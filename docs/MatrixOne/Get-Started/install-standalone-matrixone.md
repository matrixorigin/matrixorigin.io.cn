# **安装单机版 MatrixOne**

为了方便不同操作习惯的开发者或技术爱好者能够通过最方便快捷的方式安装单机版 MatrixOne，我们提供了以下三种安装方法，你可以根据你的需求，选择最适合你的安装方式：

- <p><a href="#code_source">方法 1：使用源代码搭建。</a></p>如果你有一直获取最新 MatrixOne 代码的需求，可以优先选择通过**使用源代码**的方式安装部署 MatrixOne。
- <p><a href="#binary_packages">方法 2：下载二进制包。</a></p>如果你习惯直接使用安装包进行部署，可以选择通过**下载二进制包**的方式安装部署 MatrixOne。
- <p><a href="#use_docker">方法 3：使用 Docker。</a></p>如果你平时使用 Docker，也可以选择通过**使用 Docker** 的方式安装部署 MatrixOne。

## 开始前准备

### 推荐安装环境

作为一款开源数据库，MatrixOne 目前支持主流的 **Linux** 和 **MacOS** 系统。在本篇快速指引中，为了快速上手，我们优先推荐如下硬件规格：

| CPU     | 内存 | 操作系统   |
| :------ | :----- | :-------------- |
| x86 CPU；4核 | 32 GB | CentOS 7+ |

你也可以查阅[硬件与操作系统要求](../FAQs/deployment-faqs.md)，查看更多关于硬件规格推荐，选用合适的硬件环境。

## <h2><a name="code_source">方法 1：使用源代码搭建</a></h2>

## 1. 安装部署 Go 语言

!!! note
    建议 Go 语言版本为 1.19 版本。

点击 <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> 入到 **Go** 的官方文档，按照官方指导安装步骤完成 **Go** 语言的安装。

验证 **Go** 是否安装，请执行代码 `go version`，安装成功代码行示例如下：

```
go version go1.19 darwin/arm64
```

### 2. 获取 MatrixOne 源码完成搭建

根据您的需要，选择您所获取的代码永远保持最新，还是获得稳定版本的代码。

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

         __Tips__: 你也可以运行`make debug`与`make clean`或者其他任何`Makefile`支持的命令；`make debug` 可以用来调试构建进程，`make clean` 可以清除构建进程。

     3. 启动 MatrixOne 服务：

         __Notes__: 注意，MatrixOne(开发版本) 的启动配置文件与 MatrixOne(稳定版本) 的启动配置文件不同，MatrixOne(开发版本) 的启动配置文件代码如下：

         ```
         ./mo-service -cfg ./etc/cn-standalone-test.toml
         ```

=== "通过 MatrixOne(稳定版本) 代码搭建"

     1. 如果您想获得 MatrixOne 发布的最新稳定版本代码，请先从 **main** 切换选择至 **0.5.1** 版本分支。

         ```
         git clone https://github.com/matrixorigin/matrixone.git
         git checkout 0.5.1
         cd matrixone
         ```

     2. 运行 `make config` 和 `make build` 编译文件：

         ```
         make config
         make build
         ```

         __Tips__: 你也可以运行`make debug`与`make clean`或者其他任何`Makefile`支持的命令；`make debug` 可以用来调试构建进程，`make clean` 可以清除构建进程。

     3. 启动 MatrixOne 服务：

         __Notes__: 注意，MatrixOne(稳定版本) 的启动配置文件与 MatrixOne(开发版本) 的启动配置文件不同，MatrixOne(稳定版本) 的启动配置文件代码如下：

         ```
         ./mo-server system_vars_config.toml
         ```

### 3. 连接 MatrixOne 服务

当你按照上述步骤完成安装启动 MatrixOne，默认在启动模式下，产生很多日志，接下来你可以启动新的终端，连接 MatrixOne，具体步骤，参见[连接 MatrixOne 服务](connect-to-matrixone-server.md)。

## <h2><a name="binary_packages">方法 2：下载二进制包</a></h2>

从 0.3.0 版本开始，您可以直接下载二进制包。

### 1. 安装下载工具

