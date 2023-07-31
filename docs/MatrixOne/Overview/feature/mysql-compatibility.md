# **MySQL 兼容性**

本篇文章主要对比并介绍 MatrixOne 数据库的 MySQL 模式以及原生 MySQL 数据库的兼容性信息。

MatrixOne 与 MySQL 8.0 的协议，以及 MySQL 8.0 常用的功能和语法都具有高度的兼容性。此外，MatrixOne 也对常见的 MySQL 周边工具提供了支持，如 Navicat，MySQL Workbench，JDBC 等。然而，由于 MatrixOne 的技术架构不同，且仍处于发展和完善阶段，因此有一些功能尚未得到支持。本节将主要从以下几个方面详述 MatrixOne 数据库的 MySQL 模式与原生 MySQL 数据库的区别：

- DDL 语句
- 数据类型
- DCL 语句
- SQL 语法
- 高级 SQL 功能
- 索引和约束
- 分区支持
- 函数与操作符
- 存储引擎
- 事务
- 安全与权限
- 备份恢复
- 系统变量
- 编程语言
- 周边工具

## DDL 语句

### DATABASE 相关

* 不支持中文命名的表名。
* `CHARSET`，`COLLATE`，`ENCRYPTION` 目前语法支持但不生效。
* 不支持 `ALTER DATABASE`。
* 仅默认支持 `utf8mb4` 字符集和 `utf8mb4_bin` 排序规则，无法更改。

### TABLE 相关

* 不支持 `CREATE TABLE .. AS SELECT` 语句。
* 支持列定义中的 `AUTO_INCREMENT`，但不支持表定义的 `AUTO_INCREMENT` 自定义起始值。
* 不支持列定义中的 `CHARACTER SET/CHARSET`，`COLLATE`。
* 不支持表定义中的 `CHARACTER SET/CHARSET`，`COLLATE`，`ROW_FORMAT`，`USING ...`，`ENGINE=`。

以典型的 mysqldump 从 MySQL 中导出的 DDL 语句为例：

```
-- MySQL DDL语句
CREATE TABLE IF NOT EXISTS `tool` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tool_id` bigint DEFAULT NULL COMMENT 'id',
  `operation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'type',
  `remark` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'remark',
  `create_user` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT 'create user',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `tool_id_IDX` (`tool_id`) USING BTREE,
  KEY `operation_type_IDX` (`operation_type`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1913 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='tool table';
```

需要如下方案例做出修改方可在 MatrixOne 中建表成功：

