# mo_br 备份与恢复

数据库物理备份和快照备份是两种重要的数据保护策略，它们在很多场景下都发挥着重要的作用。物理备份通过复制数据库的物理文件，如数据文件和日志文件，能够实现快速和完整的数据库恢复，特别适合于数据库整体迁移或灾难恢复的情况。另一方面，快照备份通过记录数据在特定时间点的状态，提供了一种快速且存储效率高的备份方式，适用于需要进行时间点恢复或只读查询操作的场景，如生成报告或进行数据分析。物理备份的恢复可能需要较长时间，而快照备份则可以提供快速的数据访问，两者结合使用，可以为数据库提供全面的保护，确保数据的安全性和业务的连续性。

MatrixOne 支持通过 `mo_br` 实用工具进行常规物理备份和快照备份。本章节将介绍 `mo_br` 的使用方法。

!!! note
    mo_br 企业级服务的物理备份与恢复工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

## 参考命令指南

help - 打印参考指南

```
./mo_br help
the backup and restore tool for the matrixone

Usage:
  mo_br [flags]
  mo_br [command]

Available Commands:
  backup      backup the matrixone data
  check       check the backup
  completion  Generate the autocompletion script for the specified shell
  delete      delete the backup
  help        Help about any command
  list        search the backup
  restore     restore the matrixone data
  snapshot    Manage snapshots

Flags:
      --config string      config file (default "./mo_br.toml")
  -h, --help               help for mo_br
      --log_file string    log file (default "console")
      --log_level string   log level (default "error")

Use "mo_br [command] --help" for more information about a command.
```

## 物理备份

### 创建备份

#### 语法结构

```
mo_cdc task create
    --task-name 同步任务名称.
    --source-uri 源端(mo)连接串
    --sink-type 下游类型
    --sink-uri 下游标识资源
    --tables 需要同步的表名
    --level cluster|account 选定同步的表的范围，集群/租户，
	    1.3只支持account. 指定cluster报错。
	    1.3可以不需要此参数，因为1.3只做租户级别
    --account 同步的租户，当level为 account 时需指定
    --no-full 可选，默认开启全量，添加此参数表示全量关闭
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

#### 示例

- 全量备份到本地文件系统

```bash
./mo_br backup --host "127.0.0.1" --port 6001 --user "root" --password "111" --backup_dir "filesystem"  --path "yourpath"
```

- 全量备份到 minio

```bash
./mo_br backup --host "127.0.0.1" --port 6001 --user "root" --password "111" --backup_dir "s3"  --endpoint "http://127.0.0.1:9000" --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A" --bucket "bucket1" --filepath "/backup1" --is_minio
```

- 增量备份到本地文件系统

```bash
./mo_br backup --host "127.0.0.1" --port 6001 --user "root" --password "111" --backup_dir "filesystem"  --path "yourpath" --backup_type "incremental" --base_id "xxx"
```

### 查看备份

#### 语法结构

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

#### 示例

- 查看所有备份列表

```bash
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

```bash
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

### 删除备份

#### 语法结构

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

#### 示例

- 删除本地文件系统备份

```bash
./mo_br delete e4cade26-3139-11ee-8631-acde48001122
```

- 删除 minio 上的一个备份。

```bash
./mo_br delete e4cade26-3139-11ee-8631-acde48001122 --access_key_id "S0kwLuB4JofVEIAxWTqf" --secret_access_key "X24O7t3hccmqUZqvqvmLN8464E2Nbr0DWOu9Qs5A"
```

### 恢复备份

#### 语法结构

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

#### 示例

从文件系统恢复到文件系统

**步骤一：**停止 mo，删除 mo-data

**步骤二：**执行以下恢复命令

```
./mo_br restore fb26fd88-41bc-11ee-93f8-acde48001122 --restore_dir filesystem --restore_path "your_mopath"
```

恢复后会在 matrixone 生成新的 mo-data 文件

**步骤三：**启动 mo

### 校验备份的校验码

读取备份文件夹中的每个文件及其 sha256 文件。计算文件的 sha256 值并与 sha256 文件值对比。sha256 文件是在文件创建或更新时，创建的。

#### 语法结构

- 校验某个 ID 的备份

```bash
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

#### 示例

- 校验某个 ID 的备份

```bash
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

```bash
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

## 快照备份

### 创建快照

#### 语法结构

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

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|level | 快照备份的范围，account|cluster|
|account| 快照备份的租户对象名，cluster 级别无需填写此参数|
|sname | 快照名称|

#### 示例

