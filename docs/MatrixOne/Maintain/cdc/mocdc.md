# mo_cdc 数据同步

**CDC（Change Data Capture）**是一种实时捕获数据库中数据变更的技术，能够记录插入、更新和删除操作。它通过监控数据库的变更，实现数据的实时同步和增量处理，确保不同系统间数据的一致性。CDC 适用于实时数据同步、数据迁移、灾难恢复和审计跟踪等场景，通过读取事务日志等方式，减少全量数据复制的压力，并提升系统的性能和效率。其优势在于低延迟、高实时性，灵活支持多种数据库和系统，适应不断变化的大规模数据环境。

MatrixOne 支持通过 `mo_cdc` 实用工具进行表级别的数据同步。本章节将介绍 `mo_cdc` 的使用方法。

!!! note
    mo_cdc 企业级服务的数据同步工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

## 参考命令指南

help - 打印参考指南

```bash
admin@admindeMacBook-Pro mo-backup % ./mo_cdc help
This command allows you to manage CDC Task, including task create, task show, task pause, task resume, task restart, and task drop.

Usage:
  mo_cdc [flags]
  mo_cdc [command]

Available Commands:
  completion  Generate the autocompletion script for the specified shell
  help        Help about any command
  task        Manage Task

Flags:
  -h, --help   help for mo_cdc

Use "mo_cdc [command] --help" for more information about a command.
```

## 创建任务

### 语法结构

```
mo_cdc task create
    --task-name 
    --source-uri 
    --sink-type 
    --sink-uri 
    --tables 
    --level 
    --account 
    --no-full 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|task-name | 同步任务名称|
|source-uri|源端 (mo) 连接串|
|sink-type| 下游类型，目前支持 mysql|
|tables | 需要同步的表名，多个表名间用逗号隔开|
|level | 选定同步的表的范围，目前只支持租户|
|account| 同步的租户，当 level 为 account 时需指定|
|no-full| 备可选，默认开启全量，添加此参数表示全量关闭|

#### 示例

```bash
>./mo_cdc task create --task-name "task1" --source-uri "mysql://root:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --tables "db1.t1:db1.t1,db1.t2:db1.t2" --level "account" --account "sys"

>./mo_cdc task create --task-name "task2" --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --tables "db1.table1:db2.tab1" --level "account" --account "acc1"
```

## 查看任务

查看 cdc 任务只能查看当前连接用户创建的任务。

### 语法结构

```
mo_cdc task show
    --source-uri 
    --all 
    --task-name 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|source-uri|源端服务器地址|
|all| 查看所有同步任务|
|task-name | 同步任务名称|

**返回信息**

|  字段   | 说明 |
|  ----  | ----  |
|task-id|任务 id|
|task-name| 任务名称|
|source-uri | 源端服务器地址|
|sink-uri | 下游标识资源|
|state | 任务状态，running 或 stopped|
|checkpoint | 同步进度|
|timestamp | 当前时间戳|

#### 示例

```bash
#查看所有同步任务
>./mo_cdc task show "task1" --source-uri "mysql://root:111@127.0.0.1:6001"  --all
[
  {
    "task-id": "0192bd8a-781b-776e-812a-3f4440fceff9",
    "task-name": "task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "checkpoint": "{\n  \"db1.t1\": 2024-10-24 16:12:56.254918 +0800 CST,\n  \"db1.t2\": 2024-10-24 16:12:56.376204 +0800 CST,\n}",
    "timestamp": "2024-10-24 16:12:56.897015 +0800 CST"
  }
]

#查看特定同步任务
>./mo_cdc task show "task1" --source-uri "mysql://acc1:admin:111@127.0.0.1:6001"   --task-name "task2"
[
  {
    "task-id": "0192bd94-e716-73c4-860e-a392a0d68d6f",
    "task-name": "task2",
    "source-uri": "mysql://acc1:admin:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "checkpoint": "{\n  \"db1.table1\": 2024-10-24 16:14:43.552274 +0800 CST,\n}",
    "timestamp": "2024-10-24 16:14:43.664386 +0800 CST"
  }
]
```

## 暂停任务

### 语法结构

```
mo_cdc task pause
    --source-uri 
    --all 
    --task-name 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|source-uri|源端服务器地址|
|all| 暂停所有同步任务|
|task-name | 同步任务名称|

#### 示例

```bash
#暂停特定任务
./mo_cdc task pause  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"

#暂停所有任务
./mo_cdc task pause  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --all
```

## 恢复任务

任务只能在其状态为停止时进行恢复，恢复过程会进行断点续传。如果任务暂停的时间超过了 GC 的保留期限，则在此期间的操作将无法被同步，系统仅会同步任务最终的数据状态。

### 语法结构

```
mo_cdc task resume
    --source-uri 
    --task-name 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|source-uri|源端服务器地址|
|task-name | 同步任务名称|

#### 示例

```bash
./mo_cdc task resume  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"
```

## 重启任务

重启 cdc 任务会忽略任务之前的同步进度记录，从头重新开始同步。

### 语法结构

```
mo_cdc task restart
    --source-uri 
    --task-name 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|source-uri|源端服务器地址|
|task-name | 同步任务名称|

#### 示例

```bash
./mo_cdc task restart  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"
```

## 删除任务

### 语法结构

```
mo_cdc task drop
    --source-uri 
    --all
    --task-name 
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|source-uri|源端服务器地址|
|all|删除所有同步任务|
|task-name | 删除特定名称的同步任务|

#### 示例

```bash
#删除特定任务
./mo_cdc task drop  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "task2"

#删除所有任务
./mo_cdc task drop  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --all
```
