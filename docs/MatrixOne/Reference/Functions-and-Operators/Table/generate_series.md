# **GENERATE_SERIES()**

## **函数说明**

GENERATE_SERIES() 可以生成一个从起始值到结束值的序列，通常应用于以下场景：

1. 生成连续数字：用于生成一系列的整数，例如 1 到 10。
2. 生成日期时间序列：可生成每天、每小时等间隔的时间序列。
3. 结合表查询：用于动态生成或扩展数据。

## **函数语法**

```
>select * from generate_series(start, stop [, step]) g
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| start  | 起始值|
| stop   | 结束值|
| step   | 步长，默认为 1|

## **示例**

- 示例 1：

```sql
-- 生成 1-5 整数序列
mysql> select * from generate_series(5) g;
+--------+
| result |
+--------+
|      1 |
|      2 |
|      3 |
|      4 |
|      5 |
+--------+
5 rows in set (0.01 sec)

-- 生成 2-5 整数序列
mysql> select * from generate_series(2, 5) g;
+--------+
| result |
+--------+
|      2 |
|      3 |
|      4 |
|      5 |
+--------+
4 rows in set (0.00 sec)

-- 生成 1-5 整数序列，并指定步长为 2
mysql> select * from generate_series(1, 5,2) g;
+--------+
| result |
+--------+
|      1 |
|      3 |
|      5 |
+--------+
3 rows in set (0.01 sec)

--生成日期序列
mysql> select * from generate_series('2020-02-28 00:00:00','2021-03-01 00:01:00', '1 year') g;
+---------------------+
| result              |
+---------------------+
| 2020-02-28 00:00:00 |
| 2021-02-28 00:00:00 |
+---------------------+
2 rows in set (0.00 sec)
```