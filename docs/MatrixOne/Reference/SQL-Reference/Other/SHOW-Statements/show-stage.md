# **SHOW STAGES**

## **语法说明**

`SHOW STAGES` 返回 stage 的具体信息。

## **语法结构**

```
> SHOW STAGES [LIKE 'pattern']
```

## **示例**

```sql
mysql> create stage stage_fs url = 'file:///Users/admin/test';
Query OK, 0 rows affected (0.03 sec)

mysql> show stages;
+------------+--------------------------+----------+---------+
| STAGE_NAME | URL                      | STATUS   | COMMENT |
+------------+--------------------------+----------+---------+
| stage_fs   | file:///Users/admin/test | DISABLED |         |
+------------+--------------------------+----------+---------+
1 row in set (0.00 sec)
```
