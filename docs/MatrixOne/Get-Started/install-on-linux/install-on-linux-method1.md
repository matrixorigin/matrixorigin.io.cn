# **Linux 使用源代码部署**

本篇文档将指导你使用源代码在 Linux 环境中部署单机版 MatrixOne。我们将采用 [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 工具帮助我们进行部署与管理 MatrixOne。

MatrixOne 支持 x86 及 ARM 的 Linux 系统。本文以 Debian11.1 x86 架构为例，展示如何完成全流程。如果使用 Ubuntu 系统，需要注意的是默认没有 root 权限，建议全流程命令都加 `sudo` 进行。

## 前置依赖参考

通过源码安装及使用单机版 MatrixOne，需要依赖于以下一些软件包。

| 依赖软件     | 版本          |
| ------------ | ------------- |
| golang       | 1.20 及以上   |
| gcc          | gcc8.5 及以上 |
| git          | 2.20 及以上   |
| MySQL Client | 8.0 及以上    |

## 步骤 1: 安装依赖

### 1. 安装部署 Go 语言

1. 点击 <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> 入到 **Go** 的官方文档，按照官方指导安装步骤完成 **Go** 语言的安装。

2. 验证 **Go** 是否安装，请执行代码 `go version`，安装成功代码行示例如下：

    ```
    go version go1.20.4 linux/amd64
    ```

### 2. 安装 GCC

1. Debian11.1 中一般已经自带 9.0 以上版本的 GCC，可以先用以下命令验证 GCC 环境是否需要安装。

    ```
    gcc -v
    bash: gcc: command not found
    ```

    如代码所示，未显示 GCC 的版本，则表示 **GCC** 的环境需要安装。

2. 点击 <a href="https://gcc.gnu.org/install/" target="_blank">GCC Download and install</a> 入到 **GCC** 的官方文档，按照官方指导安装步骤完成 **GCC** 的安装。

3. 验证 **GCC** 是否安装，请执行代码 `gcc -v`，安装成功代码行示例如下（只展示部分代码）：

    ```
    Using built-in specs.
    COLLECT_GCC=gcc
    ...
    Thread model: posix
    gcc version 9.3.1 20200408 (Red Hat 9.3.1-2) (GCC)
    ```

### 3. 安装 Git

1. 检查 Git 是否已支持。如代码所示，未显示 git 的版本，则表示 **git** 需要安装。

    ```
    git version
    -bash: git: command not found
    ```

2. 通过以下命令安装 Git。

    ```
    sudo apt install git
    ```

3. 验证 **Git** 是否安装，请执行代码 `git version`，安装成功代码行示例如下：

    ```
    git version
    git version 2.40.0
    ```

### 4. 安装 MySQL Client

Debian11.1 版本默认没有安装 MySQL Client，因此需要手动下载安装。

1. 安装 MySQL Client 需要用到 `wget` 下载工具，`wget` 是用来从指定的 URL 下载文件。依次执行下面的命令安装 `wget`：

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

    安装成功结果（仅展示一部分代码）如下：

    ```
    GNU Wget 1.21.3 built on linux-gnu.
    ...
    Copyright (C) 2015 Free Software Foundation, Inc.
    ...
    ```

2. 依次执行以下命令安装 MySQL Client：

    ```
    wget https://dev.mysql.com/get/mysql-apt-config_0.8.22-1_all.deb
    sudo dpkg -i ./mysql-apt-config_0.8.22-1_all.deb
    sudo apt update
    sudo apt install mysql-client
    ```

3. 执行命令 `mysql --version` 测试 MySQL 是否可用，安装成功结果如下：

    ```
    mysql --version
    mysql  Ver 8.0.33 for Linux on x86_64 (MySQL Community Server - GPL)
    ```

## 步骤 2: 安装 mo_ctl 工具

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 是一个部署安装和管理 MatrixOne 的命令行工具，使用它可以非常方便的对 MatrixOne 进行各类操作。如需获取完整的使用细节可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。

### 1. 一键安装 mo_ctl 工具

通过以下命令可以一键安装 mo_ctl 工具：

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && bash +x ./install.sh
```

安装完成以后，通过 `mo_ctl` 命令验证是否安装成功：

```
root@VM-16-2-debian:~# mo_ctl
Usage             : mo_ctl [option_1] [option_2]

[option_1]      : available: connect | ddl_connect | deploy | get_branch | get_cid | get_conf | help | pprof | precheck | restart | set_conf | sql | start | status | stop | uninstall | upgrade | watchdog
  1) connect      : connect to mo via mysql client using connection info configured
  2) ddl_convert  : convert ddl file to mo format from other types of database
  3) deploy       : deploy mo onto the path configured
  4) get_branch   : upgrade or downgrade mo from current version to a target commit id or stable version
  5) get_cid      : print mo git commit id from the path configured
  6) get_conf     : get configurations
  7) help         : print help information
  8) pprof        : collect pprof information
  9) precheck     : check pre-requisites for mo_ctl
  10) restart     : a combination operation of stop and start
  11) set_conf    : set configurations
  12) sql         : execute sql from string, or a file or a path containg multiple files
  13) start       : start mo-service from the path configured
  14) status      : check if there's any mo process running on this machine
  15) stop        : stop all mo-service processes found on this machine
  16) uninstall   : uninstall mo from path MO_PATH=/data/mo//matrixone
  17) upgrade     : upgrade or downgrade mo from current version to a target commit id or stable version
  18) watchdog    : setup a watchdog crontab task for mo-service to keep it alive
  e.g.            : mo_ctl status

  [option_2]      : Use " mo_ctl [option_1] help " to get more info
  e.g.            : mo_ctl deploy help
