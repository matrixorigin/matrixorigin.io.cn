# **连接 MatrixOne 服务**

## **准备工作**

请确保你已经完成了[安装单机版 MatrixOne](install-standalone-matrixone.md)。

你可以再新打开一个终端窗口，使用 MySQL 命令行客户端来连接 MatrixOne 服务。

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
