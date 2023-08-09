# **CREATE TABLE**

## **语法说明**

`CREATE TABLE` 语句用于在当前所选数据库创建一张新表。

## **语法结构**

```
> CREATE [TEMPORARY] TABLE [IF NOT EXISTS] tbl_name
    (create_definition,...)
    [table_options]
    [partition_options]

create_definition: {
    col_name column_definition
  | [CONSTRAINT [symbol]] PRIMARY KEY
      [index_type] (key_part,...)
      [index_option] ...
  | [CONSTRAINT [symbol]] FOREIGN KEY
      [index_name] (col_name,...)
      reference_definition
}

column_definition: {
    data_type [NOT NULL | NULL] [DEFAULT {literal | (expr)} ]
      [AUTO_INCREMENT] [UNIQUE [KEY]] [[PRIMARY] KEY]
      [COMMENT 'string']
      [reference_definition]
  | data_type
      [[PRIMARY] KEY]
      [COMMENT 'string']
      [reference_definition]
}

reference_definition:
    REFERENCES tbl_name (key_part,...)
      [ON DELETE reference_option]
      [ON UPDATE reference_option]

reference_option:
    RESTRICT | CASCADE | SET NULL | NO ACTION

table_options:
    table_option [[,] table_option] ...

table_option: {
  | AUTO_INCREMENT [=] value
  | COMMENT [=] 'string'
  | START TRANSACTION
}

partition_options:
    PARTITION BY
        { [LINEAR] HASH(expr)
        | [LINEAR] KEY [ALGORITHM={1 | 2}] (column_list)}
    [PARTITIONS num]
    [(partition_definition [, partition_definition] ...)]

partition_definition:
 PARTITION partition_name
     [VALUES
         {LESS THAN {(expr | value_list) | MAXVALUE}
         |
         IN (value_list)}]
     [COMMENT [=] 'string' ]
```

### 语法释义

创建表时可以使用的各种参数和选项，包括表的创建、列的定义、约束、选项和分区等。

- `CREATE [TEMPORARY] TABLE [IF NOT EXISTS] tbl_name`：这是创建表的基本语法。`TEMPORARY` 关键字表示创建临时表，`IF NOT EXISTS` 表示如果表不存在则创建，`tbl_name` 是要创建的表的名称。

- `(create_definition,...)`：这是列定义的部分，用来定义表的各个列以及相关属性。

- `[table_options]`：这是表级别的选项，可以设置表的存储引擎、字符集等参数。

- `[partition_options]`：这是用于分区表的选项，用来定义分区方式和分区键。

`create_definition` 部分用于定义每一列的属性，它可以包含以下内容：

- `col_name column_definition`：定义具体列名以及列的属性，包括数据类型、是否允许为空、默认值等。

- `[CONSTRAINT [symbol]] PRIMARY KEY`：定义主键约束，可以设置约束名称和主键的列。

- `[CONSTRAINT [symbol]] FOREIGN KEY`：定义外键约束，可以设置约束名称、外键的列以及参考的表。

`column_definition` 部分用于具体列的定义，可以包含以下内容：

- `data_type [NOT NULL | NULL] [DEFAULT {literal | (expr)} ]`：定义列的数据类型，以及是否允许为空和默认值。

- `[AUTO_INCREMENT] [UNIQUE [KEY]] [[PRIMARY] KEY]`：设置自增、唯一和主键约束。

- `[COMMENT 'string']`：设置列的注释。

- `[reference_definition]`：可选的引用定义，用于定义外键约束。

`reference_definition` 部分用于定义外键引用，包括以下内容：

- `REFERENCES tbl_name (key_part,...)`：指定外键引用的表和列。

- `[ON DELETE reference_option]`：设置在删除时的外键操作。

- `[ON UPDATE reference_option]`：设置在更新时的外键操作。

