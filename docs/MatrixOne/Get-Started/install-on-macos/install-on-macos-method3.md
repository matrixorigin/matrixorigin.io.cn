# **使用 Docker 部署**

本篇文档将指导你使用 Docker 部署单机版 MatrixOne。

## 步骤 1：下载安装 Docker

1. 点击 <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>，进入 Docker 的官方文档页面，根据你的操作系统，下载安装对应的 Docker。

2. 安装完成后，通过下述代码行确认 Docker 版本，验证 Docker 安装是否成功：

    ```
    docker --version
    ```

    安装成功，代码示例如下：

    ```
    Docker version 20.10.17, build 100c701
    ```

3. 直接打开你本地 Docker 客户端，启动 Docker。

## 步骤 2：获取 MatrixOne 镜像并启动

使用以下命令将从 Docker Hub 中拉取 MatrixOne 镜像，你可以选择稳定版本镜像，或开发版本镜像。

=== "稳定版本的镜像（0.7.0）"

      ```bash
      docker pull matrixorigin/matrixone:0.7.0
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:0.7.0
      ```

=== "开发版本的镜像"

      获取最新开发版本的镜像，参见[Docker Hub](https://hub.docker.com/r/matrixorigin/matrixone/tags)，找到最新Tag，拉取镜像。拉取镜像代码示例如下：

      ```bash
      docker pull matrixorigin/matrixone:nightly-commitnumber
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:nightly-commitnumber
      ```

      __Note__: 如上面代码所示，*nightly* 为标识的 Tag 版本每天都进行更新，请注意获取最新的镜像。

如需挂载数据目录或配置自定义文件，参见[挂载目录到 Docker 容器](../../Maintain/mount-data-by-docker.md)。

## 步骤 3：连接 MatrixOne

### 安装并配置 MySQL 客户端

1. 点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System > macOS**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

    __Note__: 建议 MySQL 客户端版本为 8.0.30 版本及以上。

2. 配置 MySQL 客户端环境变量：

     1. 打开一个新的终端，输入如下命令：

         ```
         cd ~
         sudo vim .bash_profile
         ```

     2. 回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码；如果没有设置密码，则直接回车跳过即可。

     3. 输入/跳过 root 密码后，即进入了*. bash_profile*，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

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

### 连接 MatrixOne

- 你可以使用 MySQL 命令行客户端来连接 MatrixOne。打开一个新的终端，直接输入以下指令：

       ```
       mysql -h IP -P PORT -uUsername -p
       ```

       输入完成上述命令后，终端会提示你提供用户名和密码。你可以使用我们提供的的初始帐号和密码：

        · user: root
        · password: 111

- 你也可以使用 MySQL 客户端下述命令行，输入密码，来连接 MatrixOne 服务：

       ```
       mysql -h 127.0.0.1 -P 6001 -uroot -p
       Enter password:
       ```

目前，MatrixOne 只支持 TCP 监听。

!!! note
    上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt.md)。
