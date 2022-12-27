# MVCC

MVCC（Multiversion Concurrency Control，多版本并发控制）应用于 MatrixOne，以保证事务快照隔离，实现事务的隔离性。

基于数据元组（Tuple，即表中的每行）的指针字段来创建一个 Latch Free 的链表，称为版本链。这个版本链允许数据库定位一个 Tuple 的所需版本。因此这些版本数据的存放机制是数据库存储引擎设计的一个重要考量。

一个方案是采用 Append Only 机制，一个表的所有 Tuple 版本都存储在同一个存储空间。这种方法被用于 Postgre SQL，为了更新一个现有的 Tuple，数据库首先为新的版本从表中获取一个空的槽（Slot），然后，它将当前版本的内容复制到新版本。最后，它在新分配的 Slot 中应用对 Tuple 的修改。Append Only 机制的关键决定是如何为 Tuple 的版本链排序，由于不可能维持一个无锁（Lock free）的双向链表，因此版本链只指向一个方向，或者从 Old 到 New（O2N），或者从 New 到 Old（N2O）。

另外一个类似的方案称为时间旅行（Time Travel），它会把版本链的信息单独存放，而主表维护主版本数据。

第三种方案，是在主表中维护 Tuple 的主版本，在一个单独的数据库对比工具（Delta）存储中维护一系列 Delta 版本。这种存储在 MySQL 和 Oracle 中被称为回滚段。为了更新一个现有的 Tuple，数据库从 Delta 存储中获取一个连续的空间来创建一个新的 Delta 版本。这个 Delta 版本包含修改过的属性的原始值，而不是整个 Tuple。然后数据库直接对主表中的主版本进行原地更新（In Place Update）。

![image-20221026152318567](https://github.com/matrixorigin/artwork/blob/main/docs/distributed-transaction/mvcc.png?raw=true)
