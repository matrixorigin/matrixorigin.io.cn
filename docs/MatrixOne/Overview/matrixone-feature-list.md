# MatrixOne 功能列表

本文档列出了 MatrixOne 最新版本所支持的功能。

## 数据定义语言（Data definition language, DDL）

| 数据定义语言 (DDL) | 支持（Y）/不支持（N） |
| ----------------------------- | ---- |
| CREATE DATABASE               | Y    |
| DROP DATABASE                 | Y    |
| RENAME DATABASE               | N    |
| CREATE TABLE                  | Y    |
| ALTER TABLE                   | N    |
| RENAME TABLE                  | N    |
| DROP TABLE                    | Y    |
| CREATE INDEX                  | Y    |
| DROP INDEX                    | Y    |
| MODIFY COLUMN                 | N    |
| PRIMARY KEY                   | Y    |
| CREATE VIEW                   | Y    |
| ALTER VIEW                    | Y    |
| DROP VIEW                     | Y    |
| CREATE OR REPLACE VIEW        | N    |
| TRUNCATE                      | N    |
| SEQUENCE                      | N    |
| AUTO_INCREMENT                | Y    |
| Temporary tables              | Y    |

## SQL 语句

| SQL 语句                      | 支持（Y）/不支持（N）  |
| ----------------------------------- | ---- |
| SELECT                              | Y    |
| INSERT                              | Y    |
| UPDATE                              | Y    |
| DELETE                              | Y    |
| REPLACE                             | N    |
| INSERT ON DUPLICATE KEY             | N    |
| LOAD DATA INFILE                    | Y    |
| SELECT INTO OUTFILE                 | Y    |
| INNER/LEFT/RIGHT/OUTER JOIN         | Y    |
| UNION, UNION ALL                    | Y    |
| EXCEPT, INTERSECT                   | Y    |
| GROUP BY, ORDER BY                  | Y    |
| Common Table Expressions(CTE)       | Y    |
| START TRANSACTION, COMMIT, ROLLBACK | Y    |
| EXPLAIN                             | Y    |
| EXPLAIN ANALYZE                     | Y    |
| Stored Procedure                    | N    |
| Trigger                             | N    |
| Event Scheduler                     | N    |
| PARTITION BY                        | Y    |
| LOCK TABLE                          | N    |

## 数据类型

| 数据类型分类 | 数据类型        | 支持（Y）/不支持（N）  |
| -------------------- | ----------------- | ---- |
| 整数类型      | TINYINT           | Y    |
|                      | SMALLINT          | Y    |
|                      | INT               | Y    |
|                      | BIGINT            | Y    |
|                      | TINYINT UNSIGNED  | Y    |
|                      | SMALLINT UNSIGNED | Y    |
|                      | INT UNSIGNED      | Y    |
|                      | BIGINT UNSIGNED   | Y    |
| 浮点类型         | FLOAT             | Y    |
|                      | DOUBLE            | Y    |
| 字符串类型         | CHAR              | Y    |
|                      | VARCHAR           | Y    |
|                      | TINYTEXT/TEXT/MEDIUMTEXT/LONGTEXT             | Y    |
| 二进制类型         | TINYBLOB/BLOB/MEDIUMBLOB/LONGBLOB         | Y    |
| 时间与日期  | Date              | Y    |
|                      | Time              | Y    |
|                      | DateTime          | Y    |
|                      | Timestamp         | Y    |
| Boolean         | BOOL              | Y    |
| 定点类型         | DECIMAL           | Y    |
| JSON 类型            | JSON              | Y    |

## 索引与约束

| 索引与约束             | 支持（Y）/不支持（N）  |
| ------------------------------------ | ---- |
| 主键约束                          | Y    |
| 复合主键                | Y    |
| 唯一约束                           | Y    |
| Secondary KEY                        | Y，仅语法实现    |
| 外键约束                          | Y    |
| 无效数据强制约束 | Y    |
| ENUM 和 SET 约束             | N    |
| 非空约束                  | Y    |

## 事务

| 事务             | 支持（Y）/不支持（N）  |
| ------------------------ | ---- |
| 1PC                      | Y    |
| 悲观事务 | N    |
| 乐观事务  | Y    |
| 分布式事务  | Y    |
| 隔离级别       | Y    |

