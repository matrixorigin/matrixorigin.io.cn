# mo_ctl 单机版工具指南

`mo_ctl` 单机版是一款帮助你对单机版 MatrixOne 进行部署安装、启停控制以及数据库连接等操作的命令行工具。

## 功能概览

`mo_ctl` 目前已适配过的操作系统如下表所示：

| 操作系统 | 版本                 |
| -------- | -------------------- |
| Debian   | 11 及以上            |
| Ubuntu   | 20.04 及以上         |
| macOS    | Monterey 12.3 及以上 |
|OpenCloudOS| v8.0 / v9.0 |
|Open  EulerOS  | 20.03 |
|TencentOS Server | v2.4 / v3.1 |
|统信  | V20 |
|银河麒麟 | V10 |
|麒麟信安 | v3.0 |

`mo_ctl` 目前的功能列表如下表所示。

| 命令                 | 功能                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `mo_ctl help`        | 查看`mo_ctl`工具本身的语句和功能列表                                                                   |
| `mo_ctl precheck`    | 检查 MatrixOne 源码安装所需要的依赖项，分别为 golang, gcc, git,MySQL Client                            |
| `mo_ctl deploy`      | 下载并安装及编译 MatrixOne 相应版本，默认为安装最新稳定版本                                            |
| `mo_ctl start`       | 启动 MatrixOne 服务                                                                                    |
| `mo_ctl status`      | 检查 MatrixOne 服务是否正在运行中                                                                      |
| `mo_ctl stop`        | 停止所有 MatrixOne 服务进程                                                                            |
| `mo_ctl restart`     | 重启 MatrixOne 服务                                                                                    |
| `mo_ctl connect`     | 调用 MySQL Client 连接 MatrixOne 服务                                                                  |
| `mo_ctl upgrade`     | 将 MatrixOne 从当前版本升级/降级到某个发布版本或者 commit id 版本                                         |
| `mo_ctl set_conf`    | 设置各类使用参数                                                                                       |
| `mo_ctl get_conf`    | 查看当前使用参数                                                                                       |
| `mo_ctl uninstall`   | 从 MO_PATH 路径下卸载 MatrixOne                                                                        |
| `mo_ctl watchdog`    | 设置一个定时任务保证 MatrixOne 服务可用性，每分钟检查 MatrixOne 的状态，如果发现服务中止则自动拉起服务 |
| `mo_ctl sql`         | 直接通过命令执行 SQL 或者 SQL 构成的文本文件                                                           |
| `mo_ctl ddl_convert` | 将 MySQL 的 DDL 语句转换成 MatrixOne 语句的工具                                                        |
| `mo_ctl get_cid`     | 查看当前使用 MatrixOne 下载仓库的源码版本                                                              |
| `mo_ctl get_branch`  | 查看当前使用 MatrixOne 下载仓库的分支版本                                                              |
| `mo_ctl pprof`       | 用于收集 MatrixOne 的性能分析数据                                                                      |

## 安装 mo_ctl

根据您是否有互联网访问权限，可以选择在线或离线安装 `mo_ctl` 工具，你需要注意始终以 root 或具有 sudo 权限执行命令（并在每个命令前添加 sudo）。同时，`install.sh` 将使用 `unzip` 命令来解压 `mo_ctl` 软件包，请确保已安装 `unzip` 命令。

### 在线安装

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/deploy/local/install.sh && sudo bash +x ./install.sh

# 备用地址
wget https://ghproxy.com/https://github.com/matrixorigin/mo_ctl_standalone/blob/main/install.sh && sudo bash +x install.sh
```

对于在 macOS 环境中运行此命令的用户，如果您是非 root 用户，请以以下语句运行 `install.sh`:

```
sudo -u $(whoami) bash +x ./install.sh
```

### 离线安装

```
# 1. 先将安装脚本下载到本地计算机，再上传到安装机器上
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/deploy/local/install.sh
wget https://github.com/matrixorigin/mo_ctl_standalone/archive/refs/heads/main.zip -O mo_ctl.zip

# 如 github 原地址下载过慢，您可尝试从以下镜像地址下载：
wget https://mirror.ghproxy.com/https://github.com/matrixorigin/mo_ctl_standalone/blob/main/install.sh
wget https://githubfast.com/matrixorigin/mo_ctl_standalone/archive/refs/heads/main.zip -O mo_ctl.zip

