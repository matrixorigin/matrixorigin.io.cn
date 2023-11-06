# 事务与锁机制实现详解

本文将向你介绍 MatrixOne 的事务与锁机制的实现细节。

## MatrixOne 事务特性

MatrixOne 默认支持悲观事务以及读已提交（Read Committed）隔离级别。同时也支持基于快照隔离（Snapshot Isolation）的乐观事务。但乐观事务和悲观事务不能同时运行。在集群中，要么使用悲观事务模型，要么使用乐观事务模型。

## MatrixOne 事务架构

MatrixOne 集群由三个内置服务构成：CN（Compute Node）、TN（Transaction Node）、LogService，以及一个外部对象存储服务。

### CN (Compute Node)

CN 是计算节点，负责执行大部分计算工作。每个事务客户端（如 JDBC 或 MySQL 客户端）都会与一个 CN 建立连接，发起的事务将在相应的 CN 上创建。每个事务都会在 CN 上分配一个工作空间，用于存储事务的临时数据。当事务提交时，工作空间中的数据将被发送到 TN 节点以进行提交处理。

### TN (Transaction Node)

TN 是事务节点，负责处理所有 CN 节点上的事务提交。TN 节点的职责包括将事务的提交日志写入 LogService，并将提交的数据写入内存。当内存数据达到一定条件时，TN 节点会将提交的数据写入外部对象存储，并清理相关的日志。

### LogService

LogService 是日志节点，类似于 TN 节点的 Write-Ahead Logging（WAL）系统。它使用 Raft 协议将日志存储为多个副本，以提供高可用性和强一致性。MatrixOne 随时可以通过 LogService 来恢复 TN 节点。

需要注意的是，LogService 中存储的日志并不会无限增长。当日志大小达到一定阈值时，TN 会将 LogService 中的日志对应的数据写入外部对象存储，并截断 LogService 中的日志。这截断后的日志数据被称为 "LogTail"，加上外部对象存储中的数据构成了 MatrixOne 数据库的全部数据。

### 时钟方案

MatrixOne 采用 HLC（Hybrid Logical Clocks）时钟方案，并与内置的 MORPC（MatrixOne Remote Procedure Call）集成，用于实现 CN 和 TN 节点之间的时钟同步。

### 事务的读操作

事务的读操作发生在 CN 节点，它可以查看 MVCC（多版本并发控制）中的数据版本，这取决于事务的快照时间戳（SnapshotTS）。

一旦事务确定了其 SnapshotTS，它需要访问两个数据集：一个存储在对象存储中，另一个存储在 LogTail 中。对象存储中的数据可以被 CN 直接访问，并提供了缓存以提高数据读取的性能。而 LogTail 中的数据分布在 TN 节点的内存中。

在以往的版本中，CN 节点采用 "Pull 模式"，即只有在事务开始后才主动与 TN 同步 LogTail 数据，这导致了性能较差、延迟较高和吞吐量较低的问题。但从 0.8 版本开始，MatrixOne 引入了 "Push 模式"，其中 LogTail 的同步不再在事务开始时发起，而是采用 CN 级别的订阅方式，TN 节点在每次 LogTail 变化时将增量的 LogTail 同步给订阅的 CN 节点。

在 Push 模式下，每个 CN 节点会不断接收来自 TN 节点的 LogTail 推送，并在 CN 节点上维护与 TN 节点相同的内存数据结构，以及最后一次消费的 LogTail 时间戳。一旦事务的 SnapshotTS 确定，只需要等待最后一次消费的 LogTail 的时间戳大于或等于 SnapshotTS，就表示 CN 拥有完整的 SnapshotTS 数据集。

### 数据可见性

事务能够读取的数据取决于其 SnapshotTS。

如果每个事务都使用最新的时间戳作为 SnapshotTS，那么该事务可以读取在其之前提交的任何数据。这将确保读取的数据始终是最新的，但也会付出一些性能代价。

