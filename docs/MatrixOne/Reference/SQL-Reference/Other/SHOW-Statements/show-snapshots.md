# SHOW SNAPSHOTS

## 语法说明

`SHOW SNAPSHOTS` 返回当前租户下创建的快照的信息，包括快照名、创建时间戳（UTC 时间）、快照级别、租户名称、数据库名、表名。

## 语法结构

```
> SHOW SNAPSHOTS [WHERE expr]
```

## 示例

```sql
create account acc1 admin_name admin identified by '111';
create snapshot sp1 for account acc1;
create snapshot sp2 for account sys;

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp2           | 2024-05-10 09:58:55.602263 | account        | sys          |               |            |
| sp1           | 2024-05-10 09:58:55.212365 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
2 rows in set (0.01 sec)

mysql> show snapshots where account_name="acc1";
+---------------+----------------------------+----------------+--------------+---------------+------------+
| snapshot_name | timestamp                  | snapshot_level | account_name | database_name | table_name |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp1           | 2024-05-10 09:58:55.212365 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.01 sec)
```
