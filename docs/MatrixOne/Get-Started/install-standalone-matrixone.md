# **单机部署 MatrixOne**

单机版 MatrixOne 适用场景即是使用单台开发机器部署 MatrixOne，体验 MatrixOne 的基本功能，与单机版使用一个 MySQL 基本相同。

**推荐安装环境**：

作为一款开源数据库，MatrixOne 目前支持主流的 **Linux** 和 **MacOS** 系统。为了快速上手，本文档中优先推荐如下硬件规格：

|操作系统 |操作系统版本 | CPU     | 内存 |
| :------ |:------ | :------ | :----- |
|Debian| 11 以上 | x86 / ARM CPU；4 核 | 16 GB |
|Ubuntu| 20.04 及以上 | x86 / ARM CPU；4 核 | 16 GB |
|macOS| Monterey 12.3 及以上 | x86 / ARM CPU；4 核 | 16 GB |

你也可以查阅[硬件与操作系统要求](../FAQs/deployment-faqs.md)，查看更多关于硬件规格推荐，选用合适的硬件环境。

## **在 macOS 上部署**

你可以在以下三种方式中选择最适合你的一种，在 macOS 上安装并连接 MatrixOne：

- [使用源代码部署](install-on-macos/install-on-macos-method1.md)
- [使用二进制包部署](install-on-macos/install-on-macos-method2.md)
- [使用 Docker 部署](install-on-macos/install-on-macos-method3.md)

## **在 Linux 上部署**

你可以在以下三种方式中选择最适合你的一种，在 Linux 上安装并连接 MatrixOne：

- [使用源代码部署](install-on-linux/install-on-linux-method1.md)
- [使用二进制包部署](install-on-linux/install-on-linux-method2.md)
- [使用 Docker 部署](install-on-linux/install-on-linux-method3.md)

## 参考文档

- 更多有关连接 MatrixOne 的方式，参见：

    * [客户端连接 MatrixOne 服务](../Develop/connect-mo/database-client-tools.md)
    * [JDBC 连接 MatrixOne 服务](../Develop/connect-mo/java-connect-to-matrixone/connect-mo-with-jdbc.md)
    * [Python 连接 MatrixOne 服务](../Develop/connect-mo/python-connect-to-matrixone.md)。

- 常见的安装和部署问题，参见[安装和部署常见问题](../FAQs/deployment-faqs.md)。

- 关于分布式部署 MatrixOne，参见 [MatrixOne 分布式集群部署](../Deploy/deploy-MatrixOne-cluster.md)。
