# mo_br 工具进行快照备份恢复

MatrixOne 支持以下两种方式进行快照备份恢复：

- [sql 语句](sql-snapshot.md)
- mo_br 工具

本篇文档主要介绍如何使用 `mo_br` 进行租户级别快照备份恢复。

## 什么是 mo_br

`mo_br` 是 MatrixOne 企业级服务的物理备份与恢复工具。

!!! note
    mo_br 企业级服务的物理备份与恢复工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

## 开始前准备

- 已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

- 已完成 mo_br 工具部署

## 如何使用 `mo_br` 进行快照备份恢复

在终端界面中使用 `mo_br` 工具非常简单，进入到解压后的 mo-backup 文件夹目录，找到可执行文件：*mo_br*，便可根据下述说明进行相应操作。

### 创建快照

#### 语法

```
mo_br snapshot create
    --host
    --port 
    --user
    --password 
    --level 
    --account 
    --sname 
```

#### 参数说明

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|level | 快照备份的范围，暂只支持 account|
|account| 快照备份的租户对象名|
|sname | 快照名称|

#### 示例

**示例 1**

为系统租户 sys 创建快照：

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "snapshot_01" --account "sys"
```

**示例 2**

系统租户为普通租户 acc1 创建快照：

```
 ./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "snapshot_02" --account "acc1" 
```

**示例 3**

普通租户创建快照：

- 创建普通租户 acc1

```sql
create account acc1 admin_name admin IDENTIFIED BY '111';
```

- acc1 创建快照

```
./mo_br snapshot create  --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --level "account" --account "acc1" --sname "snapshot_03"
```

### 查看快照

#### 语法

```
mo_br snapshot show
    --host
    --port 
    --user 
    --password 
    --account 
    --db 
    --table 
    --sname 
    --beginTs 
    --endTs
```

#### 参数说明

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|account| 要筛选的租户名，仅限 sys 管理员使用|
|db | 要筛选的数据库名|
|table | 要筛选的表名|
|sname | 要筛选的快照名称|
|beginTs |要筛选的快照时间戳的开始时间|
|endTs | 要筛选的快照时间戳的结束时间|

#### 示例

**示例 1**

查看系统租户下创建的快照：

```
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401 	account       	acc1        	             	          	
snapshot_01  	2024-05-11 02:26:03.462462	account       	sys  
```

**示例 2**

查看 acc1 下创建的快照：

```
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_03  	2024-05-11 02:29:31.572512	account       	acc1     
```

**示例 3**

查看系统租户下为租户 acc1 创建的快照，并对开始时间进行筛选：

```
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "acc1" --beginTs "2024-05-11 00:00:00"     
SNAPSHOT NAME	        TIMESTAMP        	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401	account       	acc1 
```  

### 删除快照

#### 语法

```
mo_br snapshot drop
    --host
    --port 
    --user 
    --password 
    --sname 
```

#### 参数说明

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|sname | 要筛选的快照名称|

#### 示例

**示例 1**

删除系统租户创建的快照：

```
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "dump" --password "111" --sname "snapshot_01"
```

**示例 2**

删除普通租户创建的快照：

```
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --sname "snapshot_03" 
```

### 恢复快照

#### 语法

```
mo_br snapshot restore
    --host 
    --port 
    --user 
    --password 
    --sname 
    --account 
    --db 
    --table 
    --newaccount 
    --newaccountadmin 
    --newaccountpwd 
```

#### 参数说明

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|sname | 要恢复的快照名称|
|account| 要恢复的租户名，仅限 sys 管理员使用|
|db | 要恢复的数据库名|
|table | 要恢复的表名|
|newaccount  | 新创建的租户名|
|newaccountadmin  | 租户管理员|
|newaccountpwd   | 租户管理员密码|

__NOTE__: 只有系统租户才可以执行恢复数据到新租户，且只允许租户级别的恢复。

#### 示例

**示例 1**

表级别的恢复：

- 连接 Matrixone 系统租户执行建表语句

```sql
create db if not exists snapshot_read;
use snapshot_read;
create table test_snapshot_read (a int);
INSERT INTO test_snapshot_read (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11), (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), (24), (25), (26), (27), (28), (29), (30),(31), (32), (33), (34), (35), (36), (37), (38), (39), (40),(41), (42), (43), (44), (45), (46), (47), (48), (49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61), (62), (63), (64), (65), (66), (67), (68), (69), (70),(71), (72), (73), (74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86), (87), (88), (89), (90),(91), (92), (93), (94), (95), (96), (97), (98), (99), (100);

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
```

- 创建快照

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_01" --account "sys" 

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys"
SNAPSHOT NAME	        TIMESTAMP        	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
sp_01        	2024-05-10 02:06:08.01635	account       	sys         	             	          	
```

