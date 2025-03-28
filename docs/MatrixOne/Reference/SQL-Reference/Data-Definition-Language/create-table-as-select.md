# CREATE TABLE AS SELECT

## 语法说明

`CREATE TABLE AS SELECT` 命令通过复制 `SELECT` 查询中指定的现有表中的列定义和列数据来创建新表。然而，它不会复制原表的约束、索引、视图或其他非数据属性。

## 语法结构

```
> CREATE [TEMPORARY] TABLE [ IF NOT EXISTS ] table_name
[ (column_name [, ...] ) ] AS {query}

Query can be any select statement in MO syntax.

SELECT
[ALL | DISTINCT ]
select_expr [, select_expr] [[AS] alias] ...
[INTO variable [, ...]]
[FROM table_references[{as of timestamp 'YYYY-MM-DD HH:MM:SS'}]]
[WHERE where_condition]
[GROUP BY {col_name | expr | position}
[ASC | DESC]]
[HAVING where_condition]
[ORDER BY {col_name | expr | position}
[ASC | DESC]] [ NULLS { FIRST | LAST } ]
[LIMIT {[offset,] row_count | row_count OFFSET offset}]
```

## 语法释义

- ALL：默认选项，表示返回所有匹配的行，包括重复行。

- DISTINCT：表示只返回唯一的行，即去除重复行。

- select_expr：表示要选择的列或表达式。

- AS alias：为选择的列或表达式指定一个别名。

- [INTO variable [, ...]]：用于将查询结果存储在一个变量中，而不是返回给客户端。

- [FROM table_references]：指定从哪个表或哪些表中检索数据。table_references 可以是一个表名，也可以是一个包含多个表的复杂表达式（如连接），可以选择复制表 pitr 某个时间点的数据到新表。

- [WHERE where_condition]：用于过滤结果集，只返回满足 where_condition 条件的行。

- [GROUP BY {col_name | expr | position} [ASC | DESC]]：用于将结果集按照一个或多个列或表达式进行分组；ASC 和 DESC 用于指定分组内行的排序方式。

- [HAVING where_condition]：在分组后对分组进行过滤。通常与 GROUP BY 一起使用，以过滤掉不满足条件的分组。

- [ORDER BY {col_name | expr | position} [ASC | DESC] [NULLS {FIRST | LAST}]]：用于对结果集进行排序; ASC 和 DESC 用于指定排序方式。

- [NULLS {FIRST | LAST}]：用于指定如何处理 NULL 值在排序中的位置。

- [LIMIT {[offset,] row_count | row_count OFFSET offset}]：用于限制返回的行数。offset 指定从结果集的哪一行开始返回，0 为第一行。row_count 指定返回的行数。

## 权限

在 `Matrixone` 中，执行 `CREATE TABLE AS SELECT` 语句需要具有至少以下权限：

- `CREATE` 权限：用户需要具有创建表的权限，这可以通过 `CREATE` 权限来实现。

- `INSERT` 权限：由于 `CREATE TABLE AS SELECT` 语句将选择的数据插入到新表中，因此用户还需要具有向目标表插入数据的权限。这可以通过 `INSERT` 权限来实现。

- `SELECT` 权限：用户需要能够选择源数据表中的数据，因此需要具有 SELECT 权限。

如需了解更多权限相关的操作，请查看 [Matrixone 权限分类列表](../../access-control-type.md)和 [grant 说明](../Data-Control-Language/grant.md)。

## 示例

- 示例 1

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> create table t2 as select *from t1;--整表复制
Query OK, 3 rows affected (0.02 sec)

mysql> desc t2;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | 123     |       |         |
| b     | CHAR(5) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t2;
+------------+------+
| a          | b    |
+------------+------+
|          1 | 1    |
|          2 | 2    |
| 2147483647 | max  |
+------------+------+
3 rows in set (0.00 sec)
```

- 示例 2

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE table test as select a as alias_a from t1;--为选择列指定别名
Query OK, 3 rows affected (0.02 sec)

mysql> desc test;
+---------+---------+------+------+---------+-------+---------+
| Field   | Type    | Null | Key  | Default | Extra | Comment |
+---------+---------+------+------+---------+-------+---------+
| alias_a | INT(32) | YES  |      | 123     |       |         |
+---------+---------+------+------+---------+-------+---------+
1 row in set (0.01 sec)

mysql> select * from test;
+------------+
| alias_a    |
+------------+
|          1 |
|          2 |
| 2147483647 |
+------------+
3 rows in set (0.01 sec)
```

- 示例 3

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> create table t3 as select * from t1 where 1=2;--只复制字段，不复制数据
Query OK, 0 rows affected (0.01 sec)

mysql> desc t3;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | 123     |       |         |
| b     | CHAR(5) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t3;
Empty set (0.00 sec)
```

- 示例 4

```sql
create table t1(a int default 123, b char(5));
INSERT INTO t1 values (1, '1'),(2,'2'),(0x7fffffff, 'max');

