---
title: "验证生态接入链路"
doc_type: guide
description: "明确真实接入路径和版本化能力，在部署前检查连接器兼容性与恢复边界。"
---

# 验证生态接入链路

选择连接器前，先明确源到目的的运行路径。MySQL 协议接入只建立连接接口，SQL 生成、元数据反射、批量加载和恢复仍需独立验证。连接器能够读取 MySQL binlog, 不代表 MatrixOne 可以作为兼容的 binlog 源。

## 记录实际运行路径

每个工具版本、驱动版本、MatrixOne 构建、源角色和 sink 角色分别保留验证记录。记录 TLS 与认证方式、SQL 模式、会话时区、表结构、显式类型映射、批大小和并发。口令不写入记录和配置示例。

读取、插入、更新、删除、模式变更和恢复分别标记状态：

| 状态 | 含义 |
|---|---|
| 原生路径验证通过 | 实际组件 API 或运行时在记录的配置下执行了该操作。 |
| 显式适配验证通过 | 组件实际运行，并使用了具名的表示转换或外部 SQL 效果适配。 |
| 阻断 | 保留原始错误、最小复现和受影响配置。 |
| 尚未验证 | 组件、方向或故障场景尚未完成自身验证。 |

通过状态只适用于对应配置，不覆盖所有版本或整个产品。一个 task 内的行集断言，不等于相同数量的调度器部署或崩溃实验。

## 检查组件边界

| 组件类别 | 必须实际执行的链路 | 需要记录的边界 |
|---|---|---|
| PyMySQL、mysql-connector-python、SQLAlchemy、JDBC、ODBC 与 MatrixOne SDK | 驱动读写、参数绑定和预定提交/回滚 API | 元数据反射、复制 DDL、TLS 与连接复用; 读取验证不能代替写入验证。 |
| ConnectorX 与 Ibis | 实际 reader/backend 查询 | 默认推断与显式 CAST/HEX 表示。 |
| PETL、pandas、Polars 与 Dask | 原生转换与配置的加载路径 | 显式 dtype、小数上下文、时长映射，SQL 效果是否由外部适配实现。 |
| DuckDB 与 PyArrow | 实际引擎/文件往返和预定 SQL sink | Parquet/IPC 表示，显式 SQL 桥接与原生连接器的区别。 |
| DataX 与 SeaTunnel | 实际作业及源/目的插件 | 插件和驱动版本、源分区、目的语句、批处理或流式模式。 |
| Spark、Flink CDC 与 Trino | 实际引擎及预定连接器 | 安装客户端或探测端口不能认证引擎、源 CDC 或 checkpoint sink。 |
| Singer 与 dlt | tap/target 协议或 pipeline 运行时及 state | 自定义 target、类型信封和 SQL merge 适配。 |
| Kafka Connect/Debezium 与 Confluent JDBC | 连接器 task、生成 SQL 和 offset 处理 | 源 CDC 与目的写入分别验证，模式演进和重平衡恢复需要独立检查。 |
| kafka-python 与 Redpanda Connect | 实际生产者/消费者或 pipeline | 自定义 SQL sink 需要自身的效果与 offset 契约。 |
| NiFi | 实际 processor 流程及数据库 writer | 失败队列、回滚设置、update keys 和生成的 UPSERT。 |
| Airbyte | 官方源/目的协议、记录和 STATE ACK | SQL sink 适配器与官方 destination 分开记录，协议 runner 与完整 Airbyte 平台部署分开记录。 |
| Airflow 与 DolphinScheduler | 实际 DAG/task 及预定 hook 或 SQL task | Shell 调用 Python 不认证原生 JDBC task 或调度器 HA。 |
| dbt | 实际模型 build、物化和数据测试 | parse 不代替 build, 全量 table 模型不建立增量/删除语义。 |
| Fivetran Connector SDK | 官方 SDK 操作及 checkpoint | 本地 tester 不认证托管服务或生产目的端。 |
| PyIceberg | 实际 catalog、typed append/scan 和预定 sink | 本地文件/catalog 加 SQL 桥接不等于原生 MatrixOne Iceberg 连接器，append 不保证 SQL 主键唯一。 |

可从现有 [DataX](Etl/DataX/datax-mysql-matrixone.md)、[SeaTunnel](Etl/Seatunnel/seatunnel-mysql-matrixone.md)、[Spark](Computing-Engine/Spark/spark-mysql-matrixone.md) 和 [Flink](Computing-Engine/Flink/flink-mysql-matrixone.md) 示例开始，再验证生产操作和恢复路径。还需要分别核对 [MySQL 兼容性](../../Overview/feature/mysql-compatibility.md)与 [JDBC 限制](../../Reference/Limitations/mo-jdbc-feature-list.md)。

## 排查生成 SQL 与元数据

保留原始生成语句、参数类型、驱动错误和组件状态。在受影响服务端以少量合成输入复现，并在语义范围重叠的对照数据库执行相同检查。区分 SQL 语法、服务端行为、驱动元数据、中间表示和工具配置问题。

以下历史报告提供具体兼容性探针。跨版本使用规避方式前，需要核对受影响构建和修复状态：

| 链路 | 探针 | 关联报告 |
|---|---|---|
| Airbyte MySQL destination | LOAD DATA 的 `SET NULLIF(@user_variable, ...)`, 数据持久化后再检查 STATE ACK | [#29849](https://github.com/matrixorigin/matrixone/issues/29849) |
| NiFi MySQL UPSERT | 参数化赋值一个未变化的主键 | [#29850](https://github.com/matrixorigin/matrixone/issues/29850) |
| Debezium JDBC 模式演进 | 带括号的 ALTER ADD COLUMN 和生成的目的 DDL | [#29851](https://github.com/matrixorigin/matrixone/issues/29851) |
| Ibis UInt64 反射 | BIGINT UNSIGNED 元数据与推断类型 | [#29846](https://github.com/matrixorigin/matrixone/issues/29846) |
| ENUM/SET 合并 | 别名限定的 JOIN UPDATE 赋值 | [#29923](https://github.com/matrixorigin/matrixone/issues/29923) |
| dlt 增量合并 | 跨库同名表的关联 DELETE | [#29876](https://github.com/matrixorigin/matrixone/issues/29876) |
| SQLAlchemy 反射 DDL | BOOL 元数据和反射列类型 | [#29879](https://github.com/matrixorigin/matrixone/issues/29879) |

报告关闭后，仍需记录修复提交、首次包含修复的发布版本和回归结果。关闭状态不能证明已部署版本包含修复。保留失败的原生路径，并与成功的适配路径分开。

## 验证恢复和运行限制

按[摄取链路的故障恢复](failure-recovery.md)检查删除、模式变更、重试和 checkpoint 顺序。记录批大小、task 并发、实际连接数、内存上限、队列容量和源保留期。一个 case worker 可以启动多个原生分片，因此不能将 worker 数量当作连接数上限。

吞吐和延迟应与硬件、存储、数据集、版本、运行时长和故障安排一起报告。内存临时文件系统上的功能测试不能建立磁盘吞吐、长稳或生产 HA 结论。

[matrixone#29848](https://github.com/matrixorigin/matrixone/issues/29848) 关联的生态报告固定了 MatrixOne 构建，并区分原生操作和显式适配。部署前需要针对目标版本重新验证，不将计划中的工具数或 case 数直接视为认证。
