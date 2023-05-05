# **SHOW SUBSCRIPTIONS**

## **语法说明**

返回所有订阅库名称列表与来源租户名。

## **语法结构**

```
SHOW SUBSCRIPTIONS;
```

## **示例**

```sql
reate database sub1 from sys publication pub1;

mysql> create database sub1 from sys publication sys_pub_1;
Query OK, 1 row affected (0.02 sec)

mysql> show subscriptions;
+------+--------------+
| Name | From_Account |
+------+--------------+
| sub1 | sys          |
+------+--------------+
1 row in set (0.01 sec)
```
