# **单机部署 MatrixOne**

单机版 MatrixOne 适用场景即是使用单台服务器，体验 MatrixOne 最小的完整拓扑，并模拟开发环境下的部署步骤。

**单机部署 MatrixOne 主要步骤如下**：

<a href="#install_mo">步骤一：单机安装 MatrixOne</a><br>
<a href="#connect_mo">步骤二：单机连接 MatrixOne</a>

**推荐安装环境**：

作为一款开源数据库，MatrixOne 目前支持主流的 **Linux** 和 **MacOS** 系统。为了快速上手，本文档中优先推荐如下硬件规格：

|操作系统 |操作系统版本 | CPU     | 内存 |
| :------ |:------ | :------ | :----- |
|CentOS| 7.3 及以上 | x86 CPU；4 核 | 32 GB |
|macOS| Monterey 12.3 及以上 | - x86 CPU；4 核<br>- ARM；4 核 | 32 GB |

你也可以查阅[硬件与操作系统要求](../FAQs/deployment-faqs.md)，查看更多关于硬件规格推荐，选用合适的硬件环境。

## <h2><a name="install_mo">步骤一：单机安装 MatrixOne</a></h2>

为了方便不同操作习惯的开发者或技术爱好者能够通过最方便快捷的方式安装单机版 MatrixOne，我们提供了以下三种安装方法，你可以根据你的需求，选择最适合你的安装方式：

- <p><a href="#code_source">方法 1：使用源代码搭建。</a></p>如果你有一直获取最新 MatrixOne 代码的需求，可以优先选择通过**使用源代码**的方式安装部署 MatrixOne。
- <p><a href="#binary_packages">方法 2：下载二进制包。</a></p>如果你习惯直接使用安装包进行部署，可以选择通过**下载二进制包**的方式安装部署 MatrixOne。
- <p><a href="#use_docker">方法 3：使用 Docker。</a></p>如果你平时使用 Docker，也可以选择通过**使用 Docker** 的方式安装部署 MatrixOne。

### <h3><a name="code_source">方法 1：使用源代码搭建</a></h3>

#### 1. 安装部署 Go 语言

!!! note
    建议 Go 语言版本为 1.19 版本。

点击 <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> 入到 **Go** 的官方文档，按照官方指导安装步骤完成 **Go** 语言的安装。

验证 **Go** 是否安装，请执行代码 `go version`，安装成功代码行示例如下：

=== "**Linux 环境**"

     Go 安装成功提示如下：

     ```
     go version go1.19.3 linux/amd64
     ```

=== "**MacOS 环境**"

      Go 安装成功提示如下：

      ```
      go version go1.19 darwin/arm64
      ```

#### 2. 获取 MatrixOne 源码完成搭建

根据您的需要，选择您所获取的代码永远保持最新，还是获得稳定版本的代码。

__Tips__: 通过 MatrixOne 源码完成搭建时，**Linux 环境** 与 **MacOS 环境** 通过运行指令进行 MatrixOne 的搭建过程无明显分别，本章节着重介绍不同版本的 MatrixOne 源码搭建步骤。

=== "通过 MatrixOne(开发版本) 代码搭建"

     **main** 分支是默认分支，主分支上的代码总是最新的，但不够稳定。

     1. 获取 MatrixOne(开发版本，即 Pre0.6 版本) 代码方法如下：

         ```shell
         git clone https://github.com/matrixorigin/matrixone.git
         cd matrixone
         ```

     2. 运行 `make build` 编译文件：

         ```
         make build
         ```

         __Tips__: 你也可以运行`make debug`与`make clean`或者其他任何`Makefile`支持的命令；`make debug` 可以用来调试构建进程，`make clean` 可以清除构建进程。如果在 `make build` 时产生 `Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout` 报错，参见[安装和部署常见问题](../FAQs/deployment-faqs.md)进行解决。

=== "通过 MatrixOne(稳定版本) 代码搭建"

     1. 如果您想获得 MatrixOne 发布的最新稳定版本代码，请先从 **main** 切换选择至 **0.6.0** 版本分支。

         ```
         git clone https://github.com/matrixorigin/matrixone.git
         cd matrixone         
         git checkout 0.6.0
         ```

     2. 运行 `make config` 和 `make build` 编译文件：

         ```
         make config
         make build
         ```

         __Tips__: 你也可以运行`make debug`与`make clean`或者其他任何`Makefile`支持的命令；`make debug` 可以用来调试构建进程，`make clean` 可以清除构建进程。如果在 `make build` 时产生 `Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout` 报错，参见[安装和部署常见问题](../FAQs/deployment-faqs.md)进行解决。

#### <h4><a name="launch">3. 启动 MatrixOne 服务</a></h4>

