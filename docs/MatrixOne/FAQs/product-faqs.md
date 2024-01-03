# **产品常见问题**

* **什么是 MatrixOne？**

MatrixOne 是一款面向未来的超融合异构云原生数据库，通过超融合数据引擎支持事务/分析/流处理等混合工作负载，通过异构云原生架构支持跨机房协同/多地协同/云边协同。MatrixOne 希望简化数据系统开发和运维的成本，消减复杂系统间的数据碎片，打破数据融合的各种边界。  
想了解更多关于 MatrixOne 的信息，您可以浏览 [MatrixOne 简介](../Overview/matrixone-introduction.md)。

* **MatrxOne 支持哪些应用？**

  MatrixOne 为用户提供了极致的 HTAP 服务，MatrixOne 可以被应用在企业数据中台，大数据分析等场景中。

* **MatrixOne 是基于 MySQL 或者其他数据库开发的吗？**

 MatrixOne 是一个从零打造的全新数据库。MatrixOne 兼容 MySQL 的部分语法与语义，并且在未来将会产生更多与 MySQL 不同的语义，以便我们将之打造为一款更强大的超融合数据库。
 关于与 MySQL 的兼容性，您可参见 [MySQL 兼容性](../Overview/feature/mysql-compatibility.md)。

* **MatrixOne 单机和 MySQL 性能对比如何？**

MatrixOne 单机版本在 TP 性能上与 MySQL 相比略差，但在 Load，流式写入，分析查询上性能远超过 MySQL。

* **MySQL 中的表引擎能直接迁移吗？兼容 InnoDB 等引擎吗？**

MatrixOne 不支持 MySQL 的 InnoDB，MyISAM 等引擎，但可以直接使用 MySQL 的语句，MatrixOne 会忽略这些引擎，在 MatrixOne 中仅有 TAE 一种存储引擎，它是完全独立研发的，可以友好的适用于各类场景，无需使用 ENGINE=XXX 来更换引擎。

* **与 HTAP 数据库 TiDB 有什么区别？**

MatrixOne 与 TiDB 的架构不一样。MatrixOne 是存算分离的，是基于云的 share storage 架构，数据都在一个地方，只存一份，是用一个引擎实现的 HTAP。而 TiDB 是 Share nothing 架构，数据要分片，TiKV 做 TP，TiFlash 做 AP，使用两个引擎加了个 ETL 做到的 HTAP，数据也要存两份。

* **MatrixOne 使用什么编程语言开发的？**

MatrixOne 目前主要使用 **Golang** 作为最主要的编程语言。

* **目前连接 MatrixOne 支持哪些编程语言？**

MatrixOne 支持 Java、Python、Golang 语言和 ORM 连接，其他语言也可以将 MO 当作 MySQL 来进行连接。

* **MatrixOne 可以在什么操作系统上部署？**

MatrixOne 支持在 Linux 与 MacOS 系统上部署。更多信息，参见[部署常见问题](deployment-faqs.md).

* **可以在红帽系，比如 CentOS 7 下正常使用 MatrixOne 吗？**

MatrixOne 对操作系统的要求不严格，支持在 CentOS 7 下使用，但 CentOS 7 在 24 年 6 月底就停止维护了，推荐大家使用更新版本的操作系统。

* **当前非 k8s 版本是否支持主从配置？**

MatrixOne 目前还不支持非 k8s 版本主从配置，后续会支持。

* **k8s 集群节点当前 dn（也叫 tn）节点是否支持扩容？**

MatrixOne 当前 dn 节点还不支持扩容。

* **MatrixOne 是否支持在国产环境下部署？**

对于国产的操作系统和芯片，芯片我们已经适配过鲲鹏和海光，操作系统已经适配过银河麒麟，欧拉，麒麟信安。

* **MatrixOne 是否支持在阿里云 ecs 服务器上分布式部署吗？**

目前需要基于 ECS 搭建 K8S 或者使用阿里云 ACK 才能进行分布式部署。

* **集群部署只支持 K8s 吗？能不能物理分布式本地部署？**

如果提前没有 k8s 和 minio 环境的话。我们的安装工具会自带 k8s 和 minio，也可以在物理机一键部署。

* **生产环境只能用 k8s 模式部署吗？**

是的，为了得到分布式的稳定性和可扩展性，我们推荐生产系统是用 k8s 部署，假如没有现成的 k8s，可以使用托管 k8s 进行部署，降低复杂度。