# 2. 从离线包安装
bash +x ./install.sh mo_ctl.zip
```

## 快速上手

可以通过以下步骤快速安装部署单机版 MatrixOne，详细指南可以查看[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md).

1. 使用命令 `mo_ctl help` 查看工具指南。

2. 使用命令 `mo_ctl precheck` 查看前置依赖条件是否满足。

3. 使用命令 `mo_ctl get_conf` 设置相关参数，可能用到的参数配置如下所示：

    ```
    mo_ctl set_conf MO_PATH="/data/mo/matrixone" #设置自定义的 MatrixOne 下载路径
    mo_ctl set_conf MO_GIT_URL="https://githubfast.com/matrixorigin/matrixone.git" #针对 github 原地址下载过慢问题，设置镜像下载地址
    ```

4. 使用命令 `mo_ctl deploy` 安装部署 MatrixOne 最新稳定版本。

5. 使用命令 `mo_ctl start` 启动 MatrixOne 服务。

6. 使用命令 `mo_ctl connect` 连接 MatrixOne 服务。

## 参考命令指南

### help - 打印参考指南

```
mo_ctl help
Usage             : mo_ctl [option_1] [option_2]

  [option_1]      : available: connect | ddl_connect | deploy | get_branch | get_cid | get_conf | help | pprof | precheck | query | restart | set_conf | sql | start | status | stop | uninstall | upgrade | watchdog
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
  16) uninstall   : uninstall mo from path MO_PATH=/data/mo/20230712_1228//matrixone
  17) upgrade     : upgrade or downgrade mo from current version to a target commit id or stable version
  18) watchdog    : setup a watchdog crontab task for mo-service to keep it alive
  e.g.            : mo_ctl status

  [option_2]      : Use " mo_ctl [option_1] help " to get more info
  e.g.            : mo_ctl deploy help
```

使用 `mo_ctl [option_1] help` 来获取下一级 `mo_ctl [option_1]` 功能的使用指南。

### precheck - 检查前置依赖条件

源码安装 MatrixOne 前使用 `mo_ctl precheck` 检查前置依赖条件，目前前置依赖于 `go`/`gcc`/`git`/`mysql(client)`。

```
mo_ctl precheck help
Usage         : mo_ctl precheck # check pre-requisites for mo_ctl
   Check list : go gcc git mysql
```

### deploy - 安装 MatrixOne

使用 `mo_ctl deploy [mo_version] [force]` 安装部署稳定版本 MatrixOne, 或某个指定版本，通过 `force` 选项可以将同一目录下已经存在的 MatrixOne 版本删除，强制重新安装新版本。

```
mo_ctl deploy help
Usage         : mo_ctl deploy [mo_version] [force] # deploy mo onto the path configured
  [mo_version]: optional, specify an mo version to deploy
  [force]     : optional, if specified will delete all content under MO_PATH and deploy from beginning
  e.g.        : mo_ctl deploy             # default, same as mo_ctl deploy 3.0.5
              : mo_ctl deploy main        # deploy development latest version
              : mo_ctl deploy d29764a     # deploy development version d29764a
              : mo_ctl deploy 3.0.5       # deploy stable verson 3.0.5
              : mo_ctl deploy force       # delete all under MO_PATH and deploy verson 3.0.5
              : mo_ctl deploy 3.0.5 force # delete all under MO_PATH and deploy stable verson 3.0.5 from beginning
```

### start - 启动 MatrixOne 服务

使用 `mo_ctl start` 启动 MatrixOne 服务，启动文件路径位于 `MO_PATH` 下。

```
mo_ctl start help
Usage         : mo_ctl start # start mo-service from the path configured
```

### stop - 停止 MatrixOne 服务

使用 `mo_ctl stop [force]` 停止本机器上所有 MatrixOne 服务，如果有多个 MatrixOne 服务在运行，也会全部停止。

```
 mo_ctl stop help
Usage         : mo_ctl stop [force] # stop all mo-service processes found on this machine
 [force]      : optional, if specified, will try to kill mo-services with -9 option, so be very carefully
  e.g.        : mo_ctl stop         # default, stop all mo-service processes found on this machine
              : mo_ctl stop force   # stop all mo-services with kill -9 command
```

### restart - 重启 MatrixOne 服务

使用 `mo_ctl restart [force]` 停止所有本机器上 MatrixOne 服务，并重启位于 `MO_PATH` 路径下的 MatrixOne 服务。

```
mo_ctl restart help
Usage         : mo_ctl restart [force] # a combination operation of stop and start
 [force]      : optional, if specified, will try to kill mo-services with -9 option, so be very carefully
  e.g.        : mo_ctl restart         # default, stop all mo-service processes found on this machine and start mo-serivce under path of conf MO_PATH
              : mo_ctl restart force   # stop all mo-services with kill -9 command and start mo-serivce under path of conf MO_PATH
