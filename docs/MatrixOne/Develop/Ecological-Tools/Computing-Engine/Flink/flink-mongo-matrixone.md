# 使用 Flink 将 MongoDB 数据写入 MatrixOne

本章节将介绍如何使用 Flink 将 MongoDB 数据写入到 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 完成[单机部署 MatrixOne](https://docs.matrixorigin.cn/1.2.0/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 下载安装 [lntelliJ IDEA(2022.2.1 or later version)](https://www.jetbrains.com/idea/download/)。
- 根据你的系统环境选择 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) 版本进行下载安装。
- 下载并安装 [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz)，最低支持版本为 1.11。
- 下载并安装 [MongoDB](https://www.mongodb.com/)。
- 下载并安装 [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)，推荐版本为 8.0.33。

## 操作步骤

### 开启 Mongodb 副本集模式

关闭命令：

```bash
mongod -f /opt/software/mongodb/conf/config.conf --shutdown
```

在 /opt/software/mongodb/conf/config.conf 中增加以下参数

```shell
replication:
replSetName: rs0 #复制集名称
```

重新开启 mangod

```bash
mongod -f /opt/software/mongodb/conf/config.conf
```

然后进入 mongo 执行 `rs.initiate()` 然后执行 `rs.status()`

```shell
> rs.initiate()
{
"info2" : "no configuration specified. Using a default configuration for the set",
"me" : "xx.xx.xx.xx:27017",
"ok" : 1
}
rs0:SECONDARY> rs.status()
```

看到以下相关信息说明复制集启动成功

```bash
"members" : [
{
"_id" : 0,
"name" : "xx.xx.xx.xx:27017",
"health" : 1,
"state" : 1,
"stateStr" : "PRIMARY",
"uptime" : 77,
"optime" : {
"ts" : Timestamp(1665998544, 1),
"t" : NumberLong(1)
},
"optimeDate" : ISODate("2022-10-17T09:22:24Z"),
"syncingTo" : "",
"syncSourceHost" : "",
"syncSourceId" : -1,
"infoMessage" : "could not find member to sync from",
"electionTime" : Timestamp(1665998504, 2),
"electionDate" : ISODate("2022-10-17T09:21:44Z"),
"configVersion" : 1,
"self" : true,
"lastHeartbeatMessage" : ""
}
],
"ok" : 1,

rs0:PRIMARY> show dbs
admin   0.000GB
config  0.000GB
local   0.000GB
test    0.000GB
```

### 在 flinkcdc sql 界面建立 source 表（mongodb）

在 flink 目录下的 lib 目录下执行，下载 mongodb 的 cdcjar 包

```bash
wget <https://repo1.maven.org/maven2/com/ververica/flink-sql-connector-mongodb-cdc/2.2.1/flink-sql-connector-mongodb-cdc-2.2.1.jar>
```

建立数据源 mongodb 的映射表，列名也必须一模一样

```sql
CREATE TABLE products (
  _id STRING,#必须有这一列，也必须为主键，因为mongodb会给每行数据自动生成一个id
  `name` STRING,
  age INT,
  PRIMARY KEY(_id) NOT ENFORCED
) WITH (
  'connector' = 'mongodb-cdc',
  'hosts' = 'xx.xx.xx.xx:27017',
  'username' = 'root',
  'password' = '',
  'database' = 'test',
  'collection' = 'test'
);
```

建立完成后可以执行 `select * from products;` 查下是否连接成功

### 在 flinkcdc sql 界面建立 sink 表（MatrixOne）

建立 matrixone 的映射表，表结构需相同，不需要带 id 列

```sql
CREATE TABLE cdc_matrixone (
   `name` STRING,
   age INT,
   PRIMARY KEY (`name`) NOT ENFORCED
)WITH (
'connector' = 'jdbc',
'url' = 'jdbc:mysql://xx.xx.xx.xx:6001/test',
'driver' = 'com.mysql.cj.jdbc.Driver',
'username' = 'root',
'password' = '111',
'table-name' = 'mongodbtest'   
);
```

### 开启 cdc 同步任务

这里同步任务开启后，mongodb 增删改的操作均可同步

```sql
INSERT INTO cdc_matrixone SELECT `name`,age FROM products;

#增加
rs0:PRIMARY> db.test.insert({"name" : "ddd", "age" : 90})
WriteResult({ "nInserted" : 1 })
rs0:PRIMARY> db.test.find()
{ "_id" : ObjectId("6347e3c6229d6017c82bf03d"), "name" : "aaa", "age" : 20 }
{ "_id" : ObjectId("6347e64a229d6017c82bf03e"), "name" : "bbb", "age" : 18 }
{ "_id" : ObjectId("6347e652229d6017c82bf03f"), "name" : "ccc", "age" : 28 }
{ "_id" : ObjectId("634d248f10e21b45c73b1a36"), "name" : "ddd", "age" : 90 }
#修改
rs0:PRIMARY> db.test.update({'name':'ddd'},{$set:{'age':'99'}})
WriteResult({ "nMatched" : 1, "nUpserted" : 0, "nModified" : 1 })
#删除
rs0:PRIMARY> db.test.remove({'name':'ddd'})
WriteResult({ "nRemoved" : 1 })
```