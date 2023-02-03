# **使用二进制包部署**

本篇文档将指导你使用二进制包部署单机版 MatrixOne。

## 步骤 1：安装下载工具

我们提供**下载二进制包**的方式安装 MatrixOne，如果你喜欢通过命令行进行操作，那么你可以提前准备安装好 `wget` 或 `curl`。

__Tips__：建议你下载安装这两个下载工具其中之一，方便后续通过命令行下载二进制包。

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
     curl 7.84.0 (x86_64-apple-darwin22.0) libcurl/7.84.0 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.11 nghttp2/1.47.0
     Release-Date: 2022-06-27
     ...
     ```

## 步骤 2：下载二进制包并解压

**下载方式一**和**下载方式二**需要先安装下载工具 `wget` 货 `curl`，如果你未安装，请先安装下载工具。

=== "**下载方式一：`wget` 工具下载安装二进制包**"

     ```bash
     wget https://github.com/matrixorigin/matrixone/releases/download/v0.6.0/mo-v0.6.0-darwin-x86_64.zip
     unzip mo-v0.6.0-darwin-x86_64.zip
     ```

=== "**下载方式二：`curl` 工具下载二进制包**"

     ```bash
     curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.6.0/mo-v0.6.0-darwin-x86_64.zip
     unzip mo-v0.6.0-darwin-x86_64.zip
     ```

=== "**下载方式三：页面下载**"

     如果你想通过更直观的页面下载的方式下载，直接点击进入[版本 0.6.0](https://github.com/matrixorigin/matrixone/releases/tag/v0.6.0)，下拉找到 **Assets** 栏，点击安装包 *mo-v0.6.0-darwin-x86_64.zip* 下载即可。

!!! info
     ARM 芯片硬件配置下，MatrixOne 仅支持通过源代码方式进行安装部署；如果你使用的是 MacOS 系统 M1 及以上版本，请使用[源代码](install-on-macos-method1.md)构建的方式安装部署 MatrixOne。若果在 X86 硬件配置下使用二进制方式安装部署 MatrixOne 会导致未知问题。

## 步骤 3：启动 MatrixOne 服务

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

当你按照上述步骤完成安装启动 MatrixOne，默认在启动模式下，产生很多日志，接下来你可以启动新的终端，连接 MatrixOne。

## 步骤 4：连接 MatrixOne

### 安装并配置 MySQL 客户端

1. 点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System > macOS**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

    __Note__：建议 MySQL 客户端版本为 8.0.30 版本及以上。

2. 配置 MySQL 客户端环境变量：

     1. 打开一个新的终端，输入如下命令：

         ```
         cd ~
         sudo vim .bash_profile
         ```

     2. 回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码；如果没有设置密码，则直接回车跳过即可。

     3. 输入/跳过 root 密码后，即进入了*。bash_profile*，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

        ```
        export PATH=${PATH}:/usr/local/mysql/bin
        ```

     4. 输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。

     5. 输入命令 `source .bash_profile`，回车执行，运行环境变量。

     6. 测试 MySQL 是否可用：

         - 方式一：输入命令 `mysql -u root -p`，回车执行，需要 root 用户密码，显示 `mysql>` 即表示 MySQL 客户端已开启。

         - 方式二：执行命令 `mysql --version`，安装成功提示：`mysql  Ver 8.0.31 for macos12 on arm64 (MySQL Community Server - GPL)`

     7. MySQL 如可用，关闭当前终端，继续浏览下一章节**连接 MatrixOne 服务**。

    __Tips__：目前，MatrixOne 只兼容 Oracle MySQL 客户端，因此一些特性可能无法在 MariaDB、Percona 客户端下正常工作。

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
