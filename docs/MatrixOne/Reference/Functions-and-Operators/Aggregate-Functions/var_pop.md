# **VAR_POP**

## **函数说明**

`VAR_POP()` 是一个聚合函数，计算总体方差。与 `VARIANCE()` 为同义词。

## **函数语法**

```
> VAR_POP(expr)
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
mysql> SELECT VAR_POP(RunScored) as Pop_Standard_Variance FROM t1;
+-----------------------+
| Pop_Standard_Variance |
+-----------------------+
|     284.8055555555555 |
+-----------------------+
1 row in set (0.01 sec)

-- 计算 WicketsTaken 列的方差
mysql> SELECT VAR_POP(WicketsTaken) as Pop_Std_Var_Wickets FROM t1;
+---------------------+
| Pop_Std_Var_Wickets |
+---------------------+
|  0.9166666666666665 |
+---------------------+
1 row in set (0.01 sec)
```
