# mo_br 备份与恢复

对于企业而言，每天都会产生大量数据，那么对于数据库的备份就非常重要。在系统崩溃或者硬件故障，又或者用户误操作的情况下，你可以恢复数据并重启系统，不会造成数据丢失。

另外，数据备份也作为升级 MatrixOne 安装之前的保障，同时数据备份也可以用于将 MatrixOne 安装转移到另一个系统。

MatrixOne 支持通过 `mo_br` 实用工具进行物理备份。`mo_br` 是一个命令行实用程序，用于生成 MatrixOne 数据库的物理备份。它生成可用于重新创建数据库对象和数据的 SQL 语句。

我们将通过一个简单的示例来讲述如何使用 `mo_br` 实用程序完成数据备份和还原的过程。

## 创建备份

### 语法结构

```
mo_br backup
    --host
    --port 
    --user 
    --password 
    --backup_dir s3|filesystem 
        //s3 oss minio
            --endpoint
            --access_key_id 
            --secret_access_key 
            --bucket 
            --filepath
            --region 
            --compression 
            --role_arn 
            --is_minio
            --parallelism 
        //filesystem
            --path
            --parallelism
    --meta_path 
    //增量备份需要
    --backup_type
    --base_id
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user| 用户|
|password | 用户的密码|
|backup_dir | 备份的目标路径类型。s3 或 filesystem|
|endpoint| 连接到备份到 s3 的服务的 URL|
|access_key_id| 备份到 s3 的 Access key ID|
|secret_access_key| 备份到 s3 的 Secret access key|
|bucket| 备份到的 s3 需要访问的桶|
|filepath| 备份到 s3 的相对文件路径|
|region| 备份到 s3 的对象存储服务区域|
|compression| 备份到 s3 的文件的压缩格式。|
|role_arn| 备份到 s3 的角色的资源名称。|
|is_minio| 指定备份到的 s3 是否为 minio|
|path| 本地文件系统备份路径|
|parallelism|并行度|
|meta_path|指定 meta 文件位置。只能是文件系统中的路径。如果不指定，默认是同一目录下的 mo_br.meta 文件。|
|backup_type|指定备份类型为增量备份，incremental。|
|base_id|上次一次备份的 ID，主要用于确定上次备份的时间戳。|

### 示例

- 全量备份到本地文件系统

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "yourpath"
```

- 全量备份到 minio

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "s3"  --endpoint "http://127.0.0.1:9000" --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A" --bucket "bucket1" --filepath "/backup1" --is_minio
```

- 增量备份到本地文件系统

```
./mo_br backup --host "127.0.0.1" --port 6001 --user "dump" --password "111" --backup_dir "filesystem"  --path "yourpath" --backup_type "incremental" --base_id "xxx"
```

## 查看备份

### 语法结构

```
mo_br list
    -- ID
    //要查询备份数据。如果备份在s3(oss minio)上时，需要指定
      --access_key_id 
      --secret_access_key 
    --not_check_data 
    --meta_path 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
| ID | 备份的 ID|
|access_key_id| 备份到的 s3 的 Access key ID|
|secret_access_key| 备份到的 s3 的 Secret access key|
|not_check_data | 只查看 meta 中的信息。不查看备份数据。默认不带这个参数的，就是会检查备份的文件。当前只会检查备份的文件是否存在。|
|meta_path | 指定 meta 文件位置。如果不指定，默认是同一目录下的 mo_br.meta 文件。|

### 示例

- 查看所有备份列表

```
./mo_br list
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
|                  ID                  |  SIZE  |              PATH              |          AT TIME          |   DURATION   |       COMPLETE TIME       |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
| 4d21b228-10dd-11ef-9497-26dd28356ef2 | 586 kB |  BackupDir: filesystem  Path:  | 2024-05-13 12:00:12 +0800 | 1.700945333s | 2024-05-13 12:00:13 +0800 |
|                                      |        |    /Users/admin/soft/backup    |                           |              |                           |
| 01108122-10f9-11ef-9359-26dd28356ef2 | 8.3 MB |  BackupDir: filesystem  Path:  | 2024-05-13 15:18:28 +0800 | 3.394437375s | 2024-05-13 15:18:32 +0800 |
|                                      |        |    /Users/admin/soft/backup    |                           |              |                           |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
```

