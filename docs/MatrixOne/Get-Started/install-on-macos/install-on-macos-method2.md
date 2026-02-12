# **macOS 使用二进制包部署**

本篇文档将指导你使用二进制包在 macOS 环境中部署单机版 MatrixOne，这种安装方案无需安装前置依赖和编译源码包，可以直接通过 [mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 工具帮助我们进行部署与管理 MatrixOne。

MatrixOne 支持 x86 及 ARM 两种架构的 macOS 系统，本文以 Macbook M1 ARM 版本为例展示整个部署过程。

## 前置依赖参考

通过二进制包部署和安装 MatrixOne，仅需安装 `MySQL Client` 工具。

| 依赖软件     | 版本       |
| ------------ | ---------- |
| MySQL Client | 8.0 及以上 |

## 步骤 1：安装依赖

### 安装 MySQL Client

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

## 步骤 2：下载二进制包并解压

### 1. 安装下载工具

__Tips__: 建议你下载安装这两个下载工具其中之一，方便后续通过命令行下载二进制包。

=== "安装 `wget`"

     `wget` 工具用来从指定的 URL 下载文件。`wget` 是专门的文件下载工具，它非常稳定，而且下载速度快。

     进入到<a href="https://brew.sh/" target="_blank">Homebrew</a>页面按照步骤提示，先安装 **Homebrew**，再安装 `wget`。 验证 `wget` 是否安装成功可以使用如下命令行：

     ```
     wget -V
     ```

     安装成功结果(仅展示一部分代码)如下：

     ```
     GNU Wget 1.21.3 在 darwin21.3.0 上编译。
     ...
     Copyright © 2015 Free Software Foundation, Inc.
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
     curl 7.84.0 (x86_64-apple-darwin22.0) libcurl/7.84.0 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.21 nghttp2/1.47.0
     Release-Date: 2022-06-27
     ...
     ```

### 2. 下载二进制包并解压

**下载方式一**和**下载方式二**需要先安装下载工具 `wget` 或 `curl`，如果你未安装，请先自行安装下载工具。

=== "**下载方式一：`wget` 工具下载安装二进制包**"

     x86 架构系统安装包：

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v3.0.6/mo-v3.0.6-darwin-x86_64.zip
     unzip mo-v3.0.6-darwin-x86_64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v3.0.6/mo-v3.0.6-darwin-arm64.zip
     unzip mo-v3.0.6-darwin-arm64.zip
     ```

    如 github 原地址下载过慢，您可尝试从以下地址下载镜像包：

    ```
    wget https://githubfast.com/matrixorigin/matrixone/releases/download/v3.0.6/mo-v3.0.6-darwin-xxx.zip
    ```

=== "**下载方式二：`curl` 工具下载二进制包**"

     x86 架构系统安装包：

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v3.0.6/mo-v3.0.6-darwin-x86_64.zip
     unzip mo-v3.0.6-darwin-x86_64.zip
     ```

     ARM 架构系统安装包：

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v3.0.6/mo-v3.0.6-darwin-arm64.zip
     unzip mo-v3.0.6-darwin-arm64.zip
     ```

    如 github 原地址下载过慢，您可尝试从以下地址下载镜像包：

    ```
    curl -OL https://githubfast.com/matrixorigin/matrixone/releases/download/v3.0.6/mo-v3.0.6-darwin-xxx.zip
    ```

=== "**下载方式三：页面下载**"

     如果你想通过更直观的页面下载的方式下载，直接点击进入[版本 3.0.6](https://github.com/matrixorigin/matrixone/releases/tag/v3.0.6)，下拉找到 **Assets** 栏，点击安装包 *mo-v3.0.6-darwin-x86_64.zip* 或 *mo-v3.0.6-darwin-arm64.zip* 下载即可。

## 步骤 3：安装 mo_ctl 工具

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 是一个部署安装和管理 MatrixOne 的命令行工具，使用它可以非常方便的对 MatrixOne 进行各类操作。如需获取完整的使用细节可以参考 [mo_ctl 工具指南](../../Reference/mo-tools/mo_ctl_standalone.md)。

- 一键安装 mo_ctl 工具

通过以下命令可以一键安装 mo_ctl 工具。

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/deploy/local/install.sh && sudo -u $(whoami) bash +x ./install.sh
```

- 设置 mo_ctl 的配置参数

通过以下命令调整参数：

```
mo_ctl set_conf MO_PATH="/yourpath/mo-v3.0.6-xx-xx" #设置MatrixOne路径为二进制解压文件目录
mo_ctl set_conf MO_CONF_FILE="/yourpath/mo-v3.0.6-xx-xx/etc/launch/launch.toml" #设置MatrixOne配置文件路径
mo_ctl set_conf MO_DEPLOY_MODE=binary #设置MatrixOne部署方式，此为二进制部署方式
```

## 步骤 4：启动 MatrixOne 服务

通过 `mo_ctl start` 命令一键启动 MatrixOne 服务。

如果运行正常将出现以下日志。MatrixOne 的相关运行日志会在 `/yourpath/mo-v3.0.6-xx-xx/matrixone/logs/` 中。

```
> mo_ctl start
2024-03-07 14:34:04.942 UTC+0800    [INFO]    No mo-service is running
2024-03-07 14:34:04.998 UTC+0800    [INFO]    Get conf succeeded: MO_DEPLOY_MODE="binary"
2024-03-07 14:34:05.024 UTC+0800    [INFO]    GO memory limit(Mi): 14745
2024-03-07 14:34:05.072 UTC+0800    [INFO]    Starting mo-service: cd /Users/admin/mo-v3.0.6-darwin-arm64/ && GOMEMLIMIT=14745MiB /Users/admin/mo-v3.0.6-darwin-arm64/mo-service -daemon -debug-http :9876 -launch /Users/admin/mo-v3.0.6-darwin-arm64/etc/launch/launch.toml >/Users/admin/mo-v3.0.6-darwin-arm64/matrixone/logs/stdout-20240307_143405.log 2>/Users/admin/mo-v3.0.6-darwin-arm64/matrixone/logs/stderr-20240307_143405.log
2024-03-07 14:34:05.137 UTC+0800    [INFO]    Wait for 2 seconds
2024-03-07 14:34:07.261 UTC+0800    [INFO]    At least one mo-service is running. Process info: 
  501 27145     1   0  2:34下午 ??         0:00.18 /Users/admin/mo-v3.0.6-darwin-arm64/mo-service -daemon -debug-http :9876 -launch /Users/admin/mo-v3.0.6-darwin-arm64/etc/launch/launch.toml
2024-03-07 14:34:07.284 UTC+0800    [INFO]    List of pid(s): 
27145
2024-03-07 14:34:07.308 UTC+0800    [INFO]    Start succeeded
```

!!! note
    首次启动 MatrixOne 大致需要花费 20 至 30 秒的时间，在稍作等待后，你便可以使用 MySQL 客户端连接至 MatrixOne。

## 步骤 5：连接 MatrixOne 服务

### 通过 `mo_ctl connect` 命令一键连接 MatrixOne 服务

这条命令将调用 MySQL Client 工具自动连接到 MatrixOne 服务。

```
> mo_ctl connect
2024-03-07 14:34:59.902 UTC+0800    [INFO]    Checking connectivity
2024-03-07 14:34:59.942 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 426
Server version: 8.0.30-MatrixOne-v3.0.6 MatrixOne

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