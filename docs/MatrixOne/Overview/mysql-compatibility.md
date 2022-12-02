# **MySQL兼容性**

MatrixOne的SQL语法兼容了MySQL 8.0.23版本。

|  语句类型   | 语法 |  兼容性  |
|  ----  | ----  |  ----  |
| DDL  | CREATE DATABASE | 不支持中文命名的表名 |
|   |   | 支持部分拉丁语  |
|   |   | `CHARSET`，`COLLATE`，`ENCRYPTION` 目前可以使用但无法生效 |
|   | CREATE TABLE  | 暂不支持表的分区|
|   |   | 不支持 `Create table .. as` 语句 |
|   |   | 不支持列级约束 |
|   |   | 暂不支持复合主键 |
|   |   | 暂不支持 `KEY(column)` 语法|
| | | 支持 `AUTO_INCREMENT` ，但暂不支持自定义起始值 |
|   | CREATE other projects | 不支持 `CREATE/DROP INDEX` |
|   | ALTER | 暂不支持  |
|   | DROP DATABASE | 同 MySQL. |
|   | DROP TABLE | 同 MySQL. |
||CREAT VIEW|不支持with check option子句|
| DML  |UPDATE|支持多表更新|
||DELETE|支持多表删除|
|| INSERT | 暂不支持 `LOW_PRIORITY`，`DELAYED`，`HIGH_PRIORITY`   |
|   |   | 暂不支持使用 `INSERT INTO VALUES` 函数或表达式|
|   |   | 支持批量插入，最多支持160,000行 |
|||支持 `insert into select`|
|   |   | 暂不支持 `ON DUPLICATE KEY UPDATE`  |
|   |   | 暂不支持 `DELAYED`  |
|   |   | 不分支持拉丁文命名  |
|   |   | 当前的 SQL 模式同 MySQL 中的 `only_full_group_by`模式 |
|   | SELECT | 在 `GROUP BY` 中不支持表别名 |
|   |   | 部分支持 `Distinct`  |
|   |   | 暂不支持 `SELECT...FOR UPDATE` 从句  |
|   |   | 部分支持 `INTO OUTFILE` |
|||支持 order by 子句中的 `NULLS { FIRST | LAST }`  ] |
|   | LOAD DATA | 只能导入 csv 文件  |
|   |   | 包括符 enclosed 应该为""  |
|   |   | 字段分隔符 `FILEDS TERMINATED BY` 应该为 "," 或 "|
|   |   | 行分隔符 `LINES TERMINATED BY` 应该为 "\n" |
|   |   | 支持 `SET`，但仅支持 `SET columns_name=nullif(expr1,expr2)` |
|   |   | 不支持本地关键词 |
|   |   | 只有mo-server上的文件才支持相对路径 |
| | JOIN | 同 MySQL  |
| | SUBQUERY | 暂不支持 `Non-scalar` 子查询 |
| 数据库管理语句  | SHOW | 仅支持 `show tables` 与 `show databases`  |
|   |  | 支持 `CREATE TABLE` 与 `CREATE DATABASE` |
|   | Other statements | 暂不支持  |
| 工具类语句  | USE | `Use database` 同 MySQL  |
|   | Explain | 分析的结果与 MySQL 有所不同 |
|   | | 支持 `Explain Analyze` |
|||不支持json类型的输出|
|   | Other statements | 暂不支持  |
| 数据类型 | Boolean | 与 MySQL 的布尔值类型 int 不同，MatrixOne 的布尔值是一个新的类型，它的值只能是 true 或 false。|
|   | Int/Bigint/Smallint/Tinyint | 同 MySQL  |
|   | char/varchar | 同 MySQL  |
|   | Float/double | T与MySQL的精度有所不同  |
| | DECIMAL | 最大精度为38位. |
|   | Date | 只支持 `YYYY-MM-DD` 与 `YYYYMMDD` 形式  |
|   | Datetime | 只支持 `YYYY-MM-DD hh:mi:ssssss` 与 `YYYYMMDD hh:mi:ssssss` 形式  |
| | Timestamp | 同 MySQL，支持 `timezone`，`Timestamp` 的值随着时区的变化而变化。 |
||Time|支持 `time` 类型|
||UUID| 支持|
|   | Other types | 暂不支持  |
| 运算符  | "+","-","*","/" | 同 MySQL  |
|   | DIV, %, MOD | 同 MySQL |
|   | LIKE | 同 MySQL |
|   | IN | 只支持常数列表 |
|   | NOT, AND, &&,OR, "\|\|" | 同 MySQL  |
|   | XOR | 暂不支持  |
|   | CAST | 支持不同转换规则。 |
| Functions | MAX, MIN, COUNT, AVG, SUM | 同 MySQL. 暂不支持 `Distinct` |
|  | any_value | `Any_value` 是 MatrixOne 中的一个聚合函数。不能在 `GROUP` 或过滤条件中使用。 |
||正则表达式|即`REGEXP_INSTR()`，`REGEXP_LIKE()`，`REGEXP_REPLACE()`，`REGEXP_SUBSTR()`	暂不支持第三个参数|
||to_date|对于日期的入参仅支持常量|
|系统命令|SHOW GRANTS FOR USERS| 目前只能看到直接授权的角色所具有的权限，继承角色的权限不能显示|
