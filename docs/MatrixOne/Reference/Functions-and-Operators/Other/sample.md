# SAMPLE 采样函数

SAMPLE 采样函数功能是处理大量数据分析的关键工具，主要用于快速缩减查询范围。

1. 语法结构

```sql
SELECT SAMPLE(<column_list>, <N ROWS>/<K PERCENT>) FROM <table> [WHERE ...] [GROUP BY ...] [ORDER BY ...] [LIMIT ...] [OFFSET ...]
```

* `<column_list>`: 选择的列名列表。
* `<N ROWS>/<K PERCENT>`: 指定返回的样本数量（N 行）或百分比（K%）。

2. 功能特点

* SAMPLE 函数会在表过滤再执行采样。
* 返回表中 N 个随机样本，或 K%的随机样本。
* 当指定 N 行时，N 为 1-1000 的正整数。
* 当指定 K%时，K 的取值范围为 0.01-99.99 的，代表每行被选中的概率，结果每次可能不同，且行数不固定。比如表有 10000 行，执行 SAMPLE(a, 50 PERCENT); 由于每行都是有 50% 的概率被选中，类似于掷了 1 万次硬币，正反面的概率每次都是 50%，但是最终的结果可能是 350 次正面，650 次反面。
* 支持多列采样，如 SELECT SAMPLE(a,b,c, 100 ROWS) FROM t1;。
* 可与 WHERE 子句、GROUP BY 子句等结合使用。

3. 应用示例

```sql
SELECT SAMPLE(a, 100 ROWS) FROM t1; -- 返回 100 个随机样本
SELECT SAMPLE(a, 0.2 PERCENT) FROM t1; -- 返回约 0.2% 的样本
SELECT SAMPLE(a, 100 ROWS) FROM t1 WHERE a > 1; -- 先过滤后采样
SELECT a, SAMPLE(b, 100 ROWS) FROM t1 GROUP BY a; -- 分组后采样
```