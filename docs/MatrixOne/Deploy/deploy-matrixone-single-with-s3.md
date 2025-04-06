# 基于 S3 部署一个单机的 MatrixOne

本文提供一个示例，旨在说明如何基于 S3 部署一个单机的 MatrixOne。区别于一般的单机部署方式，这种方式使用 S3 作为 MatrixOne 的存储介质，而不是直接采用宿主机器的本地磁盘。

## 适用场景

这种部署模式非常适合用于时序场景的测试。由于时序数据具有速度快、数据量大的特点，使用近乎无限容量的 S3 作为存储介质可以很好地满足这些需求，从而避免了单机本地磁盘空间不足的限制。

!!! note
    此部署模式建议仅用于开发、测试等场景，而不推荐用于生产环境。生产环境，建议使用基于 k8s+s3 的分布式部署模式。

## 前置条件

准备一台宿主机并配置好 S3 存储介质，包括但不限于：鉴权密钥对、访问 endpoint、区域（私有化可忽略）、桶名路径等。此外，建议将 MatrixOne 单机部署的宿主机与 S3 对象存储置于同一内网，以确保网络不会成为性能瓶颈。

## 操作步骤

### 场景 1：MatrixOne with Minio

#### 部署一个单机的 MatrixOne

参考[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)，完成 MatrixOne 的单机版部署，部署完毕暂不启动。

#### 修改 MatrixOne 配置文件

以下以宿主机部署方式（即源码或二进制部署）为例进行说明，若使用容器部署方式，还需要将配置文件挂载到容器中，具体操作步骤**容器化部署模式**章节。宿主机部署模式下，默认配置文件一般位于 etc/launch/下。一般需要修改的地方有：mo 的部署路径、s3 的信息。

- 备份默认配置文件夹

```bash
cd /your/mo-path/
cp -rp etc/launch etc/launch-default
```

- CN 配置 (cn.toml)

```
#######################
#    一、默认配置       #
#######################

service-type = "CN"
data-dir = "./mo-data"

[log]
level = "info"

[cn]
uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 18000

[malloc]
check-fraction = 65536
enable-metrics = true

#######################
#    二、自定义配置     #
#######################

# fileservic数组的配置中，name分为三部分：LOCAL、S3、ETL，其中：
# 1、LOCAL：临时文件存储（一般配DISK的backend）
# 2、SHARED（旧配置项为S3，后改为SHARED，但仍然兼容S3写法）：mo的数据存储
# 3、ETL：可观测性系统相关的数据存储（一般与mo的数据存储保持一致）

# 1、第一部分：LOCAL
# 1.1、（可选）配置LOCAL部分的本地路径，注意CN、TN、LOG需要配置不同的目录
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo-path/matrixone/data/local/cn"
name = "LOCAL"

# 2、第二部分：S3
# （必选）
[[fileservice]]
backend = "MINIO" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "S3"

# 2.1、（可选）配置S3部分的本地缓存，包括磁盘缓存和内存缓存
[fileservice.cache]
disk-capacity = "20GiB" # 本地磁盘缓存大小
disk-path = "/your/mo-path/matrixone/data/disk-cache" # 本地磁盘缓存路径
memory-capacity = "2GiB" #本地内存缓存大小

# 2.2、（必选）配置S3部分中用于存储mo data数据的对象存储信息，包括
[fileservice.s3]
bucket = "mo-on-minio-demo" # 桶名
endpoint = "http://10.0.0.1" # 访问地址
key-prefix = "mo/data" # 桶名后面接的路径
key-id = "xxxx" # 密钥对中的id
key-secret = "xxxx" #密钥对中的key

# 3、第三部分：ETL
#（必选）
[[fileservice]]
backend = "MINIO" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "ETL"

# 3.1、（必选）配置ETL部分中的cache，一般配置为1B，即几乎没有
[fileservice.cache]
memory-capacity = "1B"

# 3.2、（必选）配置ETL部分中用于存储mo etl数据的对象存储信息，大部分信息与第2.2部分保持一致，但key-prefix用另外一个子目录即可
[fileservice.s3]
bucket = "mo-on-minio-demo" # 桶名
endpoint = "http://10.0.0.1" # 访问地址
key-prefix = "mo/etl" # 桶名后面接的路径
key-id = "xxxx" # 密钥对中的id
key-secret = "xxxx" #密钥对中的key
```

