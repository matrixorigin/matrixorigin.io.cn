# **CASE WHEN**

## **语法说明**

`CASE WHEN` 语句用于计算条件列表并返回多个可能结果表达式之一，`CASE WHEN` 可以比较等于、范围的条件。遇到第一个满足条件的即返回，不再往下比较，如果没有满足的条件则返回 `else` 里的结果，如果没有 `else` 则返回 `NULL`。

CASE 有两种格式，两种格式都支持可选的 `ELSE` 参数。：

- 一个简单的 `CASE` 函数将一个表达式与一组简单表达式进行比较以确定结果。
- `CASE` 搜索函数计算一组布尔表达式来确定结果。

## **语法结构**

- **语法结构 1**：

```
CASE value WHEN compare_value THEN result [WHEN compare_value THEN result ...] [ELSE result] END
```

这里的 `CASE` 语法返回的是第一个 `value=compare_value` 为 `true` 的分支的结果。

- **语法结构 2**：

```
CASE WHEN condition THEN result [WHEN condition THEN result ...] [ELSE result] END
```

这里的 `CASE` 语法返回的是第一个 `condition` 为 `true` 的分支的结果。

如果没有一个 `value=compare_value` 或者 `condition` 为 `true`，那么就会返回 `ELSE` 对应的结果，如果没有 `ELSE` 分支，那么返回 `NULL`。

!!! note "<font size=4>note</font>"
    <font size=3>`CASE` 语句不能有 `ELSE NULL` 从句, 并且 `CASE` 语句必须以 `END CASE` 结尾。
</font>

## **示例**

```sql
mysql> SELECT CASE WHEN 1>0 THEN 'true' ELSE 'false' END;
+------------------------------------------+
| case when 1 > 0 then true else false end |
+------------------------------------------+
| true                                     |
+------------------------------------------+
1 row in set (0.00 sec)
```

```sql
CREATE TABLE t1 (a INT, b INT);
Query OK, 0 rows affected (0.01 sec)

INSERT INTO t1 VALUES (1,1),(2,1),(3,2),(4,2),(5,3),(6,3);
Query OK, 6 rows affected (0.01 sec)

mysql> SELECT CASE WHEN AVG(a)>=0 THEN 'Positive' ELSE 'Negative' END FROM t1 GROUP BY b;
+-------------------------------------------------------+
| case when avg(a) >= 0 then Positive else Negative end |
+-------------------------------------------------------+
| Positive                                              |
| Positive                                              |
| Positive                                              |
+-------------------------------------------------------+
3 rows in set (0.00 sec)
```
