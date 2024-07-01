# 使用 DataX 将 InfluxDB 数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 InfluxDB 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载并安装 [InfluxDB](https://www.influxdata.com/products/influxdb/)。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 下载 [influxdbreader](https://github.com/wowiscrazy/InfluxDBReader-DataX) 至 datax/plugin/reader 路径下。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 步骤

### 在 influxdb 中创建测试数据

使用默认账号登录

```bash
influx -host 'localhost' -port '8086'
```

```sql
--创建并使用数据库
create database testDb;
use testDb;
--插入数据
insert air_condition_outdoor,home_id=0000000000000,sensor_id=0000000000034 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000001,sensor_id=0000000000093 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000197 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000198 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000199 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000200 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000201 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000202 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000203 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
insert air_condition_outdoor,home_id=0000000000003,sensor_id=0000000000204 temperature=0.0000000000000000,humidity=80.0000000000000000,battery_voltage=3.2000000000000002 1514764800000000000
```

### 创建测试用账号

```sql
create user "test" with password '123456' with all privileges;
grant all privileges on testDb to test;
show grants for test;
```

### 开启数据库认证

```bash
vim /etc/influxdb/influxdb.conf
```

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/datax/datax-influxdb-01.jpg width=50% heigth=50%/>
</div>

### 重启 influxdb

```bash
systemctl restart influxdb
```

### 测试认证登录

```bash
influx -host 'localhost' -port '8086' -username 'test' -password '123456'
```

### 在 MatrixOne 中创建目标表

```sql
mysql> create database test;
mysql> use test;
mysql> create  table air_condition_outdoor(
time  datetime,
battery_voltage float,
home_id  char(15),
humidity int,
sensor_id   char(15),
temperature  int
);
```

### 编辑 datax 的 json 模板文件

进入到 datax/job 路径，在 influxdb2mo.json 填以下内容

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
                    "name": "influxdbreader",
                    "parameter": {
                        "dbType": "InfluxDB",
                        "address": "http://xx.xx.xx.xx:8086",
                        "username": "test",
                        "password": "123456",
                        "database": "testDb",
                        "querySql": "select * from air_condition_outdoor limit 20",
                    }
                },
                "writer": {
                    "name": "matrixonewriter",
                    "parameter": {
                        "username": "root",
                        "password": "111",
                        "writeMode": "insert",
                        "connection": [
                            {
                                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                                "table": ["air_condition_outdoor"]
                            }
                        ],
                        "column": ["*"],
                    }
                }
            }
        ]
    }
}
```

### 启动 datax 作业

看到类似如下结果，说明导入成功

```bash
#python bin/datax.py job/influxdb2mo.json
2024-04-28 13:51:19.665 [job-0] INFO  JobContainer -
任务启动时刻                    : 2024-04-28 13:51:08
任务结束时刻                    : 2024-04-28 13:51:19
任务总计耗时                    :                 10s
任务平均流量                    :                2B/s
记录写入速度                    :               0rec/s
读出记录总数                    :                  20
读写失败总数                    :                   0
```