# 使用 SeaTunnel 将数据写入 MatrixOne

本文档将介绍如何使用 SeaTunnel 将 Oracle 数据写入 MatrixOne。

## 开始前准备

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。

- 已完成[安装 Oracle 19c](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html)。

- 已完成[安装 SeaTunnel Version 2.3.3](https://www.apache.org/dyn/closer.lua/seatunnel/2.3.3/apache-seatunnel-2.3.3-bin.tar.gz)。安装完成后，可以通过 shell 命令行定义 SeaTunnel 的安装路径：

```shell
export SEATNUNNEL_HOME="/root/seatunnel"
```

- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

- 下载 ojdbc8-23.3.0.23.09.jar，并将文件复制到 ${SEATNUNNEL_HOME}/plugins/jdbc/lib/ 目录下。

## 操作步骤

### 在 Oracle 使用 scott 用户创建测试数据

本次使用 Oracle 中用户 scott 来创建表（当然也可以用其他用户），在 Oracle 19c 中，scott 用户需要手动创建，可以使用 sqlplus 工具通过命令将其解锁。

- 访问数据库

```sql
sqlplus / as sysdba
```

- 创建 scott 用户，并指定密码

```sql
create user scott identified by tiger;
```

- 为方便测试使用，我们授予 scott dba 角色：

```sql
grant dba to scott;
```

- 后续就可以通过 scott 用户登陆访问：

```sql
sqlplus scott/tiger
```

- 在 Oracle 中创建测试数据

```sql
create table employees_oracle(
id number(5),
name varchar(20)
);

insert into employees_oracle values(1,'zhangsan');
insert into employees_oracle values(2,'lisi');
insert into employees_oracle values(3,'wangwu');
insert into employees_oracle values(4,'oracle');
COMMIT;
--查看表数据：
select * from employees_oracle;
```

### 在 MatrixOne 中提前建表

由于 SeaTunnel 只能同步数据，不能同步表结构，所以在执行任务前，我们需要先在目标数据库（mo）中手动创建好表。

```sql
CREATE TABLE `oracle_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`)
) ;
```

### 安装 Connectors 插件

接着介绍如何使用 SeaTunnel 的 `connector-jdbc` 连接插件连接 MatrixOne。

1. 在 SeaTunnel 的 `${SEATNUNNEL_HOME}/config/plugin_config` 文件中，添加以下内容：

    ```conf
    --connectors-v2--
    connector-jdbc
    --end--
    ```

2. 版本 2.3.3 的 SeaTunnel 二进制包默认不提供连接器依赖项，你需要在首次使用 SeaTunnel 时，执行以下命令来安装连接器：

    ```shell
    sh bin/install-plugin.sh 2.3.3
    ```

    __Note:__ 本篇文档中使用 SeaTunnel 引擎将数据写入 MatrixOne，无需依赖 Flink 或 Spark。

### 定义任务配置文件

在本节中，我们使用 Oracle 数据库的 `employees_oracle` 表作为数据源，不进行数据处理，直接将数据写入 MatrixOne 数据库的 `oracle_datax` 表中。

那么，由于数据兼容性的问题，需要配置任务配置文件 `${SEATNUNNEL_HOME}/config/v2.batch.config.template`，它定义了 SeaTunnel 启动后的数据输入、处理和输出方式和逻辑。

按照以下内容编辑配置文件：

```conf
env {
  # You can set SeaTunnel environment configuration here
  execution.parallelism = 10
  job.mode = "BATCH"
  #execution.checkpoint.interval = 10000
  #execution.checkpoint.data-uri = "hdfs://localhost:9000/checkpoint"
}

source {
    Jdbc {
        url = "jdbc:oracle:thin:@xx.xx.xx.xx:1521:ORCLCDB"
        driver = "oracle.jdbc.OracleDriver"
        user = "scott"
        password = "tiger"
        query = "select * from employees_oracle"
    }
}

sink {
   Jdbc {
        url = "jdbc:mysql://xx.xx.xx.xx:6001/test"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "root"
        password = "111"
        query = "insert into oracle_datax values(?,?)"
   }
}
```

### 运行 SeaTunnel 应用

执行以下命令启动 SeaTunnel 应用：

```shell
./bin/seatunnel.sh --config ./config/v2.batch.config.template -e local
```

### 查看运行结果

SeaTunnel 运行结束后，将显示类似以下的统计结果，汇总了本次写入的用时、总读取数据数量、总写入数量以及总写入失败数量：

```shell
***********************************************
           Job Statistic Information
***********************************************
Start Time : 2023-08-07 16:45:02
End Time : 2023-08-07 16:45:05
Total Time(s) :                       3
Total Read Count :                   4
Total Write Count :                   4
Total Failed Count :                   0
***********************************************
```

你已经成功将数据从 Oracle 数据库同步写入到 MatrixOne 数据库中。