我们提供**下载二进制包**的方式安装 MatrixOne，如果你喜欢通过命令行进行操作，那么你可以提前准备安装好 `wget` 或 `curl`。

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
     curl 7.84.0 (x86_64-apple-darwin22.0) libcurl/7.84.0 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.11 nghttp2/1.47.0
     Release-Date: 2022-06-27
     ...
     ```

### 2. 下载二进制包并解压

=== "**Linux 环境**"

       **下载方式一**和**下载方式二**需要先安装下载工具 `wget` 或 `curl`，如果你未安装，请先安装下载工具。

      + **下载方式一：`wget` 工具下载安装二进制包**

           ```bash
           wget https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-linux-amd64.zip
           unzip mo-server-v0.5.1-linux-amd64.zip
           ```

      + **下载方式二：`curl` 工具下载二进制包**

          ```bash
          curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-linux-amd64.zip
          unzip mo-server-v0.5.1-linux-amd64.zip
          ```

      + **下载方式三：如果你想通过更直观的页面下载的方式下载，可以进入下述页面链接，选择安装包下载**

          进入[版本 0.5.1](https://github.com/matrixorigin/matrixone/releases/tag/v0.5.1)，下拉找到 **Assets** 栏，点击安装包 *mo-server-v0.5.1-linux-amd64.zip* 下载即可。

=== "**MacOS 环境**"

      **下载方式一**和**下载方式二**需要先安装下载工具 `wget` 货 `curl`，如果你未安装，请先安装下载工具。

       + **下载方式一：`wget` 工具下载安装二进制包**

          ```bash
             wget https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-darwin-x86_64.zip
             unzip mo-server-v0.5.1-darwin-x86_64.zip
          ```

       + **下载方式二：`curl` 工具下载二进制包**

          ```bash
          curl -OL https://github.com/matrixorigin/matrixone/releases/download/v0.5.1/mo-server-v0.5.1-darwin-x86_64.zip
          unzip mo-server-v0.5.1-darwin-x86_64.zip
          ```

       + **下载方式三：如果你想通过更直观的页面下载的方式下载，可以进入下述页面链接，点击下载**

          进入[版本 0.5.1](https://github.com/matrixorigin/matrixone/releases/tag/v0.5.1)，下拉找到 **Assets** 栏，点击安装包 *mo-server-v0.5.1-darwin-x86_64.zip* 下载即可。

!!! info
     ARM 芯片硬件配置下，MatrixOne 仅支持通过源代码方式进行安装部署；如果你使用的是 MacOS 系统 M1 及以上版本，请使用<a href="#code_source">源代码</a>构建的方式安装部署 MatrixOne。若果在 X86 硬件配置下使用二进制方式安装部署 MatrixOne 会导致未知问题。

### 3. 启动 MatrixOne 服务

```
./mo-server system_vars_config.toml
```

### 4. 连接 MatrixOne 服务

当你按照上述步骤完成安装启动 MatrixOne，默认在启动模式下，产生很多日志，接下来你可以启动新的终端，连接 MatrixOne，具体步骤，参见[连接 MatrixOne 服务](connect-to-matrixone-server.md)。

## <h2><a name="use_docker">方法 3：使用 Docker</a></h2>

### 1. 下载安装 Docker

点击<a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>，进入 Docker 的官方文档页面，根据你的操作系统，下载安装对应的 Docker。

安装完成后，点击打开 Docker，进入下一步进行验证安装是否成功。

### 2. 验证 Docker 安装成功

你可以通过下述代码行确认 Docker 版本，验证 Docker 安装是否成功：

```
docker --version
```

安装成功，代码示例如下：

```
Docker version 20.10.17, build 100c701
```

### 3. 创建并运行容器

使用以下命令将从 Docker Hub 中拉取 MatrixOne 镜像，你可以选择稳定版本镜像，或开发版本镜像。

=== "稳定版本的镜像（0.5.1）"

      ```bash
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:0.5.1
      ```

=== "开发版本的镜像（Pre0.6)"

      获取最新开发版本的镜像，参见[Docker Hub](https://hub.docker.com/r/matrixorigin/matrixone/tags)，找到最新Tag，拉取镜像。拉取镜像代码示例如下：

      ```bash
      docker run -d -p 6001:6001 --name matrixone matrixorigin/matrixone:nightly-commitnumber
      ```

      __Notes__: 如上面代码所示，*nightly* 为标识的 Tag 版本每天都进行更新，请注意获取最新的镜像。

运行 Docker Hub 时需要输入用户名和密码，获取用户名和密码可以参考步骤 5 - 连接 MatrixOne 服务

### 4. 挂载数据（选做）

如果你需要自定义*配置文件*或者*数据目录*，可以直接挂载存放在本地磁盘的自定义*配置文件*以及*数据目录*：

```
docker run -d -p 6001:6001 -v ${path_name}/system_vars_config.toml:/system_vars_config.toml:ro -v ${path_name}/store:/store:rw --name matrixone matrixorigin/matrixone:0.5.1
```

|参数|描述|
|---|---|
|${path_name}/system_vars_config.toml|挂载配置文件 *system_vars_config.toml* 的本地磁盘目录|
|/system_vars_config.toml|容器内配置文件|
|${path_name}/store|备份 */store* 的本地磁盘目录|
|/store|容器内 */store* 目录|

更多关于 *Docker run* 的指令释义，运行命令 `docker run --help` 进行查看。

### 5. 连接 MatrixOne 服务

当你按照上述步骤完成安装启动 MatrixOne，默认在启动模式下，产生很多日志，接下来你可以启动新的终端，连接 MatrixOne，具体步骤，参见[连接 MatrixOne 服务](connect-to-matrixone-server.md)。

## 参考文档

升级版本，参见[升级单机版 MatrixOne](../Maintain/upgrade-standalone-matrixone.md)。
常见的安装和部署问题，参见[安装和部署常见问题](../FAQs/deployment-faqs.md)。
