# 使用 Flink 将 SQL Server 数据写入 MatrixOne

本章节将介绍如何使用 Flink 将 SQL Server 数据写入到 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 完成[单机部署 MatrixOne](https://docs.matrixorigin.cn/1.2.3/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 下载安装 [lntelliJ IDEA(2022.2.1 or later version)](https://www.jetbrains.com/idea/download/)。
- 根据你的系统环境选择 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) 版本进行下载安装。
- 下载并安装 [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz)，最低支持版本为 1.11。
- 已完成 [SQL Server 2022](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)。
- 下载并安装 [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)，推荐版本为 8.0.33。

## 操作步骤

### 在 SQL Server 中创建库、表并插入数据

```sql
create database sstomo;
use sstomo;
create table sqlserver_data (
    id INT PRIMARY KEY,
    name NVARCHAR(100),
    age INT,
    entrytime DATE,
    gender NVARCHAR(2)
);

insert into sqlserver_data (id, name, age, entrytime, gender)
values  (1, 'Lisa', 25, '2010-10-12', '0'),
        (2, 'Liming', 26, '2013-10-12', '0'),
        (3, 'asdfa', 27, '2022-10-12', '0'),
        (4, 'aerg', 28, '2005-10-12', '0'),
        (5, 'asga', 29, '2015-10-12', '1'),
        (6, 'sgeq', 30, '2010-10-12', '1');
```

### SQL Server 配置 CDC

1. 确认当前用户已开启 sysadmin 权限
    查询当前用户权限，必须为 sysadmin 固定服务器角色的成员才允许对数据库启用 CDC (变更数据捕获) 功能。
    通过下面命令查询 sa 用户是否开启 sysadmin

    ```sql
    exec sp_helpsrvrolemember 'sysadmin';
    ```

    <div align="center">
        <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-01.jpg width=70% heigth=70%/>
    </div>

2. 查询当前数据库是否启用 CDC（变更数据捕获能力）功能

    <div align="center">
        <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/%EF%BF%BCflink-sqlserver-02.jpg width=60% heigth=60%/>
    </div>

    备注：0：表示未启用；1：表示启用

    如未开启，则执行如下 sql 开启：

    ```sql
    use sstomo;
    exec sys.sp_cdc_enable_db;
    ```

3. 查询表是否已经启用 CDC (变更数据捕获) 功能

    ```sql
    select name,is_tracked_by_cdc from sys.tables where name = 'sqlserver_data';
    ```

    <div align="center">
        <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-03.jpg width=50% heigth=50%/>
    </div>

    备注：0：表示未启用；1：表示启用
    如未开启，则执行下面 sql 进行开启：

    ```sql
    use sstomo;
    exec sys.sp_cdc_enable_table 
    @source_schema = 'dbo', 
    @source_name = 'sqlserver_data', 
    @role_name = NULL, 
    @supports_net_changes = 0;
    ```

4. 表 sqlserver_data 启动 CDC (变更数据捕获) 功能配置完成

    查看数据库下的系统表，会发现多了些 cdc 相关数据表，其中 cdc.dbo_sqlserver_flink_CT 就是记录源表的所有 DML 操作记录，每个表对应一个实例表。

    <div align="center">
        <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-04.jpg width=50% heigth=50%/>
    </div>

5. 确认 CDC agent 是否正常启动

    执行下面命令查看 CDC agent 是否开启：

    ```sql
    exec master.dbo.xp_servicecontrol N'QUERYSTATE', N'SQLSERVERAGENT';
    ```

    如状态是 `Stopped`，则需要开启 CDC agent。

    <div align="center">
        <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-05.jpg width=50% heigth=50%/>
    </div>

    在 Windows 环境开启 CDC agent：
    在安装 SqlServer 数据库的机器上，打开 Microsoft Sql Server Managememt Studio，右击下图位置（SQL Server 代理），点击开启，如下图：

    <div align="center">
        <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-06.jpg width=50% heigth=50%/>
    </div>

    开启之后，再次查询 agent 状态，确认状态变更为 running

    <div align="center">
        <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-07.jpg width=50% heigth=50%/>
    </div>

    至此，表 sqlserver_data 启动 CDC (变更数据捕获) 功能全部完成。

