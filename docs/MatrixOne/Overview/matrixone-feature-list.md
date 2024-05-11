# MatrixOne 功能清单

本文档列出了 MatrixOne 最新版本所支持的功能清单，针对常见以及在 MatrixOne 的路线图中的功能但是目前不支持的功能也将列出。

## 数据定义语言（Data definition language, DDL）

| 数据定义语言 (DDL)                 | 支持（Y）/不支持（N）/实验特性 (E)           |
| ---------------------------------- | -------------------------------------------- |
| 创建数据库 CREATE DATABASE          | Y                                            |
| 删除数据库 DROP DATABASE            | Y                                            |
| 修改数据库 ALTER DATABASE           | N                                            |
| 创建表 CREATE TABLE                 | Y                                            |
| 修改表 ALTER TABLE                  | E    |
| 修改表名 RENAME TABLE               | N，可用 ALTER TABLE tbl RENAME TO new_tbl 替代 |
| 删除表 DROP TABLE                   | Y                                            |
| 创建约束 CREATE INDEX               | Y                     |
| 删除约束 DROP INDEX                 | Y                                            |
| 修改列 MODIFY COLUMN                | Y                                            |
| 主键 PRIMARY KEY                    | Y                                            |
| 创建视图 CREATE VIEW                | Y                                            |
| 修改视图 ALTER VIEW                 | Y                                            |
| 删除视图 DROP VIEW                  | Y                                            |
| 清空表 TRUNCATE TABLE               | Y                                            |
| 自增列 AUTO_INCREMENT               | Y                                            |
| 序列 SEQUENCE                       | Y                                            |
| 临时表 TEMPORARY TABLE              | Y                                            |
| 流式表 CREATE DYNAMIC TABLE              | E，部分支持                                 |
| 分区表 PARTITION BY                 | E，部分类型支持                              |
| 字符集和排序顺序 CHARSET，COLLATION   | N，仅默认支持 UTF8                            |

## 数据修改/查询语言（Data manipulation/query language, DML/DQL）

| SQL 语句                                           | 支持（Y）/不支持（N）/实验特性 (E) |
| ------------------------------------------------- | ---------------------------------- |
| SELECT                                            | Y                                  |
| INSERT                                            | Y                                  |
| UPDATE                                            | Y                                  |
| DELETE                                            | Y                                  |
| REPLACE                                           | Y                                  |
| INSERT ON DUPLICATE KEY UPDATE                    | Y                                  |
| 导入数据 LOAD DATA                                 | Y                                  |
| 导出数据 SELECT INTO                               | Y                                  |
| 连接 INNER/LEFT/RIGHT/OUTER JOIN                  | Y                                  |
| 联合 UNION, UNION ALL                             | Y                                  |
| EXCEPT, INTERSECT                                 | Y                                  |
| GROUP BY, ORDER BY                                | Y                                  |
| 预排序 CLUSTER BY                                  | Y                                  |
| 子查询 SUBQUERY                                    | Y                                  |
| 公共表表达式 (Common Table Expressions，CTE)         | Y                                  |
| 事务语句 BEGIN/START TRANSACTION, COMMIT, ROLLBACK | Y                                  |
| EXPLAIN                                           | Y                                  |
| EXPLAIN ANALYZE                                   | Y                                  |
| 表级锁 LOCK/UNLOCK TABLE                           | N                                  |
| 用户自定义变量                                       | Y                                  |

## 高级 SQL 功能

| 高级 SQL 功能                 | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------------------- | ---------------------------------- |
| 预处理 PREPARE                 | Y                                  |
| 存储过程 STORED PROCEDURE     | N                                  |
| 触发器 TRIGGER                | N                                  |
| 时间调度器 EVENT SCHEDULER     | N                                  |
| 自定义函数 UDF                 | Y                                  |
| 快照 SNAPSHOT                 | Y                                  |
| 物化视图 Materialized VIEW | N                                  |

## 流计算

| 流计算功能                 | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------------------- | ---------------------------------- |
| 动态表                 | E                                  |
| Kafka 连接器                 | E                                  |
| 物化视图      | N                                  |
| (增量) 物化视图     | N                                  |

## 时序