`reference_option` 表示外键操作的选项，可以是 `RESTRICT`、`CASCADE`、`SET NULL` 或 `NO ACTION`。

`table_options` 部分用于设置表级别的选项，包括自增的初始值、表的注释等。

`partition_options` 部分用于定义分区表的选项，包括分区方式、分区键以及分区数等。

更详细的参数语法释义请参见下文。

#### TEMPORARY

在创建表时，可以使用 `TEMPORARY` 关键字创建一个临时表。`TEMPORARY` 表只在当前会话中可见，在会话关闭时自动删除。这表示两个不同的会话可以使用相同的临时表名，而不会彼此冲突或与同名的现有非临时表冲突。(在删除临时表之前，会隐藏现有表。)

删除数据库会自动删除数据库中创建的所有 `TEMPORARY` 表。

创建会话可以对表执行任何操作，例如 `DROP table`、`INSERT`、`UPDATE` 或 `SELECT`。

#### COMMENT

可以使用 `comment` 选项指定列或整张表的注释：

- `CREATE TABLE [IF NOT EXISTS] [db.]table_name [comment = "comment of table"];` 中的 `comment` 为整张表的注释，最长 2049 个字符。
- `(name1 type1 [comment 'comment of column'],...)` 中的 `comment` 为指定列的注释：最长 1024 个字符。

使用 `SHOW CREATE TABLE` 和 `SHOW FULL COLUMNS` 语句显示注释内容。注释内容也显示在 `INFORMATION_SCHEMA.COLUMN_COMMENT` 列中。

#### AUTO_INCREMENT

`AUTO_INCREMENT`：表的初始值，初始值从 1 开始，且数据列的值必须唯一。

- 设置 `AUTO_INCREMENT` 的列，需为整数或者浮点数据类型。
- 自增列需要设置为 `NOT NULL`，否则会直接存储 `NULL`。当你将 NULL（推荐）或 0 值插入索引的 `AUTO_INCREMENT` 列时，该列将设置为下一个序列值。通常这是 *value+1*，其中 *value* 是表中当前列的最大值。

- 每个表只能有一个 `AUTO_INCREMENT` 列，它必须可以被索引，且不能设置默认值。`AUTO_INCREMENT` 列需要含有正数值，如果插入一个负数被判断为插入一个非常大的正数，这样做是为了避免数字出现精度问题，并确保不会意外出现包含 0 的 `AUTO_INCREMENT` 列。

#### PRIMARY KEY

`PRIMARY KEY` 即主键约束，用于唯一标示表中的每条数据。
主键必须包含 `UNIQUE` 值，不能包含 `NULL` 值。
当前版本一个表只能有一个主键，这个主键可以由一个列组成，也可以由多个列组成。

- **在建表时创建主键**

以下 SQL 语句在创建 `Persons` 表时，在其中的 `ID` 列创建主键：

```
> CREATE TABLE Persons (
    ID int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Age int,
    PRIMARY KEY (ID)
);
```

!!! Note 注意区分
    上述示例中只有一个主键，并且其中仅包含了一列（`ID`）

而下面 SQL 语句在创建 `Students` 表时，在其中的 `ID` 和 `LastName` 列创建主键：

```
> CREATE TABLE Students (
    ID int NOT NULL,
    LastName varchar(255) NOT NULL,
    FirstName varchar(255),
    Age int,
    PRIMARY KEY (ID,LastName)
);
```

#### FOREIGN KEY

FOREIGN KEY 约束，即外键约束，是表的一个特殊字段，经常与主键约束一起使用。外键约束是用于防止破坏表之间链接的行为。对于两个具有关联关系的表而言，相关联字段中主键所在的表就是主表（父表），外键所在的表就是从表（子表）。外键用来建立主表与从表的关联关系，为两个表的数据建立连接，约束两个表中数据的一致性和完整性。

FOREIGN KEY 约束也能防止非法数据插入外键列，因为它必须是它指向的那个表中的值之一。

