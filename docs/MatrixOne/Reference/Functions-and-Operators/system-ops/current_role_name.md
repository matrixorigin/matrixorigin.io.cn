# **CURRENT_ROLE_NAME()**

## **函数说明**

`CURRENT_ROLE_NAME()` 用于查询你当前所登录的用户所拥有的角色的名称。

## **函数语法**

```
> CURRENT_ROLE_NAME()
```

## **示例**

```sql
mysql> select current_role_name();
+---------------------+
| current_role_name() |
+---------------------+
| moadmin             |
+---------------------+
1 row in set (0.00 sec)
```
