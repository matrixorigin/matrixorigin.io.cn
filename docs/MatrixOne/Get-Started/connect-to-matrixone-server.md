# **连接 MatrixOne 服务**

## **准备工作**

请确保你已经完成了[安装单机版 MatrixOne](install-standalone-matrixone.md)。

### 安装部署 MySQL 客户端

如果你没有安装其他

!!! note
    建议 MySQL 客户端版本为 8.0.30 版本及以上。

你可以在 <a href="https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install.html" target="_blank">MySQL Shell 官方文档</a>，按照官方指导安装，选择对应的操作系统，按照指导步骤完成 **MySQL 客户端** 的安装。

或者，你可以直接点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

安装完成后，打开终端，输入 `mysqlsh`，安装成功代码示例如下：

```
MySQL Shell 8.0.30

Copyright (c) 2016, 2022, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
MySQL  JS >
```

__Tips__: 目前，MatrixOne只兼容 Oracle MySQL 客户端，因此一些特性可能无法在 MariaDB、Percona 客户端下正常工作。

现在，你可以关掉 MySQL 客户端，重新打开一个新的终端，进入下一章节。

## **连接 MatrixOne 服务**

你可以使用 MySQL 命令行客户端来连接 MatrixOne 服务。

```
mysql -h IP -P PORT -uUsername -p
```

输入完成上述命令后，终端会提示你提供用户名和密码。你可以使用我们的内置帐号：

- user: dump
- password: 111

也可以使用 MySQL 客户端下述命令行，输入密码，来连接 MatrixOne 服务：

```
mysql -h 127.0.0.1 -P 6001 -udump -p
Enter password:
```

目前，MatrixOne 只支持TCP监听。

## 参考文档

更多有关连接 MatrixOne 的方式，参见[客户端连接 MatrixOne 服务](../Develop/connect-mo/client-connect-to-matrixone.md)、[JDBC 连接 MatrixOne 服务](../Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md)和[Python 连接 MatrixOne 服务](../Develop/connect-mo/python-connect-to-matrixone.md)。
