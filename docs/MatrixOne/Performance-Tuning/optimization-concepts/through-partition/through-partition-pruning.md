## 分区裁剪

### 概述

分区裁剪（Partition Pruning）是数据库查询优化的一个过程，它能够识别并排除那些不必要的分区，从而减少查询需要扫描的数据量。当执行一个查询时，如果查询条件与表的分区键相关联，数据库系统能够自动确定并仅访问包含相关数据的分区，而忽略其它分区以大幅减少所需计算的数据量。

例如：

```sql
CREATE TABLE t1 (
	col1 INT NOT NULL,
	col2 DATE NOT NULL,
	col3 INT NOT NULL,
	PRIMARY KEY(col1, col3)
) PARTITION BY KEY(col1, col3) PARTITIONS 4;

INSERT INTO t1 VALUES
(1, '1980-12-17', 7369),
(2, '1981-02-20', 7499),
(3, '1981-02-22', 7521),
(4, '1981-04-02', 7566),
(5, '1981-09-28', 7654),
(6, '1981-05-01', 7698),
(7, '1981-06-09', 7782),
(8, '0087-07-13', 7788),
(9, '1981-11-17', 7839),
(10, '1981-09-08', 7844),
(11, '2007-07-13', 7876),
(12, '1981-12-03', 7900),
(13, '1987-07-13', 7980),
(14, '2001-11-17', 7981),
(15, '1951-11-08', 7982),
(16, '1927-10-13', 7983),
(17, '1671-12-09', 7984),
(18, '1981-11-06', 7985),
(19, '1771-12-06', 7986),
(20, '1985-10-06', 7987),
(21, '1771-10-06', 7988),
(22, '1981-10-05', 7989),
(23, '2001-12-04', 7990),
(24, '1999-08-01', 7991),
(25, '1951-11-08', 7992),
(26, '1927-10-13', 7993),
(27, '1971-12-09', 7994),
(28, '1981-12-09', 7995),
(29, '2001-11-17', 7996),
(30, '1981-12-09', 7997),
(31, '2001-11-17', 7998),
(32, '2001-11-17', 7999);

mysql> EXPLAIN VERBOSE SELECT * FROM t1 WHERE (col1 = 1 AND col3 = 7369) OR (col1 = 6 AND col3 = 7698);
+-----------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                          |
+-----------------------------------------------------------------------------------------------------+
| Project (cost=1000.00 outcnt=1000.00 selectivity=1.0000)                                            |
|   Output: t1.col1, t1.col2, t1.col3                                                                 |
|   ->  Table Scan on db2.t1 (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)              |
|         Output: t1.col1, t1.col2, t1.col3                                                           |
|         Table: 't1' (0:'col1', 1:'col2', 2:'col3')                                                  |
|         Hit Partition: p0, p2                                                                       |
|         Filter Cond: (((t1.col1 = 1) and (t1.col3 = 7369)) or ((t1.col1 = 6) and (t1.col3 = 7698))) |
+-----------------------------------------------------------------------------------------------------+
7 rows in set (0.00 sec)
```

该查询通过裁剪分区，仅扫描了 p0 和 p2 分区。

## 分区裁剪在 KEY 分区表上的应用

### 适用的 KEY 分区表场景

只有与分区键匹配的等值比较查询条件才能支持 KEY 分区表的裁剪。

```sql
CREATE TABLE t1 (
	col1 INT NOT NULL,
	col2 DATE NOT NULL,
	col3 INT PRIMARY KEY
) PARTITION BY KEY(col3) PARTITIONS 4;

mysql> EXPLAIN SELECT * FROM t1 WHERE col3 = 7990 OR col3 = 7988;
+-------------------------------------------------------------------+
| QUERY PLAN                                                        |
+-------------------------------------------------------------------+
| Project                                                           |
|   ->  Table Scan on db1.t1                                        |
|         Hit Partition: p0, p1                                     |
|         Filter Cond: ((t1.col3 = 7990) or (t1.col3 = 7988))       |
|         Block Filter Cond: ((t1.col3 = 7990) or (t1.col3 = 7988)) |
+-------------------------------------------------------------------+
5 rows in set (0.00 sec)
```

