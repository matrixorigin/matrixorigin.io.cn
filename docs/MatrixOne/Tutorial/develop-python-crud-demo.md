# Python 基础示例

本篇文档将指导你如何使用 **Python** 构建一个简单的应用程序，并实现 CRUD（创建、读取、更新、删除）功能。

## 开始前准备

### 环境配置

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。

- 确认你已完成安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。

   使用下面的代码检查 Python 版本确认安装成功：

    ```
    #To check with Python installation and its version
    python3 -V
    ```

- 确认你已完成安装 MySQL 客户端。

- 下载安装 `pymysql` 和 `cryptography` 工具。

   使用下面的代码下载安装 `pymysql` 和 `cryptography` 工具：

    ```
    pip3 install pymysql
    pip3 install cryptography

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install cryptography -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

你可以参考 [Python 连接 MatrixOne 服务](../Develop/connect-mo/python-connect-to-matrixone.md)了解如何通过 `pymysql` 连接到 MatrixOne，本篇文档将指导你如何实现 CRUD（创建、读取、更新、删除)。

## 新建表

新建一个 `create.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "CREATE TABLE cars (id INT NOT NULL AUTO_INCREMENT, car_model VARCHAR(45) NULL,car_brand VARCHAR(45) NULL,PRIMARY KEY (`id`))"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        print("Table created")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()

```

打开终端，使用以下代码运行此 *python* 文件。这将在 MatrixOne 中的数 ​​ 据库 *test* 内创建一个名为 *cars* 表。

```
> python3 create.py
Table created
```

你可以使用 MySQL 客户端验证表是否创建成功：

```
mysql> show tables;
+----------------+
| tables_in_test |
+----------------+
| cars           |
+----------------+
1 row in set (0.03 sec)
mysql> show create table cars;
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                             |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
| cars  | CREATE TABLE `cars` (
`id` INT NOT NULL AUTO_INCREMENT,
`car_model` VARCHAR(45) DEFAULT NULL,
`car_brand` VARCHAR(45) DEFAULT NULL,
PRIMARY KEY (`id`)
) |
+-------+----------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.03 sec)
```

## 插入数据

新建一个 `insert.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "INSERT INTO cars(car_model, car_brand) VALUES ('accord', 'honda')"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print("Record Added")
        else:
            print(sql_exec)
            print("Not Added")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()
```

执行下面的代码会在 *cars* 表中插入一条记录：

```
> python3 insert.py
1
Record Added
```

你可以在 MySQL 客户端中验证这条记录是否插入成功：

```
mysql> select * from cars;
+------+-----------+-----------+
| id   | car_model | car_brand |
+------+-----------+-----------+
|    1 | accord    | honda     |
+------+-----------+-----------+
1 row in set (0.03 sec)
```

## 查询数据

新建一个 `read.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "SELECT * FROM cars"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print(cursor.fetchall())
        else:
            print(sql_exec)
            print("No Record")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()
```

执行下面的代码查询并返回 *cars* 表中的所有记录：

```
> python3 read.py
1
[{'id': 1, 'car_model': 'accord', 'car_brand': 'honda'}]
```

## 更新数据

新建一个 `update.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "UPDATE cars SET car_model = 'explorer', car_brand = 'ford' WHERE id = '1'"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print("Record Updated")
        else:
            print(sql_exec)
            print("Not Updated")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()

```

执行下面代码更新 id 为“1”的记录：

```
> python3 update.py
1
Record Updated
```

你可以在 MySQL 客户端中验证这条记录是否更新成功：

```
mysql> select * from cars;
+------+-----------+-----------+
| id   | car_model | car_brand |
+------+-----------+-----------+
|    1 | explorer  | ford      |
+------+-----------+-----------+
1 row in set (0.02 sec)
```

## 删除数据

新建一个 `delete.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
#!/usr/bin/python3

import pymysql.cursors

SQL_CONNECTION = pymysql.connect(
        host='127.0.0.1',
	    port=6001,
        user='root',
        password = "111",
        db='test',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
        )

SQL = "DELETE FROM cars WHERE id = '1'"

with SQL_CONNECTION.cursor() as cursor:
    try:
        sql_exec = cursor.execute(SQL)
        if sql_exec:
            print(sql_exec)
            print("Record Deleted")
        else:
            print(sql_exec)
            print("Not Deleted")
    except (pymysql.Error, pymysql.Warning) as e:
        print(f'error! {e}')

    finally:
        SQL_CONNECTION.close()
```

执行下面代码删除 id 为“1”的记录：

```
> python3 delete.py
1
Record Deleted
```

你可以在 MySQL 客户端中验证这条记录是否删除成功：

```
mysql> select * from cars;
Empty set (0.03 sec)
```
