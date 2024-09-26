# 使用 Flink 将 PostgreSQL 数据写入 MatrixOne

本章节将介绍如何使用 Flink 将 PostgreSQL 数据写入到 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 完成[单机部署 MatrixOne](../../../../Get-Started/install-standalone-matrixone.md)。
- 下载安装 [lntelliJ IDEA(2022.2.1 or later version)](https://www.jetbrains.com/idea/download/)。
- 根据你的系统环境选择 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) 版本进行下载安装。
- 安装 [PostgreSQL](https://www.postgresql.org/download/)。
- 下载并安装 [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz)，最低支持版本为 1.11。
- 下载并安装 [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)，推荐版本为 8.0.33。

## 操作步骤

### 下载 Flink CDC connector

```bash
wget https://repo1.maven.org/maven2/com/ververica/flink-sql-connector-postgres-cdc/2.1.1/flink-sql-connector-postgres-cdc-2.1.1.jar
```

### 复制 jar 包

将 `Flink CDC connector` 和 `flink-connector-jdbc_2.12-1.13.6.jar`、`mysql-connector-j-8.0.33.jar` 对应 Jar 包复制到 `flink-1.13.6/lib/`
如果 flink 已经启动，需要重启 flink，加载生效 jar 包。

### Postgresql 开启 cdc 配置

1. postgresql.conf 配置

    ```conf
    #更改 wal 发送最大进程数（默认值为 10），这个值和上面的 solts 设置一样
    max_wal_senders = 10    # max number of walsender processes
    #中断那些停止活动超过指定毫秒数的复制连接，可以适当设置大一点（默认 60s）
    wal_sender_timeout = 180s    # in milliseconds; 0 disables
    #更改 solts 最大数量（默认值为 10），flink-cdc 默认一张表占用一个 slots
    max_replication_slots = 10   # max number of replication slots
    #指定为 logical
    wal_level = logical         # minimal, replica, or logical
    ```

2. pg_hba.conf

    ```conf
    #IPv4 local connections:
    host all all 0.0.0.0/0 password
    host replication all 0.0.0.0/0 password
    ```

### 在 postgresql 中创建表，并插入数据

```sql

create table student
(
    stu_id integer not null unique,
    stu_name varchar(50),
    stu_age integer,
    stu_bth date
);

INSERT  into student VALUES (1,"lisa",12,'2022-10-12');
INSERT  into student VALUES (2,"tom",23,'2021-11-10');
INSERT  into student VALUES (3,"jenny",11,'2024-02-19');
INSERT  into student VALUES (4,"henry",12,'2022-04-22');
```

### 在 MatrixOne 中建表

```sql
create table student
(
    stu_id integer not null unique,
    stu_name varchar(50),
    stu_age integer,
    stu_bth date
);
```

### 启动集群

切换到 flink 目录，执行以下命令：

```bash
./bin/start-cluster.sh
```

### 启动 Flink SQL CLI

```bash
./bin/sql-client.sh
```

### 开启 checkpoint

设置每隔 3 秒做一次 checkpoint

```sql
SET execution.checkpointing.interval = 3s;
```

### 使用 flink ddl 创建 source 表

```sql
CREATE TABLE pgsql_bog  (
      stu_id  int not null,
      stu_name    varchar(50),
      stu_age     int,
      stu_bth     date,
     primary key (stu_id) not enforced
) WITH (
      'connector' = 'postgres-cdc',
      'hostname' = 'xx.xx.xx.xx',
      'port' = '5432',
      'username' = 'postgres',
      'password' = '123456',
      'database-name' = 'postgres',
      'schema-name' = 'public',
      'table-name' = 'student',
      'decoding.plugin.name' = 'pgoutput' ,
      'debezium.snapshot.mode' = 'initial'
      ) ;
```

如果是 table sql 方式，pgoutput 是 PostgreSQL 10+ 中的标准逻辑解码输出插件。需要设置一下。不添加：`'decoding.plugin.name' = 'pgoutput'`,
会报错：`org.postgresql.util.PSQLException: ERROR: could not access file "decoderbufs": No such file or directory`。

### 创建 sink 表

```sql
CREATE TABLE test_pg (
      stu_id  int not null,
      stu_name    varchar(50),
      stu_age     int,
      stu_bth     date,
      primary key (stu_id) not enforced
) WITH (
'connector' = 'jdbc',
'url' = 'jdbc:mysql://xx.xx.xx.xx:6001/postgre',
'driver' = 'com.mysql.cj.jdbc.Driver',
'username' = 'root',
'password' = '111',
'table-name' = 'student'
);
```

### 将 PostgreSQL 数据导入 MatrixOne

```sql
insert into test_pg select * from pgsql_bog;
```

在 MatrixOne 中查询对应表数据；

```sql
mysql> select * from student;
+--------+----------+---------+------------+
| stu_id | stu_name | stu_age | stu_bth    |
+--------+----------+---------+------------+
|      1 | lisa     |      12 | 2022-10-12 |
|      2 | tom      |      23 | 2021-11-10 |
|      3 | jenny    |      11 | 2024-02-19 |
|      4 | henry    |      12 | 2022-04-22 |
+--------+----------+---------+------------+
4 rows in set (0.00 sec)
```

可以发现数据已经导入

### 在 postgrsql 中新增数据

```sql
insert into public.student values (51, '58', 39, '2020-01-03');
```

在 MatrixOne 中查询对应表数据；

```sql
mysql>  select * from student;
+--------+----------+---------+------------+
| stu_id | stu_name | stu_age | stu_bth    |
+--------+----------+---------+------------+
|      1 | lisa     |      12 | 2022-10-12 |
|      2 | tom      |      23 | 2021-11-10 |
|      3 | jenny    |      11 | 2024-02-19 |
|      4 | henry    |      12 | 2022-04-22 |
|     51 | 58       |      39 | 2020-01-03 |
+--------+----------+---------+------------+
5 rows in set (0.01 sec)
```

可以发现数据已经同步到 MatrixOne 对应表中。

删除数据：

```sql
delete from public.student where stu_id=1;
```

如果报错

```sql
cannot delete from table "student" because it does not have a replica identity and publishes deletes
```

则执行

```sql
alter table public.student replica identity full;
```

在 MatrixOne 中查询对应表数据；

```sql
mysql> select * from student;
+--------+----------+---------+------------+
| stu_id | stu_name | stu_age | stu_bth    |
+--------+----------+---------+------------+
|      2 | tom      |      23 | 2021-11-10 |
|      3 | jenny    |      11 | 2024-02-19 |
|      4 | henry    |      12 | 2022-04-22 |
|     51 | 58       |      39 | 2020-01-03 |
+--------+----------+---------+------------+
4 rows in set (0.00 sec)
```