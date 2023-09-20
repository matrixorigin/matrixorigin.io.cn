# 使用 DataX 将数据写入 MatrixOne

## 概述

本文介绍如何使用 DataX 工具将数据离线写入 MatrixOne 数据库。

DataX 是一款由阿里开源的异构数据源离线同步工具，提供了稳定和高效的数据同步功能，旨在实现各种异构数据源之间的高效数据同步。

DataX 将不同数据源的同步分为两个主要组件：**Reader（读取数据源）
**和 **Writer（写入目标数据源）**。DataX 框架理论上支持任何数据源类型的数据同步工作。

MatrixOne 与 MySQL 8.0 高度兼容，但由于 DataX 自带的 MySQL Writer 插件适配的是 MySQL 5.1 的 JDBC 驱动，为了提升兼容性，社区单独改造了基于 MySQL 8.0 驱动的 MatrixOneWriter 插件。MatrixOneWriter 插件实现了将数据写入 MatrixOne 数据库目标表的功能。在底层实现中，MatrixOneWriter 通过 JDBC 连接到远程 MatrixOne 数据库，并执行相应的 `insert into ...` SQL 语句将数据写入 MatrixOne，同时支持批量提交。

MatrixOneWriter 利用 DataX 框架从 Reader 获取生成的协议数据，并根据您配置的 `writeMode` 生成相应的 `insert into...` 语句。在遇到主键或唯一性索引冲突时，会排除冲突的行并继续写入。出于性能优化的考虑，我们采用了 `PreparedStatement + Batch` 的方式，并设置了 `rewriteBatchedStatements=true` 选项，以将数据缓冲到线程上下文的缓冲区中。只有当缓冲区的数据量达到预定的阈值时，才会触发写入请求。

![DataX](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/datax.png)

!!! note
    执行整个任务至少需要拥有 `insert into ...` 的权限，是否需要其他权限取决于你在任务配置中的 `preSql` 和 `postSql`。