=== "**在终端的前台启动 MatrixOne 服务**"

      该启动方式会在终端的前台运行 `mo-service` 进行，实时打印系统日志。如果你想停止 MatrixOne 服务器，只需按 CTRL+C 或关闭当前终端。

      ```
      # Start mo-service in the frontend
      ./mo-service -launch ./etc/quickstart/launch.toml
      ```

=== "**在终端的后台启动 MatrixOne 服务**"

      该启动方法会在后台运行 `mo-service` 进程，系统日志将重定向到 `test.log` 文件中。如果你想停止 MatrixOne 服务器，你需要通过以下命令查找出它的 `PID` 进程号并消除进程。下面是整个过程的完整示例。

      ```
      # Start mo-service in the backend
      nohup ./mo-service -launch ./etc/quickstart/launch.toml &> test.log &

      # Find mo-service PID
      ps aux | grep mo-service

      [root@VM-0-10-centos ~]# ps aux | grep mo-service
      root       15277  2.8 16.6 8870276 5338016 ?     Sl   Nov25 156:59 ./mo-service -launch ./etc/quickstart/launch.toml
      root      836740  0.0  0.0  12136  1040 pts/0    S+   10:39   0:00 grep --color=auto mo-service

      # Kill the mo-service process
      kill -9 15277
      ```

      __Tips__: 如上述示例所示，使用命令 `ps aux | grep mo-service` 首先查找出 MatrixOne 运行的进程号为 `15277`，`kill -9 15277` 即表示停止进程号为 `15277` 的 MatrixOne。

#### 4. 连接 MatrixOne 服务

当你按照上述步骤完成安装启动 MatrixOne，默认在启动模式下，产生很多日志，接下来你可以启动新的终端，连接 MatrixOne，具体步骤，参见<a href="#connect_mo">步骤二：单机连接 MatrixOne</a>。

### <h3><a name="binary_packages">方法 2：下载二进制包</a></h3>

从 0.3.0 版本开始，您可以直接下载二进制包。

#### 1. 安装下载工具

我们提供**下载二进制包**的方式安装 MatrixOne，如果你喜欢通过命令行进行操作，那么你可以提前准备安装好 `wget` 或 `curl`。

__Tips__: 建议你下载安装这两个下载工具其中之一，方便后续通过命令行下载二进制包。

=== "安装 `wget`"

     `wget` 工具用来从指定的 URL 下载文件。`wget` 是专门的文件下载工具，它非常稳定，而且下载速度快。

     进入到<a href="https://brew.sh/" target="_blank">Homebrew</a>页面按照步骤提示，先安装 **Homebrew**，再安装 `wget`。 验证 `wget` 是否安装成功可以使用如下命令行：

     ```
     wget -V
     ```

     安装成功结果(仅展示一部分代码)如下：

     - Linux 环境，安装成功代码示例如下：

     ```
     GNU Wget 1.21.3 built on linux-gnu.
     ...
     Copyright (C) 2015 Free Software Foundation, Inc.
     ...
     ```

     - MacOS 环境，安装成功代码示例如下：

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

     - Linux 环境，安装成功代码示例如下：

     ```
     curl 7.84.0 (x86_64-pc-linux-gnu) libcurl/7.84.0 OpenSSL/1.1.1k-fips zlib/1.2.11
     Release-Date: 2022-06-27
     ...
     ```

     - MacOS 环境，安装成功代码示例如下：

     ```
     curl 7.84.0 (x86_64-apple-darwin22.0) libcurl/7.84.0 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.11 nghttp2/1.47.0
     Release-Date: 2022-06-27
     ...
     ```

#### 2. 下载二进制包并解压

