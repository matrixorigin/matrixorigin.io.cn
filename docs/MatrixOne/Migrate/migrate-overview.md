# 将数据迁移至 MatrixOne 概述

## MatrixOne 迁移数据的工具与功能

在使用 MatrixOne 时，有时需要将数据从其他数据库迁移至 MatrixOne。由于不同数据库之间存在差异，数据迁移需要一些额外的工作。为了方便用户快速导入外部数据，MatrixOne 提供了多种工具和功能。

以下是其中的一些常见的工具和功能：

### LOAD DATA

与 MySQL 类似，MatrixOne 提供了 LOAD DATA 功能，允许用户将外部的 CSV 文件或 JSON 文件快速并行地导入到与表结构匹配的表中。

具体操作，请参考[批量导入](../Develop/import-data/bulk-load/bulk-load-overview.md)。

### CN 直接写 S3

在 MatrixOne 中，当事务大小超过一定阈值（约 10MB）时，事务内的数据将不再被写入预写日志并直接写入 S3 中，从而极大地提高数据写入性能。在数据迁移至 MatrixOne 时，用户可以利用这一特性快速完成数据的写入。这一特性在后续的迁移中也会得到体现。

## 参考文档

MatrixOne 提供了以下文档，帮助你快速了解如何从其他数据库将数据迁移至 MatrixOne：

- [将数据从 MySQL 迁移至 MatrixOne](migrate-from-mysql-to-matrixone.md)
- [将数据从 Oracle 迁移至 MatrixOne](migrate-from-oracle-to-matrixone.md)
- [将数据从 SQL Server 迁移至 MatrixOne](migrate-from-sqlserver-to-matrixone.md)
