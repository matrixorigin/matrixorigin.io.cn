# 流引擎架构详解

MatrixOne 内置流引擎，用于实时查询、处理和/或丰富传入的一系列数据点（即数据流）的数据存储。开发人员现在可以使用 SQL 来定义和创建流处理管道，并作为实时数据后端提供服务；开发人员还可以使用 SQL 查询流中的数据，并与非流式数据集连接，从而进一步简化数据堆栈。

## 技术架构

MatrixOne 流引擎技术架构如下所示：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/stream-arch.png?raw=true)

MatrixOne 实现了创建流式表的相关能力，同时实现了一个 Kafka 的连接器，用于满足大量时序场景的流式数据接入需求。

### 连接器

连接器处理与外部数据源的连接，例如 MatrixOne 1.0 版本实现的 Kafka。

MatrixOne 支持使用下面的语句实现连接器与外部数据源的连接：

```sql
CREATE SOURCE | SINK CONNECTOR [IF NOT EXISTS] connector_name CONNECTOR_TYPE WITH（property_name = expression [, ...]）;
```

其中，参数 `CONNECTOR_TYPE` 用于指定目标。

### 流

流代表一个仅进行追加的数据流，可以将其视为带有无限事件的无界表。每个流在存储层中映射到一个事件组，例如 Kafkfa 中的主题或 MatrixOne 表。

- 外部流：通过连接器使用外部存储层的流。
- 内部流：使用 MatrixOne 表作为事件存储的流。

MatrixOne 支持使用下面的语句**创建流**：

```sql
CREATE [OR REPLACE] [EXTERNAL] STREAM [IF NOT EXISTS] stream_name
（{ column_name data_type [KEY | HEADERS | HEADER（key）] } [,...] ）
WITH（property_name = expression [,...] ）;
```

你可以看如下示例，例如：

```sql
CREATE EXTERNAL STREAM STUDENTS（ID STRING KEY，SCORE INT）
WITH（kafka_topic = 'students_topic'，value_format = 'JSON'，partitions = 4）;
```

或：

```sql
CREATE STREAM STUDENTS（ID STRING KEY，SCORE INT）
```

你也可以查询流并与其他表和物化视图连接，例如：

```sql
SELECT * FROM STUDENTS WHERE rank > 5;
```

你也可以插入新事件，例如：

```sql
INSERT INTO foo（ROWTIME，KEY_COL，COL_A）VALUES（1510923225000，'key'，'A'）;
```
