# 使用 DataX 将 MongoDB 数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 MongoDB 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载并安装 [MongoDB](https://www.mongodb.com/)。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 步骤

### 创建 MongoDB 测试数据

创建数据库 test，如果 test 不存在，则创建 test

```sql
>create database test;
>use test
#查看当前数据库
>db
test
#创建集合db.createCollection(“集合名”)
>db. createCollection(‘test’)
#插入文档数据db.集合名.insert(文档内容)
>db.test. insert({"name" : " aaa ", "age" : 20})
>db.test. insert({"name" : " bbb ", "age" : 18})
>db.test. insert({"name" : " ccc ", "age" : 28})
#查看数据
>db.test.find()
{ "_id" : ObjectId("6347e3c6229d6017c82bf03d"), "name" : "aaa", "age" : 20 }
{ "_id" : ObjectId("6347e64a229d6017c82bf03e"), "name" : "bbb", "age" : 18 }
{ "_id" : ObjectId("6347e652229d6017c82bf03f"), "name" : "ccc", "age" : 28 }
```

### 在 MatrixOne 中创建目标表

```sql
mysql> create database test;
mysql> use test;
mysql> CREATE TABLE `mongodbtest` (
  `name` varchar(30) NOT NULL COMMENT "",
  `age` int(11) NOT NULL COMMENT ""
);
```

### 编辑 datax 的 json 模板文件

进入到 datax/job 路径，新建文件 `mongo2matrixone.json` 并填以下内容：

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
          "name": "mongodbreader",
          "parameter": {
            "address": [
              "xx.xx.xx.xx:27017"
            ],
            "userName": "root",
            "userPassword": "",
            "dbName": "test",
            "collectionName": "test",
            "column": [
              {
                "name": "name",
                "type": "string"
              },
              {
                "name": "age",
                "type": "int"
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "username": "root",
            "password": "111",
            "column": ["*"],
            "connection": [
              {
                "table": ["mongodbtest"],
                "jdbcUrl": "jdbc:mysql://127.0.0.1:6001/test"
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
python bin/datax.py job/mongo2matrixone.json
2024-04-28 13:51:19.665 [job-0] INFO  JobContainer -
任务启动时刻                    : 2024-04-28 13:51:08
任务结束时刻                    : 2024-04-28 13:51:19
任务总计耗时                    :                 10s
任务平均流量                    :                2B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   3
读写失败总数                    :                   0
```