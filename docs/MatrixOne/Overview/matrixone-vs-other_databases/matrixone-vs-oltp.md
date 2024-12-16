# MatrixOne 与常见 OLTP 数据库的对比

## 一般 OLTP 数据库特点

OLTP 是指一种面向业务交易的数据库管理系统。OLTP 数据库用于处理大量的短期交易，这些交易通常是一些日常业务操作，例如订单处理、库存管理、银行交易等。它可以提供高并发性能和实时数据处理，以满足企业对即时数据访问的需求。

OLTP 数据库的主要特征如下：

- ACID：OLTP 系统必须确保正确记录整个事务处理。事务处理通常涉及执行多个步骤或操作的程序执行。它可能在所有相关方确认事务、交付产品/服务，或对数据库中的特定表进行一定数量的更新时完成。仅当执行并记录了涉及的所有步骤时，事务处理才算是获得了正确的记录。如果任何一个步骤有任何错误，则必须中止整个事务处理，并且从系统中删除所有步骤。因此，OLTP 系统必须符合原子性、一致性、隔离性和持久性 (ACID)，以确保系统中数据的准确性。
- 高并发：OLTP 系统的用户群可以非常庞大，许多用户尝试同时访问相同的数据。系统必须确保尝试读取或写入系统的所有用户都可以同时执行此操作。并发控制确保两个用户同时访问数据库系统中的相同数据将无法更改该数据，或者一个用户必须等到另一个用户完成处理后才能更改数据。
- 高可用：OLTP 系统必须始终可用并随时准备接受事务处理。事务处理失败可能导致收入损失或产生法律影响。事务处理可以在全球任何地方随时执行，因此系统必须全天候可用。
- 细粒度数据访问：OLTP 数据库通常以记录为单位进行数据访问，它支持高效的增、删、改操作，并提供快速的事务提交和回滚功能。

- 高可靠：OLTP 系统必须在发生任何硬件或软件故障时具有恢复能力。

## 当前行业中 OLTP 系统分类

OLTP 数据库根据架构和技术路线的不同还可以被分为集中式数据库，分布式数据库和云原生数据库。

* 大部分知名的 OLTP 数据库均为传统的集中式数据库，如 Oracle，Microsoft SQL Server，MySQL，PostgreSQL，DB2 等，大部分均诞生于 1980-2000 年之间。
* 分布式 OLTP 数据库以 2012 年 Google 的 Spanner 为典型代表，以 Share-nothing 为架构核心，通过多机数据分片存储和计算来实现扩展，同时通过一致性协议来实现分布式一致。此架构又被很多行业人士称之为 NewSQL 架构，代表产品如 CockroachDB，SAP HANA，TiDB，Oceanbase 等。
* 另外还有一条技术路线被称为云原生 OLTP 数据库，如 Aurora，PolarDB，NeonDB 等，与 Share-nothing 架构有明显区别的是采用共享存储架构，存算分离更加彻底，通过云计算系统中自带扩展能力的存储系统来实现扩展能力。MatrixOne 也是云原生的技术路线。

值得注意的是，这三种分类并没有严格的划分标准，在实际的发展过程中每家数据库也都开始逐步融合其他路线产品的能力。比如 Oracle 的 RAC 架构就是典型的共享存储架构，具备一定的扩展性。CockroachDB 和 TiDB 等产品也都在逐步往云原生和共享存储方向演进。在实际使用中，OLTP 作为需求最广泛的数据库场景，三种技术路线的产品也都有大量的用户在使用。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/mo-other-database/oltp_category.png width=80% heigth=80%/>
</div>

## MatrixOne 的 OLTP 特点

MatrixOne 的基本能力满足一般 OLTP 数据库的特点。

* 数据操作及 ACID 特性：MatrixOne 支持行级别的增删改查操作，同时拥有具备 ACID 特性的事务能力，详细能力描述请参考 [MatrixOne 的事务介绍](../../Develop/Transactions/matrixone-transaction-overview/overview.md)。
* 高并发：MatrixOne 可以支持高并发的业务请求，在行业通用针对 OLTP 的 TPC-C 测试中可以达到 100 仓数万 tpmC 的并发水平，同时还可以根据节点扩展而增加。
* 高可用：MatrixOne 本身基于 Kubernetes 及共享存储，在云环境中均有极成熟的方案来保证这两个基础组件的高可用。同时在 MatrixOne 本身的设计上也考虑了其中各组件的可用性和故障恢复机制。详细可参考 [MatrixOne 的高可用介绍](../../Overview/feature/high-availability.md)。

如上图所示，从架构和技术路线分类来说，MatrixOne 属于云原生技术路线，与 Aurora 更为接近，相比于 Share-nothing 架构最大的优势是存储计算分离后，存储和计算都可以按需使用。

与 Aurora 不同的地方有两点：

* Aurora 把写入节点暴露在用户层，用户只能从单节点进行写入。而 MatrixOne 将写入处理隐藏到了内部的 TN 和 LogService 上，对于用户而言，所有的 CN 节点均可以进行读写操作。
* Aurora 的共享存储依然大量采用块存储作为主要存储介质，对象存储仅作为备份数据存储。而 MatrixOne 直接把对象存储作为全量数据的主存储。

当然，MatrixOne 并不仅局限于 OLTP 能力，MatrixOne 适配其他负载的能力也与 Aurora 的定位有显著差别。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/mo-other-database/mo_vs_aurora.png)

## MatrixOne 与 MySQL 的对比

