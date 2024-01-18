# mo-dump 备份与恢复

对于企业而言，每天都会产生大量数据，那么对于数据库的备份就非常重要。在系统崩溃或者硬件故障，又或者用户误操作的情况下，你可以恢复数据并重启系统，不会造成数据丢失。

另外，数据备份也作为升级 MatrixOne 安装之前的保障，同时数据备份也可以用于将 MatrixOne 安装转移到另一个系统。

MatrixOne 支持通过 `mo-dump` 实用程序进行逻辑备份。`modump` 是一个命令行实用程序，用于生成 MatrixOne 数据库的逻辑备份。它生成可用于重新创建数据库对象和数据的 SQL 语句。你可以在 [mo-dump](../../Develop/export-data/modump.md) 章节中查找它的语法说明和使用指南。

我们将通过一个简单的示例来讲述如何使用 `mo-dump` 实用程序完成数据备份和还原的过程。

## 步骤

### 1. [构建 mo-dump 二进制文件](../../Develop/export-data/modump.md)

参见[构建 mo-dump 二进制文件](../../Develop/export-data/modump.md)章节，完成 `mo-dump` 二进制文件构建。

如果你已经完成了 `mo-dump` 的构建，那么你可以继续阅读下一章节。

### 2. 生成单个数据库的备份

示例如下，使用以下 SQL 创建的数据库 *t* 及其表 *t1*：

```
DROP DATABASE IF EXISTS `t`;
CREATE DATABASE `t`;
USE `t`;
create table t1
(
    c1  int primary key auto_increment,
    c2  tinyint not null default 4,
    c3  smallint,
    c4  bigint,
    c5  tinyint unsigned,
    c6  smallint unsigned,
    c7  int unsigned,
    c8  bigint unsigned,
    c9  float,
    c10 double,
    c11 date,
    c12 datetime,
    c13 timestamp on update current_timestamp,
    c14 char,
    c15 varchar,
    c16 json,
    c17 decimal,
    c18 text,
    c19 blob,
    c20 uuid
);
insert into t1 values (1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '2019-01-01', '2019-01-01 00:00:00', '2019-01-01 00:00:00', 'a', 'a', '{"a":1}','1212.1212', 'a', 'aza', '00000000-0000-0000-0000-000000000000');
```

如果要生成单个数据库的备份，可以运行以下命令。该命令将生成命名为 *t* 的数据库的备份，其中包含 *t.sql* 文件中的结构和数据。

```
./mo-dump -u root -p 111 -h 127.0.0.1 -P 6001 -db t > t.sql
```

如果要在数据库中生成单个表的备份，可以运行以下命令。该命令将生成命名为 *t* 的数据库的 *t1* 表的备份，其中包含 *t.sql* 文件中的结构和数据。

```
./mo-dump -u root -p 111 -db t -tbl t1 > t1.sql
```

!!! note
    如果你想生成多个数据库/表的备份，需要在数据库名/表名之间用 `,` 分隔。

### 3. 恢复备份到 MatrixOne 服务器

将导出的 *sql* 文件恢复至 MatrixOne 数据库相对简单。要恢复你的数据库，你必须先创建一个空数据库，并使用 *MySQL 客户端*进行恢复。

将 MatrixOne 与 MySQL 客户端连接至同一服务器上，并确保导出的 *sql* 文件也在同一服务器上。

```
mysql> create database t if not exists;
mysql> source /YOUR_SQL_FILE_PATH/t.sql
```

成功执行以上命令后，执行以下命令，检查是否在命名为 *t* 数据库上创建了所有对象。

```
mysql> use t;
mysql> show tables;
mysql> select count(*) from t1;
```