### 在 MatrixOne 中创建目标库及表

```sql
create database sstomo;
use sstomo;
CREATE TABLE sqlserver_data (
     id int NOT NULL,
     name varchar(100) DEFAULT NULL,
     age int DEFAULT NULL,
     entrytime date DEFAULT NULL,
     gender char(1) DEFAULT NULL,
     PRIMARY KEY (id)
);
```

### 启动 flink

1. 复制 cdc jar 包

    将 `link-sql-connector-sqlserver-cdc-2.3.0.jar`、`flink-connector-jdbc_2.12-1.13.6.jar`、`mysql-connector-j-8.0.33.jar` 复制到 flink 的 lib 目录下。

2. 启动 flink

    切换到 flink 目录，并启动集群

    ```bash
    ./bin/start-cluster.sh
    ```

    启动 Flink SQL CLIENT

    ```bash
    ./bin/sql-client.sh
    ```

3. 开启 checkpoint

    ```bash
    SET execution.checkpointing.interval = 3s;
    ```

### 使用 flink ddl 创建 source/sink 表

```sql
-- 创建 source 表
CREATE TABLE sqlserver_source (
id INT,
name varchar(50),
age INT,
entrytime date,
gender varchar(100),
PRIMARY KEY (`id`) not enforced
) WITH( 
'connector' = 'sqlserver-cdc',
'hostname' = 'xx.xx.xx.xx',
'port' = '1433',
'username' = 'sa',
'password' = '123456',
'database-name' = 'sstomo',
'schema-name' = 'dbo',
'table-name' = 'sqlserver_data');

-- 创建 sink 表
CREATE TABLE sqlserver_sink (
id INT,
name varchar(100),
age INT,
entrytime date,
gender varchar(10),
PRIMARY KEY (`id`) not enforced
) WITH( 
'connector' = 'jdbc',
'url' = 'jdbc:mysql://xx.xx.xx.xx:6001/sstomo',
'driver' = 'com.mysql.cj.jdbc.Driver',
'username' = 'root',
'password' = '111',
'table-name' = 'sqlserver_data'
);

-- 将 source 表数据读取插入到 sink 表中
Insert into sqlserver_sink select * from sqlserver_source;
```

### 在 MatrixOne 中查询对应表数据

```sql
use sstomo;
select * from sqlserver_data;
```

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-08.jpg width=50% heigth=50%/>
</div>

### 在 SQL Server 中新增数据

在 SqlServer 表 sqlserver_data 中插入 3 条数据：

```sql
insert into sstomo.dbo.sqlserver_data (id, name, age, entrytime, gender)
values (7, 'Liss12a', 25, '2010-10-12', '0'),
      (8, '12233s', 26, '2013-10-12', '0'),
      (9, 'sgeq1', 304, '2010-10-12', '1');
```

在 MatrixOne 中查询对应表数据：

```sql
select * from sstomo.sqlserver_data;
```

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-09.jpg width=50% heigth=50%/>
</div>

### 在 SQL Server 中删除增数据

在 SQL Server 中删除 id 为 3 和 4 的两行：

```sql
delete from sstomo.dbo.sqlserver_data where id in(3,4);
```

在 mo 中查询表数据，这两行已同步删除：

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-10.jpg width=50% heigth=50%/>
</div>

### 在 SQL Server 中更新增数据

在 SqlServer 表中更新两行数据：

```sql
update sstomo.dbo.sqlserver_data set age = 18 where id in(1,2);
```

在 MatrixOne 中查询表数据，这两行已同步更新：

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/flink-sqlserver-11.jpg width=50% heigth=50%/>
</div>