```

### 2. 设置 mo_ctl 的配置参数（选做）

mo_ctl 工具中有部分参数可能需要你进行调整设置，通过 `mo_ctl get_conf` 可以查看所有当前参数。

```
root@VM-16-2-debian:~# mo_ctl get_conf
2023-08-23 18:23:35.444 UTC+0800    [INFO]    Below are all configurations set in conf file /root/mo_ctl/conf/env.sh
MO_PATH="/data/mo/"
MO_LOG_PATH="${MO_PATH}/matrixone/logs"
MO_HOST="127.0.0.1"
MO_PORT="6001"
MO_USER="root"
MO_PW="111"
MO_DEPLOY_MODE="host"
MO_REPO="matrixorigin/matrixone"
MO_IMAGE_PREFIX="nightly"
MO_IMAGE_FULL=""
MO_CONTAINER_NAME="mo"
MO_CONTAINER_PORT="6001"
MO_CONTAINER_DEBUG_PORT="12345"
CHECK_LIST=("go" "gcc" "git" "mysql" "docker")
GCC_VERSION="8.5.0"
CLANG_VERSION="13.0"
GO_VERSION="1.20"
MO_GIT_URL="https://github.com/matrixorigin/matrixone.git"
MO_DEFAULT_VERSION="v1.1.0"
GOPROXY="https://goproxy.cn,direct"
STOP_INTERVAL="5"
START_INTERVAL="2"
MO_DEBUG_PORT="9876"
MO_CONF_FILE="${MO_PATH}/matrixone/etc/launch/launch.toml"
RESTART_INTERVAL="2"
PPROF_OUT_PATH="/tmp/pprof-test/"
PPROF_PROFILE_DURATION="30"
```

一般可能会需要调整的参数如下：

```
mo_ctl set_conf MO_PATH="/data/mo/matrixone" # 设置自定义的MatrixOne下载路径
mo_ctl set_conf MO_GIT_URL="https://ghproxy.com/https://github.com/matrixorigin/matrixone.git" #针对github原地址下载过慢问题，设置代理下载地址
mo_ctl set_conf MO_DEFAULT_VERSION="v1.1.0" # 设置所下载的MatrixOne版本
```

## 步骤 3：一键安装 MatrixOne

根据您的需要，选择最新的开发版本，还是获得稳定版本的代码。

=== "通过 MatrixOne (开发版本) 代码安装"

      **main** 分支是默认分支，主分支上的代码总是最新的，但不够稳定。

      ```
      mo_ctl deploy main
      ```

=== "通过 MatrixOne (稳定版本) 代码安装"

     ```
     mo_ctl deploy v1.1.0
     ```

## 步骤 4：启动 MatrixOne 服务

通过 `mo_ctl start` 命令一键启动 MatrixOne 服务。

如果运行正常将出现以下日志。MatrixOne 的相关运行日志会在 `/data/mo/logs/` 中。

```
root@VM-16-2-debian:~# mo_ctl start
2023-07-07_09:55:01    [INFO]    No mo-service is running
2023-07-07_09:55:01    [INFO]    Starting mo-service: cd /data/mo//matrixone/ && /data/mo//matrixone/mo-service -daemon -debug-http :9876 -launch /data/mo//matrixone/etc/launch/launch.toml >/data/mo//logs/stdout-20230707_095501.log 2>/data/mo//logs/stderr-20230707_095501.log
2023-07-07_09:55:01    [INFO]    Wait for 2 seconds
2023-07-07_09:55:03    [INFO]    At least one mo-service is running. Process info:
2023-07-07_09:55:03    [INFO]    root      748128       1  2 09:55 ?        00:00:00 /data/mo//matrixone/mo-service -daemon -debug-http :9876 -launch /data/mo//matrixone/etc/launch/launch.toml
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
Server version: 8.0.30-MatrixOne-v1.1.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

!!! note
    上述的连接和登录账号为初始账号 `root` 和密码 `111`，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt.md)。修改登录用户名或密码后重新登录同样需要通过 `mo_ctl set_conf` 的方式设置新的用户名和密码，详情可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。