| 流计算功能                 | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------------------- | ---------------------------------- |
| 时序表                 | Y                                 |
| 滑动窗口                 | Y                                  |
| 降采样      | Y                                  |
| 插值     | Y                                  |
| TTL（Time To Live）     | N                                  |
| ROLLUP     | N                                  |

## 数据类型

| 数据类型分类 | 数据类型                               | 支持（Y）/不支持（N）/实验特性 (E) |
| ------------ | -------------------------------------- | ---------------------------------- |
| 整数类型     | TINYINT/SMALLINT/INT/BIGINT (UNSIGNED) | Y                                  |
|              | BIT                                    | N                                  |
| 浮点类型     | FLOAT                                  | Y                                  |
|              | DOUBLE                                 | Y                                  |
| 字符串类型   | CHAR                                   | Y                                  |
|              | VARCHAR                                | Y                                  |
|              | BINARY                                 | Y                                  |
|              | VARBINARY                              | Y                                  |
|              | TINYTEXT/TEXT/MEDIUMTEXT/LONGTEXT      | Y                                  |
|              | ENUM                                   | Y                                  |
|              | SET                                    | N                                  |
| 二进制类型   | TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB      | Y                                  |
| 时间与日期   | DATE                                   | Y                                  |
|              | TIME                                   | Y                                  |
|              | DATETIME                               | Y                                  |
|              | TIMESTAMP                              | Y                                  |
|              | YEAR                                   | Y                                  |
| Boolean      | BOOL                                   | Y                                  |
| 定点类型     | DECIMAL                                | Y，最高到 38 位                      |
| JSON 类型    | JSON                                   | Y                                  |
| 向量类型     | VECTOR                                 | Y                                  |
| 数组类型     | ARRAY                                 | N（与 MySQL 一致，在 JSON 中提供数组操作）                 |
| 位图类型   | BITMAP                                 |  N
| 空间类型     | GEOMETRY/POINT/LINESTRING/POLYGON      | N                                  |

## 索引与约束

| 索引与约束       | 支持（Y）/不支持（N）/实验特性 (E) |
| ---------------- | ---------------------------------- |
| 主键约束         | Y                                  |
| 复合主键         | Y                                  |
| 唯一约束         | Y                                  |
| 次级索引         | Y                                  |
| 向量索引         | Y                                  |
| 外键约束         | Y                                  |
| 无效数据强制约束   | Y                                  |
| ENUM 和 SET 约束 | N                                  |
| 非空约束         | Y                                  |
| 自增约束         | Y                                  |

## 事务

| 事务                       | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------------------- | ---------------------------------- |
| 悲观事务                   | Y（默认模式）                                 |
| 乐观事务                   | Y                                  |
| 跨库事务                 | Y                                  |
| 分布式事务                 | Y                                  |
| 可重复读隔离（快照 SI 隔离）   | Y                                  |
| 读已提交 RC 隔离             | Y（默认模式）                                 |

## 函数与操作符

| 函数与操作符   | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------- | ---------------------------------- |
| 聚合函数       | Y                                  |
| 数值类函数     | Y                                  |
| 时间日期类函数 | Y                                  |
| 字符串函数     | Y                                  |
| Cast 函数       | Y                                  |
| 流程控制函数   | E                                  |
| 窗口函数       | Y                                  |
| JSON 函数       | Y                                  |
| 向量函数       | Y                                  |
| 系统函数       | Y                                  |
| 其他函数       | Y                                  |
| 操作符         | Y                                  |

MatrixOne 的完整函数列表可以参见[该函数总表](../Reference/Functions-and-Operators/matrixone-function-list.md).

## 分区

| 分区              | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------- | ---------------------------------- |
| KEY 分区          | E                                  |
| HASH 分区         | E                                  |
| RANGE 分区        | E                                  |
| RANGE COLUMNS 分区 | E                                  |
| LIST 分区         | E                                  |
| LIST COLUMNS 分区 | E                                  |

## 数据导入和导出

| 数据导入和导出    | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------- | ---------------------------------- |
| INSERT INTO 写入     | Y                                  |
| SQL 导入 SOURCE     | Y                                  |
| 文件导入 LOAD DATA INFILE  | Y                                  |
| 流式导入 LOAD DATA INLINE     | Y                                  |
| 从对象存储导入      | Y                                  |
| mo-dump 工具导出 SQL/CSV  | Y                                  |
| SELECT INTO 导出 CSV/JSON  | Y                                  |
| mysqldump 原生工具  | N                                  |

