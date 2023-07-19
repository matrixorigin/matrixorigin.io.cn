# MatrixOne DDL 语句分区支持的说明

## 1. MatrixOne 支持的分区类型

目前 MatrixOne 的 DDL 语句支持的 6 种分区类型，与 MySQL 官网基本一致，具体如下：

- KEY Partitioning
- HASH Partitioning

目前支持子分区（Subpartitioning）语法，但是不支持计划构建。

## 2. 关于分区键的说明

### Partition Keys, Primary Keys 和 Unique Keys 的关系

分区键（Partition Keys）、主键（Primary Keys）和唯一键（Unique Keys）的关系规则可以概括为：

分区表的分区表达式中使用的所有列必须是该表可能具有的每个唯一键的一部分。

!!! note
    唯一键包括 PrimaryKey 和 Unique KEY。

​ 也就是说，表上的每个唯一键必须使用表的分区表达式中的每一列。唯一键也包括表的主键，因为根据定义，表的主键也是唯一键。

#### 示例说明

例如，以下每个表创建语句都无效：

```sql
> CREATE TABLE t1 (
      col1 INT NOT NULL,
      col2 DATE NOT NULL,
      col3 INT NOT NULL,
      col4 INT NOT NULL,
      UNIQUE KEY (col1, col2)
  )
  PARTITION BY HASH(col3)
  PARTITIONS 4;
ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function

> CREATE TABLE t2 (
     col1 INT NOT NULL,
     col2 DATE NOT NULL,
     col3 INT NOT NULL,
     col4 INT NOT NULL,
     UNIQUE KEY (col1),
     UNIQUE KEY (col3)
 )
  PARTITION BY HASH(col1 + col3)
  PARTITIONS 4;

ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function
```

### 关于 KEY 分区键为 NULL

1. KEY 只接受零个或多个列名的列表。在表有主键的情况下，用作分区键的任何列必须包含表主键的一部分或全部。

    如果没有指定列名作为分区键，则使用表的主键（如果有）。例如，以下 `CREATE TABLE` 语句在 MySQL 中有效。

2. 如果没有主键，但有 UNIQUE KEY，那么 UNIQUE KEY 用于分区键。

​ 例如，以下建表语句中，KEY 分区分区键为 NULL，没有定义主键，但是含有唯一键，构建分区表达式时则使用唯一键作为分区键：

```sql
CREATE TABLE t1 (
	col1 INT  NOT NULL,
	col2 DATE NOT NULL,
	col3 INT NOT NULL,
	col4 INT NOT NULL,
	UNIQUE KEY (col1, col2)
)
PARTITION BY KEY()
PARTITIONS 4;
```

!!! note
    其他分区规则与 MySQL 基本保持一致。

## 3. 关于 MatrixOne 分区表达式的说明

​ 在 DDL 语句构建分区表时，会针对每一种分区定义生成一个分区表达式，该分区表达式可用于计算数据的所属的分区。

在计划构建阶段对 DDL 语句中的分区信息数据结构为 plan.PartitionInfo：

```sql
type PartitionInfo struct {
	Type                 PartitionType
	Expr                 *Expr
	PartitionExpression  *Expr
	Columns              []*Expr
	PartitionColumns     []string
	PartitionNum         uint64
	Partitions           []*PartitionItem
	Algorithm            int64
	IsSubPartition       bool
	PartitionMsg         string
}
```

其中 `PartitionExpression` 即为分区表达式。分区表达式为 MatrixOne 把分区子句转换为一个表达式进行处理的方式，对每一种分区表达式的构建方式如下：

### KEY Partitioning

KEY 分区会根据分区键和分区数量，构建一个分区表达式，分区表达式的计算结果为一个大于等于 0 的整数，代表分区序号，从零开始依次递增。

SQL 示例如下：

```sql
CREATE TABLE t1 (
    col1 INT NOT NULL,
    col2 DATE NOT NULL,
    col3 INT NOT NULL,
    col4 INT NOT NULL,
    PRIMARY KEY (col1, col2)
)
PARTITION BY KEY(col1)
PARTITIONS 4;
```

### HASH Partitioning

​ 与 KEY 分区类似，HASH 分区会根据分区函数和分区数量，构建一个分区表达式，分区表达式的计算结果为一个大于等于 0 的整数，代表分区序号，从零开始依次递增。

SQL 示例如下：

```sql
CREATE TABLE t1 (
    col1 INT,
    col2 CHAR(5),
    col3 DATE
)
PARTITION BY LINEAR HASH( YEAR(col3))
PARTITIONS 6;
```
