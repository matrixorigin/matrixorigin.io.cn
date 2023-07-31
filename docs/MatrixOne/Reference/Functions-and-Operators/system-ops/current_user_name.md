# **CURRENT_USER_NAME()**

## **函数说明**

`CURRENT_USER_NAME()` 用于查询你当前所登录的用户名称。

## **函数语法**

```
> CURRENT_USER_NAME()
```

## **示例**

```sql
mysql> select current_user_name();
+---------------------+
| current_user_name() |
+---------------------+
| root                |
+---------------------+
1 row in set (0.01 sec)
```