- TN 配置 (tn.toml)

```
#######################
#    一、默认配置       #
#######################

service-type = "TN"
data-dir = "./mo-data"

[log]
level = "info"

[tn]
uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 19000

[malloc]
check-fraction = 65536
enable-metrics = true

#######################
#    二、自定义配置     #
#######################

# fileservic数组的配置中，name分为三部分：LOCAL、S3、ETL，其中：
# 1、LOCAL：临时文件存储（一般配DISK的backend）
# 2、SHARED（旧配置项为S3，后改为SHARED，但仍然兼容S3写法）：mo的数据存储
# 3、ETL：可观测性系统相关的数据存储（一般与mo的数据存储保持一致）

# 1、第一部分：LOCAL
# 1.1、（可选）配置LOCAL部分的本地路径，注意CN、TN、LOG需要配置不同的目录
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo-path/matrixone/data/local/tn"
name = "LOCAL"

# 2、第二部分：S3
# （必选）
[[fileservice]]
backend = "MINIO" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "S3"

# 2.1、（可选）配置S3部分的本地缓存，包括磁盘缓存和内存缓存
[fileservice.cache]
disk-capacity = "20GiB" # 本地磁盘缓存大小
disk-path = "/your/mo-path/matrixone/data/disk-cache" # 本地磁盘缓存路径
memory-capacity = "2GiB" #本地内存缓存大小

# 2.2、（必选）配置S3部分中用于存储mo data数据的对象存储信息，包括
[fileservice.s3]
bucket = "mo-on-minio-demo" # 桶名
endpoint = "http://10.0.0.1" # 访问地址
key-prefix = "mo/data" # 桶名后面接的路径
key-id = "xxxx" # 密钥对中的id
key-secret = "xxxx" #密钥对中的key

# 3、第三部分：ETL
#（必选）
[[fileservice]]
backend = "MINIO" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "ETL"

# 3.1、（必选）配置ETL部分中的cache，一般配置为1B，即几乎没有
[fileservice.cache]
memory-capacity = "1B"

# 3.2、（必选）配置ETL部分中用于存储mo etl数据的对象存储信息，大部分信息与第2.2部分保持一致，但key-prefix用另外一个子目录即可
[fileservice.s3]
bucket = "mo-on-minio-demo" # 桶名
endpoint = "http://10.0.0.1" # 访问地址
key-prefix = "mo/etl" # 桶名后面接的路径
key-id = "xxxx" # 密钥对中的id
key-secret = "xxxx" #密钥对中的key
```

- LogService 配置（log.toml）