在这个 SQL 中，条件 `col3 = 7990` 可以确定所有结果都位于分区 p0 上。条件 `col3 = 7988` 可以确定所有结果都位于分区 p1 上。由于这两个条件的关系是 OR，因此只需要扫描 p0 和 p1 两个分区，分区裁剪的结果是 p0 和 p1。

### 不适用的 KEY 分区表场景

#### 场景一

Key 分区由于内部使用哈希算法造成的无序性，不适用于连续查询，如 `between`、`> < >= <=` 等条件，无法使用分区裁剪优化。

```sql
mysql> EXPLAIN SELECT * FROM t1 WHERE col3 >= 7782;
+----------------------------------------------+
| QUERY PLAN                                   |
+----------------------------------------------+
| Project                                      |
|   ->  Table Scan on db1.t1                   |
|         Hit Partition: all partitions        |
|         Filter Cond: (t1.col3 >= 7782)       |
|         Block Filter Cond: (t1.col3 >= 7782) |
+----------------------------------------------+
5 rows in set (0.00 sec)
```

#### 场景二

对于只能在执行计划生成阶段获取过滤条件的场景，无法利用分区裁剪优化。

```sql
mysql> EXPLAIN SELECT * FROM t1 WHERE col3 = (SELECT col3 FROM t2 WHERE t1.col3 = t2.col3 AND t2.col1 < 5);
+------------------------------------------------------+
| QUERY PLAN                                           |
+------------------------------------------------------+
| Project                                              |
|   ->  Filter                                         |
|         Filter Cond: (t1.col3 = t2.col3

)             |
|         ->  Join                                     |
|               Join Type: SINGLE                      |
|               Join Cond: (t1.col3 = t2.col3)         |
|               ->  Table Scan on db1.t1               |
|                     Hit Partition: all partitions    |
|               ->  Table Scan on db1.t2               |
|                     Hit Partition: all partitions    |
|                     Filter Cond: (t2.col1 < 5)       |
|                     Block Filter Cond: (t2.col1 < 5) |
+------------------------------------------------------+
12 rows in set (0.00 sec)
```

这个查询每读取一行数据，都会从子查询中获取结果并构建等值过滤条件 `col3 = ?`。然而，分区裁剪只在查询计划生成阶段生效，而不是执行阶段，因此无法进行分区裁剪。

## 分区裁剪在 Hash 分区表上的应用

### 适用的 HASH 分区表场景

Hash 分区表的使用方式与 Key 分区表基本相同，只有等值比较查询条件才能支持 Hash 分区表的裁剪。

