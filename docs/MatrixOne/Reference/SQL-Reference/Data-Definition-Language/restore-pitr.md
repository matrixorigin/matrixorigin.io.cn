# RESTORE ... FROM PITR

## 语法说明

`RESTORE ... FROM PITR` 用于从之前创建的 PITR 中进行数据恢复。

## 语法结构

```
> RESTORE [CLUSTER]|[[ACCOUNT <account_name>] [DATABASE database_name [TABLE table_name]]]FROM PITR <snapshot_name> [TO ACCOUNT <account_name>];
```

## 示例

### 示例 1：恢复集群
  
```sql

--sys 租户下执行
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';

--在租户 acc1,acc2 下执行
create database db1;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

--创建 pitr
mysql> create pitr clu_pitr1 for cluster range 1 'h';
Query OK, 0 rows affected (0.01 sec)

mysql> show pitr where pitr_name='clu_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| clu_pitr1 | 2024-10-18 17:06:49 | 2024-10-18 17:06:49 | cluster    | *            | *             | *          |           1 | h         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)

--在租户 acc1,acc2 下执行
drop database db1;--删除数据库 db1

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

--恢复
mysql> restore cluster from pitr clu_pitr1 "2024-10-18 17:06:50";
Query OK, 0 rows affected (1.84 sec)

--在租户 acc1,acc2 下执行，可以看到，恢复成功
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)
```

### 示例 2：恢复租户

```sql
CREATE database db1;
CREATE database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)

--创建 pitr
mysql> create pitr acc_pitr1 range 1 "h";
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr;
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| acc_pitr1 | 2024-10-18 16:09:34 | 2024-10-18 16:09:34 | account    | acc1         | *             | *          |           1 | h         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)

--过一会删除数据库 db1,db2
drop database db1;
drop database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
5 rows in set (0.01 sec)

--恢复
mysql> restore from pitr acc_pitr1 "2024-10-18 16:09:35";
Query OK, 0 rows affected (0.78 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)
```

### 示例 3：恢复数据库

```sql
CREATE database db1;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)


--创建 pitr
mysql> create pitr db_pitr1 for database db1 range 2 "d";
Query OK, 0 rows affected (0.01 sec)

mysql> show pitr where pitr_name='db_pitr1';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| db_pitr1  | 2024-10-18 16:16:03 | 2024-10-18 16:16:03 | database   | acc1         | db1           | *          |           2 | d         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)

--删除数据库 db1
drop database db1;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.01 sec)

--恢复 db1
mysql> restore database db1 from pitr db_pitr1 "2024-10-18 16:16:05";
Query OK, 0 rows affected (0.02 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| information_schema |
| mo_catalog         |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.00 sec)
```

### 示例 4：恢复表

```sql
--在租户 acc1 下执行
CREATE TABLE t1(n1 int);
INSERT INTO t1 values(1);

mysql> SELECT * FROM t1;
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

create pitr tab_pitr for database db1 table t1 range 1 'd';--创建 pitr

mysql> show pitr where pitr_name='tab_pitr';
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr_name | created_time        | modified_time       | pitr_level | account_name | database_name | table_name | pitr_length | pitr_unit |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| tab_pitr  | 2024-10-23 14:32:17 | 2024-10-23 14:32:17 | table      | sys          | db1           | t1         |           1 | d         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)

truncate TABLE t1;--清空 t1

mysql> SELECT * FROM t1;
Empty set (0.01 sec)

restore database db1 table t1 from pitr tab_pitr "2024-10-23 14:32:18";--恢复 pitr

mysql> SELECT * FROM t1;--恢复成功
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

## 限制

- 已删除租户暂不支持恢复。
- 集群级别的 pitr 能对集群级别和租户级别进行恢复。
- 系统租户恢复普通租户到新租户只允许租户级别的恢复。
- 只有系统租户才可以执行恢复数据到新租户，且只允许租户级别的恢复。新租户需提前创建，为了避免对象冲突，新租户最好为新建租户。
