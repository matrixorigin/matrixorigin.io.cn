# SQL 模式

sql_mode 是 MatrixOne 中的一个系统参数，用于指定 MatrixOne 执行查询和操作的模式。sql_mode 可以影响 MatrixOne 的语法和语义规则，从而改变 MatrixOne 查询 SQL 的行为。在本篇文章中，将为你介绍 sql_mode 的模式、作用以及如何设置 SQL 模式。

!!! note
    MatrixOne 目前只支持 `ONLY_FULL_GROUP_BY` 这一模式，其它模式仅作语法支持。`ONLY_FULL_GROUP_BY` 被用于控制 GROUP BY 语句的行为。当启用 `ONLY_FULL_GROUP_BY` 模式时，MatrixOne 要求在 SELECT 语句中的 GROUP BY 子句中的列必须是聚合函数 (如 SUM、COUNT 等) 或在 GROUP BY 子句中出现的列。如果 SELECT 语句中存在不符合这个要求的列，将会抛出错误，如果你的表结构复杂，为了便于查询，你可以选择将 `ONLY_FULL_GROUP_BY` 模式关闭。

## 查看 sql_mode

在 MatrixOne 中使用以下命令查看 sql_mode：

```sql
SELECT @@global.sql_mode;--全局模式
SELECT @@session.sql_mode;--会话模式
```

## 设置 sql_mode

在 MatrixOne 中使用以下命令设置 sql_mode：

```sql
set global sql_mode = 'xxx' --全局模式，重新连接数据库生效
set session sql_mode = 'xxx'--会话模式
```

## 示例

```sql
CREATE TABLE student(
id int,
name char(20),
age int,
nation char(20)
);

INSERT INTO student values(1,'tom',18,'上海'),(2,'jan',19,'上海'),(3,'jen',20,'北京'),(4,'bob',20,'北京'),(5,'tim',20,'广州');

mysql> select * from student group by nation;--在`ONLY_FULL_GROUP_BY`模式下不支持进行此操作
ERROR 1149 (HY000): SQL syntax error: column "student.id" must appear in the GROUP BY clause or be used in an aggregate function

mysql> SET session sql_mode='ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION,NO_ZERO_DATE,NO_ZERO_IN_DATE,STRICT_TRANS_TAB
LES';--关闭当前会话的 ONLY_FULL_GROUP_BY 模式
Query OK, 0 rows affected (0.02 sec)

mysql> select * from student group by nation;--在当前会话关闭`ONLY_FULL_GROUP_BY`模式立即生效
+------+------+------+--------+
| id   | name | age  | nation |
+------+------+------+--------+
|    1 | tom  |   18 | 上海   |
|    3 | jen  |   20 | 北京   |
|    5 | tim  |   20 | 广州   |
+------+------+------+--------+
3 rows in set (0.00 sec)

mysql> SET global sql_mode='ONLY_FULL_GROUP_BY';--设置全局开启 ONLY_FULL_GROUP_BY 模式
Query OK, 0 rows affected (0.02 sec)

mysql> select * from student group by nation;--ONLY_FULL_GROUP_BY 模式未生效，因为全局模式开启后需要重连数据库方可生效
+------+------+------+--------+
| id   | name | age  | nation |
+------+------+------+--------+
|    1 | tom  |   18 | 上海   |
|    3 | jen  |   20 | 北京   |
|    5 | tim  |   20 | 广州   |
+------+------+------+--------+
3 rows in set (0.00 sec)

mysql> exit --退出当前会话

mysql> select * from student group by nation;--重连数据库后执行查询操作，ONLY_FULL_GROUP_BY 模式成功开启
ERROR 1149 (HY000): SQL syntax error: column "student.id" must appear in the GROUP BY clause or be used in an aggregate function
```