```sql
CREATE TABLE employees (
	id INT NOT NULL,
	fname VARCHAR(30),
	lname VARCHAR(30),
	hired DATE NOT NULL DEFAULT '1970-01-01',
	separated DATE NOT NULL DEFAULT '9999-12-31',
	job_code INT,
	store_id INT
)
PARTITION BY HASH(store_id) PARTITIONS 4;

INSERT INTO employees VALUES
(10001, 'Georgi', 'Facello', '1953-09-02','1986-06-26',120, 1),
(10002, 'Bezalel', 'Simmel', '1964-06-02','1985-11-21',150, 7),
(10003, 'Parto', 'Bamford', '1959-12-03','1986-08-28',140, 3),
(10004, 'Chirstian', 'Koblick', '1954-05-01','1986-12-01',150, 3),
(10005, 'Kyoichi', 'Maliniak', '1955-01-21','1989-09-12',150, 18),
(10006, 'Anneke', 'Preusig', '1953-04-20','1989-06-02',150, 15),
(10007, 'Tzvetan', 'Zielinski', '1957-05-23','1989-02-10',110, 6),
(10008, 'Saniya', 'Kalloufi', '1958-02-19','1994-09-15',170, 10),
(10009, 'Sumant', 'Peac', '1952-04-19','1985-02-18',110, 13),
(10010, 'Duangkaew', 'Piveteau', '1963-06-01','1989-08-24',160, 10),
(10011, 'Mary', 'Sluis', '1953-11-07','1990-01-22',120, 8),
(10012, 'Patricio', 'Bridgland', '1960-10-04','1992-12-18',120, 7),
(10013, 'Eberhardt', 'Terkki', '1963-06-07','1985-10-20',160, 17),
(10014, 'Berni', 'Genin', '1956-02-12','1987-03-11',120, 15),
(10015, 'Guoxiang', 'Nooteboom', '1959-08-19','1987-07-02',140, 8),
(10016, 'Kazuhito', 'Cappelletti', '1961-05-02','1995-01-27',140, 2),
(10017, 'Cristinel', 'Bouloucos', '1958-07-06','1993-08-03',170, 10),
(10018, 'Kazuhide', 'Peha', '1954-06-19','1987-04-03',170, 2),
(10019, 'Lillian', 'Haddadi', '1953-01-23','1999-04-30',170, 13),
(10020, 'Mayuko', 'Warwick', '1952-12-24','1991-01-26',120, 1),
(10021, 'Ramzi', 'Erde', '1960-02-20','1988-02-10',120, 9),
(10022, 'Shahaf', 'Famili', '1952-07-08','1995-08-22',130, 10),
(10023, 'Bojan', 'Montemayor', '1953-09-29','1989-12-17',120, 5),
(10024, 'Suzette', 'Pettey', '1958-09-05','1997-05-19',130, 4),
(10025, 'Prasadram', 'Heyers', '1958-10-31','1987-08-17',180, 8),
(10026, 'Yongqiao', 'Berztiss', '1953-04-03','1995-03-20',170, 4),
(10027, 'Divier', 'Reistad', '1962-07-10','1989-07-07',180, 10),
(10028, 'Domenick', 'Tempesti', '1963-11-26','1991-10-22',110, 11),
(10029, 'Otmar', 'Herbst', '1956-12-13','1985-11-20',110, 12),
(10030, 'Elvis', 'Demeyer', '1958-07-14','1994-02-17',110, 1),
(10031, 'Karsten', 'Joslin', '1959-01-27','1991-09-01',110, 10),
(10032, 'Jeong', 'Reistad', '1960-08-09','1990-06-20',120, 19),
(10033, 'Arif', 'Merlo', '1956-11-14','1987-03-18',120, 14),
(10034, 'Bader', 'Swan', '1962-12-29','1988-09-21',130, 16),
(10035, 'Alain', 'Chappelet', '1953-02-08','1988-09-05',130, 3),
(10036, 'Adamantios', 'Portugali', '1959-08-10','1992-01-03',130, 14),
(10037, 'Pradeep', 'Makrucki', '1963-07-22','1990-12-05',140, 12),
(10038, 'Huan', 'Lortz', '1960-07-20','1989-09-20',140, 7),
(10039, 'Alejandro', 'Brender', '1959-10-01','1988-01-19',110, 20),
(10040, 'Weiyi', 'Meriste', '1959-09-13','1993-02-14',140, 17);

mysql> EXPLAIN SELECT * FROM employees WHERE store_id = 10;
+------------------------------------------------+
| QUERY PLAN                                     |
+------------------------------------------------+
| Project                                        |
|   ->  Table Scan on db1.employees              |
|         Hit Partition: p0                      |
|         Filter Cond: (employees.store_id = 10) |
+------------------------------------------------+
4 rows in set (0.00 sec)
```

在这个 SQL 中，由于分区表的分区键为 `store_id`，条件 `store_id = 10` 可以确定所有结果都在一个分区中。数值 10 经过 Hash 后确定位于分区 p0 中。因此只需要扫描分区 p0，无需访问绝对不包含相关结果的 p1、p2、p3 分区。从执行计划中可见，只出现一个 `TableScan` 算子，其中指定了 `Hit Partition` 为 p0，确保了分区裁剪的生效。

### 不适用的 HASH 分区表场景

#### 场景一

HASH 分区由于内部使用哈希算法造成的无序性，不适用于连续查询，如 `between`、`> < >= <=` 等条件，无法使用分区裁剪优化。