- 集群管理员创建集群级别快照：

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "cluster" --sname "cluster_sp1"
```

- 系统租户管理员为系统租户 sys 创建租户级别快照：

```bash
./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "account" --sname "snapshot_01" --account "sys"
```

- 系统租户管理员为普通租户 acc1 创建租户级别快照：

```bash
 ./mo_br snapshot create --host "127.0.0.1" --port 6001 --user "root" --password "111" --level "account" --sname "snapshot_02" --account "acc1" 
```

- 普通租户管理员创建租户级别快照：

    - 创建普通租户 acc1

    ```sql
    create account acc1 admin_name admin IDENTIFIED BY '111';
    ```

    - acc1 创建快照

    ```
    ./mo_br snapshot create  --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --level "account" --account "acc1" --sname "snapshot_03"
    ```

### 查看快照

#### 语法结构

```
mo_br snapshot show
    --host
    --port 
    --user 
    --password 
    --cluster
    --account 
    --db 
    --table 
    --sname 
    --beginTs 
    --endTs
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|cluster|固定填写 sys，其他值不生效，仅 sys 管理员使用|
|account| 要筛选的租户名，仅限 sys 管理员使用|
|db | 要筛选的数据库名|
|table | 要筛选的表名|
|sname | 要筛选的快照名称|
|beginTs |要筛选的快照时间戳的开始时间|
|endTs | 要筛选的快照时间戳的结束时间|

#### 示例

- 查看系统租户管理员下创建的快照：

```bash
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "root" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401 	account       	acc1        	             	          	
snapshot_01  	2024-05-11 02:26:03.462462	account       	sys  
```

- 查看普通租户管理员在 acc1 下创建的快照：

```bash
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111"
SNAPSHOT NAME	        TIMESTAMP         	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_03  	2024-05-11 02:29:31.572512	account       	acc1     
```

- 查看系统租户管理员下为租户 acc1 创建的快照，并对开始时间进行筛选：

```bash
./mo_br snapshot show --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "acc1" --beginTs "2024-05-11 00:00:00"     
SNAPSHOT NAME	        TIMESTAMP        	SNAPSHOT LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME 
snapshot_02  	2024-05-11 02:29:23.07401	account       	acc1 
```  

### 删除快照

#### 语法结构

```
mo_br snapshot drop
    --host
    --port 
    --user 
    --password 
    --sname 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|sname | 要筛选的快照名称|

#### 示例

- 删除系统管理员创建的快照：

```bash
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "root" --password "111" --sname "snapshot_01"
```

- 删除普通租户管理员创建的快照：

```bash
./mo_br snapshot drop --host "127.0.0.1" --port 6001 --user "acc1#admin" --password "111" --sname "snapshot_03" 
```

### 恢复快照

#### 语法结构

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

**参数说明**

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

- 表级别恢复

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --db "snapshot_read" --table "test_snapshot_read" --sname "sp_01"
```

- 数据库级别恢复

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --db "snapshot_read" --sname "sp_02"
```

- 租户级别恢复到本租户

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --sname "sp_03"
```

- 租户级别恢复到新租户

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111" --account "sys" --sname "sp_03" --new_account "acc2" --new_admin_name "admin" --new_admin_password "111";
```

- 集群级别恢复

```bash
./mo_br snapshot restore --host "127.0.0.1" --port 6001 --user "root" --password "111"  --sname "cluster_sp1"
```

## PITR 备份

### 创建 PITR

#### 语法结构

```
mo_br pitr create 
    --host
    --port 
    --user 
    --password 
    --pname 
    --level 
    --account 
    --database 
    --table 
    --rangevalue 
    --rangeunit 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|pname | pitr 名字|
|level | 备份的范围，cluster | account | database | table，level 等于高层级时，低层级的对象名不需要也不能填写，例如 level = account，则 database 和 table 不能填写|
|account| 备份的租户名|
|database| 备份的租数据库名|
|table|  备份的表名|
|rangevalue|时间范围值，1-100|
|rangeunit| 时间范围单位，可选范围 h（小时）、d（天，默认）、mo（月）、y（年）|

#### 示例

- 集群级别

只有系统租户才能创建集群级别的 pitr。

```
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "root" --password "111" --pname "pitr01" --level "cluster" --rangevalue 10 --rangeunit "h"
```

- 租户级别

系统租户可以为自己和其它租户创建租户级别的 pitr。

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr02" --level "account" --account "sys" --rangevalue 1 --rangeunit "d"

mo create account acc01 admin_name = 'test_account' identified by '111';
mo create account acc02 admin_name = 'test_account' identified by '111';