MatrixOneWriter 主要面向 ETL 开发工程师，他们使用 MatrixOneWriter 将数据从数据仓库导入到 MatrixOne。同时，MatrixOneWriter 也可以作为数据迁移工具为 DBA 等用户提供服务。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。
- [安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。

## 操作步骤

### 创建 MatrixOne 测试表

使用 Mysql Client 连接 MatrixOne，在 MatrixOne 中创建一个测试表：

```sql
CREATE DATABASE mo_demo;
USE mo_demo;
CREATE TABLE m_user(
    M_ID INT NOT NULL,
    M_NAME CHAR(25) NOT NULL
);
```

### 配置数据源

本例中，我们使用**内存**中生成的数据作为数据源：

```json
"reader": {
   "name": "streamreader",  
   "parameter": {
       "column" : [ #可以写多个列
           {
               "value": 20210106,   #表示该列的值
               "type": "long"       #表示该列的类型
           },
           {
               "value": "matrixone",
               "type": "string"
           }
       ],
       "sliceRecordCount": 1000     #表示要打印多少次
   }
}
```

### 编写作业配置文件

使用以下命令查看配置模板：

```
python datax.py -r {YOUR_READER} -w matrixonewriter
```

编写作业的配置文件 `stream2matrixone.json`：

```json
{
    "job": {
        "setting": {
            "speed": {
                "channel": 1
            }
        },
        "content": [
            {
                 "reader": {
                    "name": "streamreader",
                    "parameter": {
                        "column" : [
                            {
                                "value": 20210106,
                                "type": "long"
                            },
                            {
                                "value": "matrixone",
                                "type": "string"
                            }
                        ],
                        "sliceRecordCount": 1000
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "writeMode": "insert",
                        "username": "root",
                        "password": "111",
                        "column": [
                            "M_ID",
                            "M_NAME"
                        ],
                        "preSql": [
                            "delete from m_user"
                        ],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://127.0.0.1:6001/mo_demo",
                                "table": [
                                    "m_user"
                                ]
                            }
                        ]
                    }
                }
            }
        ]
    }
}
```

### 启动 DataX

执行以下命令启动 DataX：

```shell
$ cd {YOUR_DATAX_DIR_BIN}
$ python datax.py stream2matrixone.json
```

### 查看运行结果

使用 Mysql Client 连接 MatrixOne，使用 `select` 查询插入的结果。内存中的 1000 条数据已成功写入 MatrixOne。

```sql
mysql> select * from m_user limit 5;
+----------+-----------+
| m_id     | m_name    |
+----------+-----------+
| 20210106 | matrixone |
| 20210106 | matrixone |
| 20210106 | matrixone |
| 20210106 | matrixone |
| 20210106 | matrixone |
+----------+-----------+
5 rows in set (0.01 sec)

mysql> select count(*) from m_user limit 5;
+----------+
| count(*) |
+----------+
|     1000 |
+----------+
1 row in set (0.00 sec)
```

## 参数说明

以下是 MatrixOneWriter 的一些常用参数说明：

|参数名称|参数描述|是否必选|默认值|
|---|---|---|---|
|**jdbcUrl** |目标数据库的 JDBC 连接信息。DataX 在运行时会在提供的 `jdbcUrl` 后面追加一些属性，例如：`yearIsDateType=false&zeroDateTimeBehavior=CONVERT_TO_NULL&rewriteBatchedStatements=true&tinyInt1isBit=false&serverTimezone=Asia/Shanghai`。 |是 |无 |
|**username** | 目标数据库的用户名。|是 |无 |
|**password** |目标数据库的密码。 |是 |无 |
|**table** |目标表的名称。支持写入一个或多个表，如果配置多张表，必须确保它们的结构保持一致。 |是 |无 |
|**column** | 目标表中需要写入数据的字段，字段之间用英文逗号分隔。例如：`"column": ["id","name","age"]`。如果要写入所有列，可以使用 `*` 表示，例如：`"column": ["*"]`。|是 |无 |
|**preSql** |写入数据到目标表之前，会执行这里配置的标准 SQL 语句。 |否 |无 |
|**postSql** |写入数据到目标表之后，会执行这里配置的标准 SQL 语句。 |否 |无 |
|**writeMode** |控制写入数据到目标表时使用的 SQL 语句，可以选择 `insert` 或 `update`。 | `insert` 或 `update`| `insert`|
|**batchSize** |一次性批量提交的记录数大小，可以显著减少 DataX 与 MatrixOne 的网络交互次数，提高整体吞吐量。但是设置过大可能导致 DataX 运行进程内存溢出 | 否 | 1024 |

## 类型转换

MatrixOneWriter 支持大多数 MatrixOne 数据类型，但也有少数类型尚未支持，需要特别注意你的数据类型。

以下是 MatrixOneWriter 针对 MatrixOne 数据类型的转换列表：

| DataX 内部类型 | MatrixOne 数据类型 |
| --------------- | ------------------ |
| Long            | int, tinyint, smallint, bigint |
| Double          | float, double, decimal |
| String          | varchar, char, text |
| Date            | date, datetime, timestamp, time |
| Boolean         | bool |
| Bytes           | blob |

## 参考其他说明

- MatrixOne 兼容 MySQL 协议，MatrixOneWriter 实际上是对 MySQL Writer 进行了一些 JDBC 驱动版本上的调整后的改造版本，你仍然可以使用 MySQL Writer 来写入 MatrixOne。

- 在 DataX 中添加 MatrixOne Writer，那么你需要下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，然后将其解压缩到 DataX 项目根目录的 `plugin/writer/` 目录下，即可开始使用。

## 常见问题

**Q: 在运行时，我遇到了 “配置信息错误，您提供的配置文件/{YOUR_MATRIXONE_WRITER_PATH}/plugin.json 不存在” 的问题该怎么处理？**

A: DataX 在启动时会尝试查找相似的文件夹以寻找 plugin.json 文件。如果 matrixonewriter.zip 文件也存在于相同的目录下，DataX 将尝试从 `.../datax/plugin/writer/matrixonewriter.zip/plugin.json` 中查找。在 MacOS 环境下，DataX 还会尝试从 `.../datax/plugin/writer/.DS_Store/plugin.json` 中查找。此时，您需要删除这些多余的文件或文件夹。
