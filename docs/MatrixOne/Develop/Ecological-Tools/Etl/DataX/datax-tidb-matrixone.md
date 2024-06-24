# 使用 DataX 将数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 TiDB 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 完成[单机部署 MatrixOne](https://docs.matrixorigin.cn/1.2.0/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 已完成 TiDB 单机部署。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 操作步骤

### 在 TiDB 中创建测试数据

```sql
CREATE TABLE `tidb_dx` (
    `id` bigint(20) NOT NULL,
    `name` varchar(100) DEFAULT NULL,
    `salary` decimal(10,0) DEFAULT NULL,
    `age` int(11) DEFAULT NULL,
    `entrytime` date DEFAULT NULL,
    `gender` char(1) DEFAULT NULL,
    PRIMARY KEY (`id`)
);

insert into testdx2tidb values
(1,"lisa",15660,30,'2022-10-12',0),
(2,"tom",15060,24,'2021-11-10',1),
(3,"jenny",15000,28,'2024-02-19',0),
(4,"henry",12660,24,'2022-04-22',1);
```

### 在 MatrixOne 中创建目标表

由于 DataX 只能同步数据，不能同步表结构，所以在执行任务前，我们需要先在目标数据库（MatrixOne）中手动创建好表。

```sql
CREATE TABLE `testdx2tidb` (
    `id` bigint(20) NOT NULL COMMENT "",
    `name` varchar(100) NULL COMMENT "",
    `salary` decimal(10, 0) NULL COMMENT "",
    `age` int(11) NULL COMMENT "",
    `entrytime` date NULL COMMENT "",
    `gender` varchar(1) NULL COMMENT "",
    PRIMARY KEY (`id`)
);
```

### 配置 json 文件

tidb 可以直接使用 mysqlreader 读取。在 datax 的 job 目录下。编辑配置文件 `tidb2mo.json`：

```json
{
   "job": {
        "setting": {
            "speed": {
                 "channel": 1
            },
            "errorLimit": {
                "record": 0,
                "percentage": 0
            }
        },
        "content": [
            {
                "reader": {
                    "name": "mysqlreader",
                    "parameter": {
                        "username": "root",
                        "password": "root",
                        "column": [ "*" ],
                        "splitPk": "id",
                        "connection": [
                            {
                                "table": [ "tidb_dx" ],
                                "jdbcUrl": [
                                   "jdbc:mysql://xx.xx.xx.xx:4000/test"
                                ]
                            }
                        ]
                    }
                },
                "writer": {
                     "name": "matrixonewriter",
                    "parameter": {
                        "column": ["*"],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                                "table": ["testdx2tidb"]
                            }
                        ],
                        "password": "111",
                        "username": "root",
                        "writeMode": "insert"
                    }
                }
            }
        ]
    }
}
```

### 执行任务

```bash
python bin/datax.py job/tidb2mo.json
```

### 在 MatrixOne 中查看目标表数据

```sql
mysql> select * from testdx2tidb;
+------+-------+--------+------+------------+--------+
| id   | name  | salary | age  | entrytime  | gender |
+------+-------+--------+------+------------+--------+
|    1 | lisa  |  15660 |   30 | 2022-10-12 | 0      |
|    2 | tom   |  15060 |   24 | 2021-11-10 | 1      |
|    3 | jenny |  15000 |   28 | 2024-02-19 | 0      |
|    4 | henry |  12660 |   24 | 2022-04-22 | 1      |
+------+-------+--------+------+------------+--------+
4 rows in set (0.01 sec)
```

数据导入成功。