```
#######################
#    一、默认配置       #
#######################

# service node type, [DN|CN|LOG]
service-type = "LOG"
data-dir = "./mo-data"

[log]
level = "info"

[malloc]
check-fraction = 65536
enable-metrics = true

#######################
#    二、自定义配置     #
#######################

# fileservic数组的配置中，name分为三部分：LOCAL、S3、ETL，其中：
# 1、LOCAL：临时文件存储（一般配DISK的backend）
# 2、SHARED（旧配置项为S3，后改为SHARED，但仍然兼容S3写法）：mo的数据存储
# 3、ETL：可观测性系统相关的数据存储（一般与mo的数据存储保持一致）

# 1、第一部分：LOCAL
# 1.1、（可选）配置LOCAL部分的本地路径，注意CN、TN、LOG需要配置不同的目录
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo-path/matrixone/data/local/log"
name = "LOCAL"

# 2、第二部分：S3
# （必选）
[[fileservice]]
backend = "MINIO" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "S3"

# 2.1、（可选）配置S3部分的本地缓存，包括磁盘缓存和内存缓存
[fileservice.cache]
disk-capacity = "20GiB" # 本地磁盘缓存大小
disk-path = "/your/mo-path/matrixone/data/disk-cache" # 本地磁盘缓存路径
memory-capacity = "2GiB" #本地内存缓存大小

# 2.2、（必选）配置S3部分中用于存储mo data数据的对象存储信息，包括
[fileservice.s3]
bucket = "mo-on-minio-demo" # 桶名
endpoint = "http://10.0.0.1" # endpoint即访问地址
key-prefix = "mo/data" # 桶名后面接的路径
key-id = "xxxx" # 密钥对中的id
key-secret = "xxxx" #密钥对中的key

# 3、第三部分：ETL
#（必选）
[[fileservice]]
backend = "MINIO" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "ETL"

# 3.1、（必选）配置ETL部分中的cache，一般配置为1B，即几乎没有
[fileservice.cache]
memory-capacity = "1B"

# 3.2、（必选）配置ETL部分中用于存储mo etl数据的对象存储信息，大部分信息与第2.2部分保持一致，但key-prefix用另外一个子目录即可
[fileservice.s3]
bucket = "mo-on-minio-demo" # 桶名
endpoint = "http://10.0.0.1" # endpoint即访问地址
key-prefix = "mo/etl" # 桶名后面接的路径
key-id = "xxxx" # 密钥对中的id
key-secret = "xxxx" #密钥对中的key

```

#### 启动 mo-service

```
# 启动mo-service
mo_ctl start
# 稍等片刻后，确认mo-service运行状态
mo_ctl status
```

#### 连接 MatrixOne

```
# 若mo_ctl保持默认配置，则无需设置连接信息，默认会连接到本地mo
mo_ctl set_conf MO_HOST=127.0.0.1
mo_ctl set_conf MO_PORT=6001
mo_ctl set_conf MO_USER=dump
mo_ctl set_conf MO_PW=111

# 连接到mo
mo_ctl connect
```

#### 确认 MatrixOne 正常工作

```
# 以创建一个库表为例，写入一些示例数据，确认mo可以正常工作
github@shpc2-10-222-1-9:/data/mo/main/matrixone/etc/launch$ mo_ctl connect
2024-08-26 17:44:10.196 UTC+0800    [INFO]    Checking connectivity
2024-08-26 17:44:10.207 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 10
Server version: 8.0.30-MatrixOne-v287278 MatrixOne

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

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

mysql> create database test;
Query OK, 1 row affected (0.02 sec)

mysql> use test;
Database changed
mysql> create table t1(create_time timestamp(3), device_id varchar(25), metric_value float);
Query OK, 0 rows affected (0.01 sec)

mysql> insert into t1 values ('2024-08-26 17:45:01', 'jkasdjlasd', 123.22);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t1 values ('2024-08-26 17:45:10', 'jkasdjlasd', 123.99);
Query OK, 1 row affected (0.00 sec)

mysql> insert into t1 values ('2024-08-26 17:45:10', 'dassad', 88.99);
Query OK, 1 row affected (0.00 sec)

mysql> select * from t1;
+-------------------------+------------+--------------+
| create_time             | device_id  | metric_value |
+-------------------------+------------+--------------+
| 2024-08-26 17:45:01.000 | jkasdjlasd |       123.22 |
| 2024-08-26 17:45:10.000 | jkasdjlasd |       123.99 |
| 2024-08-26 17:45:10.000 | dassad     |        88.99 |
+-------------------------+------------+--------------+
3 rows in set (0.00 sec)

mysql> quit
Bye
2024-08-26 17:45:52.827 UTC+0800    [INFO]    Connect succeeded and finished. Bye
```

#### 确认数据写入 S3(MinIO)

我们可以使用 mc（minio 的官方命令行客户端工具）来确认 mo 的数据被写入到了对应的存储桶中。mc 的具体使用方式可以参考以下说明文档：
<https://min.io/docs/minio/linux/reference/minio-mc.html>

