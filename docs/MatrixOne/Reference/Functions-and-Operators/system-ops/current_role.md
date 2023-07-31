# **CURRENT_ROLE()**

## **函数说明**

`CURRENT_ROLE_NAME()` 用于查询你当前所登录的用户所拥有的角色。

## **函数语法**

```
> CURRENT_ROLE()
```

## **示例**

```sql
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| moadmin        |
+----------------+
1 row in set (0.00 sec)
```
