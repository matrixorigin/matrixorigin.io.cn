# EXPLAIN 输出格式

## 输出结构

语法结构执行结果是为 `statement` 选择的计划的文本描述，可以选择使用执行统计信息进行注释。

以下以 [TPCH]( ../../../../Test/performance-testing/TPCH-test-with-matrixone.md) 中数据集的查询分析为例，演示输出结构：

```
explain SELECT * FROM customer WHERE c_nationkey = (SELECT n_nationkey FROM nation
WHERE customer.c_nationkey  = nation.n_nationkey  AND nation.n_nationkey > 5);
```

```
mysql> explain SELECT * FROM customer WHERE c_nationkey = (SELECT n_nationkey FROM nation
    -> WHERE customer.c_nationkey  = nation.n_nationkey  AND nation.n_nationkey > 5);
+----------------------------------------------------------------------+
| QUERY PLAN                                                           |
+----------------------------------------------------------------------+
| Project                                                              |
|   ->  Filter                                                         |
|         Filter Cond: (customer.c_nationkey = nation.n_nationkey)     |
|         ->  Join                                                     |
|               Join Type: SINGLE   hashOnPK                           |
|               Join Cond: (customer.c_nationkey = nation.n_nationkey) |
|               ->  Table Scan on tpch.customer                        |
|               ->  Table Scan on tpch.nation                          |
|                     Filter Cond: (nation.n_nationkey > 5)            |
|                     Block Filter Cond: (nation.n_nationkey > 5)      |
+----------------------------------------------------------------------+
10 rows in set (0.01 sec)
```

EXPLAIN 输出一个名称为 `QUERY PLAN` 树形结构，每个叶子节点都包含节点类型、受影响的对象。我们现在只使用节点类型信息来简化展示上面的示例。`QUERY PLAN` 树形结构可以可视化 SQL 查询的整个过程，显示它所经过的操作节点。

```
Project
└── Filter
    └── Join
        └── Table Scan
        └──	Table Scan
```

## 节点类型

MatrixOne 支持以下节点类型。

| 节点名称                      | 含义             |
|: -------------------------- |: --------------- |
| Values Scan	              | 处理值的扫描|
| Table Scan	              | 从表中扫描数据|
| External Scan	              | 处理外部的数据扫描|
| Source Scan	              | 处理 source 表的数据扫描|
| Project	                  | 对数据进行投影运算|
| Sink	                      | 分发同一份数据给一个 / 多个对象|
| Sink Scan                   | 读取其他对象分发过来的数据|
| Recursive Scan	          | 循环 CTE 语法中，处理每次循环结束时的数据，判断是否开启下一轮循环 |
| CTE Scan	                  | 循环 CTE 语法中，读每次循环开始时的数据 |
| Aggregate	                  | 对数据进行聚合|
| Filter	                  | 对数据进行过滤|
| Join	                      | 对数据进行连接运算|
| Sample                      |	SAMPLE 采样函数，对数据进行抽样|
| Sort	                      | 对数据进行排序|
| Partition                   | 范围窗口中对数据进行排序，并按值切分|
| Union	                      | 对两个或多个查询的结果集组合|
| Union All	                  | 对两个或多个查询的结果集组合，包括重复行|
| Window	                  | 对数据进行范围窗口计算|
| Time Window	              | 对数据进行时间窗口计算|
| Fill	                      | 处理时间窗口中的 NULL 值|
| Insert	                  | 对数据进行插入|
| Delete	                  | 对数据进行删除|
| Intersect                   | 对两个或多个查询的都存在的行组合|
| Intersect All	              | 对两个或多个查询的都存在的行组合，包括重复行|
| Minus	                      | 比较两个查询的结果，返回存在于第一个查询而在第二个查询中不存在的行|
| Table Function              | 通过表函数读取数据|
| PreInsert	                  | 整理要写入的数据|
| PreInsert UniqueKey	      | 整理要写入到唯一键隐藏表的数据|
| PreInsert SecondaryKey	  | 整理要写入到次级索引隐藏表的数据|
| PreDelete	                  | 整理分区表所需要删除的数据。|
| On Duplicate Key	          | 对重复的数据进行更新|
| Fuzzy Filter for duplicate key	| 对写入/更新的数据进行去重|
| Lock	                      |对操作的数据上锁|

