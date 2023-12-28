# 流引擎架构详解

MatrixOne 内置流引擎，用于实时查询、处理和/或丰富传入的一系列数据点（即数据流）的数据存储。开发人员现在可以使用 SQL 来定义和创建流处理管道，并作为实时数据后端提供服务；开发人员还可以使用 SQL 查询流中的数据，并与非流式数据集连接，从而进一步简化数据堆栈。

## 技术架构

MatrixOne 流引擎技术架构如下所示：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/stream-arch.png?raw=true)

MatrixOne 已成功开发出一套高效的流式表创建机制，目前特别针对 Kafka 进行了深度整合。此举旨在优化大规模时序数据场景下的流式数据处理能力。

从技术细节来看，MatrixOne 通过 Source 功能实现与外部流式数据源的高效连接与集成。通过动态表与 Source 的链接，MatrixOne 不仅能够实现数据的持久化存储，还能对流入数据执行复杂操作，从而提升数据处理的灵活性和效率。

### Source

在 MatrixOne 的架构中，Source 扮演着关键角色，它是外部数据流与 MatrixOne 数据库表之间的桥梁。通过实现精确的连接与数据映射机制，Source 不仅确保了数据流的无缝对接，而且保障了数据的完整性和准确性。

每当创建一个新的 Source 实例时，系统会自动生成一个同名的 Source 表。这个表被设计为临时性数据存储空间，能够容纳所有流入的数据，并支持数据的动态增长和实时更新。

目前 MatrixOne 仅支持连接到 Kafka，并使用 JSON 数据进行映射，以下是创建 Source 的语法：

```sql
CREATE [OR REPLACE] SOURCE [IF NOT EXISTS] stream_name 
( { column_name data_type [KEY | HEADERS | HEADER(key)] } [, ...] )
WITH ( property_name = expression [, ...]);
```

例如使用下面的 sql 语句创建一个名为 stream_test 的 source：

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

动态表（Dynamic Table）是 MatrixOne 中的一个数据管道。动态表能够实时捕捉、处理并转换流入的数据，从而保证信息流在整个系统中的即时更新和准确表达。这种设计不仅提升了数据处理的灵活性和效率，还优化了整个系统对于复杂数据场景的响应能力和处理性能。

可以使用下面的语法结构创建动态表：

```sql
CREATE DYNAMIC TABLE [IF NOT EXISTS] table_name 
AS SELECT ... from stream_name ;
```

示例如下：

```sql
create dynamic table dt_test as select * from stream_test;
```
