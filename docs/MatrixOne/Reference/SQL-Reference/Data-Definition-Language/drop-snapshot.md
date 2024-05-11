# DROP SNAPSHOT

## 语法说明

`DROP SNAPSHOT` 用于删除当前租户下创建的快照。

## 语法结构

```
> DROP SNAPSHOT snapshot_name;
```

## 示例

```sql
create snapshot sp1 for account sys;

mysql>  show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp1           | 2024-05-10 09:55:11.601605 | account        | sys          |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.01 sec)

drop snapshot sp1;

mysql>  show snapshots;
Empty set (0.01 sec)
```
