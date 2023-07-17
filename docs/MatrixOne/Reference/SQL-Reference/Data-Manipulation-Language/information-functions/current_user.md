# **CURRENT_USER, CURRENT_USER()**

## **语法说明**

返回当前用户账户，返回的账户形式为：用户名@hostname。返回值是 utf8mb3 字符集的字符串。

## **语法结构**

```
SELECT CURRENT_ROLE();
```

## **示例**

```sql
mysql> select current_user();
+----------------+
| current_user() |
+----------------+
| root@0.0.0.0   |
+----------------+
1 row in set (0.00 sec)
```
