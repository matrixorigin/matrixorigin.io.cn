# **CURRENT_ROLE()**

## **语法说明**

返回当前会话的角色。

## **语法结构**

```
SELECT CURRENT_ROLE();
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

-- 新建一个角色，并且切换到新角色
create role use_role_1;
grant all on database * to use_role_1;
grant use_role_1 to root;
set role use_role_1;
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| use_role_1     |
+----------------+
1 row in set (0.00 sec)
```
