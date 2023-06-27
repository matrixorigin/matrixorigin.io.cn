# **VARIANCE**

## **函数说明**

`VAR(expr)` 是一个聚合函数，计算总体方差。方差是统计学中的一个重要概念，用于衡量一组数据值的离散程度，即数据值与其平均值之间的差异。如果方差值较大，说明数据值之间的差异较大；反之，如果方差值较小，说明数据值之间的差异较小。

## **函数语法**

```
> VAR(expr)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| expr  | 任何数值类型的列的列名 |

## **示例**

```sql
CREATE TABLE t1(PlayerName VARCHAR(100) NOT NULL,RunScored INT NOT NULL,WicketsTaken INT NOT NULL);
INSERT INTO t1 VALUES('KL Rahul', 52, 0 ),('Hardik Pandya', 30, 1 ),('Ravindra Jadeja', 18, 2 ),('Washington Sundar', 10, 1),('D Chahar', 11, 2 ),  ('Mitchell Starc', 0, 3);

-- 计算 RunScored 列的方差
> SELECT VARIANCE(RunScored) as Pop_Standard_Variance FROM t1;
+-----------------------+
| Pop_Standard_Variance |
+-----------------------+
|     284.8055555555555 |
+-----------------------+
1 row in set (0.01 sec)

-- 计算 WicketsTaken 列的方差
mysql> SELECT VARIANCE(WicketsTaken) as Pop_Std_Var_Wickets FROM t1;
+---------------------+
| Pop_Std_Var_Wickets |
+---------------------+
|  0.9166666666666665 |
+---------------------+
1 row in set (0.01 sec)
```
