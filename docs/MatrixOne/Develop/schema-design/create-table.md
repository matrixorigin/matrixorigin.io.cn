# 创建表

本篇文档中介绍如何使用 SQL 来创建表。上一篇文档中介绍了创建一个名为 *modatabase* 的数据库，本篇文档我们介绍在这个数据库中创建一个表。

!!! note
    此处仅对 `CREATE TABLE` 语句进行简单描述。更多信息，参见 [CREATE TABLE](../../Reference/SQL-Reference/Data-Definition-Language/create-table.md)。

## 开始前准备

在阅读本页面之前，你需要准备以下事项：

- 了解并已经完成构建 MatrixOne 集群。
- 了解什么是[数据库模式](overview.md)。
- 创建了一个数据库。

## 什么是表

表是 MatrixOne 数据库集群中的一种逻辑对象，它从属于某个数据库，用于保存数据。

表以行和列的形式组织数据记录，一张表至少有一列。若在表中定义了 n 个列，那么每一行数据都将拥有与这 n 个列中数据格式完全一致的字段。

## 命名表

创建一个有实际意义的表名称，含有关键词或编号规范的表名称，遵循命名规范，方便查找和使用。

`CREATE TABLE` 语句通常采用以下形式：

```sql
CREATE TABLE {table_name} ({elements});
```

**参数描述**

- {table_name}：表名。
- {elements}：以逗号分隔的表元素列表，比如列定义，主键定义等。

## 定义列

列从属于表，每张表都至少有一列。列通过将每行中的值分成一个个单一数据类型的小单元来为表提供结构。

列定义通常使用以下形式：

```
{column_name} {data_type} {column_qualification}
```

**参数描述**

- {column_name}：列名。
- {data_type}：列的数据类型。
- {column_qualification}：列的限定条件。

这里介绍创建一个命名为 *NATION* 的表来存储 *modatabase* 库中的用户信息。

可以为 *NATION* 表添加一些列。

```sql
CREATE TABLE NATION(
N_NATIONKEY  INTEGER NOT NULL,
N_NAME       CHAR(25) NOT NULL,
N_REGIONKEY  INTEGER NOT NULL,
N_COMMENT    VARCHAR(152)
);
```

**示例解释**

下表将解释上述示例中的字段：

|字段名 | 数据类型 | 作用 | 解释|
|---|---|---|---|
|N_NATIONKEY |INTEGER|民族的唯一标识 | 所有标识都应该是 INTEGER 类型的|
|N_NAME |CHAR|民族名字 | 民族的名称都是 char 类型，且不超过 25 字符|
|N_REGIONKEY|INTEGER|地区区号，唯一标识 | 所有标识都应该是 INTEGER 类型的|
|N_COMMENT|VARCHAR|comment 信息|varchar 类型，且不超过 152 字符|

MatrixOne 支持许多其他的列数据类型，包含整数、浮点数、时间等，参见[数据类型](../../Reference/Data-Types/data-types.md)。

**创建一个复杂表**

创建一张 *ORDERS* 表。

```sql
CREATE TABLE ORDERS(
O_ORDERKEY       BIGINT NOT NULL,
O_CUSTKEY        INTEGER NOT NULL,
O_ORDERSTATUS    CHAR(1) NOT NULL,
O_TOTALPRICE     DECIMAL(15,2) NOT NULL,
O_ORDERDATE      DATE NOT NULL,
O_ORDERPRIORITY  CHAR(15) NOT NULL,
O_CLERK          CHAR(15) NOT NULL,
O_SHIPPRIORITY   INTEGER NOT NULL,
O_COMMENT        VARCHAR(79) NOT NULL,
PRIMARY KEY (O_ORDERKEY)
);
```

这张表比 *NATION* 表包含更多的数据类型：

|字段名 | 数据类型 | 作用 | 解释|
|---|---|---|---|
|O_TOTALPRICE|DECIMAL|用于标记价格 | 精度为 15，比例为 2，即精度代表字段数值的总位数，而比例代表小数点后有多少位，例如：decimal(5,2)，即精度为 5，比例为 2 时，其取值范围为 -999.99 到 999.99。decimal(6,1) ，即精度为 6，比例为 1 时，其取值范围为 -99999.9 到 99999.9。|
|O_ORDERDATE|DATE|日期值 | 订单产生的日期|

## 选择主键

主键是一个或一组列，这个由所有主键列组合起来的值是数据行的唯一标识。

主键在 `CREATE TABLE` 语句中定义。主键约束要求所有受约束的列仅包含非 `NULL` 值。

一个表可以没有主键，主键也可以是非整数类型。

## 添加列约束

除主键约束外，MatrixOne 还支持其他的列约束，如：非空约束 NOT NULL、默认值 DEFAULT 等。

### **填充默认值**

