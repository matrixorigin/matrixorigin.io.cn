# 使用 BITMAP 对数据去重

Matrixone 支持使用 [`BITMAP`](../../Reference/Functions-and-Operators/Aggregate-Functions/bitmap.md) 处理不同值（distinct values）的计数。

本篇文章将介绍 `BITMAP` 的一些应用场景和案例。

## 应用场景

在 MatrixOne 中，`BITMAP` 用于优化特定类型的查询操作，尤其是在处理具有低基数（low cardinality）的列时，帮助用户在大数据环境中实现了快速的数据分析和决策支持。以下是一些 `BITMAP` 的使用场景：

1. **用户行为分析**：假设一个电商平台想要分析不同用户的行为模式。他们有一个事件表，记录了用户的每一次点击事件，包括用户 ID、时间戳、事件类型等。通过使用 `BITMAP`，可以快速地对用户的行为进行分类和统计，例如，找出所有进行过“购买”行为的用户数量。

2. **多维度分析**：在数据仓库中，经常需要对多个维度进行分析，例如，分析特定时间段内不同地区的销售情况。通过 `BITMAP`，可以快速地对日期和地区这两个维度进行筛选，从而提高查询效率。

3. **统计不同值的数量**：在处理具有大量唯一值的列时，如产品类别或用户状态，使用 `BITMAP` 可以高效地计算这些列中不同值的数量。例如，一个社交媒体平台可能需要统计其用户活跃状态（在线、离线）的不同数量。

4. **层次化聚合加速**：在需要进行层次化聚合查询时，如对销售数据进行季度和年度汇总，`BITMAP` 可以加速计算过程。通过使用 `BITMAP`，可以快速地对数据进行分组和聚合，从而得到所需的统计信息。

5. **优化复杂查询**：对于包含多个条件的复杂查询，`BITMAP` 可以快速筛选出符合条件的数据。例如，一个金融公司可能需要找出同时满足“高净值客户”和“投资于特定基金”的用户。

## 开始前准备

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## 案例

根据上述场景一设计案例，分析电商平台不同用户的行为模式。

### 步骤

#### 1. 建立用户表并导入数据

准备一个名为 `user_behavior_table` 的表以及对应的 csv 数据，这个 csv 数据表共有 39270760 行数据。

```sql
CREATE TABLE user_behavior_table(
user_id int,--用户 id
behavior varchar(100),--行为，包括 browser,purchase,returns
occur_year varchar(100)--行为发生年份
);

LOAD DATA INFILE '/your_path/user_behavior_table.csv' INTO TABLE user_behavior_table FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"';
```

#### 2. 定义预计算表

把粗粒度的计算结果保存在预计算表中，后续各种不同维度聚合可以使用预计算表中的结果，经过简单的计算就可以得到结果，加速查询。

```sql
CREATE TABLE precompute AS
SELECT
  behavior,
  occur_year,
  BITMAP_BUCKET_NUMBER(user_id) as bucket,
  BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(user_id)) as bitmap 
FROM user_behavior_table
GROUP BY  behavior,occur_year,bucket;
```

#### 3. 按不同维度聚合筛选数据

计算在用户行为和年份聚合情况下 user_id 的去重数量，反应的是在不同年份进行商品浏览、购买和退货的用户数量。

```sql
mysql> SELECT
    ->     behavior,
    ->     occur_year,
    ->     SUM(BITMAP_COUNT(bitmap))
    ->     FROM precompute
    ->     GROUP BY  behavior,occur_year;
+----------+------------+---------------------------+
| behavior | occur_year | sum(bitmap_count(bitmap)) |
+----------+------------+---------------------------+
| browser  | 2022       |                    939995 |
| browser  | 2023       |                   1003173 |
| purchase | 2022       |                    669474 |
| purchase | 2023       |                    660605 |
| returns  | 2023       |                      4910 |
| returns  | 2022       |                      4350 |
+----------+------------+---------------------------+
6 rows in set (0.01 sec)

mysql> select behavior,occur_year,count(distinct user_id) from user_behavior_table group by
behavior,occur_year;
+----------+------------+-------------------------+
| behavior | occur_year | count(distinct user_id) |
+----------+------------+-------------------------+
| purchase | 2022       |                  669474 |
| browser  | 2022       |                  939995 |
| browser  | 2023       |                 1003173 |
| purchase | 2023       |                  660605 |
| returns  | 2023       |                    4910 |
| returns  | 2022       |                    4350 |
+----------+------------+-------------------------+
6 rows in set (2.19 sec)
```

计算 2022-2023 年进行商品浏览、购买和退货的用户数量。

```sql
mysql> SELECT behavior, SUM(cnt) FROM (
    -> SELECT
    -> behavior,
    -> BITMAP_COUNT(BITMAP_OR_AGG(bitmap)) cnt
    -> FROM precompute
    -> GROUP BY behavior,bucket
    -> )
    -> GROUP BY behavior;
+----------+----------+
| behavior | sum(cnt) |
+----------+----------+
| browser  |  1003459 |
| purchase |   780308 |
| returns  |     9260 |
+----------+----------+
3 rows in set (0.01 sec)

mysql> select behavior,count(distinct user_id) from user_behavior_table group by behavior;
+----------+-------------------------+
| behavior | count(distinct user_id) |
+----------+-------------------------+
| browser  |                 1003459 |
| purchase |                  780308 |
| returns  |                    9260 |
+----------+-------------------------+
3 rows in set (1.44 sec)
```

对比两种查询的返回时间，显然使用 `BITMAP` 更高效。通过使用 `BITMAP`，商家能够迅速地筛选出特定类型的事件，从而统计出具有某种行为的用户总数。

## 参考文档

- [BITMAP](../../Reference/Functions-and-Operators/Aggregate-Functions/bitmap.md)
- [COUNT](../../Reference/Functions-and-Operators/Aggregate-Functions/count.md)