```

### connect - 通过 mysql-client 连接 MatrixOne 服务

使用 `mo_ctl connect` 连接到 MatrixOne 服务，连接参数均由 `mo_ctl` 工具中设置。

```
mo_ctl connect help
Usage         : mo_ctl connect # connect to mo via mysql client using connection info configured
```

### status - 检查 MatrixOne 的状态

使用 `mo_ctl status` 来检查 MatrixOne 的运行状态，是否在运行中。

```
mo_ctl status help
Usage         : mo_ctl status # check if there's any mo process running on this machine
```

### get_cid - 打印 MatrixOne 代码提交 id

使用 `mo_ctl get_cid` 打印当前 `MO_PATH` 路径下的 MatrixOne 代码库提交 id。

```
mo_ctl get_cid help
Usage         : mo_ctl get_cid # print mo commit id from the path configured
```

### get_branch - 打印 MatrixOne 代码提交 id

使用 `mo_ctl get_branch` 打印当前 `MO_PATH` 路径下的 MatrixOne 代码库分支。

```
mo_ctl get_branch help
Usage           : mo_ctl get_branch        # print which git branch mo is currently on
```

### pprof -  收集性能信息

使用 `mo_ctl pprof [item] [duration]` 收集 MatrixOne 的相关性能信息，主要为开发人员进行调试使用。

```
mo_ctl pprof help
Usage         : mo_ctl pprof [item] [duration] # collect pprof information
  [item]      : optional, specify what pprof to collect, available: profile | heap | allocs
  1) profile  : default, collect profile pprof for 30 seconds
  2) heap     : collect heap pprof at current moment
  3) allocs   : collect allocs pprof at current moment
  [duration]  : optional, only valid when [item]=profile, specifiy duration to collect profile
  e.g.        : mo_ctl pprof
              : mo_ctl pprof profile    # collect duration will use conf value PPROF_PROFILE_DURATION from conf file or 30 if it's not set
              : mo_ctl pprof profile 30
              : mo_ctl pprof heap
```

### set_conf - 配置参数

使用 `mo_ctl set_conf [conf_list]` 配置 1 个或多个使用参数。

```
mo_ctl set_conf help
Usage         : mo_ctl setconf [conf_list] # set configurations
 [conf_list]  : configuration list in key=value format, seperated by comma
  e.g.        : mo_ctl setconf MO_PATH=/data/mo/matrixone,MO_PW=M@trix0riginR0cks,MO_PORT=6101  # set multiple configurations
              : mo_ctl setconf MO_PATH=/data/mo/matrixone                                       # set single configuration
```

!!! note
    当 set_conf 的设置的路径中包含变量如 `${MO_PATH}` 时，需要在 `$` 前加上 `\`，例如：
    ```bash
    mo_ctl set_conf MO_CONF_FILE="\${MO_PATH}/matrixone/etc/launch/launch.toml"

    ```

### get_conf - 获取参数列表

使用 `mo_ctl get_conf [conf_list]` 获取一个或多个当前配置项。

```
mo_ctl get_conf help
Usage         : mo_ctl getconf [conf_list] # get configurations
 [conf_list]  : optional, configuration list in key, seperated by comma.
              : use 'all' or leave it as blank to print all configurations
  e.g.        : mo_ctl getconf MO_PATH,MO_PW,MO_PORT  # get multiple configurations
              : mo_ctl getconf MO_PATH                # get single configuration
              : mo_ctl getconf all                    # get all configurations
              : mo_ctl getconf                        # get all configurations
