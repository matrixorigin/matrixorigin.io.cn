# **SHOW COLLATION**

## **语法说明**

显示 MatrixOne 支持字符集的排序规则。默认情况下，`SHOW COLLATION` 的输出包括所有可用的排序规则。`LIKE` 子句（如果存在）指示要匹配的排序规则名称。`WHERE` 子句可以使用更一般的条件来选择行。

## **语法结构**

```
> SHOW COLLATION
    [LIKE 'pattern' | WHERE expr]
```

## **示例**

```sql
mysql> show collation;
+-------------+---------+------+----------+---------+
| Collation   | Charset | Id   | Compiled | Sortlen |
+-------------+---------+------+----------+---------+
| utf8mb4_bin | utf8mb4 |   46 | Yes      |       1 |
+-------------+---------+------+----------+---------+
1 row in set (0.00 sec)

mysql> show collation like '%';
+-------------+---------+------+----------+---------+
| Collation   | Charset | Id   | Compiled | Sortlen |
+-------------+---------+------+----------+---------+
| utf8mb4_bin | utf8mb4 |   46 | Yes      |       1 |
+-------------+---------+------+----------+---------+
1 row in set (0.00 sec)

mysql> show collation where 'Charset'='utf8mb4';
+-------------+---------+------+----------+---------+
| Collation   | Charset | Id   | Compiled | Sortlen |
+-------------+---------+------+----------+---------+
| utf8mb4_bin | utf8mb4 |   46 | Yes      |       1 |
+-------------+---------+------+----------+---------+
1 row in set (0.00 sec)
```
