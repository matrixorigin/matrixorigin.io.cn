# **SHOW FUNCTION STATUS**

## **语法说明**

`SHOW FUNCTION STATUS` 是用来显示数据库中的所有函数的信息，包括函数名、数据库名、创建时间等等。

`SHOW FUNCTION STATUS` 命令只显示用户定义的函数，不包括系统函数。

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
create function twosum (x float, y float) returns float language sql as 'select $1 + $2' ;
create function mysumtable(x int) returns int language sql as 'select mysum(test_val, id) from tbl1 where id = $1';
create function helloworld () returns int language sql as 'select id from tbl1 limit 1';

mysql> show function status;
+------+------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name       | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| aab  | twosum     | FUNCTION | root    | 2023-03-27 06:25:41 | 2023-03-27 06:25:41 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| aab  | mysumtable | FUNCTION | root    | 2023-03-27 06:25:51 | 2023-03-27 06:25:51 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
| aab  | helloworld | FUNCTION | root    | 2023-03-27 06:25:58 | 2023-03-27 06:25:58 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+------------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
3 rows in set (0.00 sec)

mysql> show function status like 'two%';
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| Db   | Name   | Type     | Definer | Modified            | Created             | Security_type | Comment | character_set_client | collation_connection | Database Collation |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
| aab  | twosum | FUNCTION | root    | 2023-03-27 06:25:41 | 2023-03-27 06:25:41 | DEFINER       |         | utf8mb4              | utf8mb4_0900_ai_ci   | utf8mb4_0900_ai_ci |
+------+--------+----------+---------+---------------------+---------------------+---------------+---------+----------------------+----------------------+--------------------+
1 row in set (0.01 sec)
```