```
github@shpc2-10-222-1-9:/data/mo/main/matrixone/etc/launch$ mc ls minio-sh/mo-on-minio-demo/mo
[2024-08-26 18:00:10 CST]     0B data/
github@shpc2-10-222-1-9:/data/mo/main/matrixone/etc/launch$ mc ls minio-sh/mo-on-minio-demo/mo/data/
[2024-08-26 17:47:32 CST] 1.7KiB STANDARD 01918e10-ec44-7245-a131-690549db5f05_00000
[2024-08-26 17:48:17 CST] 2.7KiB STANDARD 01918e10-ec44-72d2-9973-5d4ced588a4a_00000
[2024-08-26 17:48:12 CST]   972B STANDARD 01918e10-ec44-7321-93f8-5820d3abd218_00000
# ....
# 中间的文件省去
01918e1f-8a38-725e-b95f-1ba3213883ac_00000
[2024-08-26 17:58:42 CST]   739B STANDARD 01918e1f-9db7-7950-aa1a-1429b586e98d_00000
[2024-08-26 17:58:42 CST]  24KiB STANDARD 01918e1f-9db7-7bcd-bbf0-2aa3e16b6f73_00000
[2024-08-26 17:58:42 CST] 3.7KiB STANDARD 01918e1f-9dd0-7386-98e9-f2530420d460_00000
[2024-08-26 18:00:12 CST]     0B ckp/
```

### 场景 2:MatrixOne with S3

本章节将说明如何基于遵循标准 S3 协议的对象存储部署单机版 MatrixOne，以腾讯云 COS 为例。其他类似的 S3 服务商，如 AWS、阿里云 OSS 等，其配置方法类似，可参照此步骤进行。基于腾讯云 COS 的部署步骤与 MinIO 相比，除了配置文件略有不同，其他步骤基本一致。以下将重点说明配置文件的差异，其他步骤不再赘述。

#### 修改 MatrixOne 配置文件

- CN 配置 (cn.toml)

```
#######################
#    一、默认配置       #
#######################

service-type = "CN"
data-dir = "./mo-data"

[log]
level = "info"

[cn]
uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 18000

[malloc]
check-fraction = 65536
enable-metrics = true

#######################
#    二、自定义配置     #
#######################

# fileservic数组的配置中，name分为三部分：LOCAL、S3、ETL，其中：
# 1、LOCAL：临时文件存储（一般配DISK的backend）
# 2、SHARED（旧配置项为S3，后改为SHARED，但仍然兼容S3写法）：mo的数据存储
# 3、ETL：可观测性系统相关的数据存储（一般与mo的数据存储保持一致）

# 1、第一部分：LOCAL
# 1.1、（可选）配置LOCAL部分的本地路径，注意CN、TN、LOG需要配置不同的目录
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo/path/data/local/cn"
name = "LOCAL"

# 2、第二部分：S3
# （必选）
[[fileservice]]
backend = "S3" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "S3"

# 2.1、（可选）配置S3部分的本地缓存，包括磁盘缓存和内存缓存
[fileservice.cache]
disk-capacity = "20GiB" # 本地磁盘缓存大小
disk-path = "/your/mo/path/data/disk-cache" # 本地磁盘缓存路径
memory-capacity = "2GiB" #本地内存缓存大小

# 2.2、（必选）配置S3部分中用于存储mo data数据的对象存储信息，包括
[fileservice.s3]
bucket = "my-bucket-12345678" # 桶名
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint即访问地址
key-prefix = "mo/data" # 桶名后面接的路径
key-id = "xxxxxx" # 密钥对中的id
key-secret = "xxxxxx" #密钥对中的key
region = "ap-nanjing" # 地域

# 3、第三部分：ETL
#（必选）
[[fileservice]]
backend = "S3" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "ETL"

# 3.1、（必选）配置ETL部分中的cache，一般配置为1B，即几乎没有
[fileservice.cache]
memory-capacity = "1B"

# 3.2、（必选）配置ETL部分中用于存储mo etl数据的对象存储信息，大部分信息与第2.2部分保持一致，但key-prefix用另外一个子目录即可
[fileservice.s3]
bucket = "my-bucket-12345678" # 桶名
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint即访问地址
key-prefix = "mo/etl" # 桶名后面接的路径
key-id = "xxxxxx" # 密钥对中的id
key-secret = "xxxxxx" #密钥对中的key
region = "ap-nanjing" # 地域
```

