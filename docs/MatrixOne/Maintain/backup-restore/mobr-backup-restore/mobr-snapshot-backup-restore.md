# mo_br 工具进行快照备份恢复

## 快照备份恢复实现原理

数据库快照备份恢复通过创建数据库在特定时间点的只读静态视图，这个视图被称为快照。快照利用存储系统的写时复制（COW）技术，仅在原始数据页被修改前复制并存储该页，从而生成数据库在快照创建时刻的状态副本。在需要恢复数据时，可以选取快照中的数据并将其复制或恢复到新的或现有的数据库中。快照文件最初很小，随着源数据库的更改而逐渐增长，因此需要监控其大小并在必要时进行管理。快照必须与源数据库位于同一服务器实例，并且由于它们是只读的，不能直接在其上进行写操作。要注意的是，快照恢复操作会覆盖当前数据，因此需要谨慎操作。

## 应用场景

数据库快照是一种强大的工具，可以在多种场景下提高数据库的可用性和性能。以下为快照的一些应用场景：

- **数据备份与恢复**：快照可以作为数据库备份的一种方式，它允许在不停止数据库服务的情况下创建数据库的只读副本，用于数据备份和恢复。

- **报表和数据分析**：在需要数据库保持静态状态进行报表生成或数据分析时，可以使用快照来避免影响在线事务处理。

- **开发和测试**：在开发新功能或测试系统前，可以通过快照创建数据库的一个副本，以便测试可以在不影响生产环境的情况下进行。

- **数据迁移**：在数据迁移过程中，可以使用快照来确保数据的一致性，避免迁移过程中的数据变更。

- **高危操作保护**：在执行可能对数据库稳定性造成影响的操作（如数据库升级、结构变更等）之前，可以创建快照，以便在操作失败时能够快速恢复。

## MatrixOne 对快照的支持

MatrixOne 支持以下两种方式进行快照备份恢复：

- sql 语句
- mo_br 工具

本篇文档主要介绍如何使用 `mo_br` 进行集群/租户级别的快照备份恢复。

!!! note
    mo_br 企业级服务的备份与恢复工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

## 开始前准备

- 已完成[单机部署 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)

- 已完成 mo_br 工具部署

## 示例

## 示例 1 表级别的恢复

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

```bash
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

```bash
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

## 示例 2 数据库级别恢复

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

```bash
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

```bash
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

## 示例 3 租户级别恢复

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

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --account "sys" --sname "sp_03"
```

- 租户级别恢复到新租户

```bash
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

## 示例 4 集群级别恢复

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
```

- 创建快照

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "cluster" --sname "cluster_sp1"

(base) admin@192 mo-backup % ./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "dump" --password "111" --cluster "sys"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
cluster_sp1  	2024-10-14 03:52:55.657359	cluster        	             	          	          	          	
```

- 连接 Matrixone 系统租户删除数据库

```sql
--在租户 acc1,acc2 下执行
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
5 rows in set (0.01 sec)
```

- 恢复
  
```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111"  --sname "cluster_sp1"
```

- 连接租户 acc1,acc2 查询恢复情况

```sql
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