=== "**Linux 环境**"

       **下载方式一**和**下载方式二**需要先安装下载工具 `wget` 或 `curl`，如果你未安装，请先安装下载工具。

      + **下载方式一：`wget` 工具下载安装二进制包**

           ```bash
           wget https://github.com/matrixorigin/matrixone/releases/download/v0.6.0/mo-v0.6.0-linux-amd64.zip
           unzip mo-v0.6.0-linux-amd64.zip
           ```

      + **下载方式二：`curl` 工具下载二进制包**

          ```bash
          curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.6.0/mo-v0.6.0-linux-amd64.zip
          unzip mo-v0.6.0-linux-amd64.zip
          ```

      + **下载方式三：如果你想通过更直观的页面下载的方式下载，可以进入下述页面链接，选择安装包下载**

          进入[版本 0.6.0](https://github.com/matrixorigin/matrixone/releases/tag/v0.6.0)，下拉找到 **Assets** 栏，点击安装包 *mo-v0.6.0-linux-amd64.zip* 下载即可。

=== "**MacOS 环境**"

      **下载方式一**和**下载方式二**需要先安装下载工具 `wget` 货 `curl`，如果你未安装，请先安装下载工具。

       + **下载方式一：`wget` 工具下载安装二进制包**

          ```bash
             wget https://github.com/matrixorigin/matrixone/releases/download/v0.6.0/mo-v0.6.0-darwin-x86_64.zip
             unzip mo-v0.6.0-darwin-x86_64.zip
          ```

       + **下载方式二：`curl` 工具下载二进制包**

          ```bash
          curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.6.0/mo-v0.6.0-darwin-x86_64.zip
          unzip mo-v0.6.0-darwin-x86_64.zip
          ```

       + **下载方式三：如果你想通过更直观的页面下载的方式下载，可以进入下述页面链接，点击下载**

          进入[版本 0.6.0](https://github.com/matrixorigin/matrixone/releases/tag/v0.6.0)，下拉找到 **Assets** 栏，点击安装包 *mo-v0.6.0-darwin-x86_64.zip* 下载即可。

!!! info
     ARM 芯片硬件配置下，MatrixOne 仅支持通过源代码方式进行安装部署；如果你使用的是 MacOS 系统 M1 及以上版本，请使用<a href="#code_source">源代码</a>构建的方式安装部署 MatrixOne。若果在 X86 硬件配置下使用二进制方式安装部署 MatrixOne 会导致未知问题。

#### 3. 启动 MatrixOne 服务

启动 MatrixOne 服务可以参见**使用源代码搭建**章节的 <a href="#launch">3. 启动 MatrixOne 服务</a>。

=== "**在终端的前台启动 MatrixOne 服务**"

      该启动方式会在终端的前台运行 `mo-service` 进行，实时打印系统日志。如果你想停止 MatrixOne 服务器，只需按 CTRL+C 或关闭当前终端。

      ```
      # Start mo-service in the frontend
      ./mo-service -launch ./etc/quickstart/launch.toml
      ```

=== "**在终端的后台启动 MatrixOne 服务**"

      该启动方法会在后台运行 `mo-service` 进程，系统日志将重定向到 `test.log` 文件中。如果你想停止 MatrixOne 服务器，你需要通过以下命令查找出它的 `PID` 进程号并消除进程。下面是整个过程的完整示例。

      ```
      # Start mo-service in the backend
      nohup ./mo-service -launch ./etc/quickstart/launch.toml &> test.log &

      # Find mo-service PID
      ps aux | grep mo-service

      [root@VM-0-10-centos ~]# ps aux | grep mo-service
      root       15277  2.8 16.6 8870276 5338016 ?     Sl   Nov25 156:59 ./mo-service -launch ./etc/quickstart/launch.toml
      root      836740  0.0  0.0  12136  1040 pts/0    S+   10:39   0:00 grep --color=auto mo-service

      # Kill the mo-service process
      kill -9 15277
      ```

      __Tips__: 如上述示例所示，使用命令 `ps aux | grep mo-service` 首先查找出 MatrixOne 运行的进程号为 `15277`，`kill -9 15277` 即表示停止进程号为 `15277` 的 MatrixOne。

#### 4. 连接 MatrixOne 服务

当你按照上述步骤完成安装启动 MatrixOne，默认在启动模式下，产生很多日志，接下来你可以启动新的终端，连接 MatrixOne，具体步骤，参见<a href="#connect_mo">步骤二：单机连接 MatrixOne</a>。

### <h3><a name="use_docker">方法 3：使用 Docker</a></h3>

__Tips__: 通过 Docer 搭建 MatrixOne 时，**Linux 环境** 与 **MacOS 环境** 通过运行指令进行 MatrixOne 的搭建过程无明显分别。

#### 1. 下载安装 Docker

点击<a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>，进入 Docker 的官方文档页面，根据你的操作系统，下载安装对应的 Docker。

安装完成后，点击打开 Docker，进入下一步进行验证安装是否成功。

#### 2. 验证 Docker 安装成功

你可以通过下述代码行确认 Docker 版本，验证 Docker 安装是否成功：

```
docker --version
```

安装成功，代码示例如下：

```
Docker version 20.10.17, build 100c701
```

#### 3. 检查 Docker 运行状态

运行如下命令，启动 Docker 并查看运行状态是否成功，不同操作环境的检查建议如下：

- **Linux 环境**:

Linux 环境下，你可以在你终端里执行如下命令：

```
systemctl start docker
systemctl status docker
```

表示 Docker 正在运行的代码示例如下，出现 `Active: active (running)` 即表示 Docker 已经在运行中。

```
docker.service - Docker Application Container Engine
   Loaded: loaded (/usr/lib/systemd/system/docker.service; disabled; vendor preset: disabled)
   Active: active (running) since Sat 2022-11-26 17:48:32 CST; 6s ago
     Docs: https://docs.docker.com
 Main PID: 234496 (dockerd)
    Tasks: 8
   Memory: 23.6M
```

- **MacOS 环境**:

MacOS 环境下，你可以直接打开你本地 Docker 客户端，启动 Docker。

#### 4. 获取 MatrixOne 镜像并启动

使用以下命令将从 Docker Hub 中拉取 MatrixOne 镜像，你可以选择稳定版本镜像，或开发版本镜像。

=== "稳定版本的镜像（0.6.0）"

      ```bash
      docker pull matrixorigin/matrixone:0.6.0
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:0.6.0
      ```

=== "开发版本的镜像"

      获取最新开发版本的镜像，参见[Docker Hub](https://hub.docker.com/r/matrixorigin/matrixone/tags)，找到最新Tag，拉取镜像。拉取镜像代码示例如下：

      ```bash
      docker pull matrixorigin/matrixone:nightly-commitnumber
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:nightly-commitnumber
      ```

      __Notes__: 如上面代码所示，*nightly* 为标识的 Tag 版本每天都进行更新，请注意获取最新的镜像。

如需挂载数据目录或配置自定义文件，参见[挂载目录到 Docker 容器](../Maintain/mount-data-by-docker.md)。

运行 Docker Hub 时需要输入用户名和密码，获取用户名和密码可以参见<a href="#connect_mo">步骤二：单机连接 MatrixOne</a>。

## <h2><a name="connect_mo">步骤二：单机连接 MatrixOne</a></h2>

### 开始前准备

#### 安装部署 MySQL 客户端

!!! note
    建议 MySQL 客户端版本为 8.0.30 版本及以上。

你可以在 <a href="https://dev.mysql.com/doc/refman/8.0/en/installing.html" target="_blank">Installing and Upgrading MySQL</a>，按照官方指导安装，选择对应的操作系统，按照指导步骤完成 **MySQL 客户端** 的安装。

或者，你可以直接点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

#### 配置 MySQL 客户端环境变量

MySQL 客户端安装完成后，需要配置 MySQL 客户端环境变量：

=== "**Linux 环境**"

     1. 打开一个新的终端，输入如下命令：

         ```
         cd ~
         sudo vim /etc/profile
         ```

     2. 回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码；如果没有设置密码，则直接回车跳过即可。

     3. 输入/跳过 root 密码后，即进入了 *profile* 文件，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

         ```
         export PATH=/software/mysql/bin:$PATH
         ```

     4. 输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。

     5. 输入命令 `source  /etc/profile`，回车执行，运行环境变量。

     6. 测试 MySQL 是否可用：

         - 方式一：输入命令 `mysql -u root -p`，回车执行，需要 root 用户密码，显示 `mysql>` 即表示 MySQL 客户端已开启。

         - 方式二：执行命令 `mysql --version`，安装成功提示：`mysql  Ver 8.0.31 for Linux on x86_64 (Source distribution)`

     7. MySQL 如可用，关闭当前终端，继续浏览下一章节**连接 MatrixOne 服务**。

=== "**MacOS 环境**"

     1. 打开一个新的终端，输入如下命令：

         ```
         cd ~
         sudo vim .bash_profile
         ```

     2. 回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码；如果没有设置密码，则直接回车跳过即可。

     3. 输入/跳过 root 密码后，即进入了 *.bash_profile*，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

        ```
        export PATH=${PATH}:/usr/local/mysql/bin
        ```

     4. 输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。

     5. 输入命令 `source .bash_profile`，回车执行，运行环境变量。

     6. 测试 MySQL 是否可用：

         - 方式一：输入命令 `mysql -u root -p`，回车执行，需要 root 用户密码，显示 `mysql>` 即表示 MySQL 客户端已开启。

         - 方式二：执行命令 `mysql --version`，安装成功提示：`mysql  Ver 8.0.31 for macos12 on arm64 (MySQL Community Server - GPL)`

     7. MySQL 如可用，关闭当前终端，继续浏览下一章节**连接 MatrixOne 服务**。

__Tips__: 目前，MatrixOne 只兼容 Oracle MySQL 客户端，因此一些特性可能无法在 MariaDB、Percona 客户端下正常工作。

### **连接 MatrixOne**

你可以使用 MySQL 命令行客户端来连接 MatrixOne。打开一个新的终端，直接输入以下指令：

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

目前，MatrixOne 只支持 TCP 监听。

## 参考文档

- 更多有关连接 MatrixOne 的方式，参见[客户端连接 MatrixOne 服务](../Develop/connect-mo/database-client-tools.md)、[JDBC 连接 MatrixOne 服务](../Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md)和[Python 连接 MatrixOne 服务](../Develop/connect-mo/python-connect-to-matrixone.md)。

- 常见的安装和部署问题，参见[安装和部署常见问题](../FAQs/deployment-faqs.md)。

- 关于分布式部署 MatrixOne，参见 [在 Kubernetes 上部署 MatrixOne](../Deploy/install-and-launch-in-k8s.md)。
