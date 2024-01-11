# 自定义函数

## **函数说明**

MatrixOne 支持 Python UDF。用户通过自己定义的函数，满足定制化需求，简化查询的编写。也可以通过导入外部 Python 文件或外部 whl 包来创建 UDF。

在部分场景下，我们会希望 python 函数一次性接收多个元组来提高运行效率，MatrixOne 提供函数的 vector 选项来处理这种情况。

MatrixOne UDF 目前不支持重载，函数名在一个 matrixone 集群要求是唯一的。

## **函数语法**

```sql

CREATE FUNCTION <函数名> ( [ <参数1><类型1> [ , <参数2><类型2>] ] … ) RETURNS <类型> LANGUAGE PYTHON AS
$$
  <函数主体>
$$
HANDLIER <PYTHON函数名>
```

**语法说明如下：**

- <函数名>：指定自定义函数的名称。

- <参数><类型>：用于指定自定义函数的参数，这里的参数只有名称和类型。

- RETURNS <类型>：用于声明自定义函数返回值的数据类型。

- <函数主体>：自定义函数的主体部分，必须包含一个 RETURN <值> 语句，其中<值>用于指定自定义函数的返回值。

- HANDLIER <PYTHON 函数名>:指定调用的 python 函数名称。

## **示例**

- 示例 1

```sql
--用 python UDF 实现两数之和
mysql> create or replace function py_add(a int, b int) returns int language python as 
    -> $$
    -> def add(a, b):
    ->   return a + b
    -> $$
    -> handler 'add';
Query OK, 0 rows affected (0.01 sec)

mysql> select py_add(1,2);
+--------------+
| py_add(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.01 sec)

--当我们不再需要该函数时，可以将其删除
drop function py_add(int, int);
```

- 示例 2

<div>1.创建 python 文件 add_func.py 并输入以下代码：</div>

```
def add(a, b):
  return a + b
```

<div>2.在客户端中输入以下 SQL：</div>

```sql
--创建函数，使用 import 关键字来导入 add_func.py 文件。
mysql> create or replace function py_add(a int, b int) returns int language python import 
    -> '/yourpath/add_func.py' 
    -> handler 'add';
Query OK, 0 rows affected (0.03 sec)

--调用函数
mysql> select py_add(1,2);
+--------------+
| py_add(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.02 sec)
```

- 示例 3

<div>1.构建 whl 包，目录结构如下：</div>

```
func_add/
    ├── add_udf.py
    └── setup.py
```

<div>2.add_udf.py 用来实现函数方法体逻辑，代码如下：</div>

```
def add(a, b):
    return a + b
```

<div>3.setup.py 文件用来定义库的元数据和配置信息等，代码如下：</div>

```
from setuptools import setup

setup(
    name="udf",
    version="1.0.0",
    # 包含函数体的python文件名去掉拓展名.py后即为模块名
    py_modules=["add_udf"]
)
```

<div>4.工程文件编写就位后，执行如下命令构建 wheel 包：</div>

```
python /yourpath/setup.py bdist_wheel
```

<div>5.打包完成后，会在 func_add/dist 目录下生成 udf-1.0.0-py3-none-any.whl 文件，在客户端中执行以下 SQL：</div>

```sql
mysql> create or replace function py_add_t3(a int, b int) returns int language python import 
    -> '/yourpath/detect-1.0.0-py3-none-any.whl'  
    -> handler 'add_udf.add';  
Query OK, 0 rows affected (0.02 sec)

mysql> select py_add_t3(1, 2);
+-----------------+
| py_add_t3(1, 2) |
+-----------------+
|               3 |
+-----------------+
1 row in set (0.57 sec)
```

- 示例 4

```sql
mysql> create table grades(chinese int,math int);
Query OK, 0 rows affected (0.02 sec)

mysql> insert into grades values(97,100),(85,89),(79,99);
Query OK, 3 rows affected (0.01 sec)

mysql> select * from grades;
+---------+------+
| chinese | math |
+---------+------+
|      97 |  100 |
|      85 |   89 |
|      79 |   99 |
+---------+------+
3 rows in set (0.00 sec)

--使用 add.vector = True 来标记 python 函数 add 接收两个 int 列表（vector）而不是 int 值。
mysql> create or replace function py_add_grades(a int, b int) returns int language python as 
    -> $$
    -> def add(a, b):  # a, b are list
    ->   return [a[i] + b[i] for i in range(len(a))]
    -> add.vector = True
    -> $$
    -> handler 'add';
Query OK, 0 rows affected (0.01 sec)

--参数列表我们可以使用 grades 表中的两个整数字段列，例如：
mysql> select py_add_grades(chinese,math) as Total from grades;
+-------+
| Total |
+-------+
|   197 |
|   174 |
|   178 |
+-------+
3 rows in set (0.01 sec)
```