./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr015" --level "account" --account "acc01" --rangevalue 1 --rangeunit "y"

./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr016" --level "account" --account "acc02" --rangevalue 1 --rangeunit "y"
```

普通租户只能为自己创建租户级别的 pitr。

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr07" --level "account" --account "acc01" --rangevalue 1 --rangeunit "h"
```

- 数据库级别

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr011" --level "database" --account "sys" --database "abc" --rangevalue 1 --rangeunit "y"
```

- 表级别

```bash
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr011" --level "database" --account "sys" --database "abc" --rangevalue 1 --rangeunit "y"
```

### 查看 PITR

#### 语法结构

```
mo_br pitr show
    --hostname 
    --port 
    --user 
    --password 
    --cluster 
    --account 
    --database 
    --table 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|pname | pitr 名字|
|cluster | 固定填写 sys，其他值不生效，仅 sys 管理员使用|
|account| 备份的租户名|
|database| 备份的租数据库名|
|table|  备份的表名|

#### 示例

- 查看所有 pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111" 
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr016  	2024-08-08 06:55:40	2024-08-08 06:55:40	account   	acc02       	*            	*         	          1	y        	
pitr015  	2024-08-08 06:55:04	2024-08-08 06:55:04	account   	acc01       	*            	*         	          1	y        	
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y        	
pitr011  	2024-08-08 06:50:43	2024-08-08 06:50:43	database  	sys         	abc          	*         	          1	y        	
pitr05   	2024-08-08 06:45:56	2024-08-08 06:45:56	account   	sys         	*            	*         	          1	y        	
pitr04   	2024-08-08 06:45:52	2024-08-08 06:45:52	account   	sys         	*            	*         	          1	mo       	
pitr03   	2024-08-08 06:45:42	2024-08-08 06:45:42	account   	sys         	*            	*         	          1	d        	
pitr02   	2024-08-08 06:45:25	2024-08-08 06:45:25	account   	sys         	*            	*         	          1	h        	
pitr01   	2024-08-08 06:32:31	2024-08-08 06:32:31	cluster   	*           	*            	*         	         10	h  
```

- 查看集群级别 pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --cluster "sys"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr01   	2024-08-08 06:32:31	2024-08-08 06:32:31	cluster   	*           	*            	*         	         10	h 
```

- 查看租户级别 pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --account "sys"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y        	
pitr011  	2024-08-08 06:50:43	2024-08-08 06:50:43	database  	sys         	abc          	*         	          1	y        	
pitr05   	2024-08-08 06:45:56	2024-08-08 06:45:56	account   	sys         	*            	*         	          1	y        	
pitr04   	2024-08-08 06:45:52	2024-08-08 06:45:52	account   	sys         	*            	*         	          1	mo       	
pitr03   	2024-08-08 06:45:42	2024-08-08 06:45:42	account   	sys         	*            	*         	          1	d        	
pitr02   	2024-08-08 06:45:25	2024-08-08 06:45:25	account   	sys         	*            	*         	          1	h   
```

- 查看数据库级别 pitr

```bash
./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --account "sys" --database "abc"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y        	
pitr011  	2024-08-08 06:50:43	2024-08-08 06:50:43	database  	sys         	abc          	*         	          1	y     
```

- 查看表级别 pitr

```bash
 ./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --account "sys" --database "abc" --table "test"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr012  	2024-08-08 06:52:30	2024-08-08 06:52:30	table     	sys         	abc          	test      	          1	y          
```

### 更改 PITR

#### 语法结构

```
mo_br pitr alter
    --host
    --port 
    --user 
    --password 
    --pname 
    --rangevalue
    --rangeunit 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|pname | pitr 名字|
|rangevalue|时间范围值，1-100|
|rangeunit| 时间范围单位，可选范围 h（小时）、d（天，默认）、mo（月）、y（年）|

#### 示例

```bash
./mo_br pitr alter --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01" --rangevalue 10 --rangeunit "d"
 ./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111"  --cluster "sys"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr01   	2024-08-08 06:32:31	2024-08-08 07:31:06	cluster   	*           	*            	*         	         10	d    
```

### 恢复 PITR

#### 语法结构

