# 使用 Flink 将 Oracle 数据写入 MatrixOne

本章节将介绍如何使用 Flink 将 Oracle 数据写入到 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 完成[单机部署 MatrixOne](../../../../Get-Started/install-standalone-matrixone.md)。
- 下载安装 [lntelliJ IDEA(2022.2.1 or later version)](https://www.jetbrains.com/idea/download/)。
- 根据你的系统环境选择 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) 版本进行下载安装。
- 下载并安装 [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz)，最低支持版本为 1.11。
- 已完成[安装 Oracle 19c](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html)。
- 下载并安装 [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)，推荐版本为 8.0.33。

## 操作步骤

### 在 Oracle 中创建表，并插入数据

```sql
create table flinkcdc_empt
(
    EMPNO    NUMBER not null primary key,
    ENAME    VARCHAR2(10),
    JOB      VARCHAR2(9),
    MGR      NUMBER(4),
    HIREDATE DATE,
    SAL      NUMBER(7, 2),
    COMM     NUMBER(7, 2),
    DEPTNO   NUMBER(2)
)
--修改 FLINKCDC_EMPT 表让其支持增量日志
ALTER TABLE scott.FLINKCDC_EMPT ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS;
--插入测试数据：
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(1, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(2, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(3, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(4, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(5, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(6, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
INSERT INTO SCOTT.FLINKCDC_EMPT (EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO) VALUES(5989, 'TURNER', 'SALESMAN', 7698, TIMESTAMP '2022-10-31 16:21:11.000000', 1500, 0, 30);
```

### 在 MatrixOne 中创建目标表

```SQL
create database test;
use test;
CREATE TABLE `oracle_empt` (
    `empno` bigint NOT NULL COMMENT "",
    `ename` varchar(10) NULL COMMENT "",
    `job` varchar(9) NULL COMMENT "",
    `mgr` int NULL COMMENT "",
    `hiredate` datetime NULL COMMENT "",
    `sal` decimal(7, 2) NULL COMMENT "",
    `comm` decimal(7, 2) NULL COMMENT "",
    `deptno` int NULL COMMENT ""
);
```

### 复制 jar 包

将 `flink-sql-connector-oracle-cdc-2.2.1.jar`、`flink-connector-jdbc_2.11-1.13.6.jar`、`mysql-connector-j-8.0.31.jar` 复制到 `flink-1.13.6/lib/`。

如果 flink 已经启动，需要重启 flink，加载生效 jar 包。

### 切换到 flink 目录，并启动集群

```bash
./bin/start-cluster.sh
```

### 启动 Flink SQL CLI

```bash
./bin/sql-client.sh
```

### 开启 checkpoint

```bash
SET execution.checkpointing.interval = 3s;
```

### 使用 flink ddl 创建 source/sink 表

```sql
-- 创建 source 表 (oracle)
CREATE TABLE `oracle_source` (
    EMPNO bigint NOT NULL,
    ENAME VARCHAR(10),
    JOB VARCHAR(9),
    MGR int,
    HIREDATE timestamp,
    SAL decimal(7,2),
    COMM decimal(7,2),
    DEPTNO int,
    PRIMARY KEY(EMPNO) NOT ENFORCED
) WITH (
     'connector' = 'oracle-cdc',
     'hostname' = 'xx.xx.xx.xx',
     'port' = '1521',
     'username' = 'scott',
     'password' = 'tiger',
     'database-name' = 'ORCLCDB',
     'schema-name' = 'SCOTT',
     'table-name' = 'FLINKCDC_EMPT',
     'debezium.database.tablename.case.insensitive'='false',
     'debezium.log.mining.strategy'='online_catalog'
    );
-- 创建 sink 表 (mo)
CREATE TABLE IF NOT EXISTS `oracle_sink` (
    EMPNO bigint NOT NULL, 
   ENAME VARCHAR(10), 
   JOB VARCHAR(9), 
   MGR int, 
   HIREDATE timestamp, 
   SAL decimal(7,2), 
   COMM decimal(7,2), 
   DEPTNO int, 
    PRIMARY KEY(EMPNO) NOT ENFORCED
) with (
'connector' = 'jdbc',
 'url' = 'jdbc:mysql://ip:6001/test',
  'driver' = 'com.mysql.cj.jdbc.Driver',
  'username' = 'root',
  'password' = '111',
  'table-name' = 'oracle_empt'
);
-- 将 source 表数据读取插入到 sink 表中
insert into `oracle_sink` select * from `oracle_source`;
```

### 在 MatrixOne 中查询对应表数据

```sql
select * from oracle_empt;
```

 <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-oracle.jpg width=70% heigth=70%/>
</div>