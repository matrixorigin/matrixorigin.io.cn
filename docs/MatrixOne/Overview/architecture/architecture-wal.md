# WAL 技术详解

WAL(Write Ahead Log) 是一项与数据库原子性和持久性相关的技术，在事务提交时把随机写转换成顺序读写。事务的更改随机地发生在各页上，这些页很分散，随机写的开销大于顺序写，会降低提交的性能。WAL 只记录事务的更改操作，例如在某个 block 中增加了一行，提交事务时新的 WAL entry 顺序地写在 WAL 文件末尾，提交之后再异步地更新那些脏页，销毁对应的 WAL entry，释放空间。

MatrixOne 的 WAL 是物理日志，它会记录每行更新发生的位置，每次回放出来，数据不仅在逻辑上相同，在底层的组织结构也是一样的。

## Commit Pipeline

Commit Pipeline 是处理事务提交的组件。提交之前要更新 memtable，持久化 WAL entry，执行这些任务的耗时决定了提交的性能。持久化 WAL entry 涉及到 IO，比较耗时。MatrixOne 中采用 commit pipeline，异步持久化 WAL entry，不阻塞内存中的更新。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/wal_Commit_Pipeline.png)

**事务提交的流程是：**

- 把更改更新到 memtable 中，事务进入 commit pipeline 之前，先并发更新 memtable，事务之间互相不
阻塞。这时这些更改的状态为未提交，对任何事务不可见；

- 进入 commit pipeline 检查冲突；

- 持久化 WAL entry，从内存收集 WAL entry 写到后端。持久化 WAL entry 是异步的，队列里只把 WAL entry 传给后端就立刻返回，不用等待写入成功，这样不会阻塞后续其他事务。后端同时处理一批 entry，通过 Group Commit 进一步加速持久化。

- 更新 memtable 中的状态使事务可见，事务按照进队列的顺序依次更新状态，这样事务可见的顺序和队列里写 WAL entry 的顺序是一致的。

## Checkpoint

Checkpoint 将脏数据写入 Storage，销毁旧的 log entry，释放空间。MatrixOne 中，checkpoint 是一个后台发起的任务，它的流程是：

- 选定一个合适的时间戳作为 checkpoint，然后扫描时间戳之前的修改。图上的 t0 是上个 checkpoint，t1 是当前选定的 checkpoint。[t0,t1] 之间发生的更改需要转存。

- 转存 DML 修改。DML 更改存在 memtable 中的各个 block 中。Logtail Mgr 是一个内存模块，记录着每个事务改动了哪些 block。在 Logtail Mgr 上扫描 [t0,t1] 之间的事务，发起后台事务把这些 block 转存到 Storage 上，在元数据中记录地址。这样，所有 t1 前提交的 DML 更改都能通过元数据中的地址查到。为了及时做 checkpoint，不让 WAL 无限增长，哪怕区间中 block 只改动了一行，也需要转存。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/wal_Checkpoint1.png)

- 扫描 Catalog 转存 DDL 和元数据更改。Catalog 是一棵树，记录了所有的 DDL 和元数据信息，树上的每个节点都会记录更改发生的时间戳。扫描时收集所有落在 [t0,t1] 之间的更改。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/wal_Checkpoint2.png)

- 销毁旧的 WAL entry。Logtail Mgr 中存了每个事务对应的 LSN。根据时间戳，找到 t1 前最后一个事务，然后通知 Log Backend 清理这个事务的 LSN 之前的所有日志。

## Log Backend

MatrixOne 的 WAL 能写在各种 Log Backend 中。最初的 Log Backend 基于本地文件系统。为了分布式特性，我们自研了高可靠低延迟 Log Service 作为新的 Log Backend。我们为适配不同的 log backend，抽象出一个虚拟的 backend, 通过一些很轻量的 driver 开发，对接不同的 backend。

**Driver 需要适配出这些接口：**

- Append，提交事务时异步地写入 log entry：

```
Append(entry) (Lsn, error)
```

- Read，重启时批量读取 log entry：

```
Read(Lsn, maxSize) (entry, Lsn, error)
```

- Truncate 接口会销毁 LSN 前的所有 log entry，释放空间：

```
Truncate(lsn Lsn) error
```

## Group Commit