```sql
CREATE TABLE employees (
	id INT NOT NULL,
	fname VARCHAR(30),
	lname VARCHAR(30),
	hired DATE NOT NULL DEFAULT '1970-01-01',
	separated DATE NOT NULL DEFAULT '9999-12-31',
	job_code INT,
	store_id INT
)
PARTITION BY HASH(store_id) PARTITIONS 4;

mysql> EXPLAIN SELECT * FROM employees WHERE store_id > 15;
+------------------------------------------------+
| QUERY PLAN                                     |
+------------------------------------------------+
| Project                                        |
|   ->  Table Scan on db1.employees              |
|         Hit Partition: all partitions          |
|         Filter Cond: (employees.store_id > 15) |
+------------------------------------------------+
4 rows in set (0.00 sec)

```

在这个 SQL 中，条件 `store_id > 15` 无法确定对应的 Hash 分区，因此无法使用分区裁剪优化。

#### 场景二

对于只能在执行计划生成阶段获取过滤条件的场景，无法利用分区裁剪优化。

```sql
mysql> EXPLAIN SELECT * FROM t1 WHERE col1 = (SELECT store_id FROM employees WHERE employees.store_id = t1.col1 AND employees.id = 10010);
+---------------------------------------------------------+
| QUERY PLAN                                              |
+---------------------------------------------------------+
| Project                                                 |
|   ->  Filter                                            |
|         Filter Cond: (t1.col1 = employees.store_id)     |
|         ->  Join                                        |
|               Join Type: SINGLE                         |
|               Join Cond: (t1.col1 = employees.store_id) |
|               ->  Table Scan on db1.t1                  |
|                     Hit Partition: all partitions       |
|               ->  Table Scan on db1.employees           |
|                     Hit Partition: all partitions       |
|                     Filter Cond: (employees.id = 10010) |
+---------------------------------------------------------+
11 rows in set (0.01 sec)

```

这个查询每读取一行数据，都会从子查询中获取结果并构建等值过滤条件 `col3 = ?`，然而，分区裁剪仅在查询计划生成阶段生效，而不是执行阶段，因此无法进行分区裁剪。

#### 场景三

目前，不支持将函数表达式用作 Hash 分区表达式的分区裁剪。

```sql

CREATE TABLE t3 (
col1 INT,
col2 CHAR(10),
col3 DATETIME
) PARTITION BY HASH (YEAR(col3)) PARTITIONS 4;

INSERT INTO t3 VALUES
(10001, 'Georgi', '1999-04-05 11:01:02'),
(10002, 'Bezalel', '2004-04-03 13:11:10'),
(10003, 'Parto', '1997-04-05 11:01:02'),
(10004, 'Chirstian', '2004-04-03 13:11:10'),
(10005, 'Mary', '1998-04-05 11:01:02'),
(10006, 'Patricio', '2004-04-03 13:11:10'),
(10007, 'Eberhardt', '1953-09-02 13:11:10'),
(10008, 'Kazuhide', '1986-06-26 19:21:10'),
(10009, 'Tempesti', '1956-11-14 08:11:10'),
(10010, 'Nooteboom', '1987-03-18 23:11:10');

mysql> EXPLAIN SELECT * FROM t3 WHERE YEAR(col3) = 1999;
+---------------------------------------------+
| QUERY PLAN                                  |
+---------------------------------------------+
| Project                                     |
|   ->  Table Scan on db1.t3                  |
|         Hit Partition: all partitions       |
|         Filter Cond: (YEAR(t3.col3) = 1999) |
+---------------------------------------------+
4 rows in set (0.00 sec)

mysql> SELECT * FROM t3 WHERE YEAR(col3) = 1999;
+-------+--------+---------------------+
| col1  | col2   | col3                |
+-------+--------+---------------------+
| 10001 | Georgi | 1999-04-05 11:01:02 |
+-------+--------+---------------------+
1 row in set (0.01 sec)
```

## 分区剪裁的性能调优示例

### 示例 1: KEY 分区表的等值条件

