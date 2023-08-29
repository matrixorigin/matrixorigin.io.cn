# MatrixOne 功能清单

本文档列出了 MatrixOne 最新版本所支持的功能清单，针对常见以及在 MatrixOne 的路线图中的功能但是目前不支持的功能也将列出。

## 数据定义语言（Data definition language, DDL）

| 数据定义语言 (DDL)                 | 支持（Y）/不支持（N）/实验特性 (E)           |
| ---------------------------------- | -------------------------------------------- |
| 创建数据库CREATE DATABASE          | Y                                            |
| 删除数据库DROP DATABASE            | Y                                            |
| 修改数据库ALTER DATABASE           | N                                            |
| 创建表CREATE TABLE                 | Y                                            |
| 修改表ALTER TABLE                  | E，子句`CHANGE [COLUMN]`，`MODIFY [COLUMN]`，`RENAME COLUMN`，`ADD [CONSTRAINT [symbol]] PRIMARY KEY`，`DROP PRIMARY KEY` 和 `ALTER COLUMN ORDER BY` 可以在 ALTER TABLE 语句中自由组合使用，但暂时不支持与其他子句一起使用。  |
| 修改表名RENAME TABLE               | N，可用ALTER TABLE tbl RENAME TO new_tbl替代 |
| 删除表DROP TABLE                   | Y                                            |
| 创建约束CREATE INDEX               | Y，次级索引没有加速作用                      |
| 删除约束DROP INDEX                 | Y                                            |
| 修改列MODIFY COLUMN                | N                                            |
| 主键PRIMARY KEY                    | Y                                            |
| 创建视图CREATE VIEW                | Y                                            |
| 修改视图ALTER VIEW                 | Y                                            |
| 删除视图DROP VIEW                  | Y                                            |
| 清空表TRUNCATE TABLE               | Y                                            |
| 自增列AUTO_INCREMENT               | Y                                            |
| 序列SEQUENCE                       | Y                                            |
| 临时表TEMPORARY TABLE              | Y                                            |
| 流式表CREATE STREAM                | E，部分支持                                 |
| 分区表PARTITION BY                 | E，部分类型支持                              |
| 字符集和排序顺序CHARSET，COLLATION   | N，仅默认支持UTF8                            |

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
| 公共表表达式(Common Table Expressions，CTE)         | Y                                  |
| 事务语句 BEGIN/START TRANSACTION, COMMIT, ROLLBACK | Y                                  |
| EXPLAIN                                           | Y                                  |
| EXPLAIN ANALYZE                                   | Y                                  |
| 表级锁 LOCK/UNLOCK TABLE                           | N                                  |
| 用户自定义变量                                       | Y                                  |

## 高级 SQL 功能

| 高级 SQL 功能                 | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------------------- | ---------------------------------- |
| 预处理PREPARE                 | Y                                  |
| 存储过程 STORED PROCEDURE     | N                                  |
| 触发器 TRIGGER                | N                                  |
| 时间调度器EVENT SCHEDULER     | N                                  |
| 自定义函数UDF                 | N                                  |
| 增量物化视图Materialized VIEW | N                                  |

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
|              | ENUM                                   | Y，不支持**过滤 ENUM 值**和**排序 ENUM 值**|
|              | SET                                    | N                                  |
| 二进制类型   | TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB      | Y                                  |
| 时间与日期   | DATE                                   | Y                                  |
|              | TIME                                   | Y                                  |
|              | DATETIME                               | Y                                  |
|              | TIMESTAMP                              | Y                                  |
|              | YEAR                                   | Y                                  |
| Boolean      | BOOL                                   | Y                                  |
| 定点类型     | DECIMAL                                | Y，最高到38位                      |
| JSON 类型    | JSON                                   | Y                                  |
| 向量类型     | VECTOR                                 | N                                  |
| 空间类型     | SPATIAL                                | N                                  |

## 索引与约束

| 索引与约束       | 支持（Y）/不支持（N）/实验特性 (E) |
| ---------------- | ---------------------------------- |
| 主键约束         | Y                                  |
| 复合主键         | Y                                  |
| 唯一约束         | Y                                  |
| 次级索引         | Y，仅语法实现，没有加速效果        |
| 外键约束         | Y                                  |
| 无效数据强制约束   | Y                                  |
| ENUM 和 SET 约束 | N                                  |
| 非空约束         | Y                                  |
| 自增约束         | Y                                  |

## 事务

| 事务                       | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------------------- | ---------------------------------- |
| 悲观事务                   | Y                                  |
| 乐观事务                   | Y                                  |
| 分布式事务                 | Y                                  |
| 可重复读隔离（快照SI隔离）   | Y                                  |
| 读已提交RC隔离             | Y                                  |

## 函数与操作符

| 函数与操作符   | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------- | ---------------------------------- |
| 聚合函数       | Y                                  |
| 数值类函数     | Y                                  |
| 时间日期类函数 | Y                                  |
| 字符串函数     | Y                                  |
| Cast函数       | Y                                  |
| 流程控制函数   | E                                  |
| 窗口函数       | Y                                  |
| JSON函数       | Y                                  |
| 系统函数       | Y                                  |
| 其他函数       | Y                                  |
| 操作符         | Y                                  |

## 分区

| 分区              | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------- | ---------------------------------- |
| KEY 分区          | E                                  |
| HASH 分区         | E                                  |
| RANGE 分区        | N                                  |
| RANGE COLUMNS分区 | N                                  |
| LIST 分区         | N                                  |
| LIST COLUMNS 分区 | N                                  |

## 数据导入和导出

| 数据导入和导出    | 支持（Y）/不支持（N）/实验特性 (E) |
| ----------------- | ---------------------------------- |
| 文件导入LOAD DATA  | Y                                  |
| SQL导入SOURCE     | Y                                  |
| 从对象存储导入      | Y                                  |
| modump工具导出SQL  | Y                                  |
| mysqldump原生工具  | N                                  |

## 安全与访问控制

| 安全                       | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------------------- | ---------------------------------- |
| 传输层加密TLS              | Y                                  |
| 静态加密                   | Y                                  |
| 从对象存储导入              | Y                                  |
| 基于角色的访问控制（RBAC）    | Y                                  |
| 多租户                     | Y                                  |

## 备份和恢复

| 备份和恢复   | 支持（Y）/不支持（N）/实验特性 (E) |
| ------------ | ---------------------------------- |
| 逻辑备份恢复 | Y，仅支持modump工具                |
| 物理备份恢复 | Y                                  |

## 管理工具

| 管理工具             | 支持（Y）/不支持（N）/实验特性 (E) |
| -------------------- | ---------------------------------- |
| 单机mo_ctl部署管理   | Y                                  |
| 分布式mo_ctl部署管理 | E，仅企业版                        |
| 可视化管理平台       | E，仅公有云版本                    |
| 系统日志记录         | Y                                  |
| 系统指标监控         | Y                                  |
| 慢查询日志           | Y                                  |
| SQL记录              | Y                                  |
| Kubernetes operator  | Y                                  |

## 部署方式

| 部署方式             | 支持（Y）/不支持（N）/实验特性 (E)  |
| -------------------- | ----------------------------------- |
| 单机环境私有化部署   | Y                                   |
| 分布式环境私有化部署 | Y，自建Kubernetes与minIO对象存储    |
| 阿里云分布式自建部署 | Y，ACK+OSS                          |
| 腾讯云分布式自建部署 | Y，TKE+COS                          |
| AWS分布式自建部署    | Y，EKS+S3                           |
| 公有云Serverless     | Y，MatrixOne Cloud，支持AWS，阿里云 |
