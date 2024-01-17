# **SHOW FUNCTION STATUS**

## **语法说明**

`SHOW FUNCTION STATUS` 是用来显示数据库中的所有函数的信息，包括函数名、数据库名、创建时间等等。

`SHOW FUNCTION STATUS` 命令只显示用户定义的函数，不包括系统函数。MatrixOne 支持 [SQL UDF](../../Data-Definition-Language/create-function-sql.md) 和 [Python UDF](../../Data-Definition-Language/create-function-python.md)。

## **语法结构**

```
> SHOW FUNCTION STATUS
    [LIKE 'pattern' | WHERE expr]
```

### 语法说明

`LIKE 'pattern'` 是可选参数，用于筛选要显示的函数。`pattern` 是一个模式字符串，可以使用 `%` 和 `_` 通配符。例如，要显示所有以 `my_function` 开头的函数，可以使用以下命令：

```sql
SHOW FUNCTION STATUS LIKE 'my_function%';
```

输出结果将包括函数名、数据库名、类型、创建时间和修改时间等信息。

## **示例**

```sql
create or replace function py_add(a int, b int) returns int language python as 
$$
def add(a, b):
  return a + b
$$
handler 'add';
create function twosum (x float, y float) returns float language sql as 'select $1 + $2' ;
create function helloworld () returns int language sql as 'select id from tbl1 limit 1';

mysql> show function status;
+------+-------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name        | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+-------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| db1  | py_add      | FUNCTION | root    | 2024-01-16 08:00:21 | 2024-01-16 08:00:21 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| db1  | twosum      | FUNCTION | root    | 2024-01-16 08:00:39 | 2024-01-16 08:00:39 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| db1  | helloworld  | FUNCTION | root    | 2024-01-16 08:00:53 | 2024-01-16 08:00:53 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+-------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
3 rows in set (0.01 sec)

mysql> show function status like 'two%';
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name   | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| db1  | twosum | FUNCTION | root    | 2024-01-16 08:00:39 | 2024-01-16 08:00:39 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
1 rows in set (0.01 sec)
```