```sql
CREATE TABLE t1 (
    col1 INT NOT NULL,
    col2 DATE NOT NULL,
    col3 INT NOT NULL,
    PRIMARY KEY(col1, col3)
) PARTITION BY KEY(col1, col3) PARTITIONS 4;

mysql> EXPLAIN SELECT * FROM t1 WHERE col1 = 1 AND col3 = 7369;
+------------------------------------------------------+
| QUERY PLAN                                           |
+------------------------------------------------------+
| Project                                              |
|   ->  Table Scan on db2.t1                       	   |
|         Hit Partition: p0                            |
|         Filter Cond: (t1.col3 = 7369), (t1.col1 = 1) |
+------------------------------------------------------+
5 rows in set (0.00 sec)
```

这个查询经过分区裁剪后，只会访问分区 p0，因为查询条件与 p0 中的数据匹配。

### 示例 2: KEY 分区表的 OR 条件

```sql
mysql> EXPLAIN SELECT * FROM t1 WHERE (col1 = 1 AND col3 = 7369) OR (col1 = 6 AND col3 = 7698);
+-----------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                          |
+-----------------------------------------------------------------------------------------------------+
| Project (cost=1000.00 outcnt=1000.00 selectivity=1.0000)                                            |
|   Output: t1.col1, t1.col2, t1.col3                                                                 |
|   ->  Table Scan on db2.t1 (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)              |
|         Output: t1.col1, t1.col2, t1.col3                                                           |
|         Table: 't1' (0:'col1', 1:'col2', 2:'col3')                                                  |
|         Hit Partition: p0, p2                                                                       |
|         Filter Cond: (((t1.col1 = 1) and (t1.col3 = 7369)) or ((t1.col1 = 6) and (t1.col3 = 7698))) |
+-----------------------------------------------------------------------------------------------------+
7 rows in set (0.00 sec)
```

这个查询裁剪了分区 p0 和 p2，因为查询条件与这两个分区中的数据匹配。

### 示例 3: HASH 分区表的等值条件

```sql
CREATE TABLE employees (
    id INT NOT NULL,
    fname VARCHAR(30),
    lname VARCHAR(30),
    hired DATE NOT NULL DEFAULT '1970-01-01',
    separated DATE NOT NULL DEFAULT '9999-12-31',
    job_code INT,
    store_id INT
) PARTITION BY HASH(store_id) PARTITIONS 4;

mysql> EXPLAIN SELECT * FROM employees WHERE store_id = 10;
+------------------------------------------------+
| QUERY PLAN                                     |
+------------------------------------------------+
| Project                                        |
|   ->  Table Scan on db1.employees              |
|         Hit Partition: p0                      |
|         Filter Cond: (employees.store_id = 10) |
+------------------------------------------------+
4 rows in set (0.00 sec)
```

在这个查询中，只有分区 p0 包含与条件 `store_id = 10` 匹配的数据，因此只扫描了 p0 分区。

### 示例 4: HASH 分区表的多条件查询

```sql
mysql> EXPLAIN SELECT * FROM employees WHERE store_id = 10 OR store_id = 15;
+---------------------------------------------------+
| QUERY PLAN                                        |
+---------------------------------------------------+
| Project                                           |
|   ->  Table Scan on db1.employees                 |
|         Hit Partition: p0, p3                     |
|         Filter Cond: ((employees.store_id = 10) or (employees.store_id = 15)) |
+---------------------------------------------------+
5 rows in set (0.00 sec)
```

这个查询裁剪了 p0 和 p3 分区，因为这两个分区中包含了与条件 `store_id = 10 OR store_id = 15` 匹配的数据。

### 示例 5: 不适用于分区裁剪的场景

```sql
mysql> EXPLAIN SELECT * FROM t1 WHERE col1 > 5;
+------------------------------------------------+
| QUERY PLAN                                     |
+------------------------------------------------+
| Project                                        |
|   ->  Table Scan on db1.t1                     |
|         Hit Partition: all partitions          |
|         Filter Cond: (t1.col1 > 5)             |
|         Block Filter Cond: (t1.col1 > 5)       |
+------------------------------------------------+
5 rows in set (0.00 sec)
```

在这个查询中，条件 `col1 > 5` 无法确定对应的分区，因此无法使用分区裁剪。

## 限制

MatrixOne 的分区表支持四种分区形式：Key、Hash、Range、List：

- 仅支持对 Key 和 Hash 两种分区表进行分区裁剪，其他分区表的裁剪将在后续逐步实现。