## 示例

### VALUES Scan & Project

```sql
mysql> explain  select abs(-1);
+-------------------------------+
| QUERY PLAN                    |
+-------------------------------+
| Project                       |
|   ->  Values Scan "*VALUES*"  |
+-------------------------------+
2 rows in set (0.00 sec)
```

### Table Scan

```sql
mysql> explain select * from customer;
+-----------------------------------+
| QUERY PLAN                        |
+-----------------------------------+
| Project                           |
|   ->  Table Scan on tpch.customer |
+-----------------------------------+
2 rows in set (0.01 sec)
```

### External Scan

```sql
mysql> create external table extable(n1 int)infile{"filepath"='yourpath/xx.csv'} ;
Query OK, 0 rows affected (0.03 sec)

mysql> explain select * from extable;
+------------------------------------+
| QUERY PLAN                         |
+------------------------------------+
| Project                            |
|   ->  External Scan on db1.extable |
+------------------------------------+
2 rows in set (0.01 sec)
```

### Sink & Lock & Delete & Insert & PreInsert & Sink Scan

```sql
mysql> create table t3(n1 int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t3 values(1);
Query OK, 1 row affected (0.01 sec)

mysql> explain update t3 set n1=2;
+-----------------------------------------------+
| QUERY PLAN                                    |
+-----------------------------------------------+
| Plan 0:                                       |
| Sink                                          |
|   ->  Lock                                    |
|         ->  Project                           |
|               ->  Project                     |
|                     ->  Table Scan on tpch.t3 |
| Plan 1:                                       |
| Delete on tpch.t3                             |
|   ->  Sink Scan                               |
|         DataSource: Plan 0                    |
| Plan 2:                                       |
| Insert on tpch.t3                             |
|   ->  Project                                 |
|         ->  PreInsert on tpch.t3              |
|               ->  Project                     |
|                     ->  Sink Scan             |
|                           DataSource: Plan 0  |
+-----------------------------------------------+
17 rows in set (0.00 sec)
```

### Recursive Scan & CTE Scan & Filter

```sql
mysql> create table t4(n1 int,n2 int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t4 values(1,1),(2,2),(3,3);
Query OK, 3 rows affected (0.01 sec)

mysql> explain WITH RECURSIVE t4_1(n1_1) AS (
    ->     SELECT n1 FROM t4 
    ->     UNION all
    ->     SELECT n1_1 FROM t4_1 WHERE n1_1=1
    -> )
    -> SELECT * FROM t4_1;
+---------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                        |
+---------------------------------------------------------------------------------------------------+
| Plan 0:                                                                                           |
| Sink                                                                                              |
|   ->  Project                                                                                     |
|         ->  Table Scan on tpch.t4                                                                 |
| Plan 1:                                                                                           |
| Sink                                                                                              |
|   ->  Project                                                                                     |
|         ->  Filter                                                                                |
|               Filter Cond: (t4_1.n1_1 = 1), mo_check_level((t4_1.__mo_recursive_level_col < 100)) |
|               ->  Recursive Scan                                                                  |
|                     DataSource: Plan 2                                                            |
| Plan 2:                                                                                           |
| Sink                                                                                              |
|   ->  CTE Scan                                                                                    |
|         DataSource: Plan 0, Plan 1                                                                |
| Plan 3:                                                                                           |
| Project                                                                                           |
|   ->  Sink Scan                                                                                   |
|         DataSource: Plan 2                                                                        |
+---------------------------------------------------------------------------------------------------+
19 rows in set (0.00 sec)
```

### Aggregate  

```sql
mysql>  explain  SELECT count(*) FROM NATION group by N_NAME;
+-------------------------------------------+
| QUERY PLAN                                |
+-------------------------------------------+
| Project                                   |
|   ->  Aggregate                           |
|         Group Key: nation.n_name          |
|         Aggregate Functions: starcount(1) |
|         ->  Table Scan on tpch.nation     |
+-------------------------------------------+
5 rows in set (0.01 sec)
```