定义外键时，需要遵守下列规则：

- 主表必须已经存在于数据库中，或者是当前正在创建的表。如果是后一种情况，则主表与从表是同一个表，这样的表称为自参照表，这种结构称为自参照完整性。
- 必须为主表定义主键。

- 在主表的表名后面指定列名或列名的组合。这个列或列的组合必须是主表的主键或候选键。

- 外键中列的数目必须和主表的主键中列的数目相同。

- 外键中列的数据类型必须和主表主键中对应列的数据类型相同。

下面通过一个例子进行说明通过 FOREIGN KEY 和 PRIMARY KEY 关联父表与子表：

首先创建一个父表，字段 a 为主键：

```sql
create table t1(a int primary key,b varchar(5));
insert into t1 values(101,'abc'),(102,'def');
mysql> select * from t1;
+------+------+
| a    | b    |
+------+------+
|  101 | abc  |
|  102 | def  |
+------+------+
2 rows in set (0.00 sec)
```

然后创建一个子表，字段 c 为外键，关联父表字段 a：

```sql
create table t2(a int ,b varchar(5),c int, foreign key(c) references t1(a));
insert into t2 values(1,'zs1',101),(2,'zs2',102);
insert into t2 values(3,'xyz',null);
mysql> select * from t2;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 | zs1  |  101 |
|    2 | zs2  |  102 |
|    3 | xyz  | NULL |
+------+------+------+
3 rows in set (0.00 sec)
```

另外，`[ON DELETE reference_option]` 和 `[ON UPDATE reference_option]` 在定义外键关系时用于指定在删除父表中的记录时执行的操作。这两个参数主要用于维护数据的完整性和一致性：

- `ON DELETE reference_option`：这个参数指定了在引用表中的数据被删除时，应该如何处理与之关联的外键数据。常见的选项包括：

    + `RESTRICT`：如果在引用表中有相关的外键数据存在，不允许删除引用表中的数据。这可以用来防止误删除关联数据，以维护数据的一致性。

    + `CASCADE`：当引用表中的数据被删除时，同时删除与之关联的外键数据。这可以用于级联删除关联数据，以确保数据的完整性。

    + `SET NULL`：当引用表中的数据被删除时，将外键列的值设置为 NULL。这可以用于在删除引用数据时保留外键数据，但断开与引用数据的关联。

    + `NO ACTION`：表示不采取任何操作，只是检查是否有关联数据存在。这类似于 `RESTRICT`，但可能在某些数据库中有微小的差异。

- `ON UPDATE reference_option`：这个参数指定了在引用表中的数据被更新时，应该如何处理与之关联的外键数据。常见的选项类似于 `ON DELETE reference_option`，用法也类似，只是针对数据更新操作。

参见下面的示例：

假设有两张表 `Orders` 和 `Customers`，`Orders` 表中有一个外键列 `customer_id` 引用 `Customers` 表中的 `id` 列。如果在 `Customers` 表中的某个客户被删除，同时也希望删除关联的订单数据，可以使用 `ON DELETE CASCADE`。

```sql
CREATE TABLE Customers (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE Orders (
    id INT PRIMARY KEY,
    order_number VARCHAR(10),
    customer_id INT,
    FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE
);
```

在上述示例中，当 `Customers` 表中的某个客户被删除时，关联的订单数据也会被级联删除，以维护数据的完整性。同样的，`ON UPDATE` 参数也可以用类似的方式来处理更新操作。

有关数据完整性约束的更多信息，参见[数据完整性约束概述](../../../Develop/schema-design/data-integrity/overview-of-integrity-constraint-types.md)。

#### Cluster by

`Cluster by` 是一种用于优化表的物理排列方式的命令。在建表时使用 `Cluster by` 命令，对于无主键的表，可以按照指定的列对表进行物理排序，并将数据行重新排列成与该列的值的顺序相同的顺序。使用 `Cluster by` 提高查询性能。

