---
title: CREATE EXTERNAL TABLE
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
- CREATE EXTERNAL TABLE
since: unknown
last_updated: 2026-05-08
llms_summary: 外部表是指不在数据库里的表，是操作系统上的一个按照一定格式分割的文本文件，或是其他类型的表，对 MatrixOne 来说类似于视图，可以在数据库中像视图一样进行查询等操作，但是外部表在数据库中只有表结构，而数据存放在操作系统中。
---

# **CREATE EXTERNAL TABLE**


> 外部表是指不在数据库里的表，是操作系统上的一个按照一定格式分割的文本文件，或是其他类型的表，对 MatrixOne
> 来说类似于视图，可以在数据库中像视图一样进行查询等操作，但是外部表在数据库中只有表结构，而数据存放在操作系统中。

## **语法说明**

外部表是指不在数据库里的表，是操作系统上的一个按照一定格式分割的文本文件，或是其他类型的表，对 MatrixOne 来说类似于视图，可以在数据库中像视图一样进行查询等操作，但是外部表在数据库中只有表结构，而数据存放在操作系统中。

本篇文档将讲述如何在 MatrixOne 数据库外建表。

## **语法结构**

### 通用语法

```
> CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]table_name;
(
    name1 type1,
    name2 type2,
    ...
)
```

### 语法示例

```
## 创建指向本地文件的外表（指定压缩格式）
create external table t(...) localfile{"filepath"='<string>', "compression"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

## 创建指向本地文件的外表（不指定压缩格式，则为auto格式，自动检查文件的格式）
create external table t(...) localfile{"filepath"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';


## 创建指向S3文件的外表（指定压缩格式）
create external table t(...) URL s3option{"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "filepath"='<string>', "region"='<string>', "compression"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

## 创建指向S3文件的外表（不指定压缩格式，则为auto格式，自动检查文件的格式）
create external table t(...) URL s3option{"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "filepath"='<string>', "region"='<string>'} FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';
```

### 语法说明

#### 参数说明

|参数 | 描述|
|:-:|:-:|
|endpoint|终端节点是作为 AWS Web 服务的入口点的 URL。例如：s3.us-west-2.amazonaws.com|
|access_key_id| S3 的 Access key ID|
|secret_access_key| S3 的 Secret access key|
|bucket| 需要访问的桶|
|filepath| 访问文件的相对路径 |
|region| s3 所在的区域|
|compression| S3 文件的压缩格式，为空表示非压缩文件，支持的字段或压缩格式为"auto", "none", "gzip", "bzip2", "flate", "zlib", "lz4"|
|auto|压缩格式，表示通过文件后缀名自动检查文件的压缩格式|
|none|压缩格式，表示为非压缩格式，其余表示文件的压缩格式|

## 示例

```sql
create external table ex_table_cpk(clo1 tinyint,clo2 smallint,clo3 int,clo4 bigint,clo5 tinyint unsigned,clo6 smallint unsigned,clo7 int unsigned,clo8 bigint unsigned,col9 float,col10 double,col11 varchar(255),col12 Date,col13 DateTime,col14 timestamp,col15 bool,col16 decimal(5,2),col17 text,col18 varchar(255),col19 varchar(255),col20 varchar(255))infile{"filepath"='$resources/external_table_file/cpk_table_1.csv'} ;
```

更多关于使用外表指定 S3 文件，参见[从 S3 对象存储服务读取数据并导入 MatrixOne](../../../Develop/import-data/bulk-load/load-s3.md)。

### INFILE Parquet 语法（v3.0.12 起）

MatrixOne 也支持通过 `INFILE` 子句在 Parquet 文件上创建外表：

```
CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]table_name (
    column1 type1,
    column2 type2,
    ...
) INFILE{'filepath'='<path>', 'format'='parquet'};
```

| 参数 | 说明 |
|---|---|
| filepath | 包含 Parquet 文件的本地文件或目录路径。 |
| format | 设置为 `'parquet'` 表示 Parquet 格式外表。 |

### Hive 风格分区 Parquet 外表（v3.0.12 起）

对于采用 Hive 风格目录分区组织的 Parquet 文件（如 `year=2024/month=01/data.parquet`），使用以下 `INFILE` 选项：

```
CREATE EXTERNAL TABLE [IF NOT EXISTS] [db.]table_name (
    column1 type1,
    partition_col1 type_p1,
    partition_col2 type_p2,
    ...
) INFILE{
    'filepath'='<path>',
    'format'='parquet',
    'hive_partitioning'='true',
    'hive_partition_columns'='partition_col1,partition_col2'
};
```

| INFILE 选项 | 是否必填 | 说明 |
|---|---|---|
| `hive_partitioning` | 是 | 设为 `'true'` 以启用 Hive 风格分区发现。 |
| `hive_partition_columns` | 是 | 以逗号分隔的分区列名列表，须与表 schema 中声明的列匹配（不区分大小写）。 |

**分区列行为：**

- 分区列在表 schema 中声明为普通列，其值从目录名称中填充。
- 列名匹配不区分大小写。
- 等值（`=`）和 `IN` 谓词作用于分区列时，会在文件扫描阶段进行分区裁剪，减少 I/O。
- 名为 `__HIVE_DEFAULT_PARTITION__` 的目录会映射为分区列的 SQL `NULL`。
- 虚拟列 `__mo_filepath` 返回每行的源文件路径，所有外表均可使用。

**示例 — 单级分区：**

```sql
DROP DATABASE IF EXISTS hive_single_demo;
CREATE DATABASE hive_single_demo;
USE hive_single_demo;

CREATE EXTERNAL TABLE hive_single (
    id INT,
    name VARCHAR(50),
    year INT
) INFILE{
    'filepath'='$resources/hive_partition/single_level/',
    'format'='parquet',
    'hive_partitioning'='true',
    'hive_partition_columns'='year'
};

SELECT * FROM hive_single WHERE year = 2024;
SELECT COUNT(DISTINCT __mo_filepath) FROM hive_single;

DROP DATABASE hive_single_demo;
```

**示例 — 多级分区：**

```sql
DROP DATABASE IF EXISTS hive_multi_demo;
CREATE DATABASE hive_multi_demo;
USE hive_multi_demo;

CREATE EXTERNAL TABLE hive_multi (
    id INT,
    value DOUBLE,
    year INT,
    month VARCHAR(2)
) INFILE{
    'filepath'='$resources/hive_partition/multi_level/',
    'format'='parquet',
    'hive_partitioning'='true',
    'hive_partition_columns'='year,month'
};

SELECT * FROM hive_multi WHERE year = 2024 AND month = '01';

DROP DATABASE hive_multi_demo;
```

**Hive 外表的限制与说明：**

- `'format'` 必须为 `'parquet'`。CSV 及其他格式不支持 hive 分区。
- 分区列不能为 VECTOR 类型。
- 若分区列定义为 `NOT NULL`，则名为 `__HIVE_DEFAULT_PARTITION__` 的目录将被拒绝。
- 目前不支持含 URL 编码（带有 `%`）的目录名。
- 当 Parquet 文件的物理列与分区列名重叠时，目录路径中的分区值将覆盖物理列值。
- 不支持对 hive 分区外表执行 `LOAD DATA INFILE`。

## **限制**

当前 MatrixOne 仅支持对外部表进行 `select` 操作，暂时还不支持使用 `delete`、`insert`、`update` 对外部表插入数据。
