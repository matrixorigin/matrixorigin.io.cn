# **LAST_INSERT_ID()**

## **语法说明**

若表中含自增字段 `AUTO_INCREMENT`，则向表中插入一条记录后，可以调用 `LAST_INSERT_ID()` 来获得最近插入的那行记录的自增字段值。

如果没有插入参数，LAST_INSERT_ID() 返回一个 BIGINT UNSIGNED（64 位）值，该值表示作为最近执行的 INSERT 语句的结果成功插入到 `AUTO_INCREMENT` 列的第一个自动生成的值。返回值取决于之前 `AUTO_INCREMENT` 列的值，如果你之前没有插入一个列，那么返回值从 1 开始，如果你之前插入了一个列，那么返回值为 `AUTO_INCREMENT` 列的值增加 1。

如果没有成功插入参数，`LAST_INSERT_ID()` 的值保持不变。

在 MySQL 中，如果使用单个 `INSERT` 语句插入多行，则 `LAST_INSERT_ID()` 仅返回为第一个插入行生成的值。例如：

```sql
mysql> CREATE TABLE t (id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, name VARCHAR(10) NOT NULL);
mysql> INSERT INTO t VALUES (NULL, 'Bob');
mysql> SELECT * FROM t;
+----+------+
| id | name |
+----+------+
|  1 | Bob  |
+----+------+
mysql> SELECT LAST_INSERT_ID();
+------------------+
| LAST_INSERT_ID() |
+------------------+
|                1 |
+------------------+
mysql> INSERT INTO t VALUES (NULL, 'Mary'), (NULL, 'Jane'), (NULL, 'Lisa');
mysql> SELECT * FROM t;
+----+------+
| id | name |
+----+------+
|  1 | Bob  |
|  2 | Mary |
|  3 | Jane |
|  4 | Lisa |
+----+------+
mysql> SELECT LAST_INSERT_ID();
+------------------+
| LAST_INSERT_ID() |
+------------------+
|                2 |
+------------------+
```

但是在 MatrixOne 中，我们有不同的行为；如果使用单个 `INSERT` 语句插入多行，则 `LAST_INSERT_ID()` 返回为最后插入的行生成的值。与上面的示例一样，当您执行 `INSERT INTO t VALUES (NULL, 'Mary'), (NULL, 'Jane'), (NULL, 'Lisa');` 时，`LAST_INSERT_ID()` 将返回 4。

## **语法结构**

```
LAST_INSERT_ID(), LAST_INSERT_ID(expr)
```

## **示例**

```sql
create table t1(a int auto_increment primary key);
insert into t1 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|                1 |
+------------------+
1 row in set (0.02 sec)

insert into t1 values(11);
insert into t1 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|               12 |
+------------------+
1 row in set (0.02 sec)

insert into t1 values(null);
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|               13 |
+------------------+
1 row in set (0.02 sec)

create table t2(a int auto_increment primary key);
insert into t2 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|                1 |
+------------------+
1 row in set (0.02 sec)

insert into t2 values(100);
insert into t2 values();
mysql> select last_insert_id();
+------------------+
| last_insert_id() |
+------------------+
|              101 |
+------------------+
1 row in set (0.02 sec)
```