```
mo_br pitr restore
    --host string 集群 IP
    --port int 集群端口号
    --user string 用户名
    --password 用户密码
    //要恢复的对象名
    --cluster 恢复整个集群，仅限集群管理员使用，固定填写 sys,该字段填写后，只需填写 --timestamp
    --account 要筛选的租户名，仅限集群管理员使用
    --database 要筛选的数据库名
    --table 要筛选的表名
    //要恢复的时间
    --timestamp
    //创建并恢复到新租户
    --new_account string 新创建的租户名
    --new_admin_name string 租户管理员
    --new_admin_password string 租户管理员密码
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|cluster | 恢复整个集群，仅限集群管理员使用，固定填写 sys，该字段填写后，只需填写 --timestamp|
|account | 要筛选的租户名，仅限集群管理员使用|
|database | 要筛选的数据库名|
|table | 要筛选的表名|
|timestamp | 要恢复的时间|
|new_account | 要恢复的时间|
|new_admin_name | 创建并恢复到新租户，新创建的租户名|
|new_admin_password | 租户管理员|
|timestamp | 租户管理员密码|

#### 示例

- 系统租户

    ```bash
    #集群级别
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01" --level "cluster" --rangevalue 10 --rangeunit "h"

    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01" --cluster "sys" --timestamp "2024-08-08 15:42:20.249966"

    #租户级别
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --level "account" --account "sys" --rangevalue 10 --rangeunit "h"
    ##用 account pitr 恢复 account
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --timestamp "2024-08-08 15:47:15.216472" --account "sys"
    ##用 account pitr 恢复 db
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --timestamp "2024-08-08 15:47:15.216472" --account "sys" --database "abc"
    ##用 account pitr 恢复 table 
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr100" --timestamp "2024-08-08 15:47:15.216472" --account "sys" --database "abc" --table "test"

    #数据库级别
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr101" --level "database" --account "sys" --database "abc" --rangevalue 10 --rangeunit "h"
    ##用 db pitr 恢复 db
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr101" --timestamp "2024-08-08 15:56:18.610295" --account "sys" --database "abc"
    ##用 db pitr 恢复 table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr101" --timestamp "2024-08-08 15:56:18.610295" --account "sys" --database "abc" --table "test"

    #表级别
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr102" --level "table" --account "sys" --database "abc" --table "test" --rangevalue 10 --rangeunit "h"
    ##用 table pitr 恢复 table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr102" --timestamp "2024-08-08 16:00:41.433477" --account "sys" --database "abc" --table "test"
    ```

- 普通租户

    ```bash
    #租户级别
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account"  --password "111" --pname "pitr200" --level "account" --account "acc01" --rangevalue 10 --rangeunit "h"
    ##用 account pitr 恢复 account
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr200" --timestamp "2024-08-08 16:04:17.276521" --account "acc01"
    ##用 account pitr 恢复 db
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr200" --timestamp "2024-08-08 16:04:17.276521" --account "acc01" --database "abc"
    ##用 account pitr 恢复 table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr200" --timestamp "2024-08-08 16:04:17.276521" --account "acc01" --database "abc" --table "test"

    #数据库级别
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account"  --password "111" --pname "pitr201" --level "database" --account "acc01" --database "abc" --rangevalue 10 --rangeunit "h"
    ##用 db pitr 恢复 db
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr201" --timestamp "2024-08-08 16:06:50.374948" --account "acc01" --database "abc"
    ##用 db pitr 恢复 table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr201" --timestamp "2024-08-08 16:06:50.374948" --account "acc01" --database "abc" --table "test"

    #表级别
    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc01#test_account"  --password "111" --pname "pitr202" --level "table" --account "acc01" --database "abc" --table "test" --rangevalue 10 --rangeunit "h"
    ##用 table pitr 恢复 table
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc01#test_account" --password "111" --pname "pitr202" --timestamp "2024-08-08 16:06:50.374948" --account "acc01" --database "abc" --table "test"

    #系统租户给普通租户创建 pitr 并恢复普通租户

    ./mo_br pitr create --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr300" --level "account" --account "acc01" --rangevalue 1 --rangeunit "y"

    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr300" --timestamp "2024-08-08 16:09:17.035136" --account "acc01"

    #系统租户将普通租户恢复到新租户
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr300" --timestamp "2024-08-08 16:09:17.035136" --account "acc03" --new_account "acc03"  --new_admin_name "test_account" --new_admin_password "111"
    ```

### 删除 PITR

#### 语法结构

```
mo_br pitr drop
    --host
    --port 
    --user 
    --password 
    --pname
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|host | 目标 MatrixOne 的 IP|
|port|端口号|
|user | 用户|
|password | 用户的密码|
|pname | pitr 名字|

#### 示例

```bash
./mo_br pitr drop  --host "127.0.0.1" --port 6001 --user "dump" --password "111" --pname "pitr01"  
```