* **MatrixOne 支不支持 Geometry？**

目前还不支持，后续会支持。

* **有没有 MatrixOne 云版本？想快速测试看看**

有的。现 mo cloud 已经开始公测。详情查看 [MatrixOne Cloud 文档](https://docs.matrixorigin.cn/zh/matrixonecloud/MatrixOne-Cloud/Get-Started/quickstart/)

* **MatrixOne 都支持哪些数据类型？**

有关数据类型的更多信息，参见 [MatrixOne 数据类型](../Reference/Data-Types/data-types.md)。

* **我可以在哪里部署 MatrixOne？**

MatrixOne 可以本地部署、公共云、私有云或 kubernetes 上。

* **各个组件都是做什么用的？最小化需要部署都多少个实例？后期能支持不停服无感扩容吗？**

MatrixOne 核心的组件有 4 个，proxy，cn，tn，log service。cn 就是无状态的计算节点，tn 是事务节点，log service 是事务的日志，相当于 WAL。proxy 是用来做负载均衡和资源组管理的。如果都混合部署的话可以在 3 台物理机/虚拟机搞定。可以无感扩容，mo 是存算分离的，存储的扩容就是 s3 的扩容。计算的扩容就是 cn，本身基于 k8s，cn 无状态，而且是容器，可以快速扩容。

* **高可用架构要怎么用？**

MatrixOne 的单机版目前还没有高可用架构，主从版的高可用架构还在设计中。分布式版本来就是高可用的，k8s 和 s3 本来就都是高可用架构。MatrixOne 的节点里 cn 和 tn 都是无状态的，挂了可以随时拉起，log service 有状态，它的 3 节点是提供一个 raft group 的分布式架构，挂 1 个没关系，继续运行，挂 2 个系统才会不可用。

* **多租户之间是如何实现资源隔离的？**

MatrixOne 的资源隔离核心是 ACCOUNT 可以对应到 CN Set 的资源组上，或者可以认为租户的隔离就是 CN 的容器隔离。除了多租户可以分配不同资源组以外，单个租户内部也可以根据业务类型进一步分配 CN 资源组，进行更细粒度的控制。关于资源隔离的完整描述，您可参见[负载与租户隔离](../Deploy/mgmt-cn-group-using-proxy.md)

* **MatrixOne 的权限也是基于 RBAC 模型设计的吗？可不可以将权限直接授予到用户？**

MatrixOne 的权限管理是结合了基于角色的访问控制 (RBAC，Role-based access control) 和自主访问控制 (DAC，Discretionary access control) 两种安全模型设计和实现的，不支持将权限直接授予用户，需要通过角色进行授权。

* **普通用户能授予 MOADMIN 角色吗？**

不可以的，MOADMIN 为最高的集群管理员权限，只有 root 用户拥有。

* **MatrixOne 对标识符大小写敏感吗？**

MatrixOne 默认对标识符大小写不敏感，并支持通过 lower_case_table_names 参数来进行大小写敏感的支持，对于参数的详细介绍可参见[大小写敏感支持](../Reference/Variable/system-variables/lower_case_tables_name.md)

* **MatrixOne 中 show tables 无法查看临时表，如何查看是否创建成功？**

目前可以通过 "show create table 临时表名" 来查看，由于临时表在创建后只在当前会话可见，在当前会话结束时，数据库自动删除临时表并释放所有空间，在它的生命周期内我们通常是可以人为感知的。

* **请问低版本能否升级到最新的版本？**

MatrixOne 当前低版本无法直接升级至最新版本，建议备份数据，进行重装后导入。

* **现在 MatrixOne 发稳定版了吗？推荐使用哪个版本？**

MatrixOne 现已发布 1.1.0 版本，在稳定性上我们做了大量的优化工作，已经可以用于生产业务，欢迎大家试用反馈。

* **可以参与贡献 MatrixOne 项目吗？**

MatrixOne 是一个完全在 Github 上进行的开源项目，欢迎所有开发者的贡献。更多信息，参见我们的[贡献指南](../Contribution-Guide/make-your-first-contribution.md)。

* **除了官方文档，是否还有其他 MatrixOne 知识获取途径？**

目前，[MatrixOne 文档](https://docs.matrixorigin.cn)是获取 MatrixOne 相关知识最重要、最及时的途径。此外，我们在 Slack 和微信还有一些技术交流群。如有任何需求，请联系 [opensource@matrixorigin.io](mailto:opensource@matrixorigin.io)。