## 安全与访问控制

| 安全                       | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------------------- | ---------------------------------- |
| 传输层加密 TLS              | Y                                  |
| 静态加密                   | Y                                  |
| 从对象存储导入              | Y                                  |
| 基于角色的访问控制（RBAC）    | Y                                  |
| 多租户                     | Y                                  |

## 备份和恢复

| 备份和恢复   | 支持（Y）/不支持（N）/实验特性 (E) |
| ------------ | ---------------------------------- |
| 逻辑备份恢复 | Y，仅支持 mo-dump 工具                |
| 物理备份恢复 | Y，仅支持 mobackup 工具                |
| CDC 同步     | N（MatrixOne 作为源端不支持）                                  |

## 管理工具

| 管理工具             | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------------- | ---------------------------------- |
| 单机 mo_ctl 部署管理   | Y                                  |
| 分布式 mo_ctl 部署管理 | E，仅企业版                        |
| 可视化管理平台       | E，仅公有云版本                    |
| 系统日志记录         | Y                                  |
| 系统指标监控         | Y                                  |
| 慢查询日志           | Y                                  |
| SQL 记录              | Y                                  |
| Kubernetes operator  | Y                                  |

## 部署方式

| 部署方式             | 支持（Y）/不支持（N）/实验特性 (E)  |
| -------------------- | ----------------------------------- |
| 单机环境私有化部署   | Y                                   |
| 分布式环境私有化部署 | Y，自建 Kubernetes 与 minIO 对象存储    |
| 阿里云分布式自建部署 | Y，ACK+OSS                          |
| 腾讯云分布式自建部署 | Y，TKE+COS                          |
| AWS 分布式自建部署    | Y，EKS+S3                           |
| 公有云 Serverless     | Y，MatrixOne Cloud，支持 AWS，阿里云 |

## 应用连接器及常见 ORM

| 应用连接器             | 支持（Y）/不支持（N） |
| -------------------- | ----------------------------------- |
| JDBC   | Y                                   |
| ODBC | N    |
| pymysql | Y                          |
| go-sql-driver | Y                         |
| MyBatis    | Y                         |
| MyBatis-plus     | Y |
| Spring-JPA     | Y |
| Hibernate     | Y |
| GORM     | Y |
| SQL Alchemy     | Y |

注意：未在上面标明的应用连接器或者 ORM 工具并不一定不支持，MatrixOne 本身对 MySQL 8.0 高度兼容，因此如果连接 MySQL 可以正常运行的都基本可以适配 MatrixOne，用户可以直接尝试基于 MySQL 可以跑通的成熟工具连接 MatrixOne。

## 生态工具适配

| 工具种类 | 工具名称                               | 支持（Y）/不支持（N）|
| ------------ | -------------------------------------- | ---------------------------------- |
| 数据库管理 IDE    | Navicat | Y                                  |
|     | MySQL Workbench | Y                                  |
|     | DBeaver | Y                                  |
|     | HeidiSQL | Y                                  |
|     | SQLyog | Y                                  |
| ETL 工具    | DataX | Y                                  |
|      | Canal | Y                                  |
|     | Kettle | Y                                  |
|     | Seatunnel | Y                                  |
|    | FlinkCDC | Y                                  |
| 消息队列    | Kafka | Y                                  |
| 计算引擎    | Spark | Y                                  |
|      | Flink | Y                                  |
| BI 工具    | Superset | Y                                  |
|      | Tableau | Y                                  |
|      | FineBI | Y                                  |
|      | 永洪 BI | Y                                  |
|      | Datafor | Y                                  |
| 数据调度    | DolphinScheduler | Y                                  |
| 可视化监控    | Grafana | Y                                  |

注意：未在上面标明的生态工具并不一定不支持，MatrixOne 本身对 MySQL 8.0 高度兼容，因此如果连接 MySQL 可以正常运行的都基本可以适配 MatrixOne，用户可以直接尝试基于 MySQL 可以跑通的成熟工具连接 MatrixOne。