- TN 配置 (tn.toml)

```
#######################
#    一、默认配置       #
#######################

service-type = "TN"
data-dir = "./mo-data"

[log]
level = "info"

[tn]
uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf"
port-base = 19000

[malloc]
check-fraction = 65536
enable-metrics = true

#######################
#    二、自定义配置     #
#######################

# fileservic数组的配置中，name分为三部分：LOCAL、S3、ETL，其中：
# 1、LOCAL：临时文件存储（一般配DISK的backend）
# 2、SHARED（旧配置项为S3，后改为SHARED，但仍然兼容S3写法）：mo的数据存储
# 3、ETL：可观测性系统相关的数据存储（一般与mo的数据存储保持一致）

# 1、第一部分：LOCAL
# 1.1、（可选）配置LOCAL部分的本地路径，注意CN、TN、LOG需要配置不同的目录
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo/path/data/local/tn"
name = "LOCAL"

# 2、第二部分：S3
# （必选）
[[fileservice]]
backend = "S3" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "S3"

# 2.1、（可选）配置S3部分的本地缓存，包括磁盘缓存和内存缓存
[fileservice.cache]
disk-capacity = "20GiB" # 本地磁盘缓存大小
disk-path = "/your/mo/path/data/disk-cache" # 本地磁盘缓存路径
memory-capacity = "2GiB" #本地内存缓存大小

# 2.2、（必选）配置S3部分中用于存储mo data数据的对象存储信息，包括
[fileservice.s3]
bucket = "my-bucket-12345678" # 桶名
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint即访问地址
key-prefix = "mo/data" # 桶名后面接的路径
key-id = "xxxxxx" # 密钥对中的id
key-secret = "xxxxxx" #密钥对中的key
region = "ap-nanjing" # 地域

# 3、第三部分：ETL
#（必选）
[[fileservice]]
backend = "S3" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "ETL"

# 3.1、（必选）配置ETL部分中的cache，一般配置为1B，即几乎没有
[fileservice.cache]
memory-capacity = "1B"

# 3.2、（必选）配置ETL部分中用于存储mo etl数据的对象存储信息，大部分信息与第2.2部分保持一致，但key-prefix用另外一个子目录即可
[fileservice.s3]
bucket = "my-bucket-12345678" # 桶名
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint即访问地址
key-prefix = "mo/etl" # 桶名后面接的路径
key-id = "xxxxxx" # 密钥对中的id
key-secret = "xxxxxx" #密钥对中的key
region = "ap-nanjing" # 地域
```

- LogService 配置（log.toml）

