# 使用 DataX 将 Doris 数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 Doris 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载并安装 [Doris](https://doris.apache.org/zh-CN/docs/dev/get-starting/quick-start/)。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 步骤

### 在 Doris 中创建测试数据

```sql
create database test;

use test;

CREATE TABLE IF NOT EXISTS example_tbl
(
    user_id BIGINT NOT NULL COMMENT "用户id",
    date DATE NOT NULL COMMENT "数据灌入日期时间",
    city VARCHAR(20) COMMENT "用户所在城市",
    age SMALLINT COMMENT "用户年龄",
    sex TINYINT COMMENT "用户性别"
)
DUPLICATE KEY(user_id, date)
DISTRIBUTED BY HASH(user_id) BUCKETS 1
PROPERTIES (
    "replication_num"="1"
);

insert into example_tbl values
(10000,'2017-10-01','北京',20,0),
(10000,'2017-10-01','北京',20,0),
(10001,'2017-10-01','北京',30,1),
(10002,'2017-10-02','上海',20,1),
(10003,'2017-10-02','广州',32,0),
(10004,'2017-10-01','深圳',35,0),
(10004,'2017-10-03','深圳',35,0);

```

### 在 MatrixOne 中创建目标库表

```sql
create database sparkdemo;
use sparkdemo;

CREATE TABLE IF NOT EXISTS example_tbl
(
    user_id BIGINT NOT NULL COMMENT "用户id",
    date DATE NOT NULL COMMENT "数据灌入日期时间",
    city VARCHAR(20) COMMENT "用户所在城市",
    age SMALLINT COMMENT "用户年龄",
    sex TINYINT COMMENT "用户性别"
);
```

### 编辑 datax 的 json 模板文件

进入到 datax/job 路径，在 doris2mo.json 填以下内容

```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 8
      }
    },
    "content": [
      {
        "reader": {
          "name": "mysqlreader",
          "parameter": {
            "username": "root",
            "password": "root",
            "splitPk": "user_id",
            "column": [
              '*'
            ],
            "connection": [
              {
                "table": [
                  "example_tbl"
                ],
                "jdbcUrl": [
                  "jdbc:mysql://xx.xx.xx.xx:9030/test"
                ]
              }
            ],
            "fetchSize": 1024
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "writeMode": "insert",
            "username": "root",
            "password": "111",
            "column": [
              '*'
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/sparkdemo",
                "table": [
                  "example_tbl"
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

### 启动 datax 作业

```bash
python bin/datax.py job/doris2mo.json
```

显示以下结果：

```bash
2024-04-28 15:47:38.222 [job-0] INFO  JobContainer -
任务启动时刻                    : 2024-04-28 15:47:26
任务结束时刻                    : 2024-04-28 15:47:38
任务总计耗时                    :                 11s
任务平均流量                    :               12B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   7
读写失败总数                    :                   0
```