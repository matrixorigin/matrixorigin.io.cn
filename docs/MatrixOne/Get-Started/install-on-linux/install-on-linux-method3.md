# **使用 Docker 部署**

本篇文档将指导你使用 Docker 部署单机版 MatrixOne。

## 步骤 1：下载安装 Docker

1. 点击 <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>，进入 Docker 的官方文档页面，根据你的操作系统，下载安装对应的 Docker，Docker 版本推荐选择在 20.10.18 及以上，且尽量保持 Docker client 和 Docker server 的版本一致。

2. 安装完成后，通过下述代码行确认 Docker 版本，验证 Docker 安装是否成功：

    ```
    docker --version
    ```

    安装成功，代码示例如下：

    ```
    Docker version 20.10.18, build 100c701
    ```

3. 在你终端里执行如下命令，启动 Docker 并查看运行状态是否成功：

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

## 步骤 2：获取 MatrixOne 镜像并启动

使用以下命令将从 Docker Hub 中拉取 MatrixOne 镜像，你可以选择稳定版本镜像，或开发版本镜像。

=== "稳定版本的镜像（1.0.0）"

      ```bash
      docker pull matrixorigin/matrixone:1.0.0
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:1.0.0
      ```

      如果你使用的是中国大陆的网络，你可以拉取阿里云上的 MatrixOne 稳定版本镜像：

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.0.0
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.0.0
      ```

=== "开发版本的镜像（latest）"

      ```bash
      docker pull matrixorigin/matrixone:latest
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:latest
      ```

      如果你使用的是中国大陆的网络，你可以拉取阿里云上的 MatrixOne 开发版本镜像：

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:latest
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:latest
      ```


      __Note__: 获取更多开发版本的镜像，参见[Docker Hub ](https://hub.docker.com/r/matrixorigin/matrixone/tags)。

!!! note
    若 Docker 版本低于 20.10.18 或者 Docker client 和 Docker server 的版本不一致，推荐同时升级到 Docker 最新稳定版本后再尝试。若坚持使用，需要在 ```docker run``` 命令中加上参数 ```--privileged=true```，如：

    ```bash
    docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:1.0.0
    ```

!!! note
    首次启动 MatrixOne 大致需要花费 20 至 30 秒的时间，在稍作等待后，你便可以使用 MySQL 客户端连接至 MatrixOne。

如需挂载数据目录或配置自定义文件，参见[挂载目录到 Docker 容器](../../Maintain/mount-data-by-docker.md)。

## 步骤 3：连接 MatrixOne

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

    __Tips__: 目前，MatrixOne 只兼容 Oracle MySQL 客户端，因此一些特性可能无法在 MariaDB、Percona 客户端下正常工作。

### 连接 MatrixOne

- 你可以使用 MySQL 命令行客户端来连接 MatrixOne。打开一个新的终端，直接输入以下指令：

       ```
       mysql -h 127.0.0.1 -P 6001 -uroot -p
       Enter password:  # 初始密码默认为 111
       ```

目前，MatrixOne 只支持 TCP 监听。

!!! note
    上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt.md)。