在 Pull 模式下，需要等待 TN 节点同步 SnapshotTS 之前的所有事务都已提交。快照 TS 越新，需要等待的事务提交越多，从而导致延迟较高。

在 Push 模式下，CN 节点需要等待 SnapshotTS 之前的所有事务的 Commit 的 LogTail 被消费。也是越新的 SnapshotTS 需要等待的事务提交越多，从而导致较高的延迟。

然而，很多情况下，并不需要始终读取最新数据。MatrixOne 目前提供了两种数据新鲜度级别：

1. 使用当前时间戳作为 SnapshotTS，以始终查看最新数据。

2. 使用 CN 节点已消费完的最大 LogTail 时间戳作为 SnapshotTS。

对于第二种方式，它的好处在于事务几乎没有延迟，可以立即开始读写数据，因为所需的 LogTail 数据都已准备就绪，性能和延迟表现良好。但是，这也带来一个问题，如果同一数据库连接上的多个事务，后一个事务可能无法看到前一个事务的写入操作，因为后一个事务开始时，TN 节点尚未将前一个事务的 Commit 的 LogTail 推送到当前 CN 节点，从而导致后一个事务使用较旧的 SnapshotTS，无法看到前一个事务的写入。

为了解决这个问题，MatrixOne 维护了两个时间戳：当前 CN 节点的最后一个事务的 CommitTS（CNCommitTS）和当前会话（数据库连接）的最后一个事务的 CommitTS（SessionCommitTS）。此外，MatrixOne 提供了两种数据可见性级别（将当前 CN 节点消费的最大 LogTail 的时间戳称为 LastLogTailTS）：

- 会话级别的数据可见性，使用 Max(SessionCommitTS, LastLogTailTS) 作为事务的 SnapshotTS，以保证同一会话中发生的事务数据的可见性。

- CN 级别的数据可见性，使用 Max(CNCommitTS, LastLogTailTS) 作为事务的 SnapshotTS，以保证同一 CN 节点上发生的事务数据的可见性。

## RC (Read Committed)

前面的章节主要介绍了 MatrixOne 事务的处理，MatrixOne 之前仅支持 SI 隔离级别，基于 MVCC 实现，数据具有多个版本。然而，现在 MatrixOne 还支持 RC（Read Committed）隔离级别。

要在多版本上实现 RC 隔离级别，对于 SI 事务，需要维护一致的快照，不管何时读取，都能看到相同的数据。但是 RC 需要查看最新提交的数据，这相当于一致的快照不再是事务生命周期内的，而是针对每个查询的。每次查询开始时，使用当前时间戳作为事务的 SnapshotTS，以确保查询可以看到之前提交的数据。

在 RC 模式下，对于带有更新的语句（UPDATE、DELETE、SELECT FOR UPDATE），一旦出现写 - 写冲突，即意味着其他并发事务已修改了查询所涉及的数据。由于 RC 需要看到最新的写入，因此如果出现冲突事务已提交，必须更新事务的 SnapshotTS，然后重试。

## 悲观事务

本章介绍 MatrixOne 如何实现悲观事务以及相关设计考虑。

### 需要解决的核心问题

MatrixOne 实现悲观事务需要解决一些关键问题：

#### 提供锁服务

锁服务用于锁定单个记录、范围甚至整个表。当事务在读/写操作中需要锁定资源时，如果发现锁冲突，需要实现锁等待。当形成死锁环路时，需要有死锁检测机制来解除死锁。

#### 可扩展的锁服务性能

MatrixOne 的事务可能发生在任何 CN 节点。当多个节点同时访问锁服务时，锁服务的性能必须具备可扩展性。

#### 去掉 TN 节点 Commit 阶段的冲突检测

在悲观模式下，MatrixOne 集群中存在多个 TN 节点，因此需要确保可以安全地去除 Commit 阶段的冲突检测。

### 锁服务

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/lockservice.png)

MatrixOne 已经实现了 LockService 来提供锁服务，包括加锁、解锁、锁冲突检测、锁等待以及死锁检测的功能。

