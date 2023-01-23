# MatrixOne 执行计划概述

## 什么是执行计划

执行计划（execution plan，也叫查询计划或者解释计划）是数据库执行 SQL 语句的具体步骤，例如通过索引还是全表扫描访问表中的数据，连接查询的实现方式和连接的顺序等；执行计划根据你的表、列、索引和 `WHERE` 子句中的条件的详细信息，可以告诉你这个查询将会被如何执行或者已经被如何执行过，可以在不读取所有行的情况下执行对巨大表的查询；可以在不比较行的每个组合的情况下执行涉及多个表的连接。。如果 SQL 语句性能不够理想，首先应该查看它的执行计划。和大多数成熟的数据库产品一样，MatrixOne数据库也提供了这一分析查询语句性能的功能。

MatrixOne 查询优化器对输入的 SQL 查询语句通过**执行计划**而选择出效率最高的一种执行方案。你也可以通过执行计划看到 SQL 代码中那些效率比较低的地方。

## 使用 `EXPLAIN` 查询执行计划

使用 `EXPLAIN` 可查看 MatrixOne 执行某条 SQL 语句时的执行计划。

`EXPLAIN` 可以和 `SELECT`、`DELETE`、`INSERT`、`REPLACE`、`UPDATE` 语句结合使用。当 `EXPLAIN` 与可解释的语句一起使用时，MatrixOne 会解释它将如何处理该语句，包括有关表如何连接以及连接顺序的信息。

!!! note
    使用 MySQL 客户端连接到 MatrixOne 时，为避免输出结果在终端中换行，可先执行 `pager less -S` 命令。执行命令后，新的 `EXPLAIN` 的输出结果不再换行，可按右箭头 **→** 键水平滚动阅读输出结果。

## EXPLAIN 示例

下面的例子帮助你了解 `EXPLAIN`。

**数据准备**：

```sql
CREATE TABLE t (id INT NOT NULL PRIMARY KEY auto_increment, a INT NOT NULL, pad1 VARCHAR(255), INDEX(a));
INSERT INTO t VALUES (1, 1, 'aaa'),(2,2, 'bbb');
EXPLAIN SELECT * FROM t WHERE a = 1;
```

**返回结果**：

```sql
+------------------------------------------------+
| QUERY PLAN                                     |
+------------------------------------------------+
| Project                                        |
|   ->  Table Scan on aab.t                      |
|         Filter Cond: (CAST(t.a AS BIGINT) = 1) |
+------------------------------------------------+
```

`EXPLAIN` 实际不会执行查询。`EXPLAIN ANALYZE` 可用于实际执行查询并显示执行计划。如果 MatrixOne 所选的执行计划非最优，可用 `EXPLAIN` 或 `EXPLAIN ANALYZE` 来进行诊断。

**EXPLAIN 输出分析**

- QUERY PLAN，即本次执行的主题，查询计划

   + Filter Cond：过滤条件
   + Table Scan：对某个全表进行扫描

- Project 为这次查询过程中的执行顺序的父节点，Project 的结构是树状的，子节点计算完成后“流入”父节点。父节点、子节点和同级节点可能并行执行查询的一部分。

**范围查询**

在 `WHERE/HAVING/ON` 条件中，MatrixOne 优化器会分析主键或索引键的查询返回。如数字、日期类型的比较符，如大于、小于、等于以及大于等于、小于等于，字符类型的 `LIKE` 符号等。
