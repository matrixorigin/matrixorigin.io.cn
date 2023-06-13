# **使用源代码部署**

本篇文档将指导你使用源代码部署单机版 MatrixOne。

## 步骤 1：安装部署 Go 语言

1. 点击 <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> 入到 **Go** 的官方文档，按照官方指导安装步骤完成 **Go** 语言的安装。

    __Note__: 建议 Go 语言版本为 1.20 版本。

2. 验证 **Go** 是否安装，请执行代码 `go version`，安装成功代码行示例如下：

    ```
    go version go1.20.4 linux/amd64
    ```

## 步骤 2：安装 GCC

1. 验证 GCC 环境是否需要安装：

    ```
    gcc -v
    bash: gcc: command not found
    ```

    如代码所示，未显示 GCC 的版本，则表示 **GCC** 的环境需要安装。

2. 点击 <a href="https://gcc.gnu.org/install/" target="_blank">GCC Download and install</a> 入到 **GCC** 的官方文档，按照官方指导安装步骤完成 **GCC** 的安装。

    __Note__: 建议 GCC 版本为 8.5 版本及以上。

3. 验证 **GCC** 是否安装，请执行代码 `gcc -v`，安装成功代码行示例如下（只展示部分代码）：

    ```
    Using built-in specs.
    COLLECT_GCC=gcc
    ...
    Thread model: posix
    gcc version 9.3.1 20200408 (Red Hat 9.3.1-2) (GCC)
    ```

## 步骤 3：获取 MatrixOne 源代码

根据您的需要，选择您所获取的代码永远保持最新，还是获得稳定版本的代码。

=== "通过 MatrixOne (开发版本) 代码搭建"

      **main** 分支是默认分支，主分支上的代码总是最新的，但不够稳定。

     1. 获取 MatrixOne(开发版本) 代码方法如下：

         ```shell
         git clone https://github.com/matrixorigin/matrixone.git
         cd matrixone
         ```

     2. 运行 `make build` 编译文件：

         ```
         make build
         ```

         __Tips__: 你也可以运行`make debug`与`make clean`或者其他任何`Makefile`支持的命令；`make debug` 可以用来调试构建进程，`make clean` 可以清除构建进程。如果在 `make build` 时产生 `Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout` 报错，参见[安装和部署常见问题](../../FAQs/deployment-faqs.md)进行解决。

=== "通过 MatrixOne (稳定版本) 代码搭建"

     1. 如果您想获得 MatrixOne 发布的最新稳定版本代码，请先从 **main** 切换选择至 **0.7.0** 版本分支。

         ```
         git clone https://github.com/matrixorigin/matrixone.git
         cd matrixone         
         git checkout 0.7.0
         ```

     2. 运行 `make config` 和 `make build` 编译文件：

         ```
         make config
         make build
         ```

         __Tips__: 你也可以运行`make debug`与`make clean`或者其他任何`Makefile`支持的命令；`make debug` 可以用来调试构建进程，`make clean` 可以清除构建进程。如果在 `make build` 时产生 `Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout` 报错，参见[安装和部署常见问题](../../FAQs/deployment-faqs.md)进行解决。

## 步骤 4：启动 MatrixOne 服务

=== "**在终端的前台启动 MatrixOne 服务**"

      该启动方式会在终端的前台运行 `mo-service` 进行，实时打印系统日志。如果你想停止 MatrixOne 服务器，只需按 CTRL+C 或关闭当前终端。

      ```
      # Start mo-service in the frontend
      ./mo-service -launch ./etc/quickstart/launch.toml
      ```

      在前台启动模式下，产生很多日志，接下来你可以启动新的终端，连接 MatrixOne。

=== "**推荐使用：在终端的后台启动 MatrixOne 服务**"

      该启动方法会在后台运行 `mo-service` 进程，系统日志将重定向到 `test.log` 文件中。如果你想停止 MatrixOne 服务器，你需要通过以下命令查找出它的 `PID` 进程号并消除进程。下面是整个过程的完整示例。

      ```
      # Start mo-service in the backend
      ./mo-service --daemon --launch ./etc/quickstart/launch.toml &> test.log &

      # Find mo-service PID
      ps aux | grep mo-service

      [root@VM-0-10-centos ~]# ps aux | grep mo-service
      root       15277  2.8 16.6 8870276 5338016 ?     Sl   Nov25 156:59 ./mo-service -launch ./etc/quickstart/launch.toml
      root      836740  0.0  0.0  12136  1040 pts/0    S+   10:39   0:00 grep --color=auto mo-service

      # Kill the mo-service process
      kill -9 15277
      ```

      __Tips__: 如上述示例所示，使用命令 `ps aux | grep mo-service` 首先查找出 MatrixOne 运行的进程号为 `15277`，`kill -9 15277` 即表示停止进程号为 `15277` 的 MatrixOne。

      接下来你可以进行下一步 - 连接 MatrixOne。

!!! info
    如果在某一分支上构建以后，需要切换分支再进行构建，运行后则出现 panic，需要清理数据文件目录。参见[安装和部署常见问题](../../FAQs/deployment-faqs.md)进行解决。
    MatrixOne 0.8.0 版本兼容旧版本存储格式。如果你使用的是 0.8.0 版本或更高版本，执行切换至其他分支并构建时，则无需再清理数据文件目录。

## 步骤 5：连接 MatrixOne

### 安装并配置 MySQL 客户端

1. 点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

    __Note__: 建议 MySQL 客户端版本为 8.0.30 版本及以上。

2. 配置 MySQL 客户端环境变量：

     1. 打开一个新的终端，输入如下命令：

         ```
         cd ~
         sudo vim /etc/profile
         ```

     2. 回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码；如果没有设置密码，则直接回车跳过即可。

     3. 输入/跳过 root 密码后，即进入了*. bash_profile*，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

        ```
        export PATH=/software/mysql/bin:$PATH
        ```

     4. 输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。

     5. 输入命令 `source  /etc/profile`，回车执行，运行环境变量。

     6. 测试 MySQL 是否可用：

         - 方式一：输入命令 `mysql -u root -p`，回车执行，需要 root 用户密码，显示 `mysql>` 即表示 MySQL 客户端已开启。

         - 方式二：执行命令 `mysql --version`，安装成功提示：`mysql  Ver 8.0.31 for Linux on x86_64 (Source distribution)`

     7. MySQL 如可用，关闭当前终端，继续浏览下一章节**连接 MatrixOne 服务**。

    __Tips__: 目前，MatrixOne 只兼容 Oracle MySQL 客户端，因此一些特性可能无法在 MariaDB、Percona 客户端下正常工作。

### 连接 MatrixOne

- 你可以使用 MySQL 命令行客户端来连接 MatrixOne。打开一个新的终端，直接输入以下指令：

       ```
       mysql -h IP -P PORT -uUsername -p
       ```

       输入完成上述命令后，终端会提示你提供用户名和密码。你可以使用我们的内置帐号：

        · user: dump
        · password: 111

- 你也可以使用 MySQL 客户端下述命令行，输入密码，来连接 MatrixOne 服务：

       ```
       mysql -h 127.0.0.1 -P 6001 -udump -p
       Enter password:
       ```

目前，MatrixOne 只支持 TCP 监听。
