# mo_ts_perf_test 工具指南

`mo_ts_perf_test` 是一款针对 MatrixOne 进行时序写入和查询测试工具。

!!! Note 注意
    `mo_ts_perf_test` 工具目前只支持在 Linux 系统 x86 架构部署。

## 前置依赖

- 已完成[安装和启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。
- 已安装 wget

## 安装 mo_ts_perf_test

```bash
wget https://github.com/matrixorigin/mo_ts_perf_test/archive/refs/tags/v1.0.1.zip
unzip v1.0.1.zip
```

## 配置

根据实际情况修改 matrixone/conf 目录下的 db.conf 配置文件

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.0/matrixone/conf# cat db.conf 
[dbInfo]
host = 127.0.0.1
port = 6001
user = root
password = 111
tablePrefix = d
point_query_ts_condition = '2017-07-14 10:40:06.379'
loadFilePath = /root/soft/perf/
```

**配置说明：**

- tablePrefix: 为查为多表写入时，表名称的前缀，比如，值为 d，3 个客户端的话，会自动创建 3 个表：d0、d1、d2；
- point_query_ts_condition: 为点查询时 ts 字段的过滤条件值；
- loadFilePath: 为 load data infile 导入时，要导入的本地 csv 文件所在目录；注意：loadFilePath 路径必须是 MO 数据库本地路径，即：csv 文件要放到 MO 数据库所在服务器上。

## 使用 mo-write 执行写入测试

mo-write 为 MO 写入测试工具，命令为：

```bash
mo-write -T -r -n -retry -mode -txc -tType -wType -wType
```

!!! note
    所有写入都是向 test 数据库下的表写，单表写入是向 d0 表写，多表写入是向 d0、d1、d2 等等（数量由客户端数据决定）。

**参数说明**

- -T: 表示并发写入的客户端数量，默认为 7；
- -r: 表示每次写入提交的数据行数，默认 10000；
- -n: 表示每个客户端总共要导入的数据行数，默认 500000；
- -retry: 表示测试次数（最终会自动计算写入速度的平均值），默认 1；
- -mode: 表示写入模式，single 表示单表写入，multi 表示多表写入，默认 multi；
- -txc: 表示每次事务提交的写入的次数，值>=0, 默认 0（0 表示不开启事务）；
- -tType: 表示写入表的类型，分别 ts、tsPK、intPK，默认 ts，ts 表示无主键时序表，tsPK 表示有主键时序表，intPK 表示主键为 int 类型的普通表；
- -wType: 表示写入类型，分为 insert、loadLine、loadFile，insert 表示 insert into values 的方式写数据，loadLine 表示 load data inline 的方式写，loadFile 表示 load data infile 的方式导入本地 csv 文件来（本地 csv 数据文件获取：可通过 sr-write 自动生成在其上级 data 目录下）。

### 示例

- 示例 1

使用默认配置写数据，即：7 个客户端使用 load data inline 的方式，分别向无主键的时序表（d0、d1…… d6）多表写入 500000 条数据（总共写入数据量：500000*7），每次写入 10000 行数据，测试一组数据：

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.0/matrixone/mo-write# ./mo-write 
r=10000, T=7, n=500000, mode=multi, retry=1, txc=0, tType=ts, wType=loadLine 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:7
db connection[1] created.
db connection[2] created.
db connection[3] created.
db connection[4] created.
db connection[5] created.
db connection[6] created.
db connection[7] created.
mo-data of all clinet(7 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:7.255468 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=0 

start test 1 …….
spend time:7.405524 s
1 test: 3500000/7.405524 = 472620.159086 records/second
======== avg test: 472620.159086/1 = 472620.159086 records/second txc=0 ===========
```

- 示例 2

2 个客户端使用 insert into 的方式，分别向有主键的时序表（d0）单表写 100000 条数据：

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-write# ./mo-write -T 2 -n 100000 -mode single -tType tsPK -wType insert
r=10000, T=2, n=100000, mode=single, retry=1, txc=0, tType=tsPK, wType=insert 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:2
db connection[1] created.
db connection[2] created.
mo-data of all clinet(2 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:0.819425 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=0 

start test 1 …….
spend time:11.388648 s
1 test: 200000/11.388648 = 17561.347089 records/second
======== avg test: 17561.347089/1 = 17561.347089 records/second txc=0 ===========
```

- 示例 3

1 个客户端使用 load data inline 的方式，向主键为 int 类型的普通表（d0）写 500000 条数据，测试一组数据：

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-write# ./mo-write -T 1 -tType=intPK -retry 1
r=10000, T=1, n=500000, mode=multi, retry=1, txc=0, tType=intPK, wType=loadLine 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:1
db connection[1] created.
mo-data of all clinet(1 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:1.583363 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=0 

start test 1 …….
spend time:5.062582 s
1 test: 500000/5.062582 = 98763.826906 records/second
======== avg test: 98763.826906/1 = 98763.826906 records/second txc=0 ===========
```

- 示例 4

8 个客户端使用 load data inline 的方式，通过事务提交（每次提交 10 次写入）向无主键的时序表（d0……d7）多表写 500000 条数据，自动测试 3 组求平均值：

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-write# ./mo-write -T 8 -txc 10 -retry 3
r=10000, T=8, n=500000, mode=multi, retry=3, txc=10, tType=ts, wType=loadLine 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:8
db connection[1] created.
db connection[2] created.
db connection[3] created.
db connection[4] created.
db connection[5] created.
db connection[6] created.
db connection[7] created.
db connection[8] created.
mo-data of all clinet(8 thread) has ready!
Initialize database and table completed.
start preparing test data.
spend time of prepare testing data:7.854798 s
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第1次测试, txc=10 

start test 1 …….
开始事务提交写入, 一次事务提交的写入: 10
spend time:9.482012 s
1 test: 4000000/9.482012 = 421851.388088 records/second
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第2次测试, txc=10 

start test 2 …….
tables has truncated and start insert data ……
开始事务提交写入, 一次事务提交的写入: 10
spend time:10.227261 s
2 test: 4000000/10.227261 = 391111.576833 records/second
按 Y 或者 回车键,将开始插入数据,按 N 将退出, 开的第3次测试, txc=10 

start test 3 …….
tables has truncated and start insert data ……
开始事务提交写入, 一次事务提交的写入: 10
spend time:8.994586 s
3 test: 4000000/8.994586 = 444711.979564 records/second
======== avg test: 1257674.944485/3 = 419224.981495 records/second txc=10 ===========
```

## 使用 mo-query 执行查询测试

mo-query 为查询测试工具，测试 select *、点查询、常用聚合查询、时间窗口等查询的时间，所有查询都只查询 test 库里 d0 这一张表。命令为：

```bash
mo-query -T
```

**参数说明**

**-T:** 表示并发执行 select * 查询的客户端数量，默认为 1。

### 示例

```bash
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.0/matrixone/mo-query# ./mo-query -T 5
root@host-10-222-4-8:~/soft/perf/mo_ts_perf_test-1.0.1/matrixone/mo-query# ./mo-query -T 5
T=5 
dbConfig:{127.0.0.1 6001 root 111 d '2017-07-14 10:40:06.379'   /root/soft/perf/}
start create db conn, count:5
db connection[1] created.
db connection[2] created.
db connection[3] created.
db connection[4] created.
db connection[5] created.
mo all clinet(5 thread) has ready!

 count value is:200000
'count(*)' query spend time:0.062345 s

'select *' (5 client concurrent query) spend time:0.850350 s
query speed: 1000000/0.850350 = 1175985.806764 records/second

 point query sql: select * from test.d0 where ts='2017-07-14 10:40:06.379'
'point query' spend time:0.001589 s

 avg value is: 0.07560730761790913
'avg(current)' query spend time:0.026116 s

 sum value is: 15121.461523581824
'sum(current)' query spend time:0.023109 s

 max value is: 3.9999022
'max(current)' query spend time:0.054021 s

 min value is: -3.9999993
'min(current)' query spend time:0.035809 s

TimeWindow query sql:select _wstart, _wend, max(current), min(current) from d0 interval(ts, 60, minute) sliding(60, minute)
2017-07-14 02:00:00 +0000 UTC 2017-07-14 03:00:00 +0000 UTC 3.9999022 -3.9999993
TimeWindow query spend time:0.180333 s
```