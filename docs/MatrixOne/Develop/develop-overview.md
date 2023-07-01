# 概述

本篇文章及其后续章节主要旨在介绍如何利用 MatrixOne 进行应用开发。我们将展示如何连接到 MatrixOne，如何创建数据库和表，以及如何构建基于常见编程语言（如 Java，Python，Golang）的应用程序。

## MatrixOne 与应用的交互

总体来说，MatrixOne 与 MySQL 8.0 具有高度的兼容性，无论在通信协议，SQL 语法，连接工具，还是开发模式上，都与 MySQL 基本一致。如果本文档中没有明确说明某些用法，你可以参照 MySQL 8.0 的官方文档进行操作。大部分的应用程序框架或编程语言都可以使用 MySQL 的客户端库。

对于 MatrixOne 和 MySQL 有显著差异的地方，请参阅 [MySQL 兼容性](../Overview/feature/mysql-compatibility.md)章节。

## MatrixOne 事务机制

MatrixOne 支持乐观事务和悲观事务两种模式。在 MatrixOne 的当前版本中，默认采用的是**乐观事务**模式，你可以通过修改启动配置文件来开启悲观事务模式。

你可以使用 `BEGIN` 来开启一个事务，使用 `COMMIT` 来提交事务，或者使用 `ROLLBACK` 来回滚事务。MatrixOne 会确保从 `BEGIN` 开始到 `COMMIT` 或 `ROLLBACK` 结束之间的所有语句具有原子性，即在这段时间内的所有语句要么全部成功，要么全部失败，以此来保证你在应用开发过程中需要的数据一致性。

如果你选择使用乐观事务，在应用程序中请增加错误处理和重试机制，因为 MatrixOne 并不保证每个事务都能执行成功。如果你使用悲观事务，那么就无需考虑这一点。乐观事务在并发性能上会优于悲观事务。

## 参考文档

* [连接到 MatrixOne](connect-mo/database-client-tools.md)
* [数据库模式设计](schema-design/overview.md)
* [数据写入](import-data/insert-data.md)
* [数据读取](read-data/query-data-single-table.md)
* [事务](Transactions/common-transaction-overview.md)
* [应用开发示例](../Tutorial/develop-java-crud-demo.md)
