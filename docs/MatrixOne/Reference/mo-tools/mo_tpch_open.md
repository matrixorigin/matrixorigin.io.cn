# mo_tpch_open 工具指南

`mo_tpch_open` 是一款针对 MatrixOne 实现 TPCH 测试的工具。

!!! Note 注意
    `mo_tpch_open` 工具目前只支持在 Linux 系统 x86 架构部署。

## 前置依赖

- 已完成[安装和启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)
- 设置环境编码为 UTF-8  
- 已安装 wget
- 已安装 bc 命令  

## 安装 mo_tpch_open

```bash
wget https://github.com/matrixorigin/mo_tpch_open/archive/refs/tags/v1.0.1.zip
unzip v1.0.1.zip
```

## 生成数据集

使用以下命令生成数据集：

```bash
cd mo_tpch_open-1.0.1
./bin/gen-tpch-data.sh -s 1 -c 5
```

**参数释义**

**-s**：表示产生大约 1GB 的数据集，不指定参数，默认生成 100G 数据，

**-c**：表示生成表数据的线程数，默认为 10 线程。

生成完整数据集可能需要一段时间。完成后，您可以在 mo_tpch_open-1.0.1/bin/tpch-data 目录下看到结果文件。

```bash
root@host-10-222-4-8:~/soft/tpch/tpch-tools/bin/tpch-data# ls -l
root@host-10-222-4-8:~/soft/tpch/mo_tpch_open-1.0.1/bin/tpch-data# ls -l
total 1074936
-rw-r--r-- 1 root root  24346144 Jun  7 03:16 customer.tbl
-rw-r--r-- 1 root root 151051198 Jun  7 03:16 lineitem.tbl.1
-rw-r--r-- 1 root root 152129724 Jun  7 03:16 lineitem.tbl.2
-rw-r--r-- 1 root root 152344710 Jun  7 03:16 lineitem.tbl.3
-rw-r--r-- 1 root root 152123661 Jun  7 03:16 lineitem.tbl.4
-rw-r--r-- 1 root root 152213994 Jun  7 03:16 lineitem.tbl.5
-rw-r--r-- 1 root root      2224 Jun  7 03:16 nation.tbl
-rw-r--r-- 1 root root  34175478 Jun  7 03:16 orders.tbl.1
-rw-r--r-- 1 root root  34463858 Jun  7 03:16 orders.tbl.2
-rw-r--r-- 1 root root  34437453 Jun  7 03:16 orders.tbl.3
-rw-r--r-- 1 root root  34445732 Jun  7 03:16 orders.tbl.4
-rw-r--r-- 1 root root  34429640 Jun  7 03:16 orders.tbl.5
-rw-r--r-- 1 root root  24135125 Jun  7 03:16 part.tbl
-rw-r--r-- 1 root root  23677134 Jun  7 03:16 partsupp.tbl.1
-rw-r--r-- 1 root root  23721079 Jun  7 03:16 partsupp.tbl.2
-rw-r--r-- 1 root root  23808550 Jun  7 03:16 partsupp.tbl.3
-rw-r--r-- 1 root root  23894802 Jun  7 03:16 partsupp.tbl.4
-rw-r--r-- 1 root root  23883051 Jun  7 03:16 partsupp.tbl.5
-rw-r--r-- 1 root root       389 Jun  7 03:16 region.tbl
-rw-r--r-- 1 root root   1409184 Jun  7 03:16 supplier.tbl
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
# The database where TPC-H tables located
export DB='tpch'
```

然后执行以下脚本进行建表操作。

```bash
./bin/create-tpch-tables.sh
```

连接 MatrixOne 查看，建表成功。

```sql
mysql> show tables;
+----------------+
| Tables_in_tpch |
+----------------+
| customer       |
| lineitem       |
| nation         |
| orders         |
| part           |
| partsupp       |
| region         |
| revenue0       |
| supplier       |
+----------------+
9 rows in set (0.00 sec)
```

## 导入数据

执行以下脚本导入 TPC-H 测试所需数据：

```bash
./bin/load-tpch-data.sh -c 10
```

**参数释义**

**-c**: 可以指定执行导入的线程数，默认为 5 个线程。

加载完成后，可以使用创建的表查询 MatrixOne 中的数据。

## 运行查询命令

执行以下命令进行查询：

```bash
root@host-10-222-4-8:~/soft/tpch/mo_tpch_open-1.0.1# ./bin/run-tpch-queries.sh
mysql  Ver 8.0.37 for Linux on x86_64 (MySQL Community Server - GPL)
HOST: 127.0.0.1
PORT: 6001
USER: root
DB: tpch
Time Unit: ms
q1	836	715	691	691
q2	111	80	88	80
q3	325	235	212	212
q4	221	181	177	177
q5	240	236	295	236
q6	215	292	350	292
q7	373	327	299	299
q8	236	238	243	238
q9	443	406	413	406
q10	375	390	422	390
q11	201	237	231	231
q12	461	460	400	400
q13	321	294	301	294
q14	289	261	282	261
q15	391	285	294	285
q16	222	288	255	255
q17	333	247	243	243
q18	275	262	317	262
q19	513	479	511	479
q20	240	244	198	198
q21	1503	1746	1786	1746
q22	138	122	126	122
Total cold run time: 8262 ms
Total hot run time: 7797 ms
Finish tpch queries.
```

查询结果分别对应：查询语句、第一次查询结果、第二次查询结果、第三次查询结果和最快结果，单位为 ms。

!!! note
    您可以在 mo_tpch_open-1.0.1/queries 目录下查看具体的查询语句。