- 单列语法为：`create table() cluster by col;`  
- 多列语法为：`create table() cluster by (col1, col2);`  

__Note:__ `Cluster by` 不能和主键同时存在，否则会语法报错；`Cluster by` 只能在建表时指定，不支持动态创建。

更多关于使用 `Cluster by` 进行性能调优，参见[使用 Cluster by 语句调优](../../../Performance-Tuning/optimization-concepts/through-cluster-by.md).

#### Table PARTITION 和 PARTITIONS

```
partition_options:
 PARTITION BY
     { [LINEAR] HASH(expr)
     | [LINEAR] KEY [ALGORITHM={1 | 2}] (column_list)
 [PARTITIONS num]
 [(partition_definition [, partition_definition] ...)]

partition_definition:
 PARTITION partition_name
     [VALUES
         {LESS THAN {(expr | value_list) | MAXVALUE}
         |
         IN (value_list)}]
     [COMMENT [=] 'string' ]
```

分区可以被修改、合并、添加到表中，也可以从表中删除。

· 和单个磁盘或文件系统分区相比，可以存储更多的数据。

· 优化查询。

   + where 子句中包含分区条件时，可以只扫描必要的分区。
   + 涉及聚合函数的查询时，可以容易的在每个分区上并行处理，最终只需汇总得到结果。

· 对于已经过期或者不需要保存的数据，可以通过删除与这些数据有关的分区来快速删除数据。

· 跨多个磁盘来分散数据查询，以获得更大的查询吞吐量。

- **PARTITION BY**

分区语法以 `PARTITION BY` 开头。该子句包含用于确定分区的函数，这个函数返回一个从 1 到 num 的整数值，其中 num 是分区的数目。

- **HASH(expr)**

在实际工作中，经常会遇到像会员表这种没有明显可以分区的特征字段的大表。为了把这类的数据进行分区打散，MatrixOne 提供了 `HASH` 分区。基于给定的分区个数，将数据分配到不同的分区，`HASH` 分区只能针对整数进行 `HASH`，对于非整形的字段则通过表达式将其转换成整数。

· HASH 分区，基于给定的分区个数，把数据分配到不同的分区。

· Expr 是使用一个或多个表列的表达式。

示例如下：

```
CREATE TABLE t1 (col1 INT, col2 CHAR(5))
    PARTITION BY HASH(col1);

CREATE TABLE t1 (col1 INT, col2 CHAR(5), col3 DATETIME)
    PARTITION BY HASH ( YEAR(col3) );
```

- **KEY(column_list)**

·  KEY 分区，按照某个字段取余。分区对象必须为列，不能是基于列的表达式，且允许多列。KEY 分区列可以不指定，默认为主键列或者唯一键列，无主键和唯一键的情况下，则必须显性指定列。

类似于 `HASH`。`column_list` 参数只是一个包含 1 个或多个表列的列表（最大值：16）。下面的示例为一个按 `KEY` 分区的简单表，有 4 个分区：

```
CREATE TABLE tk (col1 INT, col2 CHAR(5), col3 DATE)
    PARTITION BY KEY(col3)
    PARTITIONS 4;
```

对于按 `KEY` 分区的表，可以使用 `LINEAR KEY` 来进行线性分区。这与使用 `HASH` 分区的表具有相同的效果。下面的示例为使用 `LINEAR KEY` 线性分区在 5 个分区之间分配数据：

```
CREATE TABLE tk (col1 INT, col2 CHAR(5), col3 DATE)
    PARTITION BY LINEAR KEY(col3)
    PARTITIONS 5;
```

- **PARTITIONS num**

可以选择使用 `PARTITIONS num` 子句指定分区数，其中 `num` 是分区数。如果使用此子句的同时，也使用了其他 `PARTITION` 子句，那么 `num` 必须等于使用 `PARTITION` 子句声明的分区的总数。

