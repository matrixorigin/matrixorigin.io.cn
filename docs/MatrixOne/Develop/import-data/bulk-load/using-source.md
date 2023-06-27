# 使用 `source` 命令批量导入数据

本篇文档将指导你使用 `source` 命令批量导入数据至 MatrixOne。

## 语法结构

```
SOURCE /path/to/your/sql_script.sql;
```

`/path/to/your/sql_script.sql` 是 SQL 脚本文件的绝对路径。当执行此命令时，客户端会读取指定的 SQL 脚本文件，并执行其中包含的所有 SQL 语句。

## 教程示例

在本教程中将指导你如何使用 `source` 命令将数据从 MySQL 迁移至 MatrixOne。

### 开始前准备

已完成[单机部署 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。

### 步骤

#### 1. MySQL 数据转储

你需要拥有对 MySQL 实例的完全访问权限。

首先，使用 `mysqldump` 将 MySQL 表结构和数据通过以下命令转储到一个文件中。如果你不熟悉如何使用 `mysqldump`，可参见 [mysqldump 教程](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/)。

```
mysqldump -h IP_ADDRESS -uUSERNAME -pPASSWORD -d DB_NAME1 DB_NAME2 ... OUTPUT_FILE_NAME.SQL
```

示例如下，使用命令将一个命名为 *test* 数据库的所有表结构和数据转储到一个名为 *a.sql* 的文件中。

```
mysqldump -h 127.0.0.1 -uroot -proot -d test > a.sql
```

#### 2. 修改 *sql* 文件

从 MySQL 转储的 SQL 文件还不完全兼容 MatrixOne。你需要删除和修改几个元素，以使 SQL 文件适应 MatrixOne 的格式。

* 需要删除不支持的语法或功能：`CHARACTER SET/CHARSET`、`COLLATE`、`ROW_FORMAT`、`USING BTREE`、`LOCK TABLE` `SET SYSTEM_VARIABLE`、`ENGINE`。

* 需要修改不支持的数据类型：如果你使用 BINARY 类型，你可以将其修改为 BLOB 类型。

下面示例是一个典型的 `mysqldump` 表：

```
DROP TABLE IF EXISTS `tool`;
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

在 MatrixOne 中成功创建这个表，它需要被修改为：

```
DROP TABLE IF EXISTS `tool`;
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

#### 3. 导入至 MatrixOne

转储的 *sql* 文件修改完成之后，就可以将整个表结构和数据导入到 MatrixOne 中。

1. 打开 MySQL 终端并连接到 MatrixOne。

2. 通过 `source` 命令将 *sql* 文件导入 MatrixOne。

```
mysql> source /YOUR_PATH/a.sql
```

如果 *sql* 文件较大，可以使用如下命令在后台运行导入任务：

```
nohup mysql -h 127.0.0.1 -P 6001 -udump -p111 -e 'source /YOUR_PATH/a.sql' &
```

#### 4. 检查数据

导入成功后，使用如下 SQL 语句查看导入结果：

```sql
select * from tool;
```
