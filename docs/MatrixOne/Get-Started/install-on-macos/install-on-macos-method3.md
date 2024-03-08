# **使用 Docker 部署**

本篇文档将指导你使用 Docker 部署单机版 MatrixOne。

## 步骤 1：前置条件

### 安装 docker

1. 点击 <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>，进入 Docker 的官方文档页面，根据你的操作系统，下载安装对应的 Docker，Docker 版本推荐选择在 20.10.18 及以上，且尽量保持 Docker client 和 Docker server 的版本一致。

2. 安装完成后，通过下述代码行确认 Docker 版本，验证 Docker 安装是否成功：

    ```
    docker --version
    ```

    安装成功，代码示例如下：

    ```
    Docker version 20.10.18, build 100c701
    ```

3. 直接打开你本地 Docker 客户端，启动 Docker。

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

## 步骤 2：部署 Matrixone

此节介绍使用 docker 直接拉取 MatrixOne 镜像和使用 mo_ctl 工具部署两种方式

### docker 部署

使用以下命令将从 Docker Hub 中拉取 MatrixOne 镜像，你可以选择稳定版本镜像，或开发版本镜像，当 Tag 为 `latest` 时获取最新稳定版本。

=== "稳定版本的镜像（1.1.1）"

      ```bash
      docker pull matrixorigin/matrixone:1.1.1
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:1.1.1
      ```

      如果你使用的是中国大陆的网络，你可以拉取阿里云上的 MatrixOne 稳定版本镜像：

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.1.1
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.1.1
      ```

=== "开发版本的镜像"

      获取最新开发版本的镜像，参见[Docker Hub](https://hub.docker.com/r/matrixorigin/matrixone/tags)，找到最新Tag，拉取镜像。拉取镜像代码示例如下：

      ```bash
      docker pull matrixorigin/matrixone:nightly-commitnumber
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:nightly-commitnumber
      ```

      如果你使用的是中国大陆的网络，你可以拉取阿里云上的 MatrixOne 开发版本镜像：

      ```bash
      docker pull registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:nightly-commitnumber
      docker run -d -p 6001:6001 --name matrixone registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:nightly-commitnumber
      ```

      __Note__: 如上面代码所示，*nightly* 为标识的 Tag 版本每天都进行更新，请注意获取最新的镜像。

若 Docker 版本低于 20.10.18 或者 Docker client 和 Docker server 的版本不一致，推荐同时升级到 Docker 最新稳定版本后再尝试。若坚持使用，需要在 ```docker run``` 命令中加上参数 ```--privileged=true```，如：

```bash
docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:1.1.1
```

如需挂载数据目录或配置自定义文件，参见[挂载目录到 Docker 容器](../../Maintain/mount-data-by-docker.md)。

### mo_ctl 部署

[mo_ctl](https://github.com/matrixorigin/mo_ctl_standalone) 是一个部署安装和管理 MatrixOne 的命令行工具，使用它可以非常方便的对 MatrixOne 进行各类操作。如需获取完整的使用细节可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。

- 一键安装 mo_ctl 工具

通过以下命令可以一键安装 mo_ctl 工具。

```
wget https://raw.githubusercontent.com/matrixorigin/mo_ctl_standalone/main/install.sh && sudo -u $(whoami) bash +x ./install.sh
```

- 设置 mo_ctl 的配置参数

通过以下命令调整参数：

```
mo_ctl set_conf MO_CONTAINER_DATA_HOST_PATH="/yourpath/mo/" # 宿主机mo的数据目录
mo_ctl set_conf MO_CONTAINER_IMAGE="matrixorigin/matrixone:1.1.1" # 设置镜像，国内的可以用registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone:1.1.1 
mo_ctl set_conf MO_DEPLOY_MODE=docker #设置MatrixOne部署方式，此为docker部署方式
```

以下为可选参数：

```
MO_CONTAINER_NAME="mo" # mo 容器名
MO_CONTAINER_PORT="6001" # mo 端口号
MO_CONTAINER_DEBUG_PORT="12345" #容器内 debug 端口
MO_CONTAINER_CONF_HOST_PATH="" # 宿主机 mo 的配置文件路径，需要参考
MO_CONTAINER_CONF_CON_FILE="/etc/quickstart/launch.toml" # 容器内配置文件
MO_CONTAINER_LIMIT_MEMORY="" # 内存的限制，单位：m
MO_CONTAINER_MEMORY_RATIO=90 # 如果不设置内存大小，就会根据这个值来设置主机的 x% 内存，默认 90%
MO_CONTAINER_AUTO_RESTART="yes" # 是否设置容器自动重启
MO_CONTAINER_LIMIT_CPU="" # cpu 的限制，单位：核数
MO_CONTAINER_EXTRA_MOUNT_OPTION="" #额外的挂载参数，比如 -v xx:xx:xx
```

- 安装 Matrixone

根据您的需要，选择最新的开发版本，还是获得稳定版本的代码。

=== "通过 MatrixOne (开发版本) 代码安装"

      **main** 分支是默认分支，主分支上的代码总是最新的，但不够稳定。

      ```
      mo_ctl deploy main
      ```

=== "通过 MatrixOne (稳定版本) 代码安装"

     ```
     mo_ctl deploy v1.1.1
     ```

- 启动 Matrixone

```
mo_ctl start
```

!!! note
    首次启动 MatrixOne 大致需要花费 20 至 30 秒的时间，在稍作等待后，你便可以使用 MySQL 客户端连接至 MatrixOne。

## 步骤 3：连接 MatrixOne

除了可以使用 MySQL 命令行客户端来连接 MatrixOne，在已部署 mo_ctl 工具的情况下，您还可以使用 mo_ctl 工具来连接 MatrixOne。此节介绍两种连接方式的具体操作。

### MySQL 命令行客户端连接

- 打开一个新的终端，直接输入以下指令：

```
mysql -h 127.0.0.1 -P 6001 -uroot -p
Enter password:  # 初始密码默认为 111
```

连接成功将返回以下信息：

```
>mysql -h 127.0.0.1 -P 6001 -uroot -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 5982
Server version: 8.0.30-MatrixOne-v1.1.1 MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```

目前，MatrixOne 只支持 TCP 监听。

### mo_ctl 工具连接

通过 `mo_ctl connect` 命令一键连接 MatrixOne 服务。

这条命令将调用 MySQL Client 工具自动连接到 MatrixOne 服务。

```
mo_ctl connect
2024-03-08 11:13:34.347 UTC+0800    [INFO]    Checking connectivity
2024-03-08 11:13:34.420 UTC+0800    [INFO]    Ok, connecting for user ... 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 5849
Server version: 8.0.30-MatrixOne-v1.1.1 MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 
```

!!! note
    上述的连接和登录账号为初始账号 `root` 和密码 `111`，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt.md)。修改登录用户名或密码后重新登录同样需要通过 `mo_ctl set_conf` 的方式设置新的用户名和密码，详情可以参考 [mo_ctl 工具指南](../../Maintain/mo_ctl.md)。