## **示例**

- 示例 1：创建普通表

```sql
CREATE TABLE test(a int, b varchar(10));
INSERT INTO test values(123, 'abc');

mysql> SELECT * FROM test;
+------+---------+
|   a  |    b    |
+------+---------+
|  123 |   abc   |
+------+---------+
```

- 示例 2：创建表示增加注释

```sql
create table t2 (a int, b int) comment = "事实表";

mysql> show create table t2;
+-------+---------------------------------------------------------------------------------------+
| Table | Create Table                                                                          |
+-------+---------------------------------------------------------------------------------------+
| t2    | CREATE TABLE `t2` (
`a` INT DEFAULT NULL,
`b` INT DEFAULT NULL
) COMMENT='事实表',    |
+-------+---------------------------------------------------------------------------------------+
```

- 示例 3：建表时为列增加注释

```sql
create table t3 (a int comment '列的注释', b int) comment = "table";

mysql> SHOW CREATE TABLE t3;
+-------+----------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                             |
+-------+----------------------------------------------------------------------------------------------------------+
| t3    | CREATE TABLE `t3` (
`a` INT DEFAULT NULL COMMENT '列的注释',
`b` INT DEFAULT NULL
) COMMENT='table',     |
+-------+----------------------------------------------------------------------------------------------------------+
```

- 示例 4：创建普通分区表

```sql
CREATE TABLE tp1 (col1 INT, col2 CHAR(5), col3 DATE) PARTITION BY KEY(col3) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp1;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                             |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp1   | CREATE TABLE `tp1` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 2 (col3) partitions 4 |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- 不指定分区数
CREATE TABLE tp2 (col1 INT, col2 CHAR(5), col3 DATE) PARTITION BY KEY(col3);

mysql> SHOW CREATE TABLE tp2;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| tp2   | CREATE TABLE `tp2` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 2 (col3) |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- 指定分区算法
CREATE TABLE tp3
(
    col1 INT,
    col2 CHAR(5),
    col3 DATE
) PARTITION BY KEY ALGORITHM = 1 (col3);


mysql> show create table tp3;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
| tp3   | CREATE TABLE `tp3` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 1 (col3) |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- 指定分区算法及分区数
CREATE TABLE tp4 (col1 INT, col2 CHAR(5), col3 DATE) PARTITION BY LINEAR KEY ALGORITHM = 1 (col3) PARTITIONS 5;

mysql> SHOW CREATE TABLE tp4;
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                    |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp4   | CREATE TABLE `tp4` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by linear key algorithm = 1 (col3) partitions 5 |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- 多列分区
CREATE TABLE tp5
(
    col1 INT,
    col2 CHAR(5),
    col3 DATE
) PARTITION BY KEY(col1, col2) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp5;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                   |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp5   | CREATE TABLE `tp5` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by key algorithm = 2 (col1, col2) partitions 4 |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- 创建主键列分区
CREATE TABLE tp6
(
    col1 INT  NOT NULL PRIMARY KEY,
    col2 DATE NOT NULL,
    col3 INT  NOT NULL,
    col4 INT  NOT NULL
) PARTITION BY KEY(col1) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp6;
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                        |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp6   | CREATE TABLE `tp6` (
`col1` INT NOT NULL,
`col2` DATE NOT NULL,
`col3` INT NOT NULL,
`col4` INT NOT NULL,
PRIMARY KEY (`col1`)
) partition by key algorithm = 2 (col1) partitions 4 |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- 创建HASH分区
CREATE TABLE tp7
(
    col1 INT,
    col2 CHAR(5)
) PARTITION BY HASH(col1);

mysql> SHOW CREATE TABLE tp7;
+-------+------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                         |
+-------+------------------------------------------------------------------------------------------------------+
| tp7   | CREATE TABLE `tp7` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL
) partition by hash (col1) |
+-------+------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

-- 创建 HASH 分区时指定分区数
CREATE TABLE tp8
(
    col1 INT,
    col2 CHAR(5)
) PARTITION BY HASH(col1) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp8;
+-------+-------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                      |
+-------+-------------------------------------------------------------------------------------------------------------------+
| tp8   | CREATE TABLE `tp8` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL
) partition by hash (col1) partitions 4 |
+-------+-------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- 创建分区时，指定分区粒度
CREATE TABLE tp9
(
    col1 INT,
    col2 CHAR(5),
    col3 DATETIME
) PARTITION BY HASH (YEAR(col3));

mysql> SHOW CREATE TABLE tp9;
+-------+------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                             |
+-------+------------------------------------------------------------------------------------------------------------------------------------------+
| tp9   | CREATE TABLE `tp9` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATETIME DEFAULT NULL
) partition by hash (year(col3)) |
+-------+------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- 创建分区时，指定分区粒度和分区数量
CREATE TABLE tp10
(
    col1 INT,
    col2 CHAR(5),
    col3 DATE
) PARTITION BY LINEAR HASH( YEAR(col3)) PARTITIONS 6;

mysql> SHOW CREATE TABLE tp10;
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                              |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp10  | CREATE TABLE `tp10` (
`col1` INT DEFAULT NULL,
`col2` CHAR(5) DEFAULT NULL,
`col3` DATE DEFAULT NULL
) partition by linear hash (year(col3)) partitions 6 |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

-- 创建分区时，使用主键列作为 HASH 分区
CREATE TABLE tp12 (col1 INT NOT NULL PRIMARY KEY, col2 DATE NOT NULL, col3 INT NOT NULL, col4 INT NOT NULL) PARTITION BY HASH(col1) PARTITIONS 4;

mysql> SHOW CREATE TABLE tp12;
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                            |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| tp12  | CREATE TABLE `tp12` (
`col1` INT NOT NULL,
`col2` DATE NOT NULL,
`col3` INT NOT NULL,
`col4` INT NOT NULL,
PRIMARY KEY (`col1`)
) partition by hash (col1) partitions 4 |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)
```

