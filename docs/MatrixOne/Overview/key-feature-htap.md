# MatrixOne 的 HTAP 特性

MatrixOne HSTAP 数据库重新定义了 HTAP 数据库的概念，旨在为用户提供满足单一数据库内事务处理（TP）和分析处理（AP）的所有需求。

## 功能优势

- **一站式体验**：满足单一数据库内事务处理（TP）和分析处理（AP）的所有需求，用户可以获得覆盖整个 TP 和 AP 场景的一站式体验。
- **数据流处理能力**：HSTAP 具有内置的用于连接 TP 和 AP 表数据流处理能力，为用户提供了数据库可以像大数据平台一样灵活的使用体验。
- **简化集成工作**：用户使用 MatrixOne 只需要少量的集成工作即可实现全面的 TP 和 AP 场景的使用。
- **摆脱限制**：用户可以摆脱传统大数据平台的臃肿架构及各种限制，提高数据处理效率和灵活性。

## 架构优势

### 传统架构

#### 行存储架构到数据库内存架构

在行存储架构中，数据按照行的形式保存，可以快速访问记录中的所有列。然而，这种架构对于查询具有先天劣势，同时限制了 OLAP 性能。为了解决这些问题，行存储架构被转变为数据库内存架构。

数据库内存架构允许数据以行的形式存在于 buffer cache 中，也可以以列的形式填充 In-Memory Column Store，从而显著提高查询性能。在 SQL 请求进入时，优化器会自动将 OLTP 的请求发送到行存储内存区域中，将 OLAP 发送到列存储内存区域中。这种优化可以为应用程序的开发人员和 DBA 省去额外的操作，同时实现不同存储格式的读取。

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/oracle-htap-arch.png?raw=true)

虽然这种架构的优点很明显，但也存在一些缺点。例如，需要手动干预 In-Memory 列表，同时增加了内存的开销。

#### 列存储索引架构

列存储索引（Columnstore indexes）是一种类似于行存的非聚集列存储索引，可以大幅提高写入性能。这种索引在列存储表上建立，从底层存储就以列存的形式保存，可以同时满足 OLTP 和 OLAP 两种场景。

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/sqlserver-htap-arch.png?raw=true)

尽管列存储索引的优点很明显，但在列存储索引表上创建非聚集列存储索引需要更多的存储来保存数据副本，这会增加存储开销。

#### HeateWave 插件

在数据库集群中，安装插件 HeateWave 可以将数据放入 HeateWave 集群的内存中，并以列存的形式保存。HeateWave 插件基于内存的列存管理，可以显著提高查询性能。通过控制 HeateWave 节点的总内存个数，可以调整存入内存中的数据总量。

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mysql-htap-arch.png?raw=true)

然而，随着数据量的增加，HeateWave 需要的硬件资源也会相应增加。此外，在数据库服务重启后，HeateWave 节点需要重新读取数据，这也是一个缺点。

### MatrixOne 架构

MatrixOne 提供了三种解决方案来支持 HTAP 场景隔离：存储层提供的列式存储、计算节点之间的计算资源隔离、以及流与物化视图实现原始数据与结果数据的转换。

#### 列式存储

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-1.png?raw=true)

TAE 是 MatrixOne 的存储引擎，可以同时支持 TP 和 AP 能力，支持存算分离的云原生分布式架构。TAE 以表的形式存储数据，每个表的数据被组织成一个 LSM 树，包括 L0、L1 和 L2 三层。L0 很小，可以完全驻留在内存中，而 L1 和 L2 则驻留在硬盘上。TAE 的最小 IO 单元是 column block，它按照固定行数进行组织。

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-2.png?raw=true)

MatrixOne 将在版本 0.9 引入 Column Family 的概念，TAE 可以实现负载灵活适配。用户可以方便地在行存和列存之间切换，只需要在 DDL 表定义中指定即可。如果所有列都是一个 Column Family，也就是所有的列数据保存在一起，那么可以表现出行存类似的行为；如果每个列都是独立的 Column Family，也就是每一列都独立存放，那么就是典型的列存。这种灵活的设计使得 TAE 可以支持不同类型的负载，并提供更好的性能和灵活性。

#### 资源隔离

除了 MatrixOne 的列式存储引擎 TAE，分布式计算节点 CN 也可以通过配置 CN Label 的方式实现计算资源的隔离。这样可以将需要 TP 与 AP 资源的 SQL 请求分别分配到不同的 CN 中执行，实现计算资源的完全隔离。

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-3.png?raw=true)

通过配置 CN Label，不同的 SQL 请求可以被分配到不同的 CN Label 组中，从而将 AP 与 TP 的请求从计算资源层面完全隔离开。通过配置策略，未来还可以动态划分资源，将计算资源分配到当前最需要的业务场景中。

#### 流与物化视图

在 MatrixOne 引擎中，存在两种数据存储方式：基表（Base Table）和物化视图（Materialized View）。

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/mo-htap-arch-4.png?raw=true)

基表是在关系型数据库中存储数据的表格，是数据的源头，也是其他表格的基础。基表包括多行记录，每一行表示一个实体或对象，每一列表示该实体的一个属性。基表是数据库中最基本的数据存储结构。

相比之下，物化视图是一个已经计算出来并存储在数据库中的视图，其中包含了来自一个或多个基表的数据。与普通视图不同，物化视图是一个实际的表格，它包含了基表数据的快照，而不是基于基表的查询结果。由于避免了每次查询都需要重新计算的问题，物化视图可以提高查询性能，同时减少对基表的访问压力。

使用 MatrixOne 内置的流引擎可以定期更新物化视图，从而保持与基表数据的同步。这样可以提高查询性能，同时将基表 的TP（事务处理）和 AP（分析处理）请求完成分离。

## 应用场景

HATP 无论在金融、通信、制造业还是在互联网、大数据等新兴行业，都有着广泛的使用与举足轻重的地位。以下是一个典型的 HTAP 应用场景。

### 典型场景

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/htap/scenario.png?raw=true)

某企业是一家省级电信运营商，服务的用户数量在数千万，主要业务是电话通信业务。

|主要业务场景|业务类型|MatrixOne 解决方案|
|---|---|---|
|查询用户缴存话费情况并实时停机 |高并发短小事务，需要低延迟|MatrixOne 的存储引擎 TAE 提供的 Column Family 特性，以及分布式多 CN 节点可以确保高并发下的稳定性能，同时实现负载均衡，避免某个 CN 节点成为热点。|
|接受用户充值并实时更新账户余额 |高并发短小事务，需要低延迟|MatrixOne 的存储引擎 TAE 可以满足高并发低延迟TP需求，同时提供分布式多 CN 节点的负载均衡特性。|
|批量调整用户套餐并在下个月生效|超大事务，需要高性能|MatrixOne 的存储引擎 TAE 提供直接写 S3 的特性，避免了 Logservice 在高并发下的争用，实现快速批量的数据写入。|
|每天、每周、每月、每季度、每年对用户数据统计|典型的 AP 业务，需要在规定时间内计算数据结果|MatrixOne 的列式存储和多 CN 并行计算可以满足大规模数据报表的计算需求，同时提供快速的数据读取性能。|
|实时更新当前设备和基站业务负载情况|实时查询，要求实时呈现结果|通过基于多个基表的物化视图和流引擎来实现数据的快速读取和实时更新。|
