# 使用 SeaTunnel 将数据写入 MatrixOne

## 概述

[SeaTunnel](https://seatunnel.apache.org/) 是一个分布式、高性能、易扩展的数据集成平台，专注于海量数据（包括离线和实时数据）同步和转化。MatrixOne 支持使用 SeaTunnel 从其他数据库同步数据，可以稳定高效地处理数百亿条数据。

本文档将介绍如何使用 SeaTunnel 向 MatrixOne 中写入数据。

## 开始前准备

在使用 SeaTunnel 向 MatrixOne 写入数据之前，请确保完成以下准备工作：

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。

- 已完成[安装 SeaTunnel Version 2.3.3](https://www.apache.org/dyn/closer.lua/seatunnel/2.3.3/apache-seatunnel-2.3.3-bin.tar.gz)。安装完成后，可以通过 shell 命令行定义 SeaTunnel 的安装路径：

```shell
export SEATNUNNEL_HOME="/root/seatunnel"
```

## 操作步骤

### 创建测试数据

1. 创建名为 `test1` 的 MySQL 数据库，并在其中创建名为 `test_table` 的表，存储在 root 下的 `mysql.sql` 中。以下是 MySQL 的 DDL 语句：

    ```sql
    create database test1;
    use test1;
    CREATE TABLE `test_table` (
      `name` varchar(255) DEFAULT NULL,
      `age` int(11) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
    ```

2. 使用 [mo_ctl](https://docs.matrixorigin.cn/1.1.1/MatrixOne/Maintain/mo_ctl/) 工具将 MySQL 的 DDL 语句直接导入至 MatrixOne。执行以下命令：

    ```shell
    mo_ctl sql /root/mysql.sql
    ```

### 安装 Connectors 插件

本篇文档中将介绍如何使用 SeaTunnel 的 `connector-jdbc` 连接插件连接 MatrixOne。

1. 在 SeaTunnel 的 `${SEATNUNNEL_HOME}/config/plugin_config` 文件中，添加以下内容：

    ```shell
    --connectors-v2--
    connector-jdbc
    --end--
    ```

2. 版本 2.3.3 的 SeaTunnel 二进制包默认不提供连接器依赖项，你需要在首次使用 SeaTunnel 时，执行以下命令来安装连接器：

    ```shell
    sh bin/install-plugin.sh 2.3.3
    ```

    __Note:__ 本篇文档中使用 SeaTunnel 引擎将数据写入 MatrixOne，无需依赖 Flink 或 Spark。

## 定义任务配置文件

在本篇文档中，我们使用 MySQL 数据库的 `test_table` 表作为数据源，不进行数据处理，直接将数据写入 MatrixOne 数据库的 `test_table` 表中。

那么，由于数据兼容性的问题，需要配置任务配置文件 `${SEATNUNNEL_HOME}/config/v2.batch.config.template`，它定义了 SeaTunnel 启动后的数据输入、处理和输出方式和逻辑。

按照以下内容编辑配置文件：

```shell
env {
  execution.parallelism = 2
  job.mode = "BATCH"
}

source {
    Jdbc {
        url = "jdbc:mysql://192.168.110.40:3306/test"
        driver = "com.mysql.cj.jdbc.Driver"
        connection_check_timeout_sec = 100
        user = "root"
        password = "123456"
        query = "select * from test_table"
    }
}

transform {

}

sink {
   jdbc {
        url = "jdbc:mysql://192.168.110.248:6001/test"
        driver = "com.mysql.cj.jdbc.Driver"
        user = "root"
        password = "111"
        query = "insert into test_table(name,age) values(?,?)"
   }
}
```

### 安装数据库依赖项

下载 [mysql-connector-java-8.0.33.jar](https://downloads.mysql.com/archives/get/p/3/file/mysql-connector-j-8.0.33.zip)，并将文件复制到 `${SEATNUNNEL_HOME}/plugins/jdbc/lib/` 目录下。

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
Start Time                : 2023-08-07 16:45:02
End Time                  : 2023-08-07 16:45:05
Total Time(s)             :                   3
Total Read Count          :             5000000
Total Write Count         :             5000000
Total Failed Count        :                   0
***********************************************
```

你已经成功将数据从 MySQL 数据库同步写入到 MatrixOne 数据库中。
