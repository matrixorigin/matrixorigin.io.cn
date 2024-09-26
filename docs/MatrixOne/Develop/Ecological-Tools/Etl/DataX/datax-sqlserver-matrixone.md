# 使用 DataX 将数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 SQL Server 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 完成[单机部署 MatrixOne](../../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 已完成 [SQL Server 2022](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 操作步骤

### 创建 sql server 测试数据

```sql
CREATE TABLE test.dbo.test2 (
	id int NULL,
	age int NULL,
	name varchar(50) null
);

INSERT INTO test.dbo.test2
(id, age, name)
VALUES(1, 1, N'shdfhg '),
(4, 4, N' dhdhdf '),
(2, 2, N' ndgnh '),
(3, 3, N' dgh '),
(5, 5, N' dfghnd '),
(6, 6, N' dete ');
```

### 在 MatrixOne 中创建目标表

由于 DataX 只能同步数据，不能同步表结构，所以在执行任务前，我们需要先在目标数据库（MatrixOne）中手动创建好表。

```sql
CREATE TABLE test.test_2 (
	id int not NULL,
	age int NULL,
	name varchar(50) null
);
```

### 创建作业配置文件

DataX 中的任务配置文件是 json 格式，可以通过下面的命令查看内置的任务配置模板：

```bash
python datax.py -r sqlserverreader -w matrixonewriter
```

进入到 datax/job 路径，根据模板，编写作业文件 `sqlserver2mo.json`：

```json
{
    "job": {
        "content": [
            {
                "reader": {
                    "name": "sqlserverreader",
                    "parameter": {
                        "column": ["id","age","name"],
                        "connection": [
                            {
                                "jdbcUrl": ["jdbc:sqlserver://xx.xx.xx.xx:1433;databaseName=test"],
                                "table": ["dbo.test2"]
                            }
                        ],
                        "password": "123456",
                        "username": "sa"
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "column": ["id","age","name"],
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx:6001/test",
                                "table": ["test_2"]
                            }
                        ],
                        "password": "111",
                        "username": "root",
                        "writeMode": "insert"
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
python  datax.py  sqlserver2mo.json
```

### 查看 mo 表中数据

```sql
select * from test_2;
```

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/datax/datax-sqlserver-02.jpg width=50% heigth=50%/>
</div>