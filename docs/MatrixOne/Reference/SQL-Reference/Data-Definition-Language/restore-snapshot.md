# RESTORE ... FROM SNAPSHOT

## 语法说明

`RESTORE ... FROM SNAPSHOT` 用于从之前创建的集群/租户级别的快照中进行集群/租户/数据库/表级别的恢复数据。

## 语法结构

```
> RESTORE [CLUSTER]|[[ACCOUNT <account_name>] [DATABASE database_name [TABLE table_name]]]FROM SNAPSHOT <snapshot_name> [TO ACCOUNT <account_name>];
```

## 示例

### 示例 1：恢复集群
  
```sql
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

--在系统租户 sys 下执行
create snapshot cluster_sp1 for cluster;--为集群创建快照

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

--在系统租户 sys 下执行
restore cluster FROM snapshot cluster_sp1;--在系统租户下对集群进行快照恢复

--在租户 acc1,acc2 下执行
mysql> show databases;--恢复成功
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
--在租户 acc1 下执行
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

create snapshot acc1_snap1 for account acc1;--创建快照
drop database db1;--删除数据库 db1,db2
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

restore account acc1 FROM snapshot acc1_snap1;--恢复租户级别快照

mysql> show databases;--恢复成功
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
7 rows in set (0.01 sec)
```

### 示例 3：恢复数据库

```sql
--在租户 acc1 下执行
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

create snapshot acc1_db_snap1 for account acc1;--创建快照
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

restore account acc1 database db1 FROM snapshot acc1_db_snap1;--恢复数据库级别快照

mysql> show databases;--恢复成功
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

create snapshot acc1_tab_snap1 for account acc1;--创建快照
truncate TABLE t1;--清空 t1

mysql> SELECT * FROM t1;
Empty set (0.01 sec)

restore account acc1 database db1 TABLE t1 FROM snapshot acc1_tab_snap1;--恢复快照

mysql> SELECT * FROM t1;--恢复成功
+------+
| n1   |
+------+
|    1 |
+------+
1 row in set (0.00 sec)
```

### 示例 5：系统租户恢复普通租户到普通租户本租户

```sql
--在租户 acc1 下执行
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

--在系统租户 sys 下执行
create snapshot acc1_snap1 for account acc1;--为 acc1 创建快照

--在租户 acc1 下执行
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

--在系统租户 sys 下执行
restore account acc1 FROM snapshot acc1_snap1 TO account acc1;--在系统租户下对 acc1 进行快照恢复

--在租户 acc1 下执行
mysql> show databases;--恢复成功
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

### 示例 6：系统租户恢复普通租户到新租户

```sql
--在租户 acc1 下执行
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

--在系统租户 sys 下执行
create snapshot acc1_snap1 for account acc1;--为 acc1 创建快照

--在租户 acc1 下执行
drop database db1;--删除 db1

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

--在系统租户 sys 下执行
create account acc2 ADMIN_NAME admin IDENTIFIED BY '111';--需要提前创建要目标新租户
restore account acc1 FROM snapshot acc1_snap1 TO account acc2;--在系统租户下对 acc1 进行快照恢复，恢复至 acc2

--在租户 acc1 下执行
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
5 rows in set (0.00 sec)

--在租户 acc2 下执行
mysql> show databases;--恢复至 acc2
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

## 限制

- 只有租户级别的快照才能进行数据库/表级别的恢复。

- 系统租户恢复普通租户到新租户只允许租户级别的恢复。

- 只有系统租户才可以执行恢复数据到新租户，且只允许租户级别的恢复。新租户需提前创建，为了避免对象冲突，新租户最好为新建租户。