### Join

```sql
mysql>  create table t5(n1 int);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into t5 values(1),(2),(3);
Query OK, 3 rows affected (0.01 sec)

mysql> create table t6(n1 int);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into t5 values(3),(4),(5);
Query OK, 3 rows affected (0.01 sec)

mysql> explain SELECT * FROM t5 LEFT JOIN t6 ON t5.n1 = t6.n1;
+------------------------------------+
| QUERY PLAN                         |
+------------------------------------+
| Project                            |
|   ->  Join                         |
|         Join Type: LEFT            |
|         Join Cond: (t5.n1 = t6.n1) |
|         ->  Table Scan on tpch.t5  |
|         ->  Table Scan on tpch.t6  |
+------------------------------------+
6 rows in set (0.00 sec)
```

### Sample

```sql
mysql> explain SELECT SAMPLE(c_address, 90 percent) FROM customer;
+-----------------------------------------------------+
| QUERY PLAN                                          |
+-----------------------------------------------------+
| Project                                             |
|   ->  Sample                                        |
|         Sample 90.00 Percent by: customer.c_address |
|         ->  Table Scan on tpch.customer             |
+-----------------------------------------------------+
4 rows in set (0.00 sec)
```

### SORT

```sql
mysql> explain select * from customer order by c_custkey;
+-----------------------------------------------+
| QUERY PLAN                                    |
+-----------------------------------------------+
| Project                                       |
|   ->  Sort                                    |
|         Sort Key: customer.c_custkey INTERNAL |
|         ->  Table Scan on tpch.customer       |
+-----------------------------------------------+
4 rows in set (0.00 sec)
```

### Partition & Window

```sql
mysql>CREATE TABLE t7(n1 int,n2 int);
Query OK, 0 rows affected (0.01 sec)

mysql>  INSERT INTO t7 values(1,3),(2,2),(3,1);
Query OK, 3 rows affected (0.01 sec)

mysql> explain SELECT SUM(n1) OVER(PARTITION BY n2) AS sn1 FROM t7;
+----------------------------------------------------------+
| QUERY PLAN                                               |
+----------------------------------------------------------+
| Project                                                  |
|   ->  Window                                             |
|         Window Function: sum(t7.n1); Partition By: t7.n2 |
|         ->  Partition                                    |
|               Sort Key: t7.n2 INTERNAL                   |
|               ->  Table Scan on tpch.t7                  |
+----------------------------------------------------------+
6 rows in set (0.01 sec)
```

### Time window & Fill

```sql
mysql> CREATE TABLE sensor_data (ts timestamp(3) primary key, temperature FLOAT);
Query OK, 0 rows affected (0.01 sec)

mysql> INSERT INTO sensor_data VALUES('2023-08-01 00:00:00', 25.0);
Query OK, 1 row affected (0.01 sec)

mysql> INSERT INTO sensor_data VALUES('2023-08-01 00:05:00', 26.0);
Query OK, 1 row affected (0.01 sec)

mysql> explain select _wstart, _wend from sensor_data  interval(ts, 10, minute)  fill(prev);
+---------------------------------------------------+
| QUERY PLAN                                        |
+---------------------------------------------------+
| Project                                           |
|   ->  Fill                                        |
|         Fill Columns:                             |
|         Fill Mode: Prev                           |
|         ->  Time window                           |
|               Sort Key: sensor_data.ts            |
|               Aggregate Functions: _wstart, _wend |
|               ->  Table Scan on db2.sensor_data   |
+---------------------------------------------------+
8 rows in set (0.00 sec)
```

### Intersect

```sql
mysql> explain select * from t5 intersect select * from t6;
+-----------------------------------------+
| QUERY PLAN                              |
+-----------------------------------------+
| Project                                 |
|   ->  Intersect                         |
|         ->  Project                     |
|               ->  Table Scan on tpch.t5 |
|         ->  Project                     |
|               ->  Table Scan on tpch.t6 |
+-----------------------------------------+
6 rows in set (0.00 sec)
```

### Intersect All