```

#### mo_ctl get_conf - 详细参数列表

使用 `mo_ctl get_conf` 将打印当前工具使用的所有参数列表，它们的释义与取值范围如下表所示。

| 参数名称               | 功能                                                   | 取值规范                                              |
| ---------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| MO_PATH                | MatrixOne 的代码库及可执行文件存放位置                 | 文件夹路径                                            |
| MO_LOG_PATH            | MatrixOne 的日志存放位置                               | 文件夹路径，默认为${MO_PATH}/matrixone/logs           |
| MO_HOST                | 连接 MatrixOne 服务的 IP 地址                          | IP 地址，默认为 127.0.0.1                             |
| MO_PORT                | 连接 MatrixOne 服务的端口号                            | 端口号，默认为 6001                                   |
| MO_USER                | 连接 MatrixOne 服务使用的用户名                        | 用户名，默认为 root                                   |
| MO_PW                  | 连接 MatrixOne 服务使用的密码                          | 密码，默认为 111                                      |
| CHECK_LIST             | precheck 需要的检查依赖项                              | 默认为 ("go" "gcc" "git" "mysql")                     |
| GCC_VERSION            | precheck 检查的 gcc 版本                               | 默认为 8.5.0                                          |
| GO_VERSION             | precheck 检查的 go 版本                                | 默认为 1.22.3                                           |
| MO_GIT_URL             | MatrixOne 的源码拉取地址                               | 默认为<https://github.com/matrixorigin/matrixone.git> |
| MO_DEFAULT_VERSION     | 默认拉取的 MatrixOne 的版本                            | 默认为 3.0.5                                      |
| GOPROXY                | GOPROXY 的地址，一般为国内加速拉取 golang 依赖包而使用 | 默认为<https://goproxy.cn>,direct                     |
| STOP_INTERVAL          | 停止间隔，停止服务后检测服务状态等待时间               | 默认为 5 秒                                           |
| START_INTERVAL         | 启动间隔，启动服务后检测服务状态等待时间               | 默认为 2 秒                                           |
| MO_DEBUG_PORT          | MatrixOne 的 debug 端口，一般为开发人员使用            | 默认为 9876                                           |
| MO_CONF_FILE           | MatrixOne 的启动配置文件                               | 默认为${MO_PATH}/matrixone/etc/launch/launch.toml     |
| RESTART_INTERVAL       | 重启间隔，重启服务后检测服务状态等待时间               | 默认为 2 秒                                           |
| PPROF_OUT_PATH         | golang 的性能收集数据输出路径                          | 默认为/tmp/pprof-test/                                |
| PPROF_PROFILE_DURATION | golang 的性能收集时间                                  | 默认为 30 秒                                          |

### ddl_convert - DDL 格式转换

使用 `mo_ctl ddl_convert [options] [src_file] [tgt_file]` 将一个 DDL 文件从其他数据库语法格式转换成 MatrixOne 的 DDL 格式，目前仅有 `mysql_to_mo` 模式支持。

```
mo_ctl ddl_convert help
Usage           : mo_ctl ddl_convert [options] [src_file] [tgt_file] # convert a ddl file to mo format from other types of database
 [options]      : available: mysql_to_mo
 [src_file]     : source file to be converted, will use env DDL_SRC_FILE from conf file by default
 [tgt_file]     : target file of converted output, will use env DDL_TGT_FILE from conf file by default
  e.g.          : mo_ctl ddl_convert mysql_to_mo /tmp/mysql.sql /tmp/mo.sql
```

### sql - 执行 SQL

使用 `mo_ctl sql [sql]` 来执行 SQL 文本或者 SQL 文件。

```
mo_ctl sql help
Usage           : mo_ctl sql [sql]                 # execute sql from string, or a file or a path containg multiple files
  [sql]         : a string quote by "", or a file, or a path
  e.g.          : mo_ctl sql "use test;select 1;"  # execute sql "use test;select 1"
                : mo_ctl sql /data/q1.sql          # execute sql in file /data/q1.sql
                : mo_ctl sql /data/                # execute all sql files with .sql postfix in /data/
```

### uninstall - 卸载 MatrixOne

使用 `mo_ctl uninstall` 来从 MO_PATH 上卸载 MatrixOne。

```
mo_ctl uninstall help
Usage           : mo_ctl uninstall        # uninstall mo from path MO_PATH=/data/mo//matrixone
                                          # note: you will need to input 'Yes/No' to confirm before uninstalling
```

### upgrade - 升级/降级 MatrixOne 版本

MatrixOne 0.8 及更高版本可使用 `mo_ctl upgrade version` 或者 `mo_ctl upgrade commitid` 来将 MatrixOne 从当前版本升级或降级到某个稳定版本或者某个 commit id 版本。

```
mo_ctl upgrade help
Usage           : mo_ctl upgrade [version_commitid]   # upgrade or downgrade mo from current version to a target commit id or stable version
 [commitid]     : a commit id such as '38888f7', or a stable version such as '3.0.5'
                : use 'latest' to upgrade to latest commit on main branch if you don't know the id
  e.g.          : mo_ctl upgrade 38888f7              # upgrade/downgrade to commit id 38888f7 on main branch
                : mo_ctl upgrade latest               # upgrade/downgrade to latest commit on main branch
                : mo_ctl upgrade 3.0.5               # upgrade/downgrade to stable version 3.0.5
```

### watchdog - 保活 MatrixOne

使用 `mo_ctl watchdog [options]` 设置一个定时任务保证 MatrixOne 服务可用性，每分钟检查 MatrixOne 的状态，如果发现服务中止则自动拉起服务。

```
mo_ctl watchdog help
Usage           : mo_ctl watchdog [options]   # setup a watchdog crontab task for mo-service to keep it alive
 [options]      : available: enable | disable | status
  e.g.          : mo_ctl watchdog enable      # enable watchdog service for mo, by default it will check if mo-servie is alive and pull it up if it's dead every one minute
                : mo_ctl watchdog disable     # disable watchdog
                : mo_ctl watchdog status      # check if watchdog is enabled or disabled
                : mo_ctl watchdog             # same as mo_ctl watchdog status
```

<!--ddl_convert 的详细转换规则请参考 [该文档]()。-->
