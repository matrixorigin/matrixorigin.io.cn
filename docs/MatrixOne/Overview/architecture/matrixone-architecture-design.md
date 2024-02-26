# **MatrixOne 架构设计**

## **MatrixOne 概述**

MatrixOne 是一款超融合异构云原生数据库。

超融合是指支撑多种负载的能力融合，MatrixOne 支持在同一个数据库中支撑事务性（OLTP）、分析性（OLAP）和流式工作（Sreaming）负载，这种多工作负载负载的能力融合，我们称之为 HSTAP (Hybrid Streaming & Transaction/Analytical Processing). HSTAP 数据库对 HTAP 数据库进行了重新定义，HSTAP 旨在满足单一数据库内事务处理（TP）和分析处理（AP）的所有需求。与传统的 HTAP 相比，HSTAP 强调其内置的用于连接 TP 和 AP 表数据流处理能力，为用户提供了数据库可以像大数据平台一样灵活的使用体验。也恰恰得益于大数据的繁荣，很多用户已经熟悉了这种体验。用户使用 MatrixOne 只需要少量的集成工作，即可以获得覆盖整个 TP 和 AP 场景的一站式体验，同时可以摆脱传统大数据平台的臃肿架构及各种限制。

异构云原生是指面向云原生基础设施（K8s 及对象存储），MatrixOne 完全重新设计了一套分布式数据库引擎，可以满足公有云，私有云，边缘云等多种单一云环境及多种跨云环境的部署模式，同时最大程度的利用云原生环境的特点，实现存算分离及线性扩展。在以 K8s 主导的云原生环境中，数据库系统一直以来作为有状态系统都未被很好的统一纳管起来，而是仍然基于物理机或者虚拟机的形式独立部署及运维，根本原因是因为传统的单机/分布式数据库未根据云原生环境进行改造。而 MatrixOne 则是从 0 开始，存储与计算引擎均完全自研，面向云原生环境设计，可以最大程度的利用容器化的软件定义资源以及灵活调配的特点，实现与应用层统一到同一套云原生环境中。同时由于 K8s 本身的跨云能力，MatrixOne 可以无缝兼容各种异构的云及 IaaS 环境，并且灵活实现跨多云和多端的部署。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/mo-new-arch.png)

## **MatrixOne 架构层级**

如下图所示，MatrixOne 整体是基于 Kubernetes 而构建，全部是以容器化的形式构建及管理。MatrixOne 整体分成三层架构，分别是计算层，事务层，存储层。MatrixOne 的存储，计算和事务三层是完全分离解耦的，每层都有自己的对象单元和分工，不同层的节点和资源完全解耦，独立自由伸缩。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/architecture-1.png)