- 查看指定 ID 备份列表，list 确定的 ID 时，会检测备份的文件。

```
./mo_br list 4d21b228-10dd-11ef-9497-26dd28356ef2
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
|                  ID                  |  SIZE  |              PATH              |          AT TIME          |   DURATION   |       COMPLETE TIME       |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+
| 4d21b228-10dd-11ef-9497-26dd28356ef2 | 586 kB |  BackupDir: filesystem  Path:  | 2024-05-13 12:00:12 +0800 | 1.700945333s | 2024-05-13 12:00:13 +0800 |
|                                      |        |    /Users/admin/soft/backup    |                           |              |                           |
+--------------------------------------+--------+--------------------------------+---------------------------+--------------+---------------------------+

Checking the backup data(currently,no checksum)...

check: /backup_meta
check: /mo_meta
check: hakeeper/hk_data
check: tae/tae_list
check: tae/tae_sum
check: config/log.toml_018f70d1-3100-7762-b28b-8f85ac4ed3cd
check: config/tn.toml_018f70d1-310e-78fc-ac96-aa5e06981bd7
...
```

## 删除备份

### 语法结构

```
mo_br delete ID  
    //要删除备份数据。如果备份在s3(oss minio)上时，需要指定
      --access_key_id 
      --secret_access_key
    --not_delete_data
    --meta_path
```

**参数说明**

| 参数  | 说明 |
| ---- | ----  |
| ID | 要删除的备份的 ID|
|access_key_id| 备份到的 s3 的 Access key ID|
|secret_access_key| 备份到的 s3 的 Secret access key|
|not_delete_data|只删除 meta 中的信息。不删除备份数据。|
|meta_path|指定 meta 文件位置。如果不指定，默认是同一目录下的 mo_br.meta 文件。|

### 示例

- 删除本地文件系统备份

```
./mo_br delete e4cade26-3139-11ee-8631-acde48001122
```

- 删除 minio 上的一个备份。

```
./mo_br delete e4cade26-3139-11ee-8631-acde48001122 --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A"
```

## 恢复备份

### 语法结构

- 恢复指定 ID 的备份

```
mo_br restore ID
    //读取指定ID的备份数据。如果备份在s3(oss minio)上时，需要指定
    --backup_access_key_id
    --backup_secret_access_key 

    //恢复的目标路径 restore_directory
    --restore_dir s3|filesystem 
        //s3 
            --restore_endpoint 
            --restore_access_key_id 
            --restore_secret_access_key 
            --restore_bucket 
            --restore_filepath 
            --restore_region 
            --restore_compression 
            --restore_role_arn 
            --restore_is_minio
        //filesystem
            --restore_path 
            --dn_config_path 
    --meta_path 
    --checksum
    --parallelism 
```  

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|ID | 要恢复的 ID|
|backup_access_key_id|备份在 s3 的 Access key ID|
|backup_secret_access_key  |备份在 s3 的 Secret access key|
|restore_dir | 恢复的目标路径类型。指定恢复的目标路径时使用。s3|filesystem|
|restore_endpoint| 连接到恢复到 S3 服务的 URL|
|restore_access_key_id| 恢复到 s3 的 Access key ID|
|restore_secret_access_key| 恢复到 s3 的 Secret access key|
|restore_bucket| 恢复到 s3 需要访问的桶|
|restore_filepath|恢复到 s3 的相对文件路径|
|restore_region| 恢复到 s3 的对象存储服务区域|
|restore_compression|恢复到 s3 的 S3 文件的压缩格式。|
|restore_role_arn| 恢复到 s3 的角色的资源名称。|
|restore_is_minio|指定恢复到的 s3 是否是 minio|
|restore_path|恢复到本地的路径|
|dn_config_path| dn 配置路径|
|meta_path|指定 meta 文件位置。只能是文件系统中的路径。如果不指定，默认是同一目录下的 mo_br.meta 文件。|
|checksum |恢复的时候 tae 文件复制的并行度，默认是 1|
|parallelism|并行度|