mysql> CREATE table t4(n1 int unique) as select max(a) from t1;--以原表数据聚合值作为新表的列
Query OK, 1 row affected (0.03 sec)

mysql> desc t4;
+--------+---------+------+------+---------+-------+---------+
| Field  | Type    | Null | Key  | Default | Extra | Comment |
+--------+---------+------+------+---------+-------+---------+
| n1     | INT(32) | YES  | UNI  | NULL    |       |         |
| max(a) | INT(32) | YES  |      | NULL    |       |         |
+--------+---------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t4;
+------+------------+
| n1   | max(a)     |
+------+------------+
| NULL | 2147483647 |
+------+------------+
1 row in set (0.00 sec)
```

- 示例 5

```sql
create table t5(n1 int,n2 int,n3 int);
insert into t5 values(1,1,1),(1,1,1),(3,3,3);

mysql> create table t5_1 as select distinct n1 from t5;--去除重复行
Query OK, 2 rows affected (0.02 sec)

mysql> select * from t5_1;
+------+
| n1   |
+------+
|    1 |
|    3 |
+------+
2 rows in set (0.00 sec)
```

- 示例 6

```sql
create table t6(n1 int,n2 int,n3 int);
insert into t6 values(1,1,3),(2,2,2),(3,3,1);

mysql> create table t6_1 as select * from t6 order by n3;--对结果集进行排序
Query OK, 3 rows affected (0.01 sec)

mysql> select * from t6_1;
+------+------+------+
| n1   | n2   | n3   |
+------+------+------+
|    3 |    3 |    1 |
|    2 |    2 |    2 |
|    1 |    1 |    3 |
+------+------+------+
3 rows in set (0.01 sec)
```

- 示例 7

```sql
create table t7(n1 int,n2 int,n3 int);
insert into t7 values(1,1,3),(1,2,2),(2,3,1),(2,3,1),(3,3,1);

mysql> CREATE TABLE t7_1 AS SELECT n1 FROM t7 GROUP BY n1 HAVING count(n1)>1;--对结果集进行分组
Query OK, 2 rows affected (0.02 sec)

mysql> 
mysql> select * from t7_1;
+------+
| n1   |
+------+
|    1 |
|    2 |
+------+
2 rows in set (0.01 sec)
```

- 示例 8

```sql
create table t8(n1 int,n2 int,n3 int);
insert into t8 values(1,1,1),(2,2,2),(3,3,3);

mysql> CREATE TABLE t8_1 AS SELECT * FROM t8 limit 1 offset 1;--指定从结果集的第二行开始返回，返回行数为 1

mysql> select * from t8_1;
+------+------+------+
| n1   | n2   | n3   |
+------+------+------+
|    2 |    2 |    2 |
+------+------+------+
1 row in set (0.00 sec)
```

- 示例 9

```sql
create table t9 (a int primary key, b varchar(5) unique key);
create table t9_1 (
a int primary key,
b varchar(5) unique,
c int , 
d int,
foreign key(c) references t9(a),
INDEX idx_d(d)
);
insert into t9 values (101,'abc'),(102,'def');
insert into t9_1 values (1,'zs1',101,1),(2,'zs2',102,1);

mysql> create table t9_2 as select * from t9_1;

mysql> show create table t9_1;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                                                                                                   |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t9_1  | CREATE TABLE `t9_1` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL,
PRIMARY KEY (`a`),
UNIQUE KEY `b` (`b`),
KEY `idx_d` (`d`),
CONSTRAINT `018f27eb-0b33-7289-a3c2-af479b1833b1` FOREIGN KEY (`c`) REFERENCES `t9` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show create table t9_2;--源表带约束或者索引，CTAS 创建的新表默认不会带有原表的约束和索引
+-------+-------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                      |
+-------+-------------------------------------------------------------------------------------------------------------------+
| t9_2  | CREATE TABLE `t9_2` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL
) |
+-------+-------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

--如果希望新表带有原表带约束和索引，则可以在建表后添加
ALTER TABLE t9_2 ADD PRIMARY KEY (a);
ALTER TABLE t9_2 ADD UNIQUE KEY (b);
ALTER TABLE  t9_2 ADD FOREIGN KEY (c) REFERENCES t9 (a);
ALTER TABLE t9_2 ADD INDEX idx_d3 (d);

mysql> show create table t9_2;
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                                                                                                                    |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t9_2  | CREATE TABLE `t9_2` (
`a` INT NOT NULL,
`b` VARCHAR(5) DEFAULT NULL,
`c` INT DEFAULT NULL,
`d` INT DEFAULT NULL,
PRIMARY KEY (`a`),
UNIQUE KEY `b` (`b`),
KEY `idx_d3` (`d`),
CONSTRAINT `018f282d-4563-7e9d-9be5-79c0d0e8136d` FOREIGN KEY (`c`) REFERENCES `t9` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```