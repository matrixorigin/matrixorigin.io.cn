# CREATE SNAPSHOT

## 语法说明

`CREATE SNAPSHOT` 命令用于创建数据库的快照。集群管理员可以创建集群级别或租户级别的快照，而普通租户管理员则可以为当前租户创建租户级别、数据库级别和表级别的快照。每个快照仅对创建该快照的租户可见，确保了数据的隔离性和安全性。

## 语法结构

```sql
create snapshot <snapshot_name> for [cluster]|[account [<account_name>]]|[database <database_name>]|[table <database_name> <tables_name>]
```

## 示例

**示例 1：集群管理员为集群创建集群级别快照**

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

**示例 3：普通租户管理员为租户创建租户级别快照**

```sql
create snapshot account_sp2 for account acc1;
create snapshot account_sp3 for account;

mysql> create snapshot account_sp2 for account acc2;
ERROR 20101 (HY000): internal error: only sys tenant can create tenant level snapshot for other tenant--租户管理员只能为本租户创建快照

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| account_sp3   | 2025-01-22 08:25:49.810746 | account        | acc1         |               |            |
| account_sp2   | 2025-01-22 08:25:49.349699 | account        | acc1         |               |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
2 rows in set (0.01 sec)
```

**示例 4：普通租户管理员创建数据库级别快照**

```sql
mysql> create snapshot db_sp1 for database db1;
Query OK, 0 rows affected (0.01 sec)

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| db_sp1        | 2025-01-22 08:31:41.020599 | database       | acc1         | db1           |            |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.01 sec)
```

**示例 5：普通租户管理员创建表级别快照**

```sql
mysql> create snapshot tab_sp1 for table  db1 t1;
Query OK, 0 rows affected (0.01 sec)

mysql> show snapshots;
+---------------+----------------------------+----------------+--------------+---------------+------------+
| SNAPSHOT_NAME | TIMESTAMP                  | SNAPSHOT_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME |
+---------------+----------------------------+----------------+--------------+---------------+------------+
| tab_sp1       | 2025-01-22 08:32:44.532474 | table          | acc1         | db1           | t1         |
+---------------+----------------------------+----------------+--------------+---------------+------------+
1 row in set (0.00 sec)
```

## 限制

- 集群管理员在为其它租户创建快照时只能创建租户级别的快照。