- 示例 5：主键自增

```sql
drop table if exists t1;
create table t1(a bigint primary key auto_increment, b varchar(10));
insert into t1(b) values ('bbb');
insert into t1 values (3, 'ccc');
insert into t1(b) values ('bbb1111');

mysql> select * from t1 order by a;
+------+---------+
| a    | b       |
+------+---------+
|    1 | bbb     |
|    3 | ccc     |
|    4 | bbb1111 |
+------+---------+
3 rows in set (0.01 sec)

insert into t1 values (2, 'aaaa1111');

mysql> select * from t1 order by a;
+------+----------+
| a    | b        |
+------+----------+
|    1 | bbb      |
|    2 | aaaa1111 |
|    3 | ccc      |
|    4 | bbb1111  |
+------+----------+
4 rows in set (0.00 sec)

insert into t1(b) values ('aaaa1111');

mysql> select * from t1 order by a;
+------+----------+
| a    | b        |
+------+----------+
|    1 | bbb      |
|    2 | aaaa1111 |
|    3 | ccc      |
|    4 | bbb1111  |
|    5 | aaaa1111 |
+------+----------+
5 rows in set (0.01 sec)

insert into t1 values (100, 'xxxx');
insert into t1(b) values ('xxxx');

mysql> select * from t1 order by a;
+------+----------+
| a    | b        |
+------+----------+
|    1 | bbb      |
|    2 | aaaa1111 |
|    3 | ccc      |
|    4 | bbb1111  |
|    5 | aaaa1111 |
|  100 | xxxx     |
|  101 | xxxx     |
+------+----------+
7 rows in set (0.00 sec)
```

## **限制**

目前不支持使用 `ALTER TABLE table_name DROP PRIMARY KEY` 语句删除表中的主键。
