# EXPLAIN PREPARED

## 语法说明

在 MatrixOne 中，EXPLAIN 是一个用于获取 SQL 查询的执行计划的命令，而 PREPARE 是一个用来创建一个准备好的语句（prepared statement）的命令。将这两个命令一起使用，可以带来以下优势：

- 性能调优：通过查看执行计划，你可以了解查询的效率，识别潜在的性能瓶颈。

- 安全：因为 PREPARE 分离了 SQL 语句的结构和数据，它有助于防止 SQL 注入攻击。

- 重用：准备好的语句可以被重复使用，这在需要多次执行相同查询但使用不同参数的情况下非常有用。

## 语法结构

```
PREPARE stmt_name FROM preparable_stmt
```

```
EXPLAIN

where option can be one of:
    ANALYZE [ boolean ]
    VERBOSE [ boolean ]
    (FORMAT=TEXT)

FORCE EXECUTE stmt_name
```

## 示例

**示例 1**

```sql
create table t1(n1 int);
insert into t1 values(1);
prepare st_t1 from 'select * from t1';

mysql> explain force execute st_t1;
+----------------------------+
| QUERY PLAN                 |
+----------------------------+
| Project                    |
|   ->  Table Scan on db1.t1 |
+----------------------------+
2 rows in set (0.01 sec)
```

**示例 2**

```sql
create table t2 (col1 int, col2 decimal);
insert into t2 values (1,2);
prepare st from 'select * from t2 where col1 = ?';
set @A = 1;

mysql> explain force execute st using @A;
+---------------------------------------------------+
| QUERY PLAN                                        |
+---------------------------------------------------+
| Project                                           |
|   ->  Table Scan on db1.t2                        |
|         Filter Cond: (t2.col1 = cast('1' AS INT)) |
+---------------------------------------------------+
3 rows in set (0.00 sec)

mysql> explain verbose force execute st using @A;
+----------------------------------------------------------------------------------------+
| QUERY PLAN                                                                             |
+----------------------------------------------------------------------------------------+
| Project (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)                    |
|   Output: t2.col1, t2.col2                                                             |
|   ->  Table Scan on db1.t2 (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1) |
|         Output: t2.col1, t2.col2                                                       |
|         Table: 't2' (0:'col1', 1:'col2')                                               |
|         Filter Cond: (t2.col1 = cast('1' AS INT))                                      |
+----------------------------------------------------------------------------------------+
6 rows in set (0.00 sec)

mysql> explain analyze force execute st using @A;
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                                                                    |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| Project                                                                                                                                       |
|   Analyze: timeConsumed=0ms waitTime=0ms inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=0bytes                      |
|   ->  Table Scan on db1.t2                                                                                                                    |
|         Analyze: timeConsumed=0ms waitTime=0ms inputBlocks=1 inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=21bytes |
|         Filter Cond: (t2.col1 = 1)                                                                                                            |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
5 rows in set (0.00 sec)

mysql> explain analyze verbose force execute st using @A;
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                                                                    |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| Project (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)                                                                           |
|   Output: t2.col1, t2.col2                                                                                                                    |
|   Analyze: timeConsumed=0ms waitTime=0ms inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=0bytes                      |
|   ->  Table Scan on db1.t2 (cost=1000.00 outcnt=1000.00 selectivity=1.0000 blockNum=1)                                                        |
|         Output: t2.col1, t2.col2                                                                                                              |
|         Table: 't2' (0:'col1', 1:'col2')                                                                                                      |
|         Analyze: timeConsumed=0ms waitTime=0ms inputBlocks=1 inputRows=1 outputRows=1 InputSize=20bytes OutputSize=20bytes MemorySize=21bytes |
|         Filter Cond: (t2.col1 = 1)                                                                                                            |
+-----------------------------------------------------------------------------------------------------------------------------------------------+
8 rows in set (0.00 sec)

```
