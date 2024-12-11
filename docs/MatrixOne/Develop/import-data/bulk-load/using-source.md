# Source 插入

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

#### 2. 导入至 MatrixOne

将整个表结构和数据导入到 MatrixOne 中。

1. 打开 MySQL 终端并连接到 MatrixOne。

2. 通过 `source` 命令将 *sql* 文件导入 MatrixOne。

```
mysql> use test;
mysql> source /YOUR_PATH/a.sql
```

如果 *sql* 文件较大，可以使用如下命令在后台运行导入任务：

```
nohup mysql -h 127.0.0.1 -P 6001 -uroot -p111 -e -D test 'source /YOUR_PATH/a.sql' &
```

!!! note
       上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../../Security/password-mgmt.md)。

#### 3. 检查数据

导入成功后，使用如下 SQL 语句查看导入结果：

```sql
select * from tool;
```

## 限制说明

MatrixOne v24.2.0.1 版本已经支持 MySQL 的建表语句，因此可以顺畅地将 MySQL 表迁移到 MatrixOne 上。不过需要注意，在迁移过程中，不兼容 MySQL 部分关键字，如 `engine=` 等，在 MatrixOne 中会被自动忽略，也不会影响表结构的迁移。

但需要特别注意的是，尽管 MatrixOne 支持 MySQL 建表语句，如果迁移的表中包含不兼容的数据类型、触发器、函数或存储过程，仍需要手动修改。更多详细的兼容性信息，参见 [MySQL 兼容性](../../../Overview/feature/mysql-compatibility.md)。
