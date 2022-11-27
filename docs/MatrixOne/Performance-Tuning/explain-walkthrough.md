# 使用 EXPLAIN 解读执行计划

SQL 是一种声明性语言，因此无法通过 SQL 语句直接判断一条查询的执行是否有效率，但是可以使用 `EXPLAIN` 语句查看当前的执行计划。

## 示例

我们这里准备一个简单的示例，帮助你理解使用 EXPLAIN 解读执行计划。

```sql
> drop table if exists a;
> create table a(a int);
> insert into a values(1),(2),(3),(4),(5),(6),(7),(8);
> select count(*) from a where a>=2 and a<=8;
+----------+
| count(*) |
+----------+
|        7 |
+----------+
1 row in set (0.00 sec)

> explain select count(*) from a where a>=2 and a<=8;
+-----------------------------------------------------------------------------------+
| QUERY PLAN                                                                        |
+-----------------------------------------------------------------------------------+
| Project                                                                           |
|   ->  Aggregate                                                                   |
|         Aggregate Functions: starcount(1)                                         |
|         ->  Table Scan on aab.a                                                   |
|               Filter Cond: (CAST(a.a AS BIGINT) >= 2), (CAST(a.a AS BIGINT) <= 8) |
+-----------------------------------------------------------------------------------+
5 rows in set (0.00 sec)
```

以上是该查询的执行计划结果。从 `Filter Cond` 算子开始向上看，查询的执行过程如下：

1. 先执行过滤条件 `Filter Cond`：即过滤出数据类型为 `BIGINT` 且大于等于 2，小于等于 8 的整数，按照计算推理，应该为 `(2),(3),(4),(5),(6),(7),(8)`。
2. 扫描数据库 aab 中的表 a;
3. 聚合计算满足条件整数的个数，为 7 个。

最终，得到查询结果为 7，即 `count(*)` = 7。

### 评估当前的性能

EXPLAIN 语句只返回查询的执行计划，并不执行该查询。若要获取实际的执行时间，可执行该查询，或使用 EXPLAIN ANALYZE 语句。

#### 什么是 EXPLAIN ANALYZE

EXPLAIN ANALYZE 是一个用于查询的分析工具，它将向你显示 SQL 在查询上花费的时间以及原因。它将计划查询、检测它并执行它，同时计算行数并测量在执行计划的各个点花费的时间。执行完成后，EXPLAIN ANALYZE 将打印计划和测量结果，而不是查询结果。

除了正常 EXPLAIN 将打印的查询计划和估计成本之外，EXPLAIN ANALYZE 还打印执行计划中各个迭代器的实际成本。

#### 如何使用它？

这里还是继续使用上述示例，你可以执行下面的代码：

```sql
> explain analyze select count(*) from a where a>=2 and a<=8;
+-------------------------------------------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                                                    |
+-------------------------------------------------------------------------------------------------------------------------------+
| Project                                                                                                                       |
|   Analyze: timeConsumed=0us inputRows=1 outputRows=1 inputSize=8bytes outputSize=8bytes memorySize=8bytes                     |
|   ->  Aggregate                                                                                                               |
|         Analyze: timeConsumed=3317us inputRows=2 outputRows=2 inputSize=8bytes outputSize=16bytes memorySize=16bytes          |
|         Aggregate Functions: starcount(1)                                                                                     |
|         ->  Table Scan on aab.a                                                                                               |
|               Analyze: timeConsumed=6643us inputRows=31 outputRows=24 inputSize=96bytes outputSize=64bytes memorySize=64bytes |
|               Filter Cond: (CAST(a.a AS BIGINT) >= 2), (CAST(a.a AS BIGINT) <= 8)                                             |
+-------------------------------------------------------------------------------------------------------------------------------+
8 rows in set (0.00 sec)
```

从打印的执行结果来看，当分别执行聚合计算和扫描表时，都会得出以下几个测量值，这些测量值可以作为参考项：

- 总耗时 timeConsumed
- 读取的行数
- 读取的容量大小
- 内存大小

通过在这些信息，你可以分析查询并理解它们为何是这样的表现，可以从以下几个方面进行探索：

- 执行这些查询，需要花费多久？你可以查看总耗时。

- 为什么执行当前的查询计划，而不是其他的执行计划？你可以查看行计数器。当估计行数与实际行数之间的巨大差异（即，几个数量级或更多）时，说明优化器根据估计选择计划，但查看实际执行可以方便你得知到底哪个执行计划更好。

所以使用 EXPLAIN ANALYZE 就是分析查询执行。

从上面的输出结果来看，执行以上示例查询耗时 0.00 秒，说明执行性能较为理想。也由于我们这次示例中执行的查询简单，满足较高的执行性能。

更多关于 EXPLAIN ANALYZE 的信息，请参见 [EXPLAIN ANALYZE](../Reference/SQL-Reference/Explain/explain-analyze.md)。
