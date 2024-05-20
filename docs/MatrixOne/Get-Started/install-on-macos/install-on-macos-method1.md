# **macOS 使用源代码部署**

本篇文档将指导你使用源代码在 macOS 环境中部署单机版 MatrixOne。我们将采用 [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 工具帮助我们进行部署与管理 MatrixOne。

MatrixOne 支持 x86 及 ARM 的 macOS 系统，本文以 Macbook M1 ARM 版本为例子展示整个部署过程。

## 前置依赖参考

通过源码安装及使用单机版 MatrixOne，需要依赖于以下一些软件包。

| 依赖软件     | 版本                            |
| ------------ | ------------------------------- |
| golang       | 1.20 及以上                     |
| gcc/clang    | gcc8.5 及以上，clang13.0 及以上 |
| git          | 2.20 及以上                     |
| MySQL Client | 8.0 及以上                      |

## 步骤 1：安装依赖

### 1. 安装部署 Go 语言

1. 点击 <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> 进入到 **Go** 的官方文档，按照官方指导安装步骤完成 **Go** 语言的安装。

2. 验证 **Go** 是否安装，请执行代码 `go version`，安装成功代码行示例如下：

    ```
    > go version
    go version go1.20.5 darwin/arm64
    ```

### 2. 安装 GCC/Clang

1. macOS 中一般已经自带 Clang 编译器，其与 GCC 基本起到相同作用。验证 **GCC/Clang** 环境是否需要安装：

    ```
    gcc -v
    bash: gcc: command not found
    ```

    如代码所示，未显示 GCC 或 Clang 的版本，则表示 **GCC/Clang** 的环境需要安装。

2. 你可以选择点击 <a href="https://gcc.gnu.org/install/" target="_blank">GCC Download and install</a> 进入到 **GCC** 的官方文档，按照官方指导安装步骤完成 **GCC** 的安装。或者也可以通过 Apple 官方的 [Xcode](https://www.ics.uci.edu/~pattis/common/handouts/macclion/clang.html) 进行 Clang 的安装。

3. 验证 **GCC/Clang** 是否安装，请执行代码 `gcc -v`，无论显示的是 Clang 或者 GCC 版本均说明安装成功，示例如下：

    ```
    Apple clang version 14.0.3 (clang-1403.0.22.14.1)
    Target: arm64-apple-darwin22.5.0
    Thread model: posix
    InstalledDir: /Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin
    ```

### 3. 安装 Git

通过[官方文档](https://git-scm.com/download/mac)安装 Git。

使用 `git version` 检查是否安装成功，安装成功代码示例如下：

```
> git version
git version 2.40.0
```

### 4. 安装 MySQL Client

1. 点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System > macOS**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

2. 配置 MySQL 客户端环境变量：

    1. 打开一个新的终端，输入如下命令：

        ```
        vim ~/.bash_profile
        ```

    2. 回车执行上面的命令后，即进入了 *bash_profile*，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

        ```
        export PATH=${PATH}:/usr/local/mysql/bin
        ```

3. 输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。

4. 执行命令 `source ~/.bash_profile`，回车执行，运行环境变量。

5. 测试 MySQL 是否可用：

    执行命令 `mysql --version`，安装成功提示：`mysql  Ver 8.0.31 for macos12 on arm64 (MySQL Community Server - GPL)`。

## 步骤 2：安装 mo_ctl 工具

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 是一个部署安装和管理 MatrixOne 的命令行工具，使用它可以非常方便的对 MatrixOne 进行各类操作。如需获取完整的使用细节可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。

1. 先安装 `wget` 下载工具：进入到 <a href="https://brew.sh/" target="_blank">Homebrew</a> 页面按照步骤提示，先安装 **Homebrew**，再安装 `wget`。验证 `wget` 是否安装成功可以使用如下命令行：

     ```
     wget -V
     ```

     安装成功结果（仅展示一部分代码）如下：

     ```
     GNU Wget 1.21.3 在 darwin21.3.0 上编译。
     ...
     Copyright © 2015 Free Software Foundation, Inc.
     ...
     ```

2. 通过以下命令一键安装 mo_ctl 工具：

    ```
    wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && sudo -u $(whoami) bash +x ./install.sh
    ```

3. 安装完成以后，通过 `mo_ctl` 命令验证是否安装成功，成功代码示例如下：

```
> mo_ctl
  Usage             : mo_ctl [option_1] [option_2]

  [option_1]      : available: auto_backup | auto_clean_logs | backup | clean_backup | clean_logs | connect | csv_convert | ddl_convert | deploy | get_branch | get_cid | get_conf | help | monitor | pprof | precheck | restart | set_conf | sql | start | status | stop | uninstall | upgrade | version | watchdog
  auto_backup     : setup a crontab task to backup your databases automatically
  auto_clean_logs : set up a crontab task to clean system log table data automatically
  backup          : create a backup of your databases manually
  build_image     : build an MO image from source code
  clean_backup    : clean old backups older than conf 31 days manually
  clean_logs      : clean system log table data manually
  connect         : connect to mo via mysql client using connection info configured
  csv_convert     : convert a csv file to a sql file in format "insert into values" or "load data inline format='csv'"
  ddl_convert     : convert a ddl file to mo format from other types of database
  deploy          : deploy mo onto the path configured
  get_branch      : upgrade or downgrade mo from current version to a target commit id or stable version
  get_cid         : print mo git commit id from the path configured
  get_conf        : get configurations
  help            : print help information
  monitor         : monitor system related operations
  pprof           : collect pprof information
  precheck        : check pre-requisites for mo_ctl
  restart         : a combination operation of stop and start
  set_conf        : set configurations
  sql             : execute sql from string, or a file or a path containg multiple files
  start           : start mo-service from the path configured
  status          : check if there's any mo process running on this machine
  stop            : stop all mo-service processes found on this machine
  uninstall       : uninstall mo from path MO_PATH=/Users/admin/mo//matrixone
  upgrade         : upgrade or downgrade mo from current version to a target commit id or stable version
  version         : show mo_ctl and matrixone version
  watchdog        : setup a watchdog crontab task for mo-service to keep it alive
  e.g.            : mo_ctl status

  [option_2]      : Use " mo_ctl [option_1] help " to get more info
  e.g.            : mo_ctl deploy help
```

### 设置 mo_ctl 的配置参数

mo_ctl 工具中有部分参数可能需要你进行调整设置，通过 `mo_ctl get_conf` 可以查看所有当前参数。

```
> mo_ctl get_conf
2023-07-07_15:31:24    [INFO]    Below are all configurations set in conf file /Users/username/mo_ctl/conf/env.sh
MO_PATH="/Users/username/mo/matrixone"
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
MO_DEFAULT_VERSION="v1.2.0"
GOPROXY="https://goproxy.cn,direct"
STOP_INTERVAL="5"
START_INTERVAL="2"
MO_DEBUG_PORT="9876"
MO_CONF_FILE="${MO_PATH}/matrixone/etc/launch/launch.toml"
RESTART_INTERVAL="2"
PPROF_OUT_PATH="/tmp/pprof-test/"
PPROF_PROFILE_DURATION="30"
```

需要调整的参数如下：

```
mo_ctl set_conf MO_PATH="yourpath" # 设置自定义的MatrixOne下载路径
mo_ctl set_conf MO_GIT_URL="https://githubfast.com/matrixorigin/matrixone.git" #针对github原地址下载过慢问题，设置镜像下载地址
mo_ctl set_conf MO_DEFAULT_VERSION="v1.2.0" # 设置所下载的MatrixOne版本
mo_ctl set_conf MO_DEPLOY_MODE=git #设置MatrixOne部署方式，此为源码部署方式
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
     mo_ctl deploy v1.2.0
     ```

## 步骤 4：启动 MatrixOne 服务

通过 `mo_ctl start` 命令一键启动 MatrixOne 服务。

如果运行正常将出现以下日志。MatrixOne 的相关运行日志会在 `/yourpath/matrixone/logs/` 中。

```
> mo_ctl start
2023-07-07_15:33:45    [INFO]    No mo-service is running
2023-07-07_15:33:45    [INFO]    Starting mo-service: cd /Users/username/mo/matrixone/matrixone/ && /Users/username/mo/matrixone/matrixone/mo-service -daemon -debug-http :9876 -launch /Users/username/mo/matrixone/matrixone/etc/launch/launch.toml >/Users/username/mo/matrixone/matrixone/logs/stdout-20230707_153345.log 2>/Users/username/mo/matrixone/matrixone/logs/stderr-20230707_153345.log
2023-07-07_15:33:45    [INFO]    Wait for 2 seconds
2023-07-07_15:33:48    [INFO]    At least one mo-service is running. Process info:
2023-07-07_15:33:48    [INFO]      501 66932     1   0  3:33PM ??         0:00.27 /Users/username/mo/matrixone/matrixone/mo-service -daemon -debug-http :9876 -launch /Users/username/mo/matrixone/matrixone/etc/launch/launch.toml
2023-07-07_15:33:48    [INFO]    Pids:
2023-07-07_15:33:48    [INFO]    66932
2023-07-07_15:33:48    [INFO]    Start succeeded
```

!!! note
    首次启动 MatrixOne 大致需要花费 20 至 30 秒的时间，在稍作等待后，你便可以连接至 MatrixOne。

## 步骤 5：连接 MatrixOne 服务

通过 `mo_ctl connect` 命令一键连接 MatrixOne 服务。

这条命令将调用 MySQL Client 工具自动连接到 MatrixOne 服务。

```
> mo_ctl connect
2023-07-07_10:30:20    [INFO]    Checking connectivity
2023-07-07_10:30:20    [INFO]    Ok, connecting for user ...
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 15
Server version: 8.0.30-MatrixOne-v1.2.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

!!! note
    上述的连接和登录账号为初始账号 `root` 和密码 `111`，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt.md)。修改登录用户名或密码后重新登录同样需要通过 `mo_ctl set_conf` 的方式设置新的用户名和密码，详情可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。
