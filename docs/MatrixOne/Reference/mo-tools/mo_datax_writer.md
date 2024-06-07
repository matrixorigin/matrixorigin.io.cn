# mo_datax_writer 工具指南

`mo_datax_writer` 是一款帮助你实现将数据从 mysql 到 matrixone 迁移的工具。

!!! Note 注意
    `mo_datax_writer` 工具目前只支持在 Linux 系统 x86 架构部署。

## 前置依赖

- 已完成[安装和启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)
- 下载 [DataX 工具](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202309/datax.tar.gz)
- 下载并安装 [MySQL](<https://www.mysql.com/downloads/>)
- 已完成安装 [Python 3.8(or plus)](https://www.python.org/downloads/)
- 已安装 wget
- 设置环境编码为 UTF-8  

## 安装 mo_datax_writer

```bash
wget https://github.com/matrixorigin/mo_datax_writer/archive/refs/tags/v1.0.1.zip
unzip v1.0.1.zip 
cd mo_datax_writer-1.0.1/ 
#将mo_datax_writer解压到datax/plugin/writer/目录下
unzip matrixonewriter.zip -d ../datax/plugin/writer/
```

## 初始化 MatrixOne 数据表

### 创建数据库

```sql
create database test;
```

### 创建表

```sql
use test;

CREATE TABLE `user` (
`name` VARCHAR(255) DEFAULT null,
`age` INT DEFAULT null,
`city` VARCHAR(255) DEFAULT null
);
```

## 初始化 MySQL 数据表

### 创建数据库

```SQL
create database test;
```

### 创建表

```sql
use test;

CREATE TABLE `user` (
  `name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

### 导入数据

```sql
insert into user values('zhangsan',26,'Shanghai'),('lisi',24,'Chengdu'),('wangwu',28,'Xian'),('zhaoliu',22,'Beijing'),('tianqi',26,'Shenzhen');

mysql> select * from user;
+----------+------+----------+
| name     | age  | city     |
+----------+------+----------+
| zhangsan |   26 | Shanghai |
| lisi     |   24 | Chengdu  |
| wangwu   |   28 | Xian     |
| zhaoliu  |   22 | Beijing  |
| tianqi   |   26 | Shenzhen |
+----------+------+----------+
5 rows in set (0.00 sec)
```

## 使用 DataX 导入数据

### 编写配置文件

在 datax/job 目录下添加 datax 配置文件 **mysql2mo.json**，内容如下：

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
					    // MySQL 数据库用户名
                        "username": "root",
						// MySQL 数据库密码
                        "password": "111",
						// MySQL 数据表读取的列名
                        "column": ["name","age","city"],
                        "splitPk": "",
                        "connection": [
                            {
							    // MySQL 数据表
                                "table": ["user"],
								// MySQL 连接信息
                                "jdbcUrl": [
                                    "jdbc:mysql://127.0.0.1:3306/test?useSSL=false"
                                ]
                            }
                        ]
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
					    // 数据库用户名
                        "username": "root",
						// 数据库密码
                        "password": "111",
						// 需要导入的表列名
                        "column": ["name","age","city"],
						// 导入任务开始前需要执行的 SQL 语句
                        "preSql": [],
						// 导入任务完成之后要执行的 SQL 语句
                        "postSql": [],
						// 批量写入条数，即读取多少条数据后执行 load data inline 导入任务
                        "maxBatchRows": 60000,
						// 批量写入大小，即读取多大的数据后执行 load data inline 导入任务
                        "maxBatchSize": 5242880,
						// 导入任务执行时间间隔，即经过多长时间后执行 load data inline 导入任务
                        "flushInterval": 300000,
                        "connection": [
                            {
							    // 数据库连接信息
                                "jdbcUrl": "jdbc:mysql://127.0.0.1:6001/test?useUnicode=true&useSSL=false",
								// 数据库名
                                "database": "test",
								// 数据库表
                                "table": ["user"]
                            }
                        ]
                    }
                }
            }
        ]
    }
}
```

### 执行 DataX 任务

进入 datax 安装目录，执行以下命令

```shell
python bin/datax.py job/mysql2mo.json
```

执行完成后，输出结果如下：

```shell
2024-06-06 06:26:52.145 [job-0] INFO  StandAloneJobContainerCommunicator - Total 5 records, 75 bytes | Speed 7B/s, 0 records/s | Error 0 records, 0 bytes |  All Task WaitWriterTime 0.000s |  All Task WaitReaderTime 0.012s | Percentage 100.00%
2024-06-06 06:26:52.147 [job-0] INFO  JobContainer - 
任务启动时刻                    : 2024-06-06 14:26:41
任务结束时刻                    : 2024-06-06 14:26:52
任务总计耗时                    :                 10s
任务平均流量                    :                7B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   5
读写失败总数                    :                   0
```

### 查看结果

在 MatrixOne 数据库中查看结果，可以看到数据已经从 MySQL 同步到 MatrixOne 中

```sql
mysql> select * from user;
+----------+------+-----------+
| name     | age  | city      |
+----------+------+-----------+
| zhangsan |   26 | Shanghai  |
| lisi     |   24 | Chengdu   |
| wangwu   |   28 | Xian      |
| zhaoliu  |   22 | Beijing   |
| tianqi   |   26 | Shenzhen  |
+----------+------+-----------+
5 rows in set (0.01 sec)
```
