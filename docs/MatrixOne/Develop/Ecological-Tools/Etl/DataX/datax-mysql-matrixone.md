# 使用 DataX 将 MySQL 数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 MySQL 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 完成[单机部署 MatrixOne](../../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 下载并安装 [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)。

## 步骤

### 在 mysql 中创建表并插入数据

```sql
CREATE TABLE `mysql_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
     `salary` decimal(10,0) DEFAULT NULL,
     `age` int(11) DEFAULT NULL,
     `entrytime` date DEFAULT NULL,
     `gender` char(1) DEFAULT NULL,
      PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--插入示例数据
insert into mysql_datax valus
(1,"lisa",15660,30,'2022-10-12',0),
(2,"tom",15060,24,'2021-11-10',1),
(3,"jenny",15000,28,'2024-02-19',0),
(4,"henry",12660,24,'2022-04-22',1);
```

### 在 Matrixone 创建目标库表

由于 DataX 只能同步数据，不能同步表结构，所以在执行任务前，我们需要先在目标数据库（Matrixone）中手动创建好表。

```sql
CREATE TABLE `mysql_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
     `salary` decimal(10,0) DEFAULT NULL,
     `age` int(11) DEFAULT NULL,
     `entrytime` date DEFAULT NULL,
     `gender` char(1) DEFAULT NULL,
      PRIMARY KEY (`id`)
);
```

### 创建作业配置文件

DataX 中的任务配置文件是 json 格式，可以通过下面的命令查看内置的任务配置模板：

```bash
python datax.py -r mysqlreader -w matrixonewriter
```

进入到 datax/job 路径，根据模板，编写作业文件 `mysql2mo.json`：

```json
{
    "job": {
        "content": [
            {
                "reader": {
                    "name": "mysqlreader",
                    "parameter": {
                        "column": ["*"],
                        "connection": [
                            {
                                "jdbcUrl": ["jdbc:mysql://xx.xx.xx.xx:3306/test"],
                                "table": ["mysql_datax"]
                            }
                        ],
                        "password": "root",
                        "username": "root",
                        "where": ""
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "column": ["*"],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                                "table": ["mysql_datax"]
                            }
                        ],
                        "password": "111",
                        "preSql": [],
                        "session": [],
                        "username": "root",
                        "writeMode": "insert"  --目前仅支持replace,update 或 insert 方式
                    }
                }
            }
        ],
        "setting": {
            "speed": {
                "channel": "1"
            }
        }
    }
}
```

### 启动 datax 作业

```bash
python /opt/module/datax/bin/datax.py /opt/module/datax/job/mysql2mo.json
```

### 查看 MatrixOne 表中数据

```sql
mysql> select * from mysql_datax;
+------+-------+--------+------+------------+--------+
| id   | name  | salary | age  | entrytime  | gender |
+------+-------+--------+------+------------+--------+
|    1 | lisa  |  15660 |   30 | 2022-10-12 | 0      |
|    2 | tom   |  15060 |   24 | 2021-11-10 | 1      |
|    3 | jenny |  15000 |   28 | 2024-02-19 | 0      |
|    4 | henry |  12660 |   24 | 2022-04-22 | 1      |
+------+-------+--------+------+------------+--------+
4 rows in set (0.00 sec)
```