- 存储层：MatrixOne 面向云原生环境设计，在云环境中对象存储已经成为事实上的存储标准，可靠性高，价格低廉，并且自带近乎无限扩展能力。因此 MatrixOne 选用兼容 S3 协议的对象存储作为主存储，所有的数据最终都会持久化到对象存储中。目前主流的公有云及私有化厂商均提供了兼容 S3 协议的对象存储服务，MatrixOne 均可以无缝兼容。针对不带对象存储服务的物理机/虚拟机环境，可以通过部署开源 [Minio](https://min.io/) 的形式自行搭建对象存储服务。

- 计算层：以计算节点 Compute Node (简称 CN) 为单位，在 K8s 里，每个 CN 都是一个无状态的容器 Pod，可以通过软件定义的方式自由指定资源大小及个数，由 K8s 负责资源供给。为了加快查询性能，每个 CN 节点中会有内存及本地磁盘的两级缓存，新查询过的数据会缓存到 CN 节点中，置换策略为 LRU。由于 CN 节点完全无状态，因此可以任意重启，任意纵向和横向扩展，且作为容器 Pod，CN 节点可以做到秒级的快速扩缩容，同时在发生了故障的时候迅速重启或者切换其他 CN。

- 事务层：MatrixOne 整体是搭建在容器服务及对象存储上的架构，这个架构对于提供 OLAP 服务是非常合适的，OLAP 对数据 IO 的并发要求较低，且数据块较大。但是如果需要提供高并发写入的 TP 能力，完全基于对象存储服务无法满足要求。由于 S3 协议的对象存储只能支持数百级别的 IO 并发，且对于小文件的读写不友好。因此为了解决这个问题，MatrixOne 专门设计了一层事务层。事务层包含两个组件，事务节点 Transaction Node（简称 TN）和日志服务 Log Service（简称 LS）。TN 和 LS 主要服务于数据写入相关流程。
    * TN 节点：MatrixOne 的 CN 节点没有任何差异，任何 CN 节点均可以接受写入请求，而为了保证 ACID 特性，TN 会保证整体的写入事务，对不同的 CN 节点的写入请求进行事务裁决，判断写入冲突可能性及获取锁的先后顺序等，同时会接受最终的事务 commit 请求，以确保事务完整性。同时针对新写入的数据，在数据量较小的情况下，TN 会将新写入的数据先存在内存中，达到一定规模后再异步持久化到对象存储中。如果写入数据量超过一定的量级，TN 在进行仲裁判断后会允许 CN 直接写入对象存储，并在获取 commit 信息的时候同时获取 S3 存入的文件地址。TN 节点本身也是无状态的，可以任意启停和纵向扩展。
    * LS 服务：而针对存储在 TN 内存中的一小段新数据，我们称之为 Logtail 数据，它的可靠性并没有完全得到保证，因此我们需要 LS 服务来记录与之对应的写入日志。LS 服务是由三个节点组成的 Raft group，通过三副本的 Raft 协议和 Leader 选举的机制，可以确保在一个节点失效的情况下仍然服务可用。

## **MatrixOne 系统组件**

![MatrixOne Component](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/mo-component.png)

在 MatrixOne 中，为实现分布式与多引擎的融合，构建了多种不同的系统组件用于完成架构相关的层级的功能：

### **File Service**

File Service 是 MatrixOne 负责所有存储介质读写的组件。存储介质包括内存、磁盘、对象存储等，它提供了如下特性：

- File Service 提供了一个统一的接口，使不同介质的读写，可以使用相同的接口。
- 接口的设计，遵循了数据不可变的理念。文件写入之后，就不允许再更新。数据的更新，通过产生新的文件来实现。
- 这样的设计，简化了数据的缓存、迁移、校验等操作，有利于提高数据操作的并发能力。
- 基于统一的读写接口，File Service 提供了分级的缓存，提供了灵活的缓存策略，以平衡读写速度和容量。

### **Log Service**

Log Service 是 MatrixOne 中专门用于处理事务日志的组件，它具有如下功能特性：

- 采用 Raft 协议来保证一致性，采用多副本方式确保可用性。
- 保存并处理 MatrixOne 中所有的事务日志，在事务提交前确保 Log Service 的日志读写正常，在实例重启时，检查并回放日志内容。
- 在完成事务的提交与落盘后，对 Log Service 内容做截断，从而控制 Log Service 的大小，截断后仍然保留在 Log Service 中的内容，称为 Logtail。
- 如果多个 Log Service 副本同时出现宕机，那么整个 MatrixOne 将会发生宕机。

### **Transaction Node**

Transaction Node（TN），是用来运行 MatrixOne 的分布式存储引擎 TAE 的载体，它提供了如下特性：

- 管理 MatrixOne 中的元数据信息以及 Log Service 中保存的事务日志内容。
- 接收 Computing Node（CN）发来的分布式事务请求，对分布式事务的读写请求进行裁决，将事务裁决结果推给 CN，将事务内容推给 Log Service，确保事务的 ACID 特性。
- 在事务中根据检查点生成快照，确保事务的快照隔离性，在事务结束后将快照信息释放。

### **Computing Node**

Computing Node（CN），是 Matrixone 接收用户请求并处理 SQL 的组件，具体包括以下模块：

- Frontend，处理客户端 SQL 协议，接受客户端发送的 SQL 报文，然后解析得到 MatrixOne 可执行的 SQL，调用其他模块执行 SQL 后将查询结果组织成报文返回给客户端。
- Plan，解析 Frontend 处理后的 SQL，并根据 MatrixOne 的计算引擎生成逻辑执行计划发送给 Pipeline。
- Pipeline，解析逻辑计划，将逻辑计划转成实际的执行计划，然后 Pipeline 运行执行计划。
- Disttae，负责具体的读写任务，既包含了从 TN 同步 Logtail 和从 S3 读取数据，也会把写入的数据发送给 TN。

### **Stream Engine**

Stream Engine 是 MatrixOne 内置的全新组件，旨在支持实时数据查询、处理以及增强数据存储，特别针对传入的数据流（数据点序列）。借助 Stream Engine，您能够使用 SQL 定义并构建流处理管道，将其作为实时数据后端提供服务；同时，您也能够运用 SQL 查询流中的数据，并与非流式数据集进行联接，从而更进一步地简化整个数据堆栈的处理流程。

### **Proxy**

Proxy 组件是一款功能强大的工具，主要用于实现负载均衡与 SQL 路由。它具有以下功能：

- 通过 SQL 路由，实现了不同租户之间的资源隔离，保证了不同租户的 CN 之间不会互相影响。
- 通过 SQL 路由，允许用户在同一租户的资源组内再做二次拆分，提高了资源利用率。
- 在二次拆分的资源组内，实现了不同 CN 之间的负载均衡，使得系统运行更加稳定和高效。

## **相关信息**

本节介绍了 MatrixOne 的整体架构概览。其他信息可参见：

* [安装单机版 MatrixOne](../../Get-Started/install-standalone-matrixone.md)

* [最新发布信息](../whats-new.md)
