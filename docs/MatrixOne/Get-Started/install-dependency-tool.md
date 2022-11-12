# 单元 1. 安装依赖工具

开始安装 MatrixOne 前，你首先需要安装必要的两个依赖工具：Go 语言和 MySQL 客户端。

另外，在*单元二*中，我们也有关于安装 MatrixOne 的其他安装方式的介绍，如果有兴趣学习，推荐你安装 `wget`、`curl` 和 **Docker**。

## 1. 安装部署 Go 语言

!!! note
    建议 Go 语言版本为 1.19 版本。

点击 <a href="https://go.dev/doc/install" target="_blank">Go Download and install</a> 入到 **Go** 的官方文档，按照官方指导安装步骤完成 **Go** 语言的安装。

验证 **Go** 是否安装，请执行代码 `go version`，安装成功代码行示例如下：

```
go version go1.19 darwin/arm64
```

## 2. 安装部署 MySQL 客户端

!!! note
    建议 MySQL 客户端版本为 8.0.30 版本及以上。

你可以在 <a href="https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install.html" target="_blank">MySQL Shell 官方文档</a>，按照官方指导安装，选择对应的操作系统，按照指导步骤完成 **MySQL 客户端** 的安装。

或者，你可以直接点击 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Community Downloads</a>，进入到 MySQL 客户端下载安装页面，根据你的操作系统和硬件环境，下拉选择 **Select Operating System**，再下拉选择 **Select OS Version**，按需选择下载安装包进行安装。

安装完成后，打开终端，输入 `mysqlsh`，安装成功代码示例如下：

```
MySQL Shell 8.0.30

Copyright (c) 2016, 2022, Oracle and/or its affiliates.
Oracle is a registered trademark of Oracle Corporation and/or its affiliates.
Other names may be trademarks of their respective owners.

Type '\help' or '\?' for help; '\quit' to exit.
MySQL  JS >
```

__Tips__: 目前，MatrixOne只兼容 Oracle MySQL 客户端，因此一些特性可能无法在 MariaDB、Percona 客户端下正常工作。

现在，你可以关掉 MySQL 客户端，进入下一单元，如果有兴趣，也可以继续阅读本篇文档下述的**选做**章节。

## 3.（选做）安装下载工具

在[单元 2](install-standalone-matrixone.md)中，我们将会提供**下载二进制包**的方式安装 MatrixOne，如果你喜欢通过命令行进行操作，那么你可以提前准备安装好 `wget` 或 `curl`。

__Tips__: 建议你下载安装这两个下载工具，为以后的操作提供便利。

### 安装 `wget`

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

### 安装 `curl`

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

## 4.（选做）安装 Docker

在[单元 2](install-standalone-matrixone.md)中，我们将会提供**使用 Docker** 的方式安装 MatrixOne，它拥有可视化界面，方便操作。

__Tips__: 建议你下载安装 Docker，为以后的操作提供便利。

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

## 下一单元

[单元 2. 安装单机版 MatrixOne](install-standalone-matrixone.md)