如需在列上设置默认值，请使用 `DEFAULT` 约束。默认值将可以使你无需指定每一列的值，就可以插入数据。

你可以将 `DEFAULT` 与支持的 SQL 函数结合使用，将默认值的计算移出应用层，从而节省应用层的资源（当然，计算所消耗的资源并不会凭空消失，只是被转移到了 MatrixOne 集群中）。这里使用一个简单例子，可使用以下语句：

```sql
create table t1(a int default (1), b int);
insert into t1(b) values(1), (1);
> select * from t1;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    1 |    1 |
+------+------+
2 rows in set (0.01 sec)
```

可以看到，a 的值默认是 1。

你也可以将默认值设置为插入值时的时间，参加下面的简单的示例：

```sql
-- 创建表并设置默认值为当前时间
CREATE TABLE t2 (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    created_at DATETIME DEFAULT NOW()
);

INSERT INTO t2 (id, name) VALUES
(1, 'John'),
(2, 'Jane'),
(3, 'Mike');

> SELECT * FROM t2;
+------+------+---------------------+
| id   | name | created_at          |
+------+------+---------------------+
|    1 | John | 2023-07-10 11:57:27 |
|    2 | Jane | 2023-07-10 11:57:27 |
|    3 | Mike | 2023-07-10 11:57:27 |
+------+------+---------------------+
3 rows in set (0.00 sec)
```

执行上述插入语句后，每行的 `created_at` 列都会被自动设置为当前时间。

### **防止重复**

如果你需要防止列中出现重复值，那你可以使用 `UNIQUE` 约束。

例如，你需要确保民族标记的值唯一，可以这样改写 *NATION* 表的创建 SQL：

```sql
CREATE TABLE NATION(
N_NATIONKEY  INTEGER NOT NULL,
N_NAME       CHAR(25) NOT NULL,
N_REGIONKEY  INTEGER NOT NULL,
N_COMMENT    VARCHAR(152),
UNIQUE KEY (N_NATIONKEY)
);
```

如果你在 *NATION* 表中尝试插入相同的 *N_NATIONKEY*，将返回错误。

### **防止空值**

如果你需要防止列中出现空值，那就可以使用 `NOT NULL` 约束。

还是使用民族名称来举例子，除了民族标记的值唯一，还希望民族名称不可为空，于是此处可以这样写 *NATION* 表的创建 SQL：

```sql
CREATE TABLE NATION(
N_NATIONKEY  INTEGER NOT NULL,
N_NAME       CHAR(25) NOT NULL,
N_REGIONKEY  INTEGER NOT NULL,
N_COMMENT    VARCHAR(152),
PRIMARY KEY (N_NATIONKEY)
);
```

## 执行 `SHOW TABLES` 语句

需查看 *modatabase* 数据库下的所有表，可使用 `SHOW TABLES` 语句：

```sql
SHOW TABLES IN `modatabase`;
```

运行结果为：

```
+----------------------+
| tables_in_modatabase |
+----------------------+
| nation               |
| orders               |
+----------------------+
```

## 创建表时应遵守的规则

### 命名表时应遵守的规则

- 使用完全限定的表名称（例如：`CREATE TABLE {database_name}.{table_name}`）。这是因为你在不指定数据库名称时，MatrixOne 将使用你 SQL 会话中的当前数据库。若你未在 SQL 会话中使用 `USE {databasename};` 来指定数据库，MatrixOne 将会返回错误。

- 请使用有意义的表名，例如，若你需要创建一个用户表，你可以使用名称：*user*，*t_user*，*users* 等，或遵循你公司或组织的命名规范。如果你的公司或组织没有相应的命名规范，可参考表命名规范。

- 多个单词以下划线分隔，不推荐超过 32 个字符。

- 不同业务模块的表单独建立 *DATABASE*，并增加相应注释。

### 定义列时应遵守的规则

- 查看支持的列的数据类型。
- 查看选择主键时应遵守的规则，决定是否使用主键列。
- 查看添加列约束，决定是否添加约束到列中。
- 请使用有意义的列名，推荐你遵循公司或组织的表命名规范。如果你的公司或组织没有相应的命名规范，可参考列命名规范。

### 选择主键时应遵守的规则

- 在表内定义一个主键或唯一索引。
- 尽量选择有意义的列作为主键。
- 出于为性能考虑，尽量避免存储超宽表，表字段数不建议超过 60 个，建议单行的总数据大小不要超过 64K，数据长度过大字段最好拆到另外的表。
- 不推荐使用复杂的数据类型。
- 需要 `JOIN` 的字段，数据类型保障绝对一致，避免隐式转换。
- 避免在单个单调数据列上定义主键。如果你使用单个单调数据列（例如：AUTO_INCREMENT 的列）来定义主键，有可能会对写性能产生负面影响。
