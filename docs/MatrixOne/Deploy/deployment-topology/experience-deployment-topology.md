# 体验环境

本篇文档介绍的 MatrixOne 体验环境部署规划可以用于体验 MatrixOne 的分布式基础能力，你可以简单体验数据库的基础开发、运维等功能，但是不适用于部署生产环境，进行性能压测，或进行高可用测试等。

## 硬件配置

体验环境部署规划的硬件配置要求如下：

| 硬件环境要求 | 物理机/虚拟机 |
| ------------ | ------------------ |
| 设备台数     | 3 台                |
| CPU 配置      | 2 核以上            |
| 内存配置     | 8GB 以上            |
| 磁盘配置     | 200GB 以上         |
| 网卡配置     | 不限               |

## 软件配置

体验环境部署规划的软件配置要求包括**操作系统及平台的要求**和**部署软件模块要求**：

### 操作系统及平台要求

| 操作系统                     | 支持的 CPU 架构 |
| :--------------------------- | :-------------- |
| CentOS 7.3 及以上的 7.x 版本 | X86_64          |

### 部署软件模块要求

| 软件模块   | 部署台数 | 功能说明                    |
| :--------- | -------- | :-------------------------- |
| Kubernetes | 3        | 提供整个集群的容器化管理    |
| Minio      | 1        | 提供 MatrixOne 集群的存储服务 |
| MatrixOne  | 1        | 数据库核心                  |

MatrixOne 分布式环境的体验环境部署指引可以参考 [MatrixOne 分布式集群部署](../deploy-MatrixOne-cluster.md)。
