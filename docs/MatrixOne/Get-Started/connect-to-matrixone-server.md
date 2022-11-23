# **连接单机版 MatrixOne 服务**

## **准备工作**

请确保你已经完成了[安装单机版 MatrixOne](install-standalone-matrixone.md)。

### 安装部署 MySQL 客户端

如果你没有安装其他

!!! note
    建议 MySQL 客户端版本为 8.0.30 版本及以上。

你可以在 <a href="https://dev.mysql.com/doc/refman/8.0/en/installing.html" target="_blank">Installing and Upgrading MySQL</a>，按照官方指导安装，选择对应的操作系统，按照指导步骤完成 **MySQL 客户端** 的安装。

或者，你可以直接点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

安装完成后，配置 MySQL 客户端环境变量：

1. 打开一个新的终端，输入如下命令：

    ```
    cd ~
    sudo vim .bash_profile
    ```

2. 回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码。

3. 输入完成  root 密码后，即进入了 *.bash_profile*，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

    ```
    export PATH=${PATH}:/usr/local/mysql/bin
    ```

4. 输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。

5. 输入命令 `source .bash_profile`，回车执行，运行环境变量。

6. 测试 MySQL 是否可用，输入命令 `mysql -u root -p`，回车执行，需要 root 用户密码，显示 `mysql>` 即表示 MySQL 客户端已开启。

7. 此时你可以输入 `exit` 退出，继续浏览下一章节**连接 MatrixOne 服务**。

__Tips__: 目前，MatrixOne只兼容 Oracle MySQL 客户端，因此一些特性可能无法在 MariaDB、Percona 客户端下正常工作。

## **连接 MatrixOne 服务**

你可以使用 MySQL 命令行客户端来连接 MatrixOne 服务。打开一个新的终端，直接输入以下指令：

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