Group Commit 可以加速持久化 log entry。持久化 log entry 涉及到 IO，非常耗时，经常是提交的瓶颈。为了降低延迟，批量向 Log Backend 中写入 log entry。比如，在文件系统中 fsync 耗时很久。如果每条 entry 都 fsync，会耗费大量时间。基于文件系统的 Log Backend 中，多个 entry 写完后统一只做一次 fsync，这些 entry 刷盘的时间成本之和近似一条 entry 刷盘的时间。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/wal_Group_Commit.png)

Log Service 中支持并发写入，各条 entry 刷盘的时间可以重叠，这也能缩短写 entry 的总时间，提高了提交的并发。

## 处理 Log Backend 的乱序 LSN

为了加速，向 Log Backend 并发写入 entry，写入成功的顺序和发出请求的顺序不一致，导致 Log Backend 中产生的 LSN 和上层传给 Driver 的逻辑 LSN 不一致。Truncate 和重启的时候要处理这些乱序 LSN。为了保证 Log Backend 中的 LSN 基本有序，乱序的跨度不要太大，维持了一个逻辑 LSN 的窗口，如果有很早的 log entry 正在写入还未成功，会停止向 Log Backend 写入新的 entry。例如，如果窗口的长度是 7，图中的 LSN 为 13 的 entry 还未返回，就会阻塞住 LSN 大于等于 20 的 entry。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/wal_Log_Backend.png)

Log Backend 中通过 truncate 操作销毁日志，销毁指定 LSN 之前的所有 entry。这个 LSN 之前的 entry 所对应的逻辑 LSN 都要小于逻辑 truncate 点。比如图中逻辑 truncate 到 7，这条 entry 对应 Log Backend 中的 11，但是 Log Backend 中 5，6，7，10 对应的逻辑 LSN 都大于 7，不能被 truncate。Log Backend 只能 truncate 4。

重启时，会跳过开始和末尾那些不连续的 entry。比如图上的 Log Backend 写到 14 时，整个机器断电了，重启时会根据上次的 truncate 信息过滤掉开头 8，9，11。等读完所有的 entry 发现 6，14 的逻辑 LSN 和其他的 entry 不连续，就丢弃末尾的 6 和 14。

## MatrixOne 中 WAL 的具体格式

每个写事务对应一条 log entry，由 LSN，Transaction Context 和多个 Command 组成。

```
+---------------------------------------------------------+
|                  Transaction Entry                      |
+-----+---------------------+-----------+-----------+-   -+
| LSN | Transaction Context | Command-1 | Command-2 | ... |
+-----+---------------------+-----------+-----------+-   -+
```

**LSN**：每条 log entry 对应一个 LSN。LSN 连续递增，在做 checkpoint 时用来删除 entry。

**Transaction Context**：记录事务信息

- StartTS 为事务开始的时间戳。
- CommitTS 为结束的时间戳。
- Memo 记录事务更改了哪些地方的数据。重启的时候，会把这些信息恢复到 Logtail Mgr 里，做 checkpoint 要用到这些信息。

```
+---------------------------+
|   Transaction Context     |
+---------+----------+------+
| StartTS | CommitTS | Memo |
+---------+----------+------+
```

**Transaction Commands**"：事务中每种写操作对应一个或多个 command。log entry 会记录事务中所有的 command。

| Operator           | Command           |
| :----------------- | :---------------- |
| DDL                | Update Catalog    |
| Insert             | Update Catalog    |
|                    | Append            |
| Delete             | Delete            |
| Compact&Merge      | Update Catalog    |

