# mo_ssb_open 工具指南

`mo_ssb_open` 是一款针对 MatrixOne 实现 SSB 测试的工具。

!!! Note 注意
    `mo_ssb_open` 工具目前只支持在 Linux 系统 x86 架构部署。

## 前置依赖

- 已完成[安装和启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)
- 环境编码设置为 UTF-8  
- 已安装 wget
- 已安装 bc 命令  

## 安装 mo_ssb_open

```bash
wget https://github.com/matrixorigin/mo_ssb_open/archive/refs/tags/v1.0.1.zip
unzip v1.0.1.zip
```

## 生成数据集

```bash
cd mo_ssb_open-1.0.1 
./bin/gen-ssb-data.sh -s 1 -c 5
```

**-s**：表示产生大约 1GB 的数据集，不指定参数，默认生成 100G 数据，

**-c**：表示生成 lineorder 表数据的线程数，默认为 10 线程。

生成完整数据集可能需要一段时间。完成后，您可以在 mo_ssb_open-1.0.1/bin/ssb-data/ 目录下看到结果文件。

```bash
root@host-10-222-4-8:~/soft/ssb/mo_ssb_open-1.0.1/bin/ssb-data# ls -l
total 604976
-rwS--S--T 1 root root   2837046 Jun  7 03:31 customer.tbl
-rw-r--r-- 1 root root    229965 Jun  7 03:31 date.tbl
-rw-r--r-- 1 root root 118904702 Jun  7 03:31 lineorder.tbl.1
-rw-r--r-- 1 root root 119996341 Jun  7 03:31 lineorder.tbl.2
-rw-r--r-- 1 root root 120146777 Jun  7 03:31 lineorder.tbl.3
-rw-r--r-- 1 root root 120000311 Jun  7 03:31 lineorder.tbl.4
-rw-r--r-- 1 root root 120057972 Jun  7 03:31 lineorder.tbl.5
-rw-r--r-- 1 root root  17139259 Jun  7 03:31 part.tbl
-rw-r--r-- 1 root root    166676 Jun  7 03:31 supplier.tbl
```

## 在 MatrixOne 中建表

修改配置文件 conf/matrxione.conf，指定 MatrixOne 的地址、用户名、密码，配置文件示例如下

```conf
# MatrixOne host
export HOST='127.0.0.1'
# MatrixOne port
export PORT=6001
# MatrixOne username
export USER='root'
# MatrixOne password
export PASSWORD='111'
# The database where SSB tables located
export DB='ssb'
```

然后执行以下脚本进行建表操作。

```bash
./bin/create-ssb-tables.sh
```

连接 MatrixOne 查看，建表成功。

```sql
mysql> show tables;
+----------------+
| Tables_in_ssb  |
+----------------+
| customer       |
| dates          |
| lineorder      |
| lineorder_flat |
| part           |
| supplier       |
+----------------+
6 rows in set (0.01 sec)
```

## 导入数据

执行以下脚本导入 ssb 测试所需数据：

```bash
./bin/load-ssb-data.sh -c 10
```

**参数释义**

**-c**: 可以指定执行导入的线程数，默认为 5 个线程。

加载完成后，可以使用创建的表查询 MatrixOne 中的数据。

## 运行查询命令

查询结果第一列为查询编码，

- 多表查询

```bash
root@host-10-222-4-8:~/soft/ssb/mo_ssb_open-1.0.1# ./bin/run-ssb-queries.sh
mysqlslap  Ver 8.0.37 for Linux on x86_64 (MySQL Community Server - GPL)
mysql  Ver 8.0.37 for Linux on x86_64 (MySQL Community Server - GPL)
bc 1.07.1
Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006, 2008, 2012-2017 Free Software Foundation, Inc.
HOST: 127.0.0.1
PORT: 6001
USER: root
DB: ssb
q1.1:	0.22	0.16	0.13	fast:0.13
q1.2:	0.17	0.17	0.17	fast:0.17
q1.3:	0.15	0.19	0.18	fast:0.15
q2.1:	0.22	0.21	0.23	fast:0.21
q2.2:	0.18	0.17	0.16	fast:0.16
q2.3:	0.15	0.16	0.17	fast:0.15
q3.1:	0.24	0.23	0.23	fast:0.23
q3.2:	0.16	0.16	0.20	fast:0.16
q3.3:	0.16	0.14	0.13	fast:0.13
q3.4:	0.12	0.11	0.11	fast:0.11
q4.1:	0.24	0.22	0.30	fast:0.22
q4.2:	0.22	0.21	0.22	fast:0.21
q4.3:	0.20	0.21	0.20	fast:0.20
total time: 2.23 seconds
Finish ssb queries.
```

- 单表查询

```bash
root@host-10-222-4-8:~/soft/ssb/mo_ssb_open-1.0.1#  ./bin/run-ssb-flat-queries.sh
mysqlslap  Ver 8.0.37 for Linux on x86_64 (MySQL Community Server - GPL)
mysql  Ver 8.0.37 for Linux on x86_64 (MySQL Community Server - GPL)
bc 1.07.1
Copyright 1991-1994, 1997, 1998, 2000, 2004, 2006, 2008, 2012-2017 Free Software Foundation, Inc.
HOST: 127.0.0.1
PORT: 6001
USER: root
DB: ssb
q1.1:	0.21	0.13	0.14	fast:0.13
q1.2:	0.15	0.13	0.15	fast:0.13
q1.3:	0.16	0.21	0.22	fast:0.16
q2.1:	0.36	0.34	0.38	fast:0.34
q2.2:	0.36	0.34	0.32	fast:0.32
q2.3:	0.25	0.26	0.22	fast:0.22
q3.1:	0.39	0.39	0.30	fast:0.30
q3.2:	0.32	0.33	0.29	fast:0.29
q3.3:	0.22	0.23	0.29	fast:0.22
q3.4:	0.32	0.28	0.31	fast:0.28
q4.1:	0.42	0.38	0.38	fast:0.38
q4.2:	0.42	0.48	0.45	fast:0.42
q4.3:	0.35	0.34	0.29	fast:0.29
total time: 3.48 seconds
Finish ssb-flat queries.
```

查询结果分别对应：查询语句、第一次查询结果、第二次查询结果、第三次查询结果和最快结果，单位为 s。

!!! note
    您可以在 mo_ssb_open-1.0.1/ssb-queries 目录下查看具体的查询语句。