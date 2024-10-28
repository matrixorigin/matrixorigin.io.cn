# CREATE PITR

## 语法说明

`CREATE PITR` 命令用于创建时间点恢复（Point-in-Time Recovery, PITR）的恢复点。集群管理员可以创建集群级别或租户级别的 pitr，而租户管理员则可以为当前租户创建租户/数据库/表级别的 pitr。每个 pitr 的信息仅对创建该 pitr 的租户可见，确保了数据的隔离性和安全性。

## 语法结构

```sql
create pitr <pitr_name> for 
    [cluster]|[account <account_name>]|[database <database_name>]|[table <database_name> <table_name>]
    range <value><unit>
```

### 语法释义

**range**: int，时间范围值，1-100。
**unit**: string 时间范围单位，可选范围 h（小时）、d（天，默认）、mo（月）、y（年）

## 示例

**示例 1：集群管理员为集群创建 pitr**

```sql
create pitr cluster_pitr1 for cluster range 1 "d";
mysql> show pitr;
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME     | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| cluster_pitr1 | 2024-10-18 14:07:10 | 2024-10-18 14:07:10 | cluster    | *            | *             | *          |           1 | d         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

**示例 2：集群管理员为租户创建 pitr**

```sql
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
mysql> create pitr account_pitr1 for account acc1 range 1 "d";
mysql> show pitr where pitr_name='account_pitr1';
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name     | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| account_pitr1 | 2024-10-18 14:11:57 | 2024-10-18 14:11:57 | account    | acc1         | *             | *          |           1 | d         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

**示例 3：租户管理员为租户创建 pitr**

```sql
create pitr account_pitr1 range 2 "h";

mysql> show pitr where pitr_name='account_pitr1';
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name     | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| account_pitr1 | 2024-10-18 14:23:12 | 2024-10-18 14:23:12 | account    | acc1         | *             | *          |           2 | h         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

**示例 4：租户管理员为数据库创建 pitr**

```sql
mysql> create pitr db_pitr1 for database db1 range 1 'y';
Query OK, 0 rows affected (0.01 sec)

mysql> show pitr where pitr_name='db_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| db_pitr1  | 2024-10-18 14:26:02 | 2024-10-18 14:26:02 | database   | acc1         | db1           | *          |           1 | y         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

**示例 5：租户管理员为表创建 pitr**

```sql
mysql> create pitr tab_pitr1 for database  db1 table t1 range 1 'y';
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr where pitr_name='tab_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| tab_pitr1 | 2024-10-18 14:28:53 | 2024-10-18 14:28:53 | table      | acc1         | db1           | t1         |           1 | y         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```

## 限制

- 集群管理员为其它租户创建 pitr 时只能创建租户级别的 pitr。
