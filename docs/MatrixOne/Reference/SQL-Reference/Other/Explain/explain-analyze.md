# 通过 `EXPLAIN ANALYZE` 获取信息

`EXPLAIN ANALYZE` 是一个用于查询的分析工具，它将向你显示 SQL 在查询上花费的时间以及原因。它将计划查询、检测它并执行它，同时计算行数并测量在执行计划的各个点花费的时间。执行完成后，`EXPLAIN ANALYZE` 将打印计划和测量结果，而不是查询结果。

`EXPLAIN ANALYZE`，它运行 SQL 语句产生 `EXPLAIN` 输出，此外，还产生其他信息，例如时间和基于迭代器的附加信息，以及关于优化器的预期与实际执行的匹配情况。

对于每个迭代器，提供以下信息：

- 预计执行成本

   成本模型没有考虑一些迭代器，因此不包括在估算中。

- 估计的返回的行数

- 返回第一行的时间

- 执行此迭代器（仅包括子迭代器，但不包括父迭代器）所花费的时间，以毫秒为单位。

- 迭代器返回的行数

- 循环数

查询执行信息使用 `TREE` 输出格式显示，其中节点代表迭代器。`EXPLAIN ANALYZE` 始终使用 `TREE` 输出格式。

`EXPLAIN ANALYZE` 可以与 `SELECT` 语句一起使用，也可以与多表 `UPDATE` 和 `DELETE` 语句一起使用。

你可以使用 `KILL QUERY` 或 `CTRL-C` 终止此语句。

`EXPLAIN ANALYZE` 不能与 `FOR CONNECTION` 一起使用。

## 示例

**建表**

```sql
CREATE TABLE t1 (
    c1 INTEGER DEFAULT NULL,
    c2 INTEGER DEFAULT NULL
);

CREATE TABLE t2 (
    c1 INTEGER DEFAULT NULL,
    c2 INTEGER DEFAULT NULL
);

CREATE TABLE t3 (
    pk INTEGER NOT NULL PRIMARY KEY,
    i INTEGER DEFAULT NULL
);
```

**表输出结果**：

```sql
> mysql> EXPLAIN ANALYZE SELECT * FROM t1 JOIN t2 ON (t1.c1 = t2.c2)\G
*************************** 1. row ***************************
QUERY PLAN: Project
*************************** 2. row ***************************
QUERY PLAN:   Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 3. row ***************************
QUERY PLAN:   ->  Join
*************************** 4. row ***************************
QUERY PLAN:         Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=16441bytes
*************************** 5. row ***************************
QUERY PLAN:         Join Type: INNER
*************************** 6. row ***************************
QUERY PLAN:         Join Cond: (t1.c1 = t2.c2)
*************************** 7. row ***************************
QUERY PLAN:         ->  Table Scan on tpch.t1
*************************** 8. row ***************************
QUERY PLAN:               Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 9. row ***************************
QUERY PLAN:         ->  Table Scan on tpch.t2
*************************** 10. row ***************************
QUERY PLAN:               Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
10 rows in set (0.00 sec)

> EXPLAIN ANALYZE SELECT * FROM t3 WHERE i > 8\G
*************************** 1. row ***************************
QUERY PLAN: Project
*************************** 2. row ***************************
QUERY PLAN:   Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 3. row ***************************
QUERY PLAN:   ->  Table Scan on tpch.t3
*************************** 4. row ***************************
QUERY PLAN:         Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 5. row ***************************
QUERY PLAN:         Filter Cond: (t3.i > 8)
5 rows in set (0.00 sec)

> EXPLAIN ANALYZE SELECT * FROM t3 WHERE pk > 17\G
*************************** 1. row ***************************
QUERY PLAN: Project
*************************** 2. row ***************************
QUERY PLAN:   Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 3. row ***************************
QUERY PLAN:   ->  Table Scan on tpch.t3
*************************** 4. row ***************************
QUERY PLAN:         Analyze: timeConsumed=0ms waitTime=0ms inputRows=0 outputRows=0 InputSize=0bytes OutputSize=0bytes MemorySize=0bytes
*************************** 5. row ***************************
QUERY PLAN:         Filter Cond: (t3.pk > 17)
5 rows in set (0.01 sec)
```
