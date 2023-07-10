# **Linux 使用二进制包部署**

本篇文档将指导你使用二进制包在 Linux 环境中部署单机版 MatrixOne，这种安装方案无需安装前置依赖和编译源码包，可以直接通过 [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 工具帮助我们进行部署与管理 MatrixOne。

MatrixOne 支持 x86 及 ARM 的 Linux 系统。本文以 Debian11.1 x86 架构为例，展示如何完成全流程。如果使用 Ubuntu 系统，需要注意的是默认没有 root 权限，建议全流程命令都加 `sudo` 进行。

## 前置依赖参考

通过二进制包部署和安装 MatrixOne，仅需安装 `MySQL Client` 工具。

| 依赖软件     | 版本                          |
| ------------ | ----------------------------- |
| MySQL Client | 8.0 及以上                     |

## 步骤 1：安装依赖

### 安装下载工具

__Tips__: 建议你下载安装这两个下载工具其中之一，方便后续通过命令行下载 `MySQL Client` 和二进制包。

=== "安装 `wget`"

     `wget` 工具用来从指定的 URL 下载文件。`wget` 是专门的文件下载工具，它非常稳定，而且下载速度快。

     进入到<a href="https://brew.sh/" target="_blank">Homebrew</a>页面按照步骤提示，先安装 **Homebrew**，再安装 `wget`。 验证 `wget` 是否安装成功可以使用如下命令行：

     ```
     wget -V
     ```

     安装成功结果(仅展示一部分代码)如下：

     ```
     GNU Wget 1.21.3 built on linux-gnu.
     ...
     Copyright (C) 2015 Free Software Foundation, Inc.
     ...
     ```

=== "安装 `curl`"

     `curl` 是一个利用 URL 规则在命令行下工作的文件传输工具。`curl` 是综合传输工具，支持文件的上传和下载。

     进入到<a href="https://curl.se/download.html" target="_blank">Curl</a>官网按照官方指导安装 `curl`。 验证 `curl` 是否安装成功可以使用如下命令行：

     ```
     curl --version
     ```

     安装成功结果(仅展示一部分代码)如下：

     ```
     curl 7.84.0 (x86_64-pc-linux-gnu) libcurl/7.84.0 OpenSSL/1.1.1k-fips zlib/1.2.11
     Release-Date: 2022-06-27
     ...
     ```

### 安装 MySQL Client

Debian11.1 版本默认没有安装 MySQL Client，因此需要手动下载安装。

1. 依次执行以下命令：

    ```
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb
    sudo dpkg -i ./mysql-apt-config_0.8.22-1_all.deb
    sudo apt update
    sudo apt install mysql-client
    ```

2. 执行命令 `mysql --version` 测试 MySQL 是否可用，安装成功结果如下：

    ```
    mysql --version
    mysql  Ver 8.0.33 for Linux on x86_64 (MySQL Community Server - GPL)
    ```

## 步骤 2：下载二进制包并解压

**下载方式一**和**下载方式二**需要先安装下载工具 `wget` 货 `curl`，如果你未安装，请先安装下载工具。

=== "**下载方式一：`wget` 工具下载安装二进制包**"

     x86 架构系统安装包：

     ```bash
     mkdir /root/matrixone & cd /root/
     wget https://github.com/matrixorigin/matrixone/releases/download/v0.8.0/mo-v0.8.0-linux-amd64.zip
     unzip -d  matrixone/ mo-v0.8.0-linux-amd64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     mkdir /root/matrixone & cd /root/
     wget https://github.com/matrixorigin/matrixone/releases/download/v0.8.0/mo-v0.8.0-linux-arm64.zip
     unzip -d  matrixone/ mo-v0.8.0-linux-arm64.zip
     ```

=== "**下载方式二：`curl` 工具下载二进制包**"

     x86 架构系统安装包：

     ```bash
     mkdir /root/matrixone & cd /root/
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.8.0/mo-v0.8.0-linux-amd64.zip
     unzip -d  matrixone/ mo-v0.8.0-linux-amd64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     mkdir /root/matrixone & cd /root/
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.8.0/mo-v0.8.0-linux-arm64.zip
     unzip -d  matrixone/ mo-v0.8.0-linux-arm64.zip
     ```

=== "**下载方式三：页面下载**"

     如果你想通过更直观的页面下载的方式下载，直接点击进入[版本 0.8.0](https://github.com/matrixorigin/matrixone/releases/tag/v0.8.0)，下拉找到 **Assets** 栏，点击安装包 *mo-v0.8.0-linux-amd64.zip* 或者 *mo-v0.8.0-linux-arm64.zip* 下载即可。

## 步骤 3：安装 mo_ctl 工具

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 是一个部署安装和管理 MatrixOne 的命令行工具，使用它可以非常方便的对 MatrixOne 进行各类操作。如需获取完整的使用细节可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。

### 1. 一键安装 mo_ctl 工具

通过以下命令可以一键安装 mo_ctl 工具。

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && bash +x ./install.sh
```

### 2. 设置 mo_ctl 的配置参数

通过以下命令将 MatrixOne 的二进制解压文件目录设置到 mo_ctl 的 `MO_PATH` 参数上。mo_ctl 会自动寻找位于 `MO_PATH` 中的 `matrixone` 文件夹。

```
mo_ctl set_conf MO_PATH="/root/"
```

## 步骤 4：启动 MatrixOne 服务

通过 `mo_ctl start` 命令一键启动 MatrixOne 服务。

如果运行正常将出现以下日志。MatrixOne 的相关运行日志会在 `/data/mo/logs/` 中。

```
root@VM-16-2-debian:~# mo_ctl start
2023-07-07_09:55:01    [INFO]    No mo-service is running
2023-07-07_09:55:01    [INFO]    Starting mo-service: cd /data/mo//matrixone/ && /data/mo//matrixone/mo-service -daemon -debug-http :9876 -launch /data/mo//matrixone/etc/launch-tae-CN-tae-DN/launch.toml >/data/mo//logs/stdout-20230707_095501.log 2>/data/mo//logs/stderr-20230707_095501.log
2023-07-07_09:55:01    [INFO]    Wait for 2 seconds
2023-07-07_09:55:03    [INFO]    At least one mo-service is running. Process info:
2023-07-07_09:55:03    [INFO]    root      748128       1  2 09:55 ?        00:00:00 /data/mo//matrixone/mo-service -daemon -debug-http :9876 -launch /data/mo//matrixone/etc/launch-tae-CN-tae-DN/launch.toml
2023-07-07_09:55:03    [INFO]    Pids:
2023-07-07_09:55:03    [INFO]    748128
2023-07-07_09:55:03    [INFO]    Start succeeded
```

!!! note
    首次启动 MatrixOne 大致需要花费 20 至 30 秒的时间，在稍作等待后，你便可以连接至 MatrixOne。

## 步骤 5：连接 MatrixOne 服务

通过 `mo_ctl connect` 命令一键连接 MatrixOne 服务。

这条命令将调用 MySQL Client 工具自动连接到 MatrixOne 服务。

```
root@VM-16-2-debian:~# mo_ctl connect
2023-07-07_10:30:20    [INFO]    Checking connectivity
2023-07-07_10:30:20    [INFO]    Ok, connecting for user ...
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 15
Server version: 8.0.30-MatrixOne-v0.8.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

!!! note
    上述的连接和登录账号为初始账号 `root` 和密码 `111`，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt/)。修改登录用户名或密码后重新登录同样需要通过 `mo_ctl set_conf` 的方式设置新的用户名和密码，详情可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。