- Operators：MatrixOne 中 DN 负责提交事务，向 Log Backend 中写 log entry，做 checkpoint。DN 支持建库，删库，建表，删表，更新表结构，插入，删除，同时后台会自动触发排序。更新操作被拆分成插入和删除。

    - DDL  
    DDL 包括建库，删库，建表，删表，更新表结构。DN 在 Catalog 里记录了表和库的信息。内存里的 Catalog 是一棵树，每个结点是一条 catalog entry。catalog entry 有 4 类，database，table，segment 和 block，其中 segment 和 block 是元数据，在插入数据和后台排序的时候会变更。每条 database entry 对应一个库，每条 table entry 对应一张表。每个 DDL 操作对应一条 database/table entry，在 entry 里记录成 Update Catalog Command。

    - Insert  
    新插入的数据记录在 Append Command 中。DN 中的数据记录在 block 中，多个 block 组成一个 segment。如果 DN 中没有足够的 block 或 segment 记录新插入的数据，就会新建一个。这些变化记录在 Update Catalog Command 中。大事务中，由 CN 直接把数据写入 S3，DN 只提交元数据。这样，Append Command 中的数据不会很大。
  
    - Delete  
    DN 记录 Delete 发生的行号。读取时，先读所有插入过的数据，然后再减去这些行。事务中，同一个 block 上所有的删除合并起来，对应一个 Delete Command。

    - Compact & Merge  
    DN 后台发起事务，把内存里的数据转存到 s3 上。把 S3 上的数据按主键排序，方便读的时候过滤。compact 发生在一个 block 上，compact 之后 block 内的数据是有序的。merge 发生在 segment 里，会涉及多个 block，merge 之后整个 segment 内有序。compact/merge 前后的数据不变，只改变元数据，删除旧的 block/segment，创建新的 block/segment。每次删除/创建对应一条 Update Catalog Command。

- Commands

<div>&nbsp&nbsp&nbsp1. &nbspUpdate Catalog</div>

Catalog 从上到下每层分别是 database，table，segment 和 block。一条 Updata Catalog Command 对应一条 Catalog Entry。每次 ddl 或者跟新元数据对应一条 Update Catalog Command。Update Catalog Command 包含 Dest 和 EntryNode。

```
+-------------------+
|   Update Catalog  |
+-------+-----------+
| Dest  | EntryNode |
+-------+-----------+
```

Dest 是这条 Command 作用的位置，记录了对应结点和他的祖先结点的 id。重启的时候会通过 Dest，在 Catalog 上定位到操作的位置。

| Type               | Dest                                |
| :------------------|:------------------------------------------|
| Update Database    | database id                               |
| Update Table       | database id,table id                      |
| Update Segment     | database id,table id,segment id           |
| Update Block       | atabase id,table id,segment id,block id   |

EntryNode 记录了 entry 的创建时间和删除时间。如果 entry 没被删除，删除时间为 0。如果当前事务正在创建或者删除，对应的时间为 UncommitTS。

```
+-------------------+
|    Entry Node     |
+---------+---------+
| Create@ | Delete@ |
+---------+---------+
```

对于 segment 和 block，Entry Node 还记录了 metaLoc，deltaLoc，分别是数据和删除记录在 S3 上的地址。

```
 +----------------------------------------+
 |               Entry Node               |
 +---------+---------+---------+----------+
 | Create@ | Delete@ | metaLoc | deltaLoc |
 +---------+---------+---------+----------+
```

对于 table，Entry Node 还记录了表结构 schema。

```
 +----------------------------+
 |         Entry Node         |
 +---------+---------+--------+
 | Create@ | Delete@ | schema |
 +---------+---------+--------+
```

<div>&nbsp&nbsp&nbsp2. &nbspAppend</div>

Append Command 中记录了插入的数据和和这些数据的位置。

```
+-------------------------------------------+
|             Append Command                |
+--------------+--------------+-   -+-------+
| AppendInfo-1 | AppendInfo-2 | ... | Batch |
+--------------+--------------+-   -+-------+
```

- Batch 是插入的数据。

- AppendInfo  
 一个 Append Data Command 中的数据可能跨多个 block。每个 block 对应一个 Append Info，记录了数据在 Command 的 Batch 中的位置 pointer to data，还有数据在 block 中的位置 destination。

```
+------------------------------------------------------------------------------+
|                              AppendInfo                                      |
+-----------------+------------------------------------------------------------+
| pointer to data |                     destination                            |
+--------+--------+-------+----------+------------+----------+--------+--------+
| offset | length | db id | table id | segment id | block id | offset | length |
+--------+--------+-------+----------+------------+----------+--------+--------+
```

<div>&nbsp&nbsp&nbsp3. &nbspDelete Command</div>

每个 Delete Command 只包含一个 block 中的删除。

```
+---------------------------+
|      Delete Command       |
+-------------+-------------+
| Destination | Delete Mask |
+-------------+-------------+
```

- Destination 记录 Delete 发生在哪个 Block 上。
- Delete Mask 记录删除掉的行号。
