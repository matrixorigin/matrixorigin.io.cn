# **MySQL 兼容性**

MatrixOne 的 SQL 语法兼容了 MySQL 8.0.23 版本。

|  语句类型   | 语法 |  兼容性  |
|  ----  | ----  |  ----  |
| 数据定义语言（Data Definition Language，DDL)  | CREATE DATABASE | 不支持中文命名的表名 |
|   |   | 支持部分拉丁语  |
|   |   | `CHARSET`，`COLLATE`，`ENCRYPTION` 目前可以使用但无法生效 |
|   | CREATE TABLE  | 暂不支持表的分区|
|   |   | 不支持 `Create table .. as` 语句 |
|   |   | 不支持列级约束 |
|   |   | 暂不支持 `KEY(column)` 语法|
| | | 支持 `AUTO_INCREMENT` ，但暂不支持自定义起始值 |
|   | ALTER | 仅部分支持 `ALTER TABLE` |
|   | DROP DATABASE | 同 MySQL |
|   | DROP TABLE | 同 MySQL|
||CREAT VIEW|不支持 with check option 子句|
||DROP VIEW|同 MySQL|
||CREAT SEQUENCE|同 MySQL|
||DROP SEQUENCE|同 MySQL|
| 数据操作语言（Data Manipulation Language，DML)  |UPDATE|同 MySQL|
||DELETE|同 MySQL|
|| INSERT | 暂不支持 `LOW_PRIORITY`，`DELAYED`，`HIGH_PRIORITY`   |
|   |   | 暂不支持使用 `INSERT INTO VALUES` 函数或表达式|
|   |   | 支持批量插入，最多支持 160,000 行 |
|   |   | 暂不支持 `DELAYED`  |
|   |   | 不分支持拉丁文命名  |
|   |   | 当前的 SQL 模式同 MySQL 中的 `only_full_group_by`模式 |
|   | SELECT | 在 `GROUP BY` 中不支持表别名 |
|   |   | 部分支持 Distinct  |
|   |   | 暂不支持 `SELECT...FOR UPDATE` 从句  |
|   |   | 部分支持 `INTO OUTFILE` |
|   | LOAD DATA | 支持导入 csv 和 jsonline 文件  |
|   |   | 包括符 enclosed 应该为""  |
|   |   | 字段分隔符 `FILEDS TERMINATED BY` 应该为 "," 或 "|
|   |   | 行分隔符 `LINES TERMINATED BY` 应该为 "\n" |
|   |   | 支持 `SET`，但仅支持 `SET columns_name=nullif(expr1,expr2)` |
|   |   | 不支持本地关键词 |
|   |   | 不支持 `ESCAPED BY` |
| | JOIN | 同 MySQL  |
| | SUBQUERY | 暂不支持 `Non-scalar` 子查询，但可以作为过滤条件使用 |
| 数据控制语言（Data Control Language，DCL)  |CREATE ACCOUNT| MatrixOne 创建集群租户，语法同 MySQL，租户资源隔离逻辑与 MySQL 有差异|
||CREATE ROLE| 同 MySQL|
||CREATE USER|同 MySQL|
||ALTER ACCOUNT|语法同 MySQL，当前仅支持修改密码与暂停恢复租户操作|
||ALTER USER|同 MySQL，当前仅支持租户管理员或系统管理员修改用户密码，且一次只能修改一个用户的密码|
||DROP ACCOUNT|同 MySQL|
||DROP ROLE|同 MySQL|
||DROP USER|同 MySQL|
||GRANT|语法同 MySQL，授权逻辑与 MySQL 有差异|
||ROVOKE|语法同 MySQL，回收权限逻辑与 MySQL 有差异|
| 数据库管理语句  | SHOW | 部分支持，当前支持 `SHOW ACCOUNTS`、`SHOW DATABASES`、`SHOW CREATE TABLE`、`SHOW CREATE VIEW`、`SHOW TABLES`、`SHOW INDEX`、`SHOW COLLATION`、`SHOW COLUMNS`、`SHOW FUNCTION STATUS`、`SHOW GRANT`、`SHOW ROLES`、`SHOW SEQUENCE`、`SHOW VARIABLES`、`SHOW NODE LIST` |
||SHOW GRANTS FOR USERS| 目前只能看到直接授权的角色所具有的权限，继承角色的权限不能显示|
| 工具类语句 | EXPLAIN | 分析的结果与 MySQL 有所不同 |
|||不支持 JSON 类型的输出|
|   | PREPARED | 支持 `PREPARE`、`EXCUTE`、`DEALLOCATE` |
|   | Other statements | 暂不支持  |
| 数据类型 | BOOLEAN | 与 MySQL 的布尔值类型 int 不同，MatrixOne 的布尔值是一个新的类型，它的值只能是 true 或 false。|
|   | INT/BIGINT/SMALLINT/TINYINT/INT UNSIGNED/BIGINT UNSIGNED | 同 MySQL  |
|   | CHAR/VARCHAR/BINARY/VARBINARY/TEXT/BLOB/ENUM | 同 MySQL  |
|   | FLOAT/DOUBLE | 与 MySQL 的精度有所不同  |
| | DECIMAL | 最大精度为 38 位。|
|   | DATE | 只支持 `YYYY-MM-DD` 与 `YYYYMMDD` 形式  |
|   | DATETIME | 只支持 `YYYY-MM-DD hh:mi:ssssss` 与 `YYYYMMDD hh:mi:ssssss` 形式  |
| | TIMESTAMP | 同 MySQL |
| | JSON | 同 MySQL |
|   | Other types | 暂不支持  |
| 运算符  | "+","-","*","/" | 同 MySQL  |
|   | DIV, %, MOD | 同 MySQL |
|   | LIKE | 同 MySQL |
|   | IN | 只支持常数列表 |
|   | NOT, AND, &&,OR, "\|\|" | 同 MySQL  |
|   | CAST | 支持不同转换规则。 |
| Functions | MAX, MIN, COUNT, AVG, SUM | 同 MySQL |
|  | ANY_VALUE | `ANY_VALUE` 是 MatrixOne 中的一个聚合函数。不能在 `GROUP` 或过滤条件中使用。 |
||正则表达式 | 即`REGEXP_INSTR()`，`REGEXP_LIKE()`，`REGEXP_REPLACE()`，`REGEXP_SUBSTR()`	暂不支持第三个参数|
||TO_DATE|对于日期的入参仅支持常量|
|系统命令|