```
#######################
#    一、默认配置       #
#######################

# service node type, [DN|CN|LOG]
service-type = "LOG"
data-dir = "./mo-data"

[log]
level = "info"

[malloc]
check-fraction = 65536
enable-metrics = true

#######################
#    二、自定义配置     #
#######################

# fileservic数组的配置中，name分为三部分：LOCAL、S3、ETL，其中：
# 1、LOCAL：临时文件存储（一般配DISK的backend）
# 2、SHARED（旧配置项为S3，后改为SHARED，但仍然兼容S3写法）：mo的数据存储
# 3、ETL：可观测性系统相关的数据存储（一般与mo的数据存储保持一致）

# 1、第一部分：LOCAL
# 1.1、（可选）配置LOCAL部分的本地路径，注意CN、TN、LOG需要配置不同的目录
[[fileservice]]
backend = "DISK"
data-dir = "/your/mo/path/data/local/log"
name = "LOCAL"

# 2、第二部分：S3
# （必选）
[[fileservice]]
backend = "S3" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "S3"

# 2.1、（可选）配置S3部分的本地缓存，包括磁盘缓存和内存缓存
[fileservice.cache]
disk-capacity = "20GiB" # 本地磁盘缓存大小
disk-path = "/your/mo/path/data/disk-cache" # 本地磁盘缓存路径
memory-capacity = "2GiB" #本地内存缓存大小

# 2.2、（必选）配置S3部分中用于存储mo data数据的对象存储信息，包括
[fileservice.s3]
bucket = "my-bucket-12345678" # 桶名
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint即访问地址
key-prefix = "mo/data" # 桶名后面接的路径
key-id = "xxxxxx" # 密钥对中的id
key-secret = "xxxxxx" #密钥对中的key
region = "ap-nanjing" # 地域

# 3、第三部分：ETL
#（必选）
[[fileservice]]
backend = "S3" # 注意，MinIO时配置为MINIO，其余S3配置为S3
name = "ETL"

# 3.1、（必选）配置ETL部分中的cache，一般配置为1B，即几乎没有
[fileservice.cache]
memory-capacity = "1B"

# 3.2、（必选）配置ETL部分中用于存储mo etl数据的对象存储信息，大部分信息与第2.2部分保持一致，但key-prefix用另外一个子目录即可
[fileservice.s3]
bucket = "my-bucket-12345678" # 桶名
endpoint = "https://cos.ap-nanjing.myqcloud.com" # endpoint即访问地址
key-prefix = "mo/etl" # 桶名后面接的路径
key-id = "xxxxxx" # 密钥对中的id
key-secret = "xxxxxx" #密钥对中的key
region = "ap-nanjing" # 地域
```

#### 确认数据写入 COS

我们可以使用上述的 mc 工具，也可以使用腾讯云 COS 提供的 coscli 工具来确认，请参考官方文档说明：<https://cloud.tencent.com/document/product/436/63143>