```
CREATE TABLE IF NOT EXISTS `tool` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tool_id` bigint DEFAULT NULL COMMENT 'id',
  `operation_type` varchar(50) DEFAULT NULL COMMENT 'type',
  `remark` varchar(100) DEFAULT NULL COMMENT 'remark',
  `create_user` varchar(20) DEFAULT NULL COMMENT 'create user',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'create time',
  PRIMARY KEY (`id`),
  KEY `tool_id_IDX` (`tool_id`),
  KEY `operation_type_IDX` (`operation_type`)
) COMMENT='tool table';
```

* ALTER TABLE 仅支持 `ADD/DROP COLUMN` 增加和删除列，`RENAME` 修改表名，不支持 `MODIFY COLUMN`，不支持修改已有列和索引的定义，不支持动态增加删除主键。
* ALTER TABLE 不支持 `PARTITION` 相关的操作。
* 支持定义 `Cluster by column` 字句，对某列进行预排序加速查询。

### VIEW 相关

* 不支持 `CREATE OR REPLACE VIEW`。
* 不支持 `with check option` 子句。
* 不支持 `DEFINER` 与 `SQL SECURITY` 子句。

### SEQUENCE 相关

* MySQL 不支持 SEQUENCE 对象，而 MatrixOne 可以通过 CREATE SEQUENCE 创建一个序列，MatrixOne 的语法与 PostgreSQL 相同。
* 在表中使用 SEQUENCE 时，需要注意 `auto_increment` 与 `sequence` 不能一起用，否则会报错。

## 数据类型

* BOOL: 与 MySQL 的布尔值类型实际上是 int 不同，MatrixOne 的布尔值是一个新的类型，它的值只能是 true 或 false。
* DECIMAL：DECIMAL(P,D)，MatrixOne 的有效数字 P 和小数点后的位数 D 最大精度均为 38 位，MySQL 则分别为 65 和 30。
* 浮点数：MySQL8.0.17 后废弃 Float(M,D) 及 Double(M,D) 用法，但 MatrixOne 仍保留该用法。
* DATETIME: MySQL 的最大取值范围为 `'1000-01-01 00:00:00'` 到 `'9999-12-31 23:59:59'`，MatrixOne 的最大范围为 `'0001-01-01 00:00:00'` 到 `'9999-12-31 23:59:59'`。
* TIMESTAMP: MySQL 的最大取值范围是 `'1970-01-01 00:00:01.000000'` UTC 到 `'2038-01-19 03:14:07.999999'` UTC，MatrixOne 的最大范围 `'0001-01-01 00:00:00'` UTC 到 `'9999-12-31 23:59:59'` UTC。
* MatrixOne 支持 UUID 类型。
* 不支持 YEAR 类型。
* 不支持空间 Spatial 类型。
* 不支持 BIT，ENUM，SET 类型。
* 不支持 MEDIUMINT 类型。

## DCL 语句

### ACCOUNT 相关

* 多租户 Account 是 MatrixOne 独有功能，包括 CREATE/ALTER/DROP ACCOUNT 等相关语句。

### 权限相关

* GRANT，授权逻辑与 MySQL 有差异。

* REVOLE，回收权限逻辑与 MySQL 有差异。

### SHOW 相关

* MatrixOne 不支持对某些对象进行 SHOW 操作，包括 `TRIGGER`，`FUNCTION`，`EVENT`，`PROCEDURE`，`ENGINE` 等。
* 由于架构上的不同，MatrixOne 实现了部分 SHOW 命令仅出于语法的兼容性，这些命令不会产生任何输出，如 `SHOW STATUS/PROCESSLIST/PRIVILEGES` 等。
* 有些命令虽然在语法上与 MySQL 相同，但由于实现方式的不同，其结果与 MySQL 会有较大差异，如：`SHOW GRANTS`，`SHOW ERRORS`，`SHOW VARIABLES`。
* MatrixOne 提供了一些特有的 SHOW 命令以方便其自身的管理，包括 `SHOW BACKEND SERVERS`，`SHOW ACCOUNTS`，`SHOW ROLES`，`SHOW NODE LIST` 等。

### 关于 SET

* MatrixOne 的系统变量与 MySQL 存在较大差异，大部分只是为了实现语法的兼容性，目前实际可设置的参数包括：`ROLE`，`SQL_MODE`，`TIME_ZONE`。

## SQL 语法

### SELECT 相关

* 在 `GROUP BY` 中，MatrixOne 不支持表别名。
* `SELECT...FOR UPDATE` 当前仅支持单表查询。

### INSERT 相关

* MatrixOne 不支持 `LOW_PRIORITY`，`DELAYED`，`HIGH_PRIORITY`，`IGNORE` 等修饰符。

### UPDATE 相关

* MatrixOne 不支持使用 `LOW_PRIORITY` 和 `IGNORE` 修饰符。

### DELETE 相关

* MatrixOne 不支持 `LOW_PRIORITY`，`QUICK`，`IGNORE` 等修饰符。

### 子查询相关

* MatrixOne 不支持 IN 的多层关联子查询。

### LOAD 相关

* MatrixOne 支持 `SET`，但只支持 `SET columns_name=nullif(expr1,expr2)` 的形式。
* MatrixOne 不支持 `ESCAPED BY`。
* MatrixOne 支持客户端执行 `LOAD DATA LOCAL`，但在连接时必须加入 `--local-infle` 参数。
* MatrixOne 支持导入 `JSONlines` 文件，但需要使用一些特殊的语法。
* MatrixOne 支持从对象存储导入文件，但需要使用一些特殊的语法。

### EXPLAIN 相关

* MatrixOne 的 `Explain` 和 `Explain Analyze` 打印格式均参照 PostgreSQL，与 MySQL 有较大不同。
* 不支持 JSON 类型的输出。

### 公共表表达式 (CTE)

* 不支持递归 CTE `With recursive`。

### 其他

* 不支持 `REPLACE` 语句。

## 高级 SQL 功能

* 不支持触发器。
* 不支持存储过程。
* 不支持事件调度器。
* 不支持自定义函数。
* 不支持物化视图。

## 索引和约束

* 次级索引仅实现语法，并没有加速效果。
* 外键不支持 `ON CASCADE DELETE` 级联删除。

## 分区支持

* 仅支持 `KEY`，`HASH` 两种分区类型。
* 子分区仅实现语法，未实现功能。

## 函数与操作符

### 聚合函数

* 支持 MatrixOne 特有的 Median 中位数函数。

### 时间日期类函数

* MatrixOne 的 `TO_DATE` 函数与 MySQL 的 `STR_TO_DATE` 函数起到相同功能。

### CAST 函数

* 类型转换规则与 MySQL 差异较大，请参考 [CAST](../../Reference/Operators/operators/cast-functions-and-operators/cast.md)。

### 窗口函数

* 仅支持 `RANK`，`DENSE_RANK`，`ROW_NUMBER`。

### JSON 函数

* 仅支持 `JSON_UNQUOTE`，`JSON_QUOTE`，`JSON_EXTRACT`。

### 系统管理函数

- 支持 `CURRENT_ROLE_NAME()`，`CURRENT_ROLE()`，`CURRENT_USER_NAME()`，`CURRENT_USER()`，`PURGE_LOG()`。

## 存储引擎

* MatrixOne 的 TAE 存储引擎是完全独立研发的，不支持 MySQL 的 InnoDB，MyISAM 等引擎。
* MatrixOne 中仅有 TAE 一种存储引擎，无需使用 `ENGINE=XXX` 来更换引擎。

## 安全与权限

* 仅支持使用 `ALTER USER` 方法修改密码。
* 不支持修改用户连接个数上限。
* 不支持连接 IP 白名单。
* 不支持 `LOAD` 和 `SELECT INTO` 文件授权管理。

## 事务

* MatrixOne 默认为乐观事务。
* 与 MySQL 不同，MatrixOne 中的 DDL 语句是事务性的，可以在一个事务中回滚 DDL 操作。
* 不支持表级锁 `LOCK/UNLOCK TABLE`。

## 备份恢复

* 不支持 mysqldump 备份工具，仅支持 modump 工具。
* 不支持物理备份。
* 不支持 binlog 日志备份。
* 不支持增量备份。

## 系统变量

* MatrixOne 的 `lower_case_table_names` 有 5 种模式，默认为 1。

## 编程语言

* Java，Python，Golang 连接器和 ORM 基本支持，其他语言的连接器及 ORM 可能会碰到兼容性问题。

## 其他支持工具

* Navicat，DBeaver，MySQL Workbench，HeidiSQL 基本支持，但是由于 ALTER TABLE 能力不完善，表设计功能支持不完善。
* 不支持 xtrabackup 备份工具。
