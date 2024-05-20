## 原理概述

数据库常规物理备份是直接复制数据库的物理存储文件，包括数据文件、日志文件和控制文件等，以创建数据库的一个独立副本。这一过程通常在文件系统级别进行，可以通过操作系统的命令实现，生成的备份是数据库的完整备份，包含了所有的数据和对象。备份文件可以存储在多种介质上，并可通过压缩和加密来节省空间和提高安全性。在恢复时，可以直接将这些文件复制到需要的位置，从而快速地恢复整个数据库。此外，物理备份支持跨平台迁移，适用于灾难恢复和数据库迁移场景，但可能需要较多的存储空间和时间。

全量备份是指备份数据库中所有数据的备份过程。它创建了一个数据库的完整副本，这通常需要更多的存储空间和更长的时间来完成。由于包含了所有数据，全量备份在恢复时较为简单，可以直接恢复到备份时的状态。

增量备份是指备份自上次备份以来发生变化的数据。它只复制在两次备份之间有修改的数据块或数据文件，因此备份集通常较小，备份速度较快。增量备份可以节省存储空间和备份时间，但在数据恢复时可能更复杂，因为需要依次应用一系列增量备份来恢复到最新状态。

MatrixOne 支持使用 `mo_br` 进行增量和全量物理备份恢复：

!!! note
    mo_br 企业级服务的备份与恢复工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

## 示例

### 示例 1 全量备份恢复

- 连接 mo 创建数据库 db1、db2。

```sql
create database db1;
create database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- 创建全量备份

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "/Users/admin/soft/backuppath/syncback1"

Backup ID
    25536ff0-126f-11ef-9902-26dd28356ef3

./mo_br list
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+------------+
|                  ID                  | SIZE  |                  PATH                  |          AT TIME          |   DURATION   |       COMPLETE TIME       |       BACKUPTS        | BACKUPTYPE |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+------------+
| 25536ff0-126f-11ef-9902-26dd28356ef3 | 65 MB |      BackupDir: filesystem  Path:      | 2024-05-15 11:56:44 +0800 | 8.648091083s | 2024-05-15 11:56:53 +0800 | 1715745404915410000-1 |    full    |
|                                      |       | /Users/admin/soft/backuppath/syncback1 |                           |              |                           |                       |            |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+------------+
```

- 连接 mo 删除数据库 db1 并建立数据库 db3。

```sql
drop database db1;
create database db3;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db2                |
| db3                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- 停止 mo 服务，删除 mo-data，恢复备份

```
mo_ctl stop
rm -rf /Users/admin/soft/matrixone/mo-data

./mo_br restore 25536ff0-126f-11ef-9902-26dd28356ef3  --restore_dir filesystem --restore_path "/Users/admin/soft/matrixone"
From:
    BackupDir: filesystem
    Path: /Users/admin/soft/backuppath/syncback1

To
    BackupDir: filesystem
    Path: /Users/admin/soft/matrixone

TaePath
    ./mo-data/shared
restore tae file path ./mo-data/shared, parallelism 1,  parallel count num: 1
restore file num: 1, total file num: 733, cost : 549µs
Copy tae file 1
    018f7a41-1881-7999-bbd6-858c3d4acc18_00000 => mo-data/shared/018f7a41-1881-7999-bbd6-858c3d4acc18_00000
    ... 
```

- 启动 mo，检查恢复情况

```
mo_ctl start
```

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

可以看到，恢复成功。

### 示例 2 增量备份恢复

- 连接 mo 创建数据库 db1、db2

```sql
create database db1;
create database db2;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- 创建全量备份

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "/Users/admin/soft/backuppath/syncback2"

Backup ID
    2289638c-1284-11ef-85e4-26dd28356ef3
```

- 创建基于上述全量备份的增量备份

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "/Users/admin/soft/backuppath/syncback2" --backup_type "incremental" --base_id "2289638c-1284-11ef-85e4-26dd28356ef3"

Backup ID
    81531c5a-1284-11ef-9ba3-26dd28356ef3

./mo_br list
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+-------------+
|                  ID                  | SIZE  |                  PATH                  |          AT TIME          |   DURATION   |       COMPLETE TIME       |       BACKUPTS        | BACKUPTYPE  |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+-------------+
| 2289638c-1284-11ef-85e4-26dd28356ef3 | 70 MB |      BackupDir: filesystem  Path:      | 2024-05-15 14:26:59 +0800 | 9.927034917s | 2024-05-15 14:27:09 +0800 | 1715754419668571000-1 |    full     |
|                                      |       | /Users/admin/soft/backuppath/syncback2 |                           |              |                           |                       |             |
| 81531c5a-1284-11ef-9ba3-26dd28356ef3 | 72 MB |      BackupDir: filesystem  Path:      | 2024-05-15 14:29:38 +0800 | 2.536263666s | 2024-05-15 14:29:41 +0800 | 1715754578690660000-1 | incremental |
|                                      |       | /Users/admin/soft/backuppath/syncback2 |                           |              |                           |                       |             |
+--------------------------------------+-------+----------------------------------------+---------------------------+--------------+---------------------------+-----------------------+-------------+
```

对比增量备份和全量备份的的耗时 (Duration)，可以看到增量备份耗时较少。

- 连接 mo 删除数据库 db1 并建立数据库 db3。

```sql
drop database db1;
create database db3;

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db2                |
| db3                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

- 停止 mo 服务，删除 mo-data，恢复备份

```
mo_ctl stop
rm -rf /Users/admin/soft/matrixone/mo-data

./mo_br restore 81531c5a-1284-11ef-9ba3-26dd28356ef3  --restore_dir filesystem --restore_path "/Users/admin/soft/matrixone"
2024/05/15 14:35:27.910925 +0800 INFO malloc/malloc.go:43 malloc {"max buffer size": 2147483648, "num shards": 8, "classes": 23, "min class size": 128, "max class size": 1048576, "buffer objects per class": 22}
From:
    BackupDir: filesystem
    Path: /Users/admin/soft/backuppath/syncback2

To
    BackupDir: filesystem
    Path: /Users/admin/soft/matrixone

TaePath
    ./mo-data/shared
...
```

- 启动 mo，检查恢复情况

```
mo_ctl start
```

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| db1                |
| db2                |
| information_schema |
| mo_catalog         |
| mo_debug           |
| mo_task            |
| mysql              |
| system             |
| system_metrics     |
+--------------------+
9 rows in set (0.00 sec)
```

可以看到，恢复成功。
