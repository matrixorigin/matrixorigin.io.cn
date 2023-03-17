# 注释

本文档介绍 MatrixOne 支持的注释语法。

MatrixOne 支持以下注释格式：

- 使用 `#` 注释：

   ```sql
   mysql> select 100-99;   # 注释内容
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```

- 使用 `--` 来注释一行。 `--`（双破折号）注释样式要求第二个破折号后跟至少一个空格或控制字符（例如空格、制表符、换行符等）。

   ```sql
   mysql> select 100-99;   -- 注释内容
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```
   
- 注释内容使用 `/*` 开头，以 `*/` 结束，与 C 语言中使用方式一样。此语法使注释可以扩展到多行。

   ```sql
   mysql> select 100 /* 注释内容 */ -99;
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```

   或：

   ```sql
   mysql> select 100
   /*
   注释内容
   */
   -99;
   +----------+
   | 100 - 99 |
   +----------+
   |        1 |
   +----------+
   1 row in set (0.01 sec)
   ```

## MySQL 兼容的注释语法

MatrixOne 也跟 MySQL 保持一致，支持 C 语言注释格式：

```sql
mysql> select 100 /*! Specific code */ -99;
+----------+
| 100 - 99 |
+----------+
|        1 |
+----------+
1 row in set (0.02 sec)
```

或：

```sql
mysql> select 100 /*!50110 Specific code */ -99;
+----------+
| 100 - 99 |
+----------+
|        1 |
+----------+
1 row in set (0.02 sec)
```

## MatrixOne 可执行的注释语法

MatrixOne 还支持另一种 C 语言注释格式：

```sql
mysql> select 100-99;   // This comment continues to the end of line
+----------+
| 100 - 99 |
+----------+
|        1 |
+----------+
1 row in set (0.03 sec)
```

Or:

```sql
mysql> // This comment continues to the line
    -> select 100-99;
+----------+
| 100 - 99 |
+----------+
|        1 |
+----------+
```

## 限制

MatrixOne 暂不支持嵌套注释。