- 不指定恢复备份 ID

```  
//恢复。
mo_br restore
    --backup_dir s3|filesystem 备份的目标路径类型。指定备份的目标路径时使用。
        //s3 
            --backup_endpoint 
            --backup_access_key_id 
            --backup_secret_access_key
            --backup_bucket
            --backup_filepath
            --backup_region 
            --backup_compression 
            --backup_role_arn 
            --backup_is_minio
        //filesystem
            --backup_path 
    //恢复的目标路径 restore_directory
    --restore_dir s3|filesystem 恢复的目标路径类型。指定恢复的目标路径时使用。
        //s3 
            --restore_endpoint 
            --restore_access_key_id 
            --restore_secret_access_key 
            --restore_bucket 
            --restore_filepath
            --restore_region 
            --restore_compression 
            --restore_role_arn 
            --restore_is_minio
        //filesystem
            --restore_path 
            --dn_config_path 
    --meta_path 
    --checksum
    --parallelism
```  

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|backup_dir | 恢复的目标路径类型。指定恢复的目标路径时使用。s3|filesystem|
|backup_endpoint| 连接到备份在 s3 的的 URL|
|backup_access_key_id| 备份在 s3 的 Access key ID|
|backup_secret_access_key| 备份在 s3 的 Secret access key|
|backup_bucket| 备份在 s3 的桶|
|backup_filepath| 备份在 s3 的相对文件路径|
|backup_region| 备份在 s3 的服务区域|
|backup_compression| 备份在 s3 的文件的压缩格式。|
|backup_role_arn| 备份在 s3 的角色的资源名称。|
|backup_is_minio| 指定备份的 s3 是否是 minio|
|backup_path| 本地备份的路径|
|restore_dir | 恢复的目标路径类型。指定恢复的目标路径时使用。s3 或 filesystem|
|restore_endpoint| 连接到恢复到 S3 服务的 URL|
|restore_access_key_id| 恢复到 s3 的 Access key ID|
|restore_secret_access_key| 恢复到 s3 的 Secret access key|
|restore_bucket| 恢复到 s3 需要访问的桶|
|restore_filepath|恢复到 s3 的相对文件路径|
|restore_region| 恢复到 s3 的对象存储服务区域|
|restore_compression|恢复到 s3 的 S3 文件的压缩格式。|
|restore_role_arn| 恢复到 s3 的角色的资源名称。|
|restore_is_minio|指定恢复到的 s3 是否是 minio|
|restore_path|恢复到本地 matrixone 的路径|
|dn_config_path| dn 配置路径|
|meta_path|指定 meta 文件位置。只能是文件系统中的路径。如果不指定，默认是同一目录下的 mo_br.meta 文件。|
|checksum |恢复的时候 tae 文件复制的并行度，默认是 1|
|parallelism|并行度|

### 示例

从文件系统恢复到文件系统

**步骤一：**停止 mo，删除 mo-data

**步骤二：**执行以下恢复命令

```
./mo_br restore fb26fd88-41bc-11ee-93f8-acde48001122 --restore_dir filesystem --restore_path "your_mopath"
```

恢复后会在 matrixone 生成新的 mo-data 文件

**步骤三：**启动 mo

## 校验备份的校验码

读取备份文件夹中的每个文件及其 sha256 文件。计算文件的 sha256 值并与 sha256 文件值对比。sha256 文件是在文件创建或更新时，创建的。

### 语法结构

- 校验某个 ID 的备份