```sql
mysql> explain select * from t5 intersect all select * from t6;
+-----------------------------------------+
| QUERY PLAN                              |
+-----------------------------------------+
| Project                                 |
|   ->  Intersect All                     |
|         ->  Project                     |
|               ->  Table Scan on tpch.t5 |
|         ->  Project                     |
|               ->  Table Scan on tpch.t6 |
+-----------------------------------------+
6 rows in set (0.00 sec)
```

### Minus

```sql
mysql> explain select * from t5 minus  select * from t6;
+-----------------------------------------+
| QUERY PLAN                              |
+-----------------------------------------+
| Project                                 |
|   ->  Minus                             |
|         ->  Project                     |
|               ->  Table Scan on tpch.t5 |
|         ->  Project                     |
|               ->  Table Scan on tpch.t6 |
+-----------------------------------------+
6 rows in set (0.00 sec)
```

### Table Function

```sql
mysql>  explain select * from unnest('{"a":1}') u;
+-------------------------------------+
| QUERY PLAN                          |
+-------------------------------------+
| Project                             |
|   ->  Table Function on unnest      |
|         ->  Values Scan "*VALUES*"  |
+-------------------------------------+
3 rows in set (0.10 sec)
```

### PreInsert UniqueKey & Fuzzy Filter for duplicate key

```sql
mysql> CREATE TABLE t8(n1 int,n2 int UNIQUE key);
Query OK, 0 rows affected (0.01 sec)

mysql> explain INSERT INTO t8(n2) values(1);
+---------------------------------------------------------------------------------+
| QUERY PLAN                                                                      |
+---------------------------------------------------------------------------------+
| Plan 0:                                                                         |
| Sink                                                                            |
|   ->  PreInsert on tpch.t8                                                      |
|         ->  Project                                                             |
|               ->  Project                                                       |
|                     ->  Values Scan "*VALUES*"                                  |
| Plan 1:                                                                         |
| Sink                                                                            |
|   ->  Lock                                                                      |
|         ->  PreInsert UniqueKey                                                 |
|               ->  Sink Scan                                                     |
|                     DataSource: Plan 0                                          |
| Plan 2:                                                                         |
| Insert on tpch.__mo_index_unique_018e2d16-6629-719d-82b5-036222e9658a           |
|   ->  Sink Scan                                                                 |
|         DataSource: Plan 1                                                      |
| Plan 3:                                                                         |
| Fuzzy Filter for duplicate key                                                  |
|   ->  Table Scan on tpch.__mo_index_unique_018e2d16-6629-719d-82b5-036222e9658a |
|         Filter Cond: (__mo_index_idx_col = 1)                                   |
|         Block Filter Cond: (__mo_index_idx_col = 1)                             |
|   ->  Sink Scan                                                                 |
|         DataSource: Plan 1                                                      |
| Plan 4:                                                                         |
| Insert on tpch.t8                                                               |
|   ->  Sink Scan                                                                 |
|         DataSource: Plan 0                                                      |
+---------------------------------------------------------------------------------+
27 rows in set (0.01 sec)
```

### PreInsert SecondaryKey

```sql
mysql>  CREATE TABLE t9 ( n1 int , n2 int, KEY key2 (n2) USING BTREE);
Query OK, 0 rows affected (0.02 sec)

mysql>  explain INSERT INTO t9(n2) values(2);
+--------------------------------------------------------------------------+
| QUERY PLAN                                                               |
+--------------------------------------------------------------------------+
| Plan 0:                                                                  |
| Sink                                                                     |
|   ->  PreInsert on tpch.t9                                               |
|         ->  Project                                                      |
|               ->  Project                                                |
|                     ->  Values Scan "*VALUES*"                           |
| Plan 1:                                                                  |
| Insert on tpch.__mo_index_secondary_018e2d14-6f20-7db0-babb-c1fd505fd3c5 |
|   ->  Lock                                                               |
|         ->  PreInsert SecondaryKey                                       |
|               ->  Sink Scan                                              |
|                     DataSource: Plan 0                                   |
| Plan 2:                                                                  |
| Insert on tpch.t9                                                        |
|   ->  Sink Scan                                                          |
|         DataSource: Plan 0                                               |
+--------------------------------------------------------------------------+
16 rows in set (0.00 sec)
```