## 函数与操作符

| 函数与操作符 | 名称                |
| ---------------------------------- | ------------------- |
| 聚合函数                             | AVG()              |
|                                    | COUNT()             |
|                                    | MAX()               |
|                                    | MIN()               |
|                                    | Median()            |
|                                    | SUM()               |
|                                    | ANY_VALUE()         |
|                                    | BIT_OR()            |
|                                    | BIT_AND()           |
|                                    | BIT_XOR()           |
|                                    | STD()               |
|                                    | VARIANCE()          |
|                                    | GROUP_CONCAT()      |
|                                    | SLEEP()             |
| 数学类                              | ABS()               |
|                                    | SIN()               |
|                                    | COS()               |
|                                    | TAN()               |
|                                    | COT()               |
|                                    | ACOS()              |
|                                    | ATAN()              |
|                                    | SINH()              |
|                                    | FLOOR()             |
|                                    | ROUND()             |
|                                    | CEIL()              |
|                                    | POWER()             |
|                                    | PI()                |
|                                    | LOG()               |
|                                    | LN()                |
|                                    | UUID()              |
|                                    | EXP()               |
| 日期时间类                           | DATE_FORMAT()       |
|                                    | YEAR()              |
|                                    | MONTH()             |
|                                    | DATE()              |
|                                    | WEEKDAY()           |
|                                    | TIMESTAMP()         |
|                                    | DAYOFYEAR()         |
|                                    | EXTRACT()           |
|                                    | DATE_ADD()          |
|                                    | DATE_SUB()          |
|                                    | TO_DATE()           |
|                                    | DAY()               |
|                                    | UNIX_TIMESTAMP()    |
|                                    | FROM_UNIXTIME()     |
|                                    | UTC_TIMESTAMP()     |
|                                    | NOW()               |
|                                    | CURRENT_TIMESTAMP() |
|                                    | DATEDIFF()          |
|                                    | TIMEDIFF()          |
|                                    | CURDATE()           |
| 字符串类                             | BIN()               |
|                                    | BIT_LENGTH()        |
|                                    | HEX()               |
|                                    | CONCAT()            |
|                                    | CONCAT_WS()         |
|                                    | FIND_IN_SET()       |
|                                    | FORMAT()            |
|                                    | OCT()               |
|                                    | EMPTY()             |
|                                    | LENGTH()            |
|                                    | BIT_LENGTH()        |
|                                    | LENGTHUTF8()        |
|                                    | CHAR_LENGTH()       |
|                                    | LEFT()              |
|                                    | TRIM()              |
|                                    | LTRIM()             |
|                                    | RTRIM()             |
|                                    | LPAD()              |
|                                    | RPAD()              |
|                                    | STARTSWITH()        |
|                                    | ENDSWITH()          |
|                                    | SUBSTRING()         |
|                                    | SPACE()             |
|                                    | REVERSE()           |
|                                    | SUBSTRING_INDEX()   |
|                                    | FIELD()             |
| 操作符                              | %, MOD              |
|                                    | *                   |
|                                    | +                   |
|                                    | -                   |
|                                    | /                   |
|                                    | Div                 |
|                                    | =                   |
|                                    | &                   |
|                                    | >>                  |
|                                    | <<                  |
|                                    | ^                   |
|                                    | \|                  |
|                                    | ~                   |
|                                    | CAST()              |
|                                    | CONVERT()           |
|                                    | >                   |
|                                    | >=                  |
|                                    | <                   |
|                                    | <>, !=              |
|                                    | <=                  |
|                                    | =                   |
|                                    | LIKE                |
|                                    | BETWEEN ... AND ... |
|                                    | IN()                |
|                                    | IS/IS NOT           |
|                                    | IS/IS NOT NULL      |
|                                    | NOT BETWEEN ... AND ... |
|                                    | LIKE                |
|                                    | NOT LIKE            |
|                                    | COALESCE()          |
|                                    | CASE...WHEN         |
|                                    | IF                  |
|                                    | AND                 |
|                                    | OR                  |
|                                    | XOR                 |
|                                    | NOT                 |
