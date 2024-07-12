# 使用 DataX 将 ClickHouse 数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 ClickHouse 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 已完成 [ClickHouse](https://packages.clickhouse.com/tgz/stable/) 安装部署
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 步骤

### 登录 clickhouse 数据库创建测试数据

```sql
create database source_ck_database;
use source_ck_database; 

create table if not exists student(
`id` Int64 COMMENT '学生 id', 
`name` String COMMENT '学生姓名',
`birthday` String COMMENT '学生出生日期',
`class` Int64 COMMENT '学生班级编号',
`grade` Int64 COMMENT '学生年级编号',
`score` decimal(18,0) COMMENT '学生成绩'
) engine = MergeTree 
order by id;
```

### 使用 datax 导入数据

#### 使用 clickhousereader

注：Datax 不能同步表结构，所以需提前在 MatrixOne 中创建表
MatrixOne 建表语句：

```sql
CREATE TABLE  datax_db.`datax_ckreader_ck_student` (
  `id` bigint(20) NULL COMMENT "",
  `name` varchar(100) NULL COMMENT "",
  `birthday` varchar(100) NULL COMMENT "",
  `class` bigint(20) NULL COMMENT "",
  `grade` bigint(20) NULL COMMENT "",
  `score` decimal(18, 0) NULL COMMENT ""
); 

CREATE TABLE  datax_db.`datax_rdbmsreader_ck_student` (
  `id` bigint(20) NULL COMMENT "",
  `name` varchar(100) NULL COMMENT "",
  `birthday` varchar(100) NULL COMMENT "",
  `class` bigint(20) NULL COMMENT "",
  `grade` bigint(20) NULL COMMENT "",
  `score` decimal(18, 0) NULL COMMENT ""
); 
```

将 clikchousereader 上传至$DATAX_HOME/plugin/reader 目录下
解压安装包：

```bash
[root@root ~]$ unzip clickhousereader.zip
```

移动压缩包至/opt/目录下：

```bash
[root@root ~] mv clickhousereader.zip /opt/
```

编写任务 json 文件

```bash
[root@root ~] vim $DATAX_HOME/job/ck2sr.json
```

```json
{
  "job": {
    "setting": {
      "speed": {
"channel": "1"
      }
    },
    "content": [
      {
        "reader": {
          "name": "clickhousereader",
          "parameter": {
            "username": "default",
            "password": "123456",
            "column": [
              "*"
            ],
            "splitPK": "id",
            "connection": [
              {
                "table": [
                  "student"
                ],
                "jdbcUrl": [
                  "jdbc:clickhouse://xx.xx.xx.xx:8123/source_ck_database"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "column": [
              "*"
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/datax_db",
                "table": [
                  "datax_ckreader_ck_student"
                ]
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

执行导入任务

```bash
[root@root ~] cd $DATAX_HOME/bin 
[root@root ~] ./python datax.py ../jobs/ck2sr.json
```

#### 使用 Rdbmsreader 导入

上传 ClickHouse JDBC 驱动到$DATAX_HOME/plugin/reader/rdbmsreader/libs/目录下

修改配置文件

```bash
[root@root ~] vim $DATAX_HOME/plugin/reader/rdbmsreader/plugin.json
```

```json
{
    "name": "rdbmsreader",
    "class": "com.alibaba.datax.plugin.reader.rdbmsreader.RdbmsReader",
    "description": "useScene: prod. mechanism: Jdbc connection using the database, execute select sql, retrieve data from the ResultSet. warn: The more you know about the database, the less problems you encounter.",
    "developer": "alibaba",
    "drivers":["dm.jdbc.driver.DmDriver", "com.sybase.jdbc3.jdbc.SybDriver", "com.edb.Driver", "org.apache.hive.jdbc.HiveDriver","com.clickhouse.jdbc.ClickHouseDriver"]
}
```

编写 json 任务文件

```bash
[root@root ~]  vim $DATAX_HOME/job/ckrdbms2sr.json
```

```json
{
  "job": {
    "setting": {
      "speed": {
        "byte": 1048576
      }
    },
    "content": [
      {
        "reader": {
          "name": "rdbmsreader",
          "parameter": {
            "username": "default",
            "password": "123456",
            "column": [
              "*"
            ],
            "splitPK": "id",
            "connection": [
              {
                "table": [
                  "student"
                ],
                "jdbcUrl": [
                  "jdbc:clickhouse://xx.xx.xx.xx:8123/source_ck_database"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "column": [
              "*"
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/datax_db",
                "table": [
                  "datax_rdbmsreader_ck_student"
                ]
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

执行导入任务

```bash
[root@root ~] cd $DATAX_HOME/bin 
[root@root ~] ./python datax.py ../jobs/ckrdbms2sr.json
```