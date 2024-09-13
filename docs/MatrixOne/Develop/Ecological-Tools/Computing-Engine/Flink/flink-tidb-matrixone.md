# 使用 Flink 将 TiDB 数据写入 MatrixOne

本章节将介绍如何使用 Flink 将 TiDB 数据写入到 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 完成[单机部署 MatrixOne](https://docs.matrixorigin.cn/1.2.3/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 下载安装 [lntelliJ IDEA(2022.2.1 or later version)](https://www.jetbrains.com/idea/download/)。
- 根据你的系统环境选择 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) 版本进行下载安装。
- 已完成 TiDB 单机部署。
- 下载并安装 [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz)，最低支持版本为 1.11。
- 下载并安装 [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)，推荐版本为 8.0.33。
- 下载 [Flink CDC connector](https://repo1.maven.org/maven2/com/ververica/flink-sql-connector-tidb-cdc/2.2.1/flink-sql-connector-tidb-cdc-2.2.1.jar)

## 操作步骤

### 复制 jar 包

将 `Flink CDC connector` 和 `flink-connector-jdbc_2.12-1.13.6.jar`、`mysql-connector-j-8.0.33.jar` 对应 Jar 包复制到 `flink-1.13.6/lib/`。

如果 flink 已经启动，需要重启 flink，加载生效 jar 包。

### 在 TiDB 中创建表，并插入数据

```sql
create table EMPQ_cdc
(
    empno    bigint not null,
    ename    VARCHAR(10),
    job      VARCHAR(9),
    mgr      int,
    hiredate  DATE,
    sal      decimal(7,2),
    comm   decimal(7,2),
    deptno   int(2),
    primary key (empno)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT  into empq VALUES (1,"张三","sale",1,'2024-01-01',1000,NULL,1);
INSERT  into empq VALUES (2,"李四","develo,"2,'2024-03-05',5000,NULL,2);
INSERT  into empq VALUES (3,"王五","hr",3,'2024-03-18',2000,NULL,2);
INSERT  into empq VALUES (4,"赵六","pm",4,'2024-03-11',2000,NULL,3);
```

### 在 MatrixOne 中创建目标表

```sql
create table EMPQ
(
    empno    bigint not null,
    ename    VARCHAR(10),
    job      VARCHAR(9),
    mgr      int,
    hiredate  DATE,
    sal      decimal(7,2),
    comm   decimal(7,2),
    deptno   int(2),
    primary key (empno)
);
```

### 切换到 flink 目录，并启动集群

```bash
./bin/start-cluster.sh
```

### 启动 Flink SQL CLI

```bash
./bin/sql-client.sh
```

### 开启 checkpoint

```sql
SET execution.checkpointing.interval = 3s;
```

### 使用 flink ddl 创建 source 和 sink 表

建表语句在 smt/result/flink-create.all.sql 中。

```sql
-- 创建测试库
CREATE DATABASE IF NOT EXISTS `default_catalog`.`test`;

-- 创建 source 表
CREATE TABLE IF NOT EXISTS `default_catalog`.`test`.`EMPQ_src` (
`empno` BIGINT NOT NULL,                                                 
`ename` STRING NULL,                                                   
`job` STRING NULL,                                                      
`mgr` INT NULL,                                                      
`hiredate` DATE NULL,                                                         
`sal` DECIMAL(7, 2) NULL,                                             
`comm` DECIMAL(7, 2) NULL,                                                     
`deptno` INT NULL,                                                        
PRIMARY KEY(`empno`) NOT ENFORCED
) with (
    'connector' = 'tidb-cdc',
    'database-name' = 'test',
    'table-name' = 'EMPQ_cdc',
    'pd-addresses' = 'xx.xx.xx.xx:2379'
);

-- 创建 sink 表
CREATE TABLE IF NOT EXISTS `default_catalog`.`test`.`EMPQ_sink` (           
`empno` BIGINT NOT NULL,                                                     
`ename` STRING NULL,                                                     
`job` STRING NULL,                                                        
`mgr` INT NULL,                                                         
`hiredate` DATE NULL,                                                          
`sal` DECIMAL(7, 2) NULL,                                               
`comm` DECIMAL(7, 2) NULL,                                                             
`deptno` INT NULL,                                                           
PRIMARY KEY(`empno`) NOT ENFORCED
) with (
'connector' = 'jdbc',
'url' = 'jdbc:mysql://xx.xx.xx.xx:6001/test',
'driver' = 'com.mysql.cj.jdbc.Driver',
'username' = 'root',
'password' = '111',
'table-name' = 'empq'
);
```

### 将 TiDB 数据导入 MatrixOne

```sql
INSERT INTO `default_catalog`.`test`.`EMPQ_sink` SELECT * FROM `default_catalog`.`test`.`EMPQ_src`;
```

### 在 Matrixone 中查询对应表数据

```sql
select * from EMPQ;
```

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-tidb-01.jpg width=50% heigth=50%/>
</div>

可以发现数据已经导入

### 在 TiDB 删除一条数据

```sql
delete from EMPQ_cdc where empno=1;
```

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-tidb-02.jpg width=50% heigth=50%/>
</div>

在 MatrixOne 中查询表数据，这行已同步删除。
