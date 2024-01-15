# **CREATE FUNCTION...LANGUAGE PYTHON AS**

## **语法说明**

`CREATE FUNCTION...LANGUAGE PYTHON AS` 用于创建用户自定义 Python 函数。用户通过自己定义的函数，满足定制化需求，简化查询的编写。也可以通过导入外部 Python 文件或外部 whl 包来创建 UDF。

在部分场景下，我们会希望 python 函数一次性接收多个元组来提高运行效率，MatrixOne 提供函数的 vector 选项来处理这种情况。

MatrixOne Python UDF 目前不支持重载，函数名在一个 matrixone 集群要求是唯一的。

## **语法结构**

```sql
> CREATE [ OR REPLACE ] FUNCTION <name> (
[ <arg_name> <arg_data_type> ] [ , ... ] )
RETURNS <result_data_type>  LANGUAGE PYTHON AS
$$
  <function_body>
[ add.vector = True ]
$$
HANDLER = '<function_name>'
```

## **结构说明**

- `<name>`：指定自定义函数的名称。

- `<arg_name> <arg_data_type>`：用于指定自定义函数的参数，这里的参数只有名称和类型。

- `RETURNS <result_data_type>`：用于声明自定义函数返回值的数据类型。

- `<function_body>`：自定义函数的主体部分，必须包含一个 RETURN <value>语句，其中<value>用于指定自定义函数的返回值。

- `[ add.vector = True ]`：标志 python 函数一次性接收多个元组。

- `HANDLIER <function_name>:` 指定调用的 python 函数名称。

## 类型映射

为确保编写 Python UDF 过程中使用的数据类型与 MatrixOne 支持的数据类型保持一致，您需要关注二者间的数据类型映射关系，具体映射关系如下：

| MatrixOne  类型                                           | Python 类型          |
| -------------------------------------------------------- | --------------------------- |
| bool                                                     | bool                        |
| int8, int16, int32, int64, uint8, uint16, uint32, uint64 | int                         |
| float32, float64                                         | float                       |
| char, varchar, text, uuid                                | str                         |
| json                                                     | str, int, float, list, dict |
| time                                                     | datetime.timedelta          |
| date                                                     | datetime.date               |
| datetime, timestamp                                      | datetime.datetime           |
| decimal64, decimal128                                    | decimal.Decimal             |
| binary, varbinary, blob                                  | bytes                       |

## **示例**

```sql
--用 python UDF 实现两数之和
create or replace function py_add(a int, b int) returns int language python as 
$$
def add(a, b):
  return a + b
$$
handler 'add';

--调用函数
mysql> select py_add(1,2);
+--------------+
| py_add(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.01 sec)
```