```
mo_br check ID
    //校验指定ID的备份数据。如果备份在s3(oss minio)上时，需要指定
      --backup_access_key_id string
      --backup_secret_access_key string
    --meta_path string 指定meta文件位置。如果不指定，默认是同一目录下的mo_br.meta文件。
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|backup_access_key_id| 备份在 s3 的 Access key ID|
|backup_secret_access_key| 备份在 s3 的 Secret access key|
|meta_path|指定 meta 文件位置。只能是文件系统中的路径。如果不指定，默认是同一目录下的 mo_br.meta 文件。|

- 校验备份，指定备份的 path

```
mo_br check
    --backup_dir s3|filesystem 
        //s3 
            --backup_endpoint
            --backup_access_key_id
            --backup_secret_access_key 
            --backup_bucket
            --backup_filepath 
            --backup_region 
            --backup_compression
            --backup_role_arn 
            --backup_is_minio
        //filesystem
            --backup_path
    --meta_path 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|backup_dir | 备份所在的路径类型，在没有指定 ID 时，必须要指定。s3 或 filesystem|
|backup_endpoint| 连接到备份在 s3 的的 URL|
|backup_access_key_id| 备份在 s3 的 Access key ID|
|backup_secret_access_key| 备份在 s3 的 Secret access key|
|backup_bucket| 备份在 s3 的桶|
|backup_filepath| 备份在 s3 的相对文件路径|
|backup_region| 备份在 s3 的服务区域|
|backup_compression| 备份在 s3 的文件的压缩格式。|
|backup_role_arn| 备份在 s3 的角色的资源名称。|
|backup_is_minio| 指定备份的 s3 是否是 minio|
|backup_path| 本地备份的路径|
|meta_path|指定 meta 文件位置。只能是文件系统中的路径。如果不指定，默认是同一目录下的 mo_br.meta 文件。|

### 示例

- 校验某个 ID 的备份

```
./mo_br check  1614f462-126c-11ef-9af3-26dd28356ef3
+--------------------------------------+--------+-----------------------------------+---------------------------+---------------+---------------------------+
|                  ID                  |  SIZE  |               PATH                |          AT TIME          |   DURATION    |       COMPLETE TIME       |
+--------------------------------------+--------+-----------------------------------+---------------------------+---------------+---------------------------+
| 1614f462-126c-11ef-9af3-26dd28356ef3 | 126 MB |   BackupDir: filesystem  Path:    | 2024-05-15 11:34:28 +0800 | 22.455633916s | 2024-05-15 11:34:50 +0800 |
|                                      |        | /Users/admin/soft/incbackup/back2 |                           |               |                           |
+--------------------------------------+--------+-----------------------------------+---------------------------+---------------+---------------------------+

Checking the backup data...

check: /backup_meta
check: /mo_meta
check: hakeeper/hk_data
check: tae/tae_list
check: tae/tae_sum
check: config/launch.toml_018f7a50-d300-7017-8580-150edf08733e
...
```

- 校验某个备份目录中的备份

```
(base) admin@admindeMacBook-Pro mo-backup % ./mo_br check --backup_dir filesystem --backup_path /Users/admin/soft/incbackup/back2
2024/05/15 11:40:30.011160 +0800 INFO malloc/malloc.go:42 malloc {"max buffer size": 1073741824, "num shards": 16, "classes": 23, "min class size": 128, "max class size": 1048576, "buffer objects per class": 23}
check: /backup_meta
check: /mo_meta
check: hakeeper/hk_data
check: tae/tae_list
check: tae/tae_sum
check: config/launch.toml_018f7a50-d300-7017-8580-150edf08733e
check: config/log.toml_018f7a50-d30c-7ed0-85bc-191e9f1eb753
...
```

## 最佳实践

下面我们将通过几个简单的示例来讲述如何使用 mo_br 进行数据的备份与还原

## 示例 1 全量备份恢复

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

## 示例 2 增量备份恢复

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
