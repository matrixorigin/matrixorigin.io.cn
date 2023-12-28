# 流引擎架构详解

MatrixOne 内置流引擎，用于实时查询、处理和/或丰富传入的一系列数据点（即数据流）的数据存储。开发人员现在可以使用 SQL 来定义和创建流处理管道，并作为实时数据后端提供服务；开发人员还可以使用 SQL 查询流中的数据，并与非流式数据集连接，从而进一步简化数据堆栈。

## 技术架构

MatrixOne 流引擎技术架构如下所示：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/stream-arch.png?raw=true)

MatrixOne 实现了创建流式表的相关能力，目前实现了对于 Kafka 的连接，用于满足大量时序场景的流式数据接入需求。

### Source

Source 负责外部数据与 MatrixOne 数据表的连接与映射，创建一个 Source 的同时也会创建一个同名的 Source 表，这个动态表中的数据会随着外部的流式数据动态增长。

目前 MatrixOne 仅支持连接到 Kafka ，并使用 JSON 数据进行映射，以下是创建 Source 的语法：

```sql
CREATE [OR REPLACE] SOURCE [IF NOT EXISTS] stream_name 
( { column_name data_type [KEY | HEADERS | HEADER(key)] } [, ...] )
WITH ( property_name = expression [, ...]);
```

例如使用下面的sql语句创建一个名为 stream_test 的 source：

```sql
create source stream_test(c1 char(25),c2 varchar(500),c3 text,c4 tinytext,c5 mediumtext,c6 longtext )with(
    "type"='kafka',
    "topic"= 'test',
    "partition" = '0',
    "value"= 'json',
    "bootstrap.servers"='127.0.0.1:9092'   
)
```

### 动态表 Dynamic Table

动态表（Dynamic Table）是 MatrixOne 中的一个数据管道。

可以使用下面的语法结构创建动态表：

```sql
CREATE DYNAMIC TABLE [IF NOT EXISTS] table_name 
AS SELECT ... from stream_name ;
```

示例如下：

```sql
create dynamic table dt_test as select * from stream_test;
```
