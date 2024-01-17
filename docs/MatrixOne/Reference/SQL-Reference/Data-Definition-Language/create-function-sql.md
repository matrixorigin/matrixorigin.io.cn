# **CREATE FUNCTION...LANGUAGE SQL AS**

## **语法说明**

`CREATE FUNCTION...LANGUAGE SQL AS` 用于创建 SQL UDF。

SQL 自定义函数是一种用户自己编写的 SQL 函数，可以根据特定需求执行自定义操作。这些函数可以用于查询、数据转换等任务，使得 sQL 代码更加模块化和可维护。

MatrixOne SQL UDF 目前不支持重载，函数名在一个 matrixone 集群要求是唯一的。

## **语法结构**

```sql
> CREATE [ OR REPLACE ] FUNCTION <name> (
[ <arg_name> <arg_data_type> ] [ , ... ] )
RETURNS <result_data_type>  LANGUAGE SQL AS 'function_body'
```

## **结构说明**

- `<name>`：指定自定义函数的名称。

- `<arg_name> <arg_data_type>`：用于指定自定义函数的参数，这里的参数只有名称和类型。

- `RETURNS <result_data_type>`：用于声明自定义函数返回值的数据类型，完整的数据类型请查看[数据类型概览](../../../Reference/Data-Types/data-types.md)

- `function_body`：自定义函数的主体部分。用户必须使用$1、$2,...以引用参数，而不是实际的参数名称。函数体支持 select 语句，且返回值唯一，如果 sql 函数体不是表达式，并且是表上的 select 语句，则查询应使用 limit 1 或不带 group by 子句的聚合函数将其结果限制为 1。

## **示例**

**示例 1**

```sql
--创建无参 sql 自定义函数

mysql> create table t1(n1 int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t1 values(1),(2),(3);
Query OK, 3 rows affected (0.01 sec)

mysql> CREATE FUNCTION t1_fun () RETURNS VARCHAR LANGUAGE SQL AS 'select n1 from t1 limit 1' ;
Query OK, 0 rows affected (0.01 sec)

mysql> select t1_fun();
+----------+
| t1_fun() |
+----------+
|        1 |
+----------+
1 row in set (0.01 sec)
```

**示例 2**

```sql
--创建 sql 自定义函数返回两个参数的和
mysql> CREATE FUNCTION twoadd (x int, y int) RETURNS int LANGUAGE SQL AS 'select $1 + $2' ;
Query OK, 0 rows affected (0.02 sec)

mysql> select twoadd(1,2);
+--------------+
| twoadd(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.00 sec)
```