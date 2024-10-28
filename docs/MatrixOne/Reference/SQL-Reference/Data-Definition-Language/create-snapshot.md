# CREATE SNAPSHOT

## 语法说明

`CREATE SNAPSHOT` 命令用于创建数据库的快照。集群管理员可以创建集群级别或租户级别的快照，而普通租户管理员则可以为当前租户创建租户级别的快照。每个快照仅对创建该快照的租户可见，确保了数据的隔离性和安全性。

## 语法结构

```sql
create snapshot <snapshot_name> for [cluster]|[account <account_name>]
```

## 示例

**示例 1：集群管理员为集群创建集群快照**

```sql
create snapshot cluster_sp for cluster;
mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| cluster_sp    | 2024-10-10 10:40:14.487655 | cluster        |              |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

**示例 2：集群管理员为租户创建租户快照**

```sql
mysql> create snapshot account_sp1 for account acc1;
mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| account_sp1   | 2024-10-10 10:58:53.946829 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

**示例 3：普通租户管理员为租户创建租户快照**

```sql
create snapshot account_sp2 for account acc1;

mysql> create snapshot account_sp2 for account acc2;
ERROR 20101 (HY000): internal error: only sys tenant can create tenant level snapshot for other tenant--租户管理员只能为本租户创建快照

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| account_sp2   | 2024-10-10 11:19:12.699093 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

## 限制

- 目前只支持创建集群和租户级别的快照，不支持创建数据库级别和表级别的快照。
