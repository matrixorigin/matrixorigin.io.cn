# mo_cdc 数据同步

**CDC（Change Data Capture）**是一种实时捕获数据库中数据变更的技术，能够记录插入、更新和删除操作。它通过监控数据库的变更，实现数据的实时同步和增量处理，确保不同系统间数据的一致性。CDC 适用于实时数据同步、数据迁移、灾难恢复和审计跟踪等场景，通过读取事务日志等方式，减少全量数据复制的压力，并提升系统的性能和效率。其优势在于低延迟、高实时性，灵活支持多种数据库和系统，适应不断变化的大规模数据环境。

在进行 CDC 同步之前，必须提前创建包含同步范围的 PITR（时间点恢复）能力，且建议覆盖至少 2 小时的变更范围。这样可以确保在同步任务发生中断或异常时，系统能回溯并重新读取变更数据，避免数据丢失或不一致。

MatrixOne 支持通过 `mo_cdc` 实用工具进行租户/数据库/表级别的数据同步。本章节将介绍 `mo_cdc` 的使用方法。

!!! note
    mo_cdc 企业级服务的数据同步工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

## 参考命令指南

help - 打印参考指南

```bash
(base) admin@admindeMBP mo-backup % ./mo_cdc help
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
    --level 
      account|database|table
    --databases
    --tables 
    --no-full 
    --start-ts
    --end-ts
    --start-ts 
    --end-ts
    --send-sql-timeout 
    --max-sql-length 
    --exclude
    --error-handle-option
```

**参数说明**

|  参数   | 说明 |
|  ----  | ----  |
|task-name | 同步任务名称|
|source-uri|源端 (matrixone) 连接串|
|sink-type| 下游类型，目前支持 mysql 和 matrixone|
|level | 同步的范围，account|database|table|
|databases | 可选，同步范围为数据库级别时需指定|
|tables | 可选，同步范围为表级别时需指定|
|no-full| 可选，默认开启全量，添加此参数表示全量关闭|
|start-ts| 可选，从数据库中的特定时间戳开始拉取数据，需小于当前时间。|
|end-ts| 可选，数据拉取将停止于数据库中的指定时间戳，在指定 start-ts 时，需大于 start-ts。|
|max-sql-length| 可选，发送单条 sql 长度限制，默认为 4MB 和下游 max_packet_size 变量的较小值|
|exclude| 可选，指定过滤对象，即这部分对象不同步，支持正则表达式  |
|error-handle-option| 可选，stop|ignore，用来控制当向下游同步数据的时候，如果遇到了错误并到达重试时间：5 分钟后如何工作，默认 stop，表示停止该表的同步，可设置为 ignore，表示跳过此错误，继续往下同步|

#### 示例

```bash
>./mo_cdc task create --task-name "ms_task1" --source-uri "mysql://root:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --level table --tables "db1.t1:db1.t1"  

>./mo_cdc task create --task-name "ms_task2" --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --sink-uri "mysql://root:111@127.0.0.1:3306" --sink-type "mysql" --level "account" 

>./mo_cdc task create --task-name "mo_task1" --source-uri "mysql://root:111@127.0.0.1:6001" --sink-uri "mysql://root:111@10.222.2.33:6001" --sink-type "matrixone" --level database --databases "db1:db2" 
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
> ./mo_cdc task show --source-uri "mysql://root:111@127.0.0.1:6001"  --all
[
  {
    "task-id": "0195db8d-1a36-73d0-9fa3-e37839638b4b",
    "task-name": "mo_task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@10.222.2.33:6001",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"db1.t1\": 2025-03-28 15:00:35.790209 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:00:36.207296 +0800 CST"
  },
  {
    "task-id": "0195db5c-6406-73d8-bbf6-25fb8b9dd45d",
    "task-name": "task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"source_db.orders\": 2025-03-28 15:00:35.620173 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:00:36.207296 +0800 CST"
  },
  {
    "task-id": "0195db82-7d6f-7f2a-a6d0-24cbe6ae8896",
    "task-name": "ms_task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"db1.t1\": 2025-03-28 15:00:35.632194 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:00:36.207296 +0800 CST"
  }
]


#查看特定同步任务
>./mo_cdc task show --source-uri "mysql://acc1:admin:111@127.0.0.1:6001"   --task-name "ms_task2"
[
  {
    "task-id": "0195db8c-c15a-742e-8d0d-598529ab3f1e",
    "task-name": "ms_task2",
    "source-uri": "mysql://acc1:admin:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n  \"db1.t1\": 2025-03-28 15:01:44.030821 +0800 CST,\n  \"db1.table1\": 2025-03-28 15:01:43.998759 +0800 CST,\n}",
    "timestamp": "2025-03-28 15:01:44.908341 +0800 CST"
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
./mo_cdc task pause  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"

#暂停所有任务
./mo_cdc task pause --source-uri "mysql://root:111@127.0.0.1:6001"  --all
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
./mo_cdc task resume  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"
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
./mo_cdc task restart  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"
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
./mo_cdc task drop  --source-uri "mysql://acc1:admin:111@127.0.0.1:6001" --task-name "ms_task2"

#删除所有任务
./mo_cdc task drop  --source-uri  "mysql://root:111@127.0.0.1:6001" --all
```