```
github@VM-32-6-debian:/data/mo/main$ mo_ctl connect
2024-08-26 18:38:31.105 UTC+0800    [INFO]    Checking connectivity
2024-08-26 18:38:31.124 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 3
Server version: 8.0.30-MatrixOne-v287278 MatrixOne

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [(none)]> show databases;
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
7 rows in set (0.003 sec)

MySQL [(none)]> create database test;
Query OK, 1 row affected (0.008 sec)

MySQL [(none)]> use test
Database changed
MySQL [test]> create table t1(create_time timestamp(3), device_id varchar(25), metric_value float);
Query OK, 0 rows affected (0.012 sec)

MySQL [test]> insert into t1 values ('2024-08-26 17:45:01', 'jkasdjlasd', 123.22);
Query OK, 1 row affected (0.005 sec)

MySQL [test]>  insert into t1 values ('2024-08-26 17:45:10', 'jkasdjlasd', 123.99);
Query OK, 1 row affected (0.003 sec)

MySQL [test]> insert into t1 values ('2024-08-26 17:45:10', 'dassad', 88.99);
Query OK, 1 row affected (0.002 sec)

MySQL [test]> select * from t1;
+-------------------------+------------+--------------+
| create_time             | device_id  | metric_value |
+-------------------------+------------+--------------+
| 2024-08-26 17:45:01.000 | jkasdjlasd |       123.22 |
| 2024-08-26 17:45:10.000 | jkasdjlasd |       123.99 |
| 2024-08-26 17:45:10.000 | dassad     |        88.99 |
+-------------------------+------------+--------------+
3 rows in set (0.003 sec)

MySQL [test]> quit
Bye
2024-08-26 18:50:17.007 UTC+0800    [INFO]    Connect succeeded and finished. Bye


github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo
       KEY       | TYPE | LAST MODIFIED | SIZE  
-----------------+------+---------------+-------
  main_30eca66c/ |  DIR |               |       
             mo/ |  DIR |               |       
       KEY       | TYPE |  LAST MODIFIED  | SIZE  
-----------------+------+-----------------+-------
-----------------+------+-----------------+-------
                          TOTAL OBJECTS:  |  2    
                        ------------------+-------
github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo/mo/
    KEY    |   TYPE   |      LAST MODIFIED       | SIZE  
-----------+----------+--------------------------+-------
  mo/data/ |      DIR |                          |       
       mo/ | STANDARD | 2024-08-26T10:28:28.000Z | 0  B  
    KEY    |   TYPE   |      LAST MODIFIED       | SIZE  
-----------+----------+--------------------------+-------
-----------+----------+--------------------------+-------
                             TOTAL OBJECTS:      |  2    
                      ---------------------------+-------
github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo/mo/data
    KEY    | TYPE | LAST MODIFIED | SIZE  
-----------+------+---------------+-------
  mo/data/ |  DIR |               |       
    KEY    | TYPE |  LAST MODIFIED  | SIZE  
-----------+------+-----------------+-------
-----------+------+-----------------+-------
                    TOTAL OBJECTS:  |  1    
                  ------------------+-------
github@VM-32-6-debian:/data/mo/main$ coscli ls cos://mo-on-cos-demo/mo/data/
                         KEY                         |   TYPE   |      LAST MODIFIED       |   SIZE     
-----------------------------------------------------+----------+--------------------------+------------
                                        mo/data/ckp/ |      DIR |                          |            
  mo/data/01918e44-0205-7239-9fdc-a3370df0cc73_00000 | STANDARD | 2024-08-26T10:43:39.000Z |  15.42 KB  
  mo/data/01918e44-0205-7463-b9b1-95a4b88f11fa_00000 | STANDARD | 2024-08-26T10:43:49.000Z |    972  B  
# ....
# 中间省去
  mo/data/01918e4e-ba33-772f-a606-07a0e7c20e03_00000 | STANDARD | 2024-08-26T10:50:09.000Z |   2.26 KB  
  mo/data/01918e4e-ba34-7605-b070-c53224bc16e2_00000 | STANDARD | 2024-08-26T10:50:09.000Z |  45.77 KB  
  mo/data/01918e4e-ba36-7080-96b6-7000c1f978aa_00000 | STANDARD | 2024-08-26T10:50:09.000Z |  62.67 KB  
                         KEY                         |   TYPE   |      LAST MODIFIED       |   SIZE     
-----------------------------------------------------+----------+--------------------------+------------
-----------------------------------------------------+----------+--------------------------+------------
                                                                       TOTAL OBJECTS:      |    119     
                                                                ---------------------------+------------
```

### 容器化部署模式

根据场景，按上面步骤，先配置好 cn.toml、tn.toml、log.toml 文件。之后，把这些文件存放到同一个目录下，例如/data/mo_confs。此外，还需要配置一个 launch.toml 文件，内容如下：

- 修改 MatrixOne 配置文件

```
logservices = [
    "./etc/log.toml",
]

tnservices = [
    "./etc/tn.toml"
]

cnservices = [
    "./etc/cn.toml"
]
```

- 设置 mo_ctl 工具配置

```
先配置好cn.toml、tn.toml、log.toml
mo_ctl set_conf MO_CONTAINER_IMAGE=matrixorigin/matrixone/2.1.0 #设置镜像
mo_ctl set_conf MO_CONTAINER_NAME=mo # 设置容器名
mo_ctl set_conf MO_CONTAINER_CONF_HOST_PATH=/data/mo_confs/ # 设置宿主机上的mo配置文件存放的目录
mo_ctl set_conf MO_CONTAINER_CONF_CON_FILE="/etc/launch.toml" # 设置容器启动时容器内的配置文件路径
mo_ctl set_conf MO_CONTAINER_DATA_HOST_PATH="/data/mo-data/" # 设置挂载到容器的宿主机数据目录
mo_ctl set_conf MO_CONTAINER_AUTO_RESTART="yes"   # 配置容器异常退出后自动重启
```

- 启动 MatrixOne 容器
  
设置 MatrixOne 部署模式为容器，并启动 MatrixOne 容器

```
mo_ctl set_conf MO_DEPLOY_MODE=docker
mo_ctl start
```
