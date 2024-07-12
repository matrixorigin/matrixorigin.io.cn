# 使用 DataX 将 ElasticSearch 数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 ElasticSearch 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载并安装 [ElasticSearch](https://www.elastic.co/cn/downloads/elasticsearch)。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 下载 [elasticsearchreader.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/datax_es_mo/elasticsearchreader.zip)，解压至 datax/plugin/reader 目录下。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 步骤

### 导入数据到 ElasticSearch

#### 创建索引

创建名称为 person 的索引（下文 -u 参数后为 ElasticSearch 中的用户名和密码，本地测试时可按需进行修改或删除）：

```bash
curl -X PUT "<http://127.0.0.1:9200/person>" -u elastic:elastic
```

输出如下信息表示创建成功：

```bash
{"acknowledged":true,"shards_acknowledged":true,"index":"person"}
```

#### 给索引 person 添加字段

```bash
curl -X PUT "127.0.0.1:9200/person/_mapping" -H 'Content-Type: application/json' -u elastic:elastic -d'{  "properties": {    "id": { "type": "integer" },    "name": { "type": "text" },    "birthday": {"type": "date"}  }}'
```

输出如下信息表示设置成功：

```bash
{"acknowledged":true}
```

#### 为 ElasticSearch 索引添加数据

通过 curl 命令添加三条数据：

```bash
curl -X POST '127.0.0.1:9200/person/_bulk' -H 'Content-Type: application/json' -u elastic:elastic -d '{"index":{"_index":"person","_type":"_doc","_id":1}}{"id": 1,"name": "MatrixOne","birthday": "1992-08-08"}{"index":{"_index":"person","_type":"_doc","_id":2}}{"id": 2,"name": "MO","birthday": "1993-08-08"}{"index":{"_index":"person","_type":"_doc","_id":3}}{"id": 3,"name": "墨墨","birthday": "1994-08-08"}
```

输出如下信息表示执行成功：

```bash
{"took":5,"errors":false,"items":[{"index":{"_index":"person","_type":"_doc","_id":"1","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":0,"_primary_term":1,"status":201}},{"index":{"_index":"person","_type":"_doc","_id":"2","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":1,"_primary_term":1,"status":201}},{"index":{"_index":"person","_type":"_doc","_id":"3","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":2,"_primary_term":1,"status":201}}]}
```

### 在 MatrixOne 中建表

```sql
create database mo;
CREATE TABLE mo.`person` (
`id` INT DEFAULT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`birthday` DATE DEFAULT NULL
);
```

### 编写迁移文件

进入到 datax/job 路径，编写作业文件 `es2mo.json`：

```json
{
    "job":{
        "setting":{
            "speed":{
                "channel":1
            },
            "errorLimit":{
                "record":0,
                "percentage":0.02
            }
        },
        "content":[
            {
                "reader":{
                    "name":"elasticsearchreader",
                    "parameter":{
                        "endpoint":"http://127.0.0.1:9200",
                        "accessId":"elastic",
                        "accessKey":"elastic",
                        "index":"person",
                        "type":"_doc",
                        "headers":{

                        },
                        "scroll":"3m",
                        "search":[
                            {
                                "query":{
                                    "match_all":{

                                    }
                                }
                            }
                        ],
                        "table":{
                            "filter":"",
                            "nameCase":"UPPERCASE",
                            "column":[
                                {
                                    "name":"id",
                                    "type":"integer"
                                },
                                {
                                    "name":"name",
                                    "type":"text"
                                },
                                {
                                    "name":"birthday",
                                    "type":"date"
                                }
                            ]
                        }
                    }
                },
                "writer":{
                    "name":"matrixonewriter",
                    "parameter":{
                        "username":"root",
                        "password":"111",
                        "column":[
                            "id",
                            "name",
                            "birthday"
                        ],
                        "connection":[
                            {
                                "table":[
                                    "person"
                                ],
                                "jdbcUrl":"jdbc:mysql://127.0.0.1:6001/mo"
                            }
                        ]
                    }
                }
            }
        ]
    }
}
```

### 执行迁移任务

进入 datax 安装目录，执行以下命令启动迁移作业：

```bash
cd datax
python bin/datax.py job/es2mo.json
```

作业执行完成后，输出结果如下：

```bash
2023-11-28 15:55:45.642 [job-0] INFO  StandAloneJobContainerCommunicator - Total 3 records, 67 bytes | Speed 6B/s, 0 records/s | Error 0 records, 0 bytes |  All Task WaitWriterTime 0.000s |  All Task WaitReaderTime 0.456s | Percentage 100.00%2023-11-28 15:55:45.644 [job-0] INFO  JobContainer - 
任务启动时刻                    : 2023-11-28 15:55:31
任务结束时刻                    : 2023-11-28 15:55:45
任务总计耗时                    :                 14s
任务平均流量                    :                6B/s
记录写入速度                    :              0rec/s
读出记录总数                    :                   3
读写失败总数                    :                   0
```

### 在 MatrixOne 中查看迁移后数据

在 MatrixOne 数据库中查看目标表中的结果，确认迁移已完成：

```sql
mysql> select * from mo.person;
+------+-----------+------------+
| id   | name      | birthday   |
+------+-----------+------------+
|    1 | MatrixOne | 1992-08-08 |
|    2 | MO        | 1993-08-08 |
|    3 | 墨墨      | 1994-08-08 |
+------+-----------+------------+
3 rows in set (0.00 sec)
```