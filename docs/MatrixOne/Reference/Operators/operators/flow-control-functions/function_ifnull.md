# **IFNULL**

## **语法说明**

如果 `expr1` 不为 `NULL`，则 `IFNULL()` 返回 `expr1`；否则返回 `expr2`。

## **语法结构**

```
> IFNULL(expr1,expr2)
```

## **示例**

```sql
mysql> SELECT IFNULL(NULL,10);
+------------------+
| ifnull(null, 10) |
+------------------+
|               10 |
+------------------+
1 row in set (0.01 sec)
```

```sql
mysql> SELECT CAST(IFNULL(NULL, NULL) AS DECIMAL);
+-----------------------------------------+
| cast(ifnull(null, null) as decimal(38)) |
+-----------------------------------------+
|                                    NULL |
+-----------------------------------------+
1 row in set (0.01 sec)
```
