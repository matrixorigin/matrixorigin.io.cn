# 使用 DataX 将数据写入 MatrixOne

## 概述

DataX 是一款由阿里开源的异构数据源离线同步工具，提供了稳定和高效的数据同步功能，旨在实现各种异构数据源之间的高效数据同步。

DataX 将不同数据源的同步分为两个主要组件：**Reader（读取数据源）
**和 **Writer（写入目标数据源）**。DataX 框架理论上支持任何数据源类型的数据同步工作。

MatrixOne 与 MySQL 8.0 高度兼容，但由于 DataX 自带的 MySQL Writer 插件适配的是 MySQL 5.1 的 JDBC 驱动，为了提升兼容性，社区单独改造了基于 MySQL 8.0 驱动的 MatrixOneWriter 插件。MatrixOneWriter 插件实现了将数据写入 MatrixOne 数据库目标表的功能。在底层实现中，MatrixOneWriter 通过 JDBC 连接到远程 MatrixOne 数据库，并执行相应的 `insert into ...` SQL 语句将数据写入 MatrixOne，同时支持批量提交。

MatrixOneWriter 利用 DataX 框架从 Reader 获取生成的协议数据，并根据您配置的 `writeMode` 生成相应的 `insert into...` 语句。在遇到主键或唯一性索引冲突时，会排除冲突的行并继续写入。出于性能优化的考虑，我们采用了 `PreparedStatement + Batch` 的方式，并设置了 `rewriteBatchedStatements=true` 选项，以将数据缓冲到线程上下文的缓冲区中。只有当缓冲区的数据量达到预定的阈值时，才会触发写入请求。

![DataX](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/datax.png)

!!! note
    执行整个任务至少需要拥有 `insert into ...` 的权限，是否需要其他权限取决于你在任务配置中的 `preSql` 和 `postSql`。

MatrixOneWriter 主要面向 ETL 开发工程师，他们使用 MatrixOneWriter 将数据从数据仓库导入到 MatrixOne。同时，MatrixOneWriter 也可以作为数据迁移工具为 DBA 等用户提供服务。