由于 MatrixOne 以兼容 MySQL 为主要目标，MySQL 本身也是世界上[流行度最高的开源数据库](https://db-engines.com/en/ranking)。MatrixOne 的用户很大一部分是由从开源 MySQL 迁移到 MatrixOne 的，因此这里我们将 MatrixOne 与 MySQL 做一个详细的对比。

|                    | MySQL                                                   | MatrixOne                                  |
| ------------------ | ------------------------------------------------------- | ------------------------------------------ |
| 版本               | 8.0.37                                                  | 最新版本                                   |
| License            | GPL License                                             | Apache License 2.0                         |
| 架构               | 集中式数据库                                            | 分布式云原生数据库                         |
| 负载类型           | OLTP, 分析型负载依赖于企业版的 Heatwave                  | HTAP，时序                                 |
| 存储格式           | 行存                                                    | 列存                                       |
| 存储引擎           | InnoDB/MyIsam                                           | TAE                                        |
| 交互方式           | SQL                                                     | SQL                                        |
| 部署方式           | 单机部署/主从部署                                       | 单机部署/主从部署/分布式部署/K8s 部署       |
| 横向扩展能力       | 依赖分库分表中间件实现                                  | 天然支持                                   |
| 事务能力           | 悲观事务/乐观事务+ANSI 4 种隔离级别（InnoDB 引擎）        | 悲观事务/乐观事务+RC/SI                    |
| 数据类型           | 基础数值，时间日期，字符，JSON，空间                    | 基础数值，时间日期，字符，JSON，向量       |
| 索引和约束         | 主键，次级键，唯一键，外键                              | 主键，次级键，唯一键，外键                 |
| 访问控制           | 基于 RBAC                                                | 基于 RBAC                                   |
| 窗口函数           | 基础窗口函数                                            | 基础窗口函数，时间滑动窗口                 |
| 高级 SQL 能力        | 触发器，存储过程                                        | 不支持                                     |
| 流计算             | 不支持                                                  | 流式写入/kafka 连接器/动态表                |
| UDF                | 支持 SQL 及 C 语言的 UDF                                     | 支持 SQL 及 Python 的 UDF                       |
| 多租户             | 不支持                                                  | 支持                                       |
| 数据共享           | 不支持                                                  | 支持租户间数据共享                         |
| 编程语言           | 绝大部分语言                                            | Java，Python，Golang 连接器和 ORM 基本支持 |
| 常见可视化管理工具 | Navicat，DBeaver，MySQL Workbench，DataGrip，HeidiSQL 等 | 与 MySQL 一致                                |
| 备份工具           | 逻辑备份，物理备份                                      | 逻辑备份，物理备份，快照备份               |
| CDC 能力            | 具备                                                    | 不具备                                     |
| OLTP 性能           | 单机优秀，不可扩展                                      | 单机良好，可扩展                           |
| OLAP 性能           | 较差                                                    | 优秀，可扩展                               |
| 大批量写入性能     | 较差                                                    | 优秀，可扩展                               |
| 存储空间           | 受限于磁盘                                              | 无限扩展                                   |

其他细节可以参照 [MatrixOne 的 MySQL 兼容性详细说明](../../Overview/feature/mysql-compatibility.md)。

整体来说，MatrixOne 是一个高度兼容 MySQL 的云原生 HTAP 数据库，可以无缝兼容绝大部分基于 MySQL 开发的应用。与此同时，MatrixOne 天然具备强大的扩展性，以及支撑其他类型业务负载的能力。另外，基于 MatrixOne 存算分离和多租户的特性，用户在设计应用架构的时候，可以非常灵活的将过去由应用，中间件，或者其他数据库来解决的负载隔离问题来通过 MatrixOne 一站式实现。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/mo-other-database/mo_mysql_use_case.png width=60% heigth=60%/>
</div>

对于 MySQL 用户而言，如果碰到以下问题瓶颈的话，MatrixOne 会是一个更合适的选择：

* 单表数据达到千万级以上，查询性能变慢，需要进行分表操作。
* 整体数据量超过 TB 级别，MySQL 需要配置非常昂贵的物理机器。
* 需要做多表关联类，或者较大单表的聚合分析查询。
* 需要做大规模的实时数据写入，如每秒数百万条数据。
* 需要做应用层的多租户设计，如 SaaS 场景。
* 需要根据业务应用负载变化经常性的进行垂直扩展。
* 需要经常性的进行数据传输和协作。
* 需要与应用框架共同集成到 K8s 环境中，降低运维复杂度。
* 需要做流式数据处理，如实时数据写入和加工。
* 需要存储和搜索向量数据。

在 MatrixOne 的技术博客中，我们也有较多关于 MySQL 与 MatrixOne 的对比和迁移之类的文章供参考。

[MatrixOne 与 MySQL 全面对比--部署篇](https://mp.weixin.qq.com/s?__biz=Mzg2NjU2ODUwMA==&mid=2247491148&idx=2&sn=a83e592da9504d6b4ab356abd6cc2369&chksm=cf9274a6b133599752c811ea241d1c0b25fc44dcc255bf907de131b9a9bb6972d5ebd076d1b6&scene=0&xtrack=1#rd)

[MatrixOne 与 MySQL 全面对比--多租户篇](https://mp.weixin.qq.com/s?__biz=Mzg2NjU2ODUwMA==&mid=2247491293&idx=1&sn=e1967b12371a7f8b57b336d1f8ada986&chksm=cf974c93821360fb559c865b5eba71adb155c410a99e3bc4d0f7aac675a80eab6d95a24853f6&scene=0&xtrack=1#rd)

[MatrixOne 与 MySQL 全面对比--迁移篇](https://mp.weixin.qq.com/s?__biz=Mzg2NjU2ODUwMA==&mid=2247491369&idx=2&sn=a0bab26c2709edd7bc278a1bcbb07d64&chksm=cf3ea15bec8aef761e476a5281b9723638c90f059af813b0c0cc799a3256a92fc96d483e0670&scene=0&xtrack=1#rd)