- 连接 Matrixone 系统租户按删除表中部分数据。

```sql
delete from snapshot_read.test_snapshot_read where a <= 50;

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|       50 |
+----------+
```

- 表级别恢复到本租户

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --table "test_snapshot_read" --sname "sp_01"
```

- 连接 Matrixone 系统租户查询恢复情况

```sql
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
```

**示例 2**

数据库级别恢复

- 连接 Matrixone 系统租户执行 sql 语句

```sql
create db if not exists snapshot_read;
use snapshot_read;
create table test_snapshot_read (a int);
INSERT INTO test_snapshot_read (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11), (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), (24), (25), (26), (27), (28), (29), (30),(31), (32), (33), (34), (35), (36), (37), (38), (39), (40),(41), (42), (43), (44), (45), (46), (47), (48), (49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61), (62), (63), (64), (65), (66), (67), (68), (69), (70),(71), (72), (73), (74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86), (87), (88), (89), (90),(91), (92), (93), (94), (95), (96), (97), (98), (99), (100);
create table test_snapshot_read_1(a int);
INSERT INTO test_snapshot_read_1 (a) VALUES(1), (2), (3), (4), (5),(6), (7), (8), (9), (10), (11), (12),(13), (14), (15), (16), (17), (18), (19), (20),(21), (22), (23), (24), (25), (26), (27), (28), (29), (30),(31), (32), (33), (34), (35), (36), (37), (38), (39), (40),(41), (42), (43), (44), (45), (46), (47), (48), (49), (50),(51), (52), (53), (54), (55), (56), (57), (58), (59), (60),(61), (62), (63), (64), (65), (66), (67), (68), (69), (70),(71), (72), (73), (74), (75), (76), (77), (78), (79), (80), (81), (82), (83), (84), (85), (86), (87), (88), (89), (90),(91), (92), (93), (94), (95), (96), (97), (98), (99), (100);

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      200 |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
1 row in set (0.01 sec)
```

- 创建快照

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_02" --account "sys"

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
sp_02        	2024-05-10 02:47:15.638519	account       	sys          	             	          	
```

- 连接 Matrixone 系统租户删除部分数据

```sql
delete from snapshot_read.test_snapshot_read where a <= 50;
delete from snapshot_read.test_snapshot_read_1 where a >= 50;

mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
|       49 |
+----------+
1 row in set (0.01 sec)
```

- 数据库级别恢复到本租户

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --db "snapshot_read" --sname "sp_02"
```

- 连接 Matrixone 系统租户查询恢复情况

```sql
mysql> select count(*) from snapshot_read.test_snapshot_read;
+----------+
| count(*) |
+----------+
|      200 |
+----------+
1 row in set (0.00 sec)

mysql> select count(*) from snapshot_read.test_snapshot_read_1;
+----------+
| count(*) |
+----------+
|      100 |
+----------+
1 row in set (0.00 sec)
```

**示例 2**

租户级别恢复

- 连接 Matrixone 系统租户执行 sql 语句

```sql
create database if not exists snapshot_read;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| snapshot_read      |
| system             |
| system_metrics     |
+--------------------+
8 rows in set (0.00 sec)
```

- 创建快照

```
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --level "account" --sname "sp_03" --account "sys"

./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
sp_03        	2024-05-11 03:20:16.065685	account       	sys           	             	          	          	          	
```

- 连接 Matrixone 系统租户删除数据库

```sql
drop database snapshot_read;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
7 rows in set (0.01 sec)
```

- 租户级别恢复到本租户

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03"
```

- 租户级别恢复到新租户

```
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03" --new_account "acc2" --new_admin_name "admin" --new_admin_password "111";
```

- 连接 Matrixone 系统租户查询恢复情况

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| snapshot_read      |
| system             |
| system_metrics     |
+--------------------+
8 rows in set (0.00 sec)
```

- 连接新租户 acc2 查询恢复情况

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mo_catalog         |
| mysql              |
| snapshot_read      |
| system             |
| system_metrics     |
+--------------------+
6 rows in set (0.00 sec)
```