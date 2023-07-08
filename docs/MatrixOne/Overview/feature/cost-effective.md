# 高性价比

MatrixOne 是一款全新设计的数据库，其架构设计理念强调高性价比。MatrixOne 的高性价比主要体现在以下几个方面：

## 单集群支持混合负载 HTAP

随着大数据应用的快速普及与多元化发展，传统的数据处理方案越来越难以满足海量数据实时分析的需求。现代数据应用需求更加倾向于同时考虑高并发的 OLTP 事务型业务和大规模数据的 OLAP 分析型业务。

MatrixOne 是专门设计用来解决混合负载问题的数据库。MatrixOne 能够在同一个集群中同时支持 OLTP 和 OLAP，真正实现混合事务/分析处理（Hybrid Transaction and Analytical Processing，HTAP）。用户不再需要分别搭建 OLTP 和 OLAP 两个数据库系统，只需一个数据库就能支持混合负载。这样一来，不仅避免了建设和维护两套系统的成本，还避免了将数据从 OLTP 系统同步到 OLAP 系统的 ETL 过程。用户能够在同一个集群中方便地处理业务和分析。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/high-cost-performance/HTAP.png)

## 单一存储引擎实现 HTAP

在数据库领域，实现 HTAP 通常需要将一个 OLTP 引擎和一个 OLAP 引擎封装到一个数据库产品中。虽然数据在两个存储引擎之间的转换过程对用户是隐藏的，用户只看到一个统一的 SQL 接口，但实际上数据在两个存储引擎各存一份，硬件和存储成本并未降低。

与上述引擎封装方式不同，MatrixOne 利用单一存储引擎实现 HTAP。如下图所示，MatrixOne 通过对不同计算节点 CN 进行分组，以及在负载的运行链路上进行区分，实现单引擎的 HTAP。当用户的应用请求进入 MatrixOne 集群时，Proxy 模块会将 OLAP 类的请求分发到专门处理 OLAP 的 CN 组。这些请求通常需要大范围地读取或写入数据，由 CN 节点直接与对象存储进行交互。而 OLTP 类的请求，如小数据量的 `INSERT`，`UPDATE`，`DELETE`，则会通过另一组专门处理 OLTP 的 CN 组，并由 DN 节点处理事务信息，并写入 LogService 的共享日志。DN 还会不断地将 LogService 中的少量事务类数据进行压缩和合并，再写入对象存储中。

总的来说，用户写入 MatrixOne 的数据只存在一份，并通过单一的存储引擎进行处理，大幅度降低了存储和计算硬件的成本。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/high-cost-performance/HTAP-single-engine.png)

## 灵活的资源分配提高机器利用率

在实际的数据应用业务场景中，系统大部分时间是服务于基于 CRUD 的事务型业务。然而，在特定的时间点，如晚上、月底或者年底，需要对一段时间内的总体数据进行分析。这时，如果用户只有一个数据库系统，就需要临时减少业务负载，或者在业务负载较低的时候进行 OLAP 分析任务。然而，这种情况下，通常会面临分析时间过长，不能影响业务运行的长时间等问题。如果用户为 OLAP 分析型业务单独部署一套数据库系统，但实际的分析型业务往往难以最大化利用，也会导致一定的资源浪费。

如上一部分所介绍的，MatrixOne 通过对无状态的计算节点进行分组，以及在底层通过不同的链路支持 OLTP 和 OLAP 业务，实现 HTAP。这种架构使得 MatrixOne 能够根据实际业务需求，灵活地调整资源分配，以此提高机器利用率，实现真正的高性价比。
如果 CRUD 类型的业务需求较高时，你可以为 OLTP 分配更多的 CN 节点。相应地，当分析型业务需求升高时，你可以为 OLAP 分配更多的 CN 节点。这种调整均是全动态可配置的。

以下图为例，假设用户原先需要 3 个计算节点来处理 OLTP 业务，以及 3 个计算节点来处理 OLAP 业务，并且这些硬件资源是完全绑定的，即为 OLTP 服务的节点不能为 OLAP 提供服务，反之亦然，而且用户对机器资源的规划往往超出实际需求的上限。然而，在实际业务中，达到全峰需求的时间相当有限。如果设计使用 MatrixOne 集群支持这些业务，那么可以调整为总共 4 个计算节点，平时 3 个节点处理 OLTP 业务，1 个节点处理 OLAP 业务。然后，在月末等分析需求高峰时期，则可以调整为 1 个计算节点处理 OLTP 业务，3 个计算节点处理 OLAP 业务；高峰过后再恢复原始配置，这样可提高机器资源使用率 40%。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/high-cost-performance/usage-optimize.png)

## 高效低成本的对象存储

在存储层面，MatrixOne 主要采用对象存储，该存储通过使用纠删码原理，仅需要低至 33% 的冗余度即可保证数据的高可用性。与行业内常见的通过多副本来保证高可用性的方案相比，纠删码在保持同等可靠性的前提下，其空间利用率优于多副本方案。

在 MatrixOne 集群中，以私有化部署的 Minio 官方推荐的最小配置（4 节点 × 4 磁盘）为例，MatrixOne 最少可以支持 4 块磁盘作为纠删码磁盘，以及 12 块磁盘作为数据磁盘的架构，其冗余度为 1.33。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/high-cost-performance/erasure-code.png)

此外，对象存储还支持 HDD 磁盘等低成本存储介质。对于集群计算性能要求不高，以存储为主的使用场景中，可以进一步降低使用成本。

## 与 MySQL 的兼容性

MatrixOne 在语法、协议以及生态工具方面都保持了与市场上最流行的开源数据库 MySQL 的兼容性，这使得熟悉 MySQL 或者以前使用 MySQL 的用户能够以极低的成本进行迁移和学习。

关于 MatrixOne 与 MySQL 兼容性的详细信息，请参见 [MySQL 兼容性章节](mysql-compatibility.md)。
