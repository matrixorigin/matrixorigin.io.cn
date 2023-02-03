# **NULLIF**

## **Description**

The `NULLIF()` function returns NULL if expr1 = expr2 is true，otherwise returns expr1。

The return value has the same type as the first argument。

## **Syntax**

```
> NULLIF(expr1,expr2)

```

## **Examples**

```sql
mysql> SELECT NULLIF(1,1);
+--------------+
| nullif(1, 1) |
+--------------+
|         NULL |
+--------------+
1 row in set (0.00 sec)
mysql> SELECT NULLIF(1,2);
+--------------+
| nullif(1, 2) |
+--------------+
|            1 |
+--------------+
1 row in set (0.01 sec)
mysql> SELECT CAST(IFNULL(NULL, NULL) AS DECIMAL);
+-----------------------------------------+
| cast(ifnull(null, null) as decimal(10)) |
+-----------------------------------------+
|                                    NULL |
+-----------------------------------------+
```
