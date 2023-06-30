# 批量导入概述

MatrixOne 支持使用 `LOAD DATA` 命令将大量行插入至 MatrixOne 数据表，也支持使用 `SOURCE` 命令将表结构和数据导入整个数据库。

## `LOAD DATA`

MatrixOne 支持使用 `LOAD DATA` 命令从本地文件系统或 *S3 对象存储服务*批量导入 *csv* 文件、*jsonline* 文件。

### 导入不同的数据格式

根据*数据文件类型不同*的情况，MatrixOne 支持使用 `LOAD DATA` 命令导入 *csv* 和 *jl* 格式。

- 一种是支持导入 *csv* 格式的数据，具体导入方式可以参考[插入 csv 文件](load-csv.md)。
- 一种是支持导入 *jl* 格式的数据，即 jsonlines 格式，具体导入方式可以参考[插入 jsonlines 文件](load-jsonline.md)。

### 从不同存储位置进行导入

根据*数据存储位置不同*的情况，MatrixOne 支持使用 `LOAD DATA` 命令从*本地进行导入*和*从对象存储服务（Simple Storage Service, S3) 导入*。

- 从本地导入数据的方式，参考[插入 csv 文件](load-csv.md)或[插入 jsonlines 文件](load-jsonline.md)。
- 从 S3 导入数据的方式，参考[从对象存储导入文件](load-s3.md)。

## `SOURCE`

MatrixOne 支持使用 `SOURCE` 命令从外部 SQL 脚本文件执行 SQL 语句导入整个数据库结构（包括表结构和数据）。`SOURCE` 命令在处理大量数据时可能没有 `LOAD DATA` 命令性能高，因为它需要解析和执行每个 SQL 语句。

- [Source 插入](using-source.md)

## 更多导入能力

- MatrixOne 支持并行加载数据文件：数据文件较大时，为了提升加载速度，MatrixOne 也支持并行加载，可参见 `LOAD DATA` 导入数据的参数说明。
- 在 MatrixOne 分布式集群中，除了本地导入数据和从公有云对象存储 S3 导入数据到 MatrixOne，还可以通过本地 Minio 组件导入数据，操作详情，参见[本地对象存储导入导入数据](../../../Deploy/import-data-from-minio-to-mo.md)
