# **Linux 使用二进制包部署**

本篇文档将指导你使用二进制包在 Linux 环境中部署单机版 MatrixOne，这种安装方案无需安装前置依赖和编译源码包，可以直接通过 [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 工具帮助我们进行部署与管理 MatrixOne。

MatrixOne 支持 x86 及 ARM 的 Linux 系统。本文以 Debian11.1 x86 架构为例，展示如何完成全流程。如果使用 Ubuntu 系统，需要注意的是默认没有 root 权限，建议全流程命令都加 `sudo` 进行。

## 前置依赖参考

通过二进制包部署和安装 MatrixOne，仅需安装 `MySQL Client` 工具。

| 依赖软件     | 版本       |
| ------------ | ---------- |
| MySQL Client | 8.0 及以上 |

## 步骤 1：安装依赖

### 1. 安装下载工具

__Tips__: 建议你下载安装这两个下载工具其中之一，方便后续通过命令行下载 `MySQL Client` 和二进制包。

=== "安装 `wget`"

     `wget` 工具用来从指定的 URL 下载文件。`wget` 是专门的文件下载工具，它非常稳定，而且下载速度快。依次执行下面的命令安装 `wget`：

     ```
     ## 更新软件源列表缓存
     sudo apt update
     ## 安装 wget
     sudo apt install wget
     ```

     安装完成后请输入下面的命令进行验证：

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

### 2. 安装 MySQL Client

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

!!! note
    数据库系统在处理大量数据时（如 TPC-H 100G 测试），会使用内存映射文件来提高 I/O 性能。Linux 系统参数 vm.max_map_count 定义了进程可以拥有的虚拟内存区域数量，如果这个值设置得太低，数据库系统可能无法创建足够的内存映射区域来处理其日常操作，这可能导致数据库无法正常工作，如内存不足 (OOM) 和进程崩溃。为了提高 Matrixone 在 Linux 中运行的稳定性，建议将 vm.max_map_count 设置为一个较高的值，推荐值为 **262144**，这个值适用于大多数需要大量内存映射的场景。您可以通过命令 `sysctl -w vm.max_map_count = 262144` 使其临时生效，或修改配置文件 `/etc/sysctl.conf` 使其永久生效。

## 步骤 2：下载二进制包并解压

我们提供了两类二进制包：一类是依托 glibc 构建的，另一类是基于 musl libc 构建的。对于使用较旧操作系统版本的用户，可以选择使用基于 musl libc 构建的二进制包来进行部署。接下来，我们将详细解释两种安装包的下载流程：

### 基于 musl libc 构建的二进制包

=== "**下载方式一：`wget` 工具下载安装二进制包**"

     x86 架构系统安装包：

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-musl-x86_64.zip
     unzip mo-v1.2.3-musl-x86_64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-musl-arm64.zip
     unzip mo-v1.2.3-musl-arm64.zip
     ```

    如 github 原地址下载过慢，您可尝试从以下地址下载镜像包：

    ```
    wget https://githubfast.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-musl-xxx.zip
    ```
=== "**下载方式二：`curl` 工具下载二进制包**"

     x86 架构系统安装包：

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-musl-x86_64.zip
     unzip mo-v1.2.3-musl-x86_64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-musl-arm64.zip
     unzip mo-v1.2.3-musl-arm64.zip
     ```

    如 github 原地址下载过慢，您可尝试从以下地址下载镜像包：

    ```
    curl -OL https://githubfast.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-musl-xxx.zip
    ```

=== "**下载方式三：页面下载**"

     如果你想通过更直观的页面下载的方式下载，直接点击进入[版本 1.2.3](https://github.com/matrixorigin/matrixone/releases/tag/v1.2.3)，下拉找到 **Assets** 栏，点击安装包 *mo-v1.2.3-musl-x86_64.zip* 或者 *mo-v1.2.3-musl-arm64.zip* 下载再使用 ```unzip``` 命令解压即可。

### 基于 glibc 构建的二进制包

=== "**下载方式一：`wget` 工具下载安装二进制包**"

     x86 架构系统安装包：

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-linux-x86_64.zip
     unzip mo-v1.2.3-linux-x86_64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-linux-arm64.zip
     unzip mo-v1.2.3-linux-arm64.zip
     ```

    如 github 原地址下载过慢，您可尝试从以下地址下载镜像包：

    ```
    wget https://githubfast.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-linux-xxx.zip
    ```

=== "**下载方式二：`curl` 工具下载二进制包**"

     x86 架构系统安装包：

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-linux-x86_64.zip
     unzip mo-v1.2.--linux-x86_64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-linux-arm64.zip
     unzip mo-v1.2.3-linux-arm64.zip
     ```

    如 github 原地址下载过慢，您可尝试从以下地址下载镜像包：

    ```
    curl -OL https://githubfast.com/matrixorigin/matrixone/releases/download/v1.2.3/mo-v1.2.3-linux-xxx.zip
    ```

=== "**下载方式三：页面下载**"

     如果你想通过更直观的页面下载的方式下载，直接点击进入[版本 1.2.3](https://github.com/matrixorigin/matrixone/releases/tag/v1.2.3)，下拉找到 **Assets** 栏，点击安装包 *mo-v1.2.3-linux-x86_64.zip* 或者 *mo-v1.2.3-linux-arm64.zip* 下载再使用 ```unzip``` 命令解压即可。

## 步骤 3：安装 mo_ctl 工具

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 是一个部署安装和管理 MatrixOne 的命令行工具，使用它可以非常方便的对 MatrixOne 进行各类操作。如需获取完整的使用细节可以参考 [mo_ctl 工具指南](../../Reference/mo-tools/mo_ctl_standalone.md)。

### 1. 一键安装 mo_ctl 工具

通过以下命令可以一键安装 mo_ctl 工具。

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && bash +x ./install.sh
```

### 2. 设置 mo_ctl 的配置参数

通过以下命令调整参数：

```
mo_ctl set_conf MO_PATH="/yourpath/mo-v1.2.3-xx-xx" #设置MatrixOne路径为二进制解压文件目录
mo_ctl set_conf MO_CONF_FILE="/yourpath/mo-v1.2.3-xx-xx/etc/launch/launch.toml" #设置MatrixOne配置文件路径
mo_ctl set_conf MO_DEPLOY_MODE=binary #设置MatrixOne部署方式，此为二进制部署方式
```

## 步骤 4：启动 MatrixOne 服务

通过 `mo_ctl start` 命令一键启动 MatrixOne 服务。

如果运行正常将出现以下日志。MatrixOne 的相关运行日志会在 `/yourpath/mo-v1.2.3-xx-xx/matrixone/logs/` 中。

```
> mo_ctl start
2024-03-07 14:34:04.942 UTC+0800    [INFO]    No mo-service is running
2024-03-07 14:34:04.998 UTC+0800    [INFO]    Get conf succeeded: MO_DEPLOY_MODE="binary"
2024-03-07 14:34:05.024 UTC+0800    [INFO]    GO memory limit(Mi): 14745
2024-03-07 14:34:05.072 UTC+0800    [INFO]    Starting mo-service: cd /Users/admin/mo-v1.2.3-linux-arm64/ && GOMEMLIMIT=14745MiB /Users/admin/mo-v1.2.3-linux-arm64/mo-service -daemon -debug-http :9876 -launch /Users/admin/mo-v1.2.3-linux-arm64/etc/launch/launch.toml >/Users/admin/mo-v1.2.3-linux-arm64/matrixone/logs/stdout-20240307_143405.log 2>/Users/admin/mo-v1.2.3-linux-arm64/matrixone/logs/stderr-20240307_143405.log
2024-03-07 14:34:05.137 UTC+0800    [INFO]    Wait for 2 seconds
2024-03-07 14:34:07.261 UTC+0800    [INFO]    At least one mo-service is running. Process info: 
  501 27145     1   0  2:34下午 ??         0:00.18 /Users/admin/mo-v1.2.3-linux-arm64/mo-service -daemon -debug-http :9876 -launch /Users/admin/mo-v1.2.3-linux-arm64/etc/launch/launch.toml
2024-03-07 14:34:07.284 UTC+0800    [INFO]    List of pid(s): 
27145
2024-03-07 14:34:07.308 UTC+0800    [INFO]    Start succeeded
```

!!! note
    首次启动 MatrixOne 大致需要花费 20 至 30 秒的时间，在稍作等待后，你便可以连接至 MatrixOne。

## 步骤 5：连接 MatrixOne 服务

### 通过 `mo_ctl connect` 命令一键连接 MatrixOne 服务

这条命令将调用 MySQL Client 工具自动连接到 MatrixOne 服务。

```
> mo_ctl connect
2024-03-07 14:34:59.902 UTC+0800    [INFO]    Checking connectivity
2024-03-07 14:34:59.942 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 426
Server version: 8.0.30-MatrixOne-v1.2.3 MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

!!! note
    上述的连接和登录账号为初始账号 `root` 和密码 `111`，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt.md)。修改登录用户名或密码后重新登录同样需要通过 `mo_ctl set_conf` 的方式设置新的用户名和密码，详情可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。

### 通过 MySQL 命令行客户端来连接

```bash
mysql -h IP -P PORT -uUsername -p 
```

例如：

```bash
mysql -h 127.0.0.1 -P 6001 -uroot -p111
```