# CREATE SNAPSHOT

## 语法说明

`CREATE SNAPSHOT` 命令用于创建快照。系统租户可以给自己也可以给普通租户创建快照，但是普通租户只能给自己创建快照。租户创建的快照仅本租户可见。

## 语法结构

```sql
> CREATE SNAPSHOT snapshot_name FOR ACCOUNT account_name
```

## 示例

```sql
--在系统租户 sys 下执行
create snapshot sp1 for account sys;
create snapshot sp2 for account acc1;

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp2           | 2024-05-10 09:49:08.925908 | account        | acc1         |               |            |
| sp1           | 2024-05-10 09:48:50.271707 | account        | sys          |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
2 rows in set (0.00 sec)

--在租户 acc1 下执行
mysql> create snapshot sp3 for account acc2;--普通租户只能为自己建立快照
ERROR 20101 (HY000): internal error: only sys tenant can create tenant level snapshot for other tenant

create snapshot sp3 for account acc1;

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| sp3           | 2024-05-10 09:53:09.948762 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

## 限制

- 目前只支持创建租户级别的快照，不支持创建集群级别、数据库级别和表级别的快照。