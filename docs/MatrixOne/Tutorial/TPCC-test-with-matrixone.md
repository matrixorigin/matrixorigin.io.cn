# **完成 TPCC 测试**

TPC-C 是一个在线事务处理(OLTP)基准。TPC-C 比以前的 OLTP 基准测试(如 TPC-A)更复杂，因为它有多种事务类型、更复杂的数据库和整体执行结构。TPC-C 混合了五个不同类型和复杂性的并发事务，可以在线执行，也可以排队延迟执行。

本项测试是从 benchmarksql-5.0 定制开发的，用于运行 MatrixOne 的 TPCC Benchmark。

本项测试主要定制了模式、SQL 语句和一些事务冲突处理代码。

通过阅读本教程，你将学习如何使用 MatrixOne 完成 TPC-C 测试。

## **开始前准备**

### 安装并启动 MatrixOne

确保你已经完成了[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。

### 克隆 mo-tpch 仓库到本地

```
git clone https://github.com/matrixorigin/mo-tpcc.git
```

## 步骤

### 步骤简介

本节将介绍如何生成 TPCC 数据、创建 TPCC 表，并将数据加载到 MatrixOne 以及运行 TPCC 测试。  

现在你可以按照以下描述逐步执行命令。

### 1. 配置 *props.mo* 文件

克隆 *mo-tpch* 仓库到本地后，在本地打开 *mo-tpch* 文件夹，按照下面的配置项，修改文件夹中的 *props.mo* 文件：

```
db=mo
driver=com.mysql.cj.jdbc.Driver
conn=jdbc:mysql://127.0.0.1:6001/tpcc?characterSetResults=utf8&continueBatchOnError=false&useServerPrepStmts=true&alwaysSendSetIsolation=false&useLocalSessionState=true&zeroDateTimeBehavior=CONVERT_TO_NULL&failoverReadOnly=false&serverTimezone=Asia/Shanghai&enabledTLSProtocols=TLSv1.2&useSSL=false
user=dump
password=111

//the number of warehouse
warehouses=1
loadWorkers=4

//the num of terminals that will simultaneously run
//must be less than warehouses*10
terminals=1
//To run specified transactions per terminal- runMins must equal zero
runTxnsPerTerminal=0
//To run for specified minutes- runTxnsPerTerminal must equal zero
runMins=1
//Number of total transactions per minute
limitTxnsPerMin=0
```

修改完成后，保存 *props.mo* 文件。

### 2. 创建 TPCC 数据库和表

打开一个新的终端，执行下面的代码：

```
cd mo-tpch
./runSQL.sh props.mo tableCreates
```

上面的代码表示，进入到 *mo-tpch* 文件夹目录，执行代码创建完成  TPCC 数据库和表。

执行完成后，输出结果示例如下：

```
# ------------------------------------------------------------
# Loading SQL file ./sql/tableCreates.sql
# ------------------------------------------------------------
drop database if exists tpcc;
create database if not exists tpcc;
use tpcc;
create table bmsql_config (
cfg_name    varchar(30) primary key,
cfg_value   varchar(50)
);
create table bmsql_warehouse (
w_id        integer   not null,
w_ytd       decimal(12,2),
w_tax       decimal(4,4),
w_name      varchar(10),
w_street_1  varchar(20),
w_street_2  varchar(20),
w_city      varchar(20),
w_state     char(2),
w_zip       char(9),
primary key (w_id)
) PARTITION BY KEY(w_id);
create table bmsql_district (
d_w_id       integer       not null,
d_id         integer       not null,
d_ytd        decimal(12,2),
d_tax        decimal(4,4),
d_next_o_id  integer,
d_name       varchar(10),
d_street_1   varchar(20),
d_street_2   varchar(20),
d_city       varchar(20),
d_state      char(2),
d_zip        char(9),
primary key (d_w_id, d_id)
) PARTITION BY KEY(d_w_id);
create table bmsql_customer (
c_w_id         integer        not null,
c_d_id         integer        not null,
c_id           integer        not null,
c_discount     decimal(4,4),
c_credit       char(2),
c_last         varchar(16),
c_first        varchar(16),
c_credit_lim   decimal(12,2),
c_balance      decimal(12,2),
c_ytd_payment  decimal(12,2),
c_payment_cnt  integer,
c_delivery_cnt integer,
c_street_1     varchar(20),
c_street_2     varchar(20),
c_city         varchar(20),
c_state        char(2),
c_zip          char(9),
c_phone        char(16),
c_since        timestamp,
c_middle       char(2),
c_data         varchar(500),
primary key (c_w_id, c_d_id, c_id)
) PARTITION BY KEY(c_w_id);
create table bmsql_history (
hist_id  integer auto_increment,
h_c_id   integer,
h_c_d_id integer,
h_c_w_id integer,
h_d_id   integer,
h_w_id   integer,
h_date   timestamp,
h_amount decimal(6,2),
h_data   varchar(24),
primary key (hist_id)
);
create table bmsql_new_order (
no_w_id  integer   not null,
no_d_id  integer   not null,
no_o_id  integer   not null,
primary key (no_w_id, no_d_id, no_o_id)
) PARTITION BY KEY(no_w_id);
create table bmsql_oorder (
o_w_id       integer      not null,
o_d_id       integer      not null,
o_id         integer      not null,
o_c_id       integer,
o_carrier_id integer,
o_ol_cnt     integer,
o_all_local  integer,
o_entry_d    timestamp,
primary key (o_w_id, o_d_id, o_id)
) PARTITION BY KEY(o_w_id);
create table bmsql_order_line (
ol_w_id         integer   not null,
ol_d_id         integer   not null,
ol_o_id         integer   not null,
ol_number       integer   not null,
ol_i_id         integer   not null,
ol_delivery_d   timestamp,
ol_amount       decimal(6,2),
ol_supply_w_id  integer,
ol_quantity     integer,
ol_dist_info    char(24),
primary key (ol_w_id, ol_d_id, ol_o_id, ol_number)
) PARTITION BY KEY(ol_w_id);
create table bmsql_item (
i_id     integer      not null,
i_name   varchar(24),
i_price  decimal(5,2),
i_data   varchar(50),
i_im_id  integer,
primary key (i_id)
) PARTITION BY KEY(i_id);
create table bmsql_stock (
s_w_id       integer       not null,
s_i_id       integer       not null,
s_quantity   integer,
s_ytd        integer,
s_order_cnt  integer,
s_remote_cnt integer,
s_data       varchar(50),
s_dist_01    char(24),
s_dist_02    char(24),
s_dist_03    char(24),
s_dist_04    char(24),
s_dist_05    char(24),
s_dist_06    char(24),
s_dist_07    char(24),
s_dist_08    char(24),
s_dist_09    char(24),
s_dist_10    char(24),
primary key (s_w_id, s_i_id)
) PARTITION BY KEY(s_w_id);
```

### 3. 生成 TPCC 数据集并加载至 MatrixOne

执行下面的代码，生成 TPCC 数据集并将 TPCC 数据集加载到 MatrixOne:

```
./runLoader.sh props.mo warehouse 10
```

执行完成后，输出结果示例如下：

```
Starting BenchmarkSQL LoadData

props.mo
driver=com.mysql.cj.jdbc.Driver
conn=jdbc:mysql://127.0.0.1:6001/tpcc?characterSetResults=utf8&continueBatchOnError=false&useServerPrepStmts=true&alwaysSendSetIsolation=false&useLocalSessionState=true&zeroDateTimeBehavior=CONVERT_TO_NULL&failoverReadOnly=false&serverTimezone=Asia/Shanghai&enabledTLSProtocols=TLSv1.2&useSSL=false
user=dump
password=***********
warehouses=1
loadWorkers=4
fileLocation (not defined)
csvNullValue (not defined - using default '')

Worker 000: Loading ITEM
Worker 001: Loading Warehouse      1
Worker 000: Loading ITEM done
Worker 001: Loading Warehouse      1 done
```

如果仅需生成数据，但不需要将数据集加载到 MatrixOne，可以执行下面的代码：

```
./runLoader.sh props.mo warehouse 10 filelocation /yourpath/
```

### 4. 运行 TPCC 测试

执行下面的代码，运行 TPCC 测试：

```
./runBenchmark.sh props.mo
```

执行完成后，输出结果示例如下：

```
.:./lib/*
2022-11-27 01:07:44 INFO  jTPCC:78 - Term-00,
2022-11-27 01:07:44 INFO  jTPCC:79 - Term-00, +-------------------------------------------------------------+
2022-11-27 01:07:44 INFO  jTPCC:80 - Term-00,      BenchmarkSQL v5.0
2022-11-27 01:07:44 INFO  jTPCC:81 - Term-00, +-------------------------------------------------------------+
2022-11-27 01:07:44 INFO  jTPCC:82 - Term-00,  (c) 2003, Raul Barbosa
2022-11-27 01:07:44 INFO  jTPCC:83 - Term-00,  (c) 2004-2016, Denis Lussier
2022-11-27 01:07:44 INFO  jTPCC:84 - Term-00,  (c) 2016, Jan Wieck
2022-11-27 01:07:44 INFO  jTPCC:85 - Term-00, +-------------------------------------------------------------+
2022-11-27 01:07:44 INFO  jTPCC:86 - Term-00,
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, db=mo
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, driver=com.mysql.cj.jdbc.Driver
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, conn=jdbc:mysql://127.0.0.1:6001/tpcc?characterSetResults=utf8&continueBatchOnError=false&useServerPrepStmts=true&alwaysSendSetIsolation=false&useLocalSessionState=true&zeroDateTimeBehavior=CONVERT_TO_NULL&failoverReadOnly=false&serverTimezone=Asia/Shanghai&enabledTLSProtocols=TLSv1.2&useSSL=false
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, user=dump
2022-11-27 01:07:44 INFO  jTPCC:93 - Term-00,
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, warehouses=1
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, terminals=1
2022-11-27 01:07:44 INFO  jTPCC:100 - Term-00, runMins=1
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, limitTxnsPerMin=0
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, terminalWarehouseFixed=null
2022-11-27 01:07:44 INFO  jTPCC:108 - Term-00,
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, newOrderWeight=null
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, paymentWeight=null
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, orderStatusWeight=null
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, deliveryWeight=null
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, stockLevelWeight=null
2022-11-27 01:07:44 INFO  jTPCC:115 - Term-00,
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, resultDirectory=null
2022-11-27 01:07:44 INFO  jTPCC:63 - Term-00, osCollectorScript=null
2022-11-27 01:07:44 INFO  jTPCC:119 - Term-00,
2022-11-27 01:07:44 INFO  jTPCC:710 - Term-00, Loading database driver: 'com.mysql.cj.jdbc.Driver'...
2022-11-27 01:07:44 INFO  jTPCC:324 - Term-00, C value for C_LAST during load: 229
2022-11-27 01:07:44 INFO  jTPCC:325 - Term-00, C value for C_LAST this run:    110
2022-11-27 01:07:44 INFO  jTPCC:326 - Term-00,
Term-00, Running Average tpmTOTAL: 0.00    Current tpmTOTAL: 0    Memory Usage: 15MB / 260MB      2022-11-27 01:07:44 ERROR jTPCC:715 - Term-00, Invalid number in mix percentage!
java.lang.Exception
        at io.mo.jTPCC.<init>(jTPCC.java:429)
        at io.mo.jTPCC.main(jTPCC.java:57)
Term-00, Running Average tpmTOTAL: 0.00    Current tpmTOTAL: 0    Memory Usage: 15MB / 260MB
```