LockService 并不是一个独立部署的组件，而是一个 CN 的组件。在 MatrixOne 集群中，每个 CN 的 LockService 实例都能感知到其他 LockService 实例，协调整个集群中的 LockService 一起工作。每个 CN 只会访问当前节点的 LockService 实例，不会感知到其他 LockService 实例。对于 CN 来说，当前节点的 LockService 表现得就像是一个本地的组件。

#### LockTable

锁信息存储在一个名为 LockTable 的组件中，一个 LockService 可以包含多个 LockTable。

在 MatrixOne 集群中，第一次访问某个表的锁服务时，LockService 会创建一个 LockTable 实例，这个 LockTable 将被附加到当前 CN 的 LockService 实例中。在整个集群中，一个 LockTable 将会有一个本地 LockTable 和多个远程 LockTable 实例。只有本地 LockTable 才真正保存锁信息，远程 LockTable 充当访问本地 LockTable 的代理。

#### LockTableAllocator

LockTableAllocator 是用于分配 LockTable 的组件，它在内存中记录了 MatrixOne 集群中所有 LockTable 的分布情况。

LockTableAllocator 不是一个独立部署的组件，它是 TN 的一个组件。由于 LockTable 和 LockService 的绑定是可变的，比如 LockTableAllocator 检测到某个 CN 下线，绑定关系将发生变化，每次绑定关系变化时，绑定版本号都会增加。

在事务开始和事务提交的时间窗口内，LockTable 和 LockService 的绑定关系可能会发生变化，这种不一致可能会引发数据冲突，从而导致悲观事务模型失效。因此，LockTableAllocator 是 TN 的组件，会在处理事务提交之前检查绑定关系是否有变化，如果发现某个事务访问的

LockTable 的绑定关系已过时，将中止该事务以确保正确性。

#### 分布式死锁检测

所有活动事务所持有的锁分布在多个 LockService 的本地 LockTable 中，因此需要一种分布式死锁检测机制。

每个 LockService 都有一个死锁检测模块，其检测机制大致如下：

- 为每个锁在内存中维护一个等待队列；

- 当发生新的冲突时，需要将事务添加到锁持有者的等待队列中；

- 启动异步任务，递归查找等待队列中所有事务持有的锁，检查是否存在等待环路。如果遇到远程事务的锁，使用 RPC 获取远程事务持有的所有锁信息。

#### 可靠性

整个锁服务的关键数据都存储在内存中，包括锁信息、LockTable 和 LockService 的绑定关系。对于本地 LockTable 内部记录的锁信息，如果 CN 宕机，那么与该 CN 连接的事务将失败，因为数据库连接断开。然后 LockTableAllocator 会重新分配 LockTable 和 LockService 的绑定关系，从而确保整个锁服务可以继续提供服务。

LockTableAllocator 运行在 TN 中，一旦 TN 宕机，HAKeeper 会修复一个新的 TN，导致所有绑定关系失效。这意味着当前活动的所有事务都会因绑定关系不匹配而提交失败。

### 如何使用锁服务

为了更好地使用锁服务，MatrixOne 实现了一个 Lock 算子，负责调用和处理锁服务。

在 SQL 的计划阶段，如果是悲观事务，会处理相应的情况，然后在执行阶段，在合适的位置插入 Lock 算子。

- 对于 `INSERT` 插入操作，计划阶段会在其他 Insert 算子之前首先插入 Lock 算子，后续执行时，只有在成功获取锁后才会执行后续算子。

- 对于 `DELETE` 删除操作，与插入类似，计划阶段会在其他 Delete 算子之前插入 Lock 算子，然后只有在成功获取锁后才会执行后续算子。

- 对于 `UPDATE` 更新操作，计划阶段会被拆分成 Delete+Insert，因此会有两次锁定阶段（如果未修改主键，则会优化为一次锁定，Insert 阶段将不会锁定）。
