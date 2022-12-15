# Python 连接 MatrixOne 服务

MatrixOne supports Python connection, in 0.6.0 release, `pymysql` and `sqlalchemy` drivers are supported. This tutorial will walk you through how to connect MatrixOne by these two python drivers.

MatrixOne 支持 Python 连接，在 0.6.0 版本中，MatrixOne 支持 `pymysql` 和 `sqlalchemy` 两种驱动程序。

本篇文档将指导你了解如何通过这两个 *python* 驱动程序连接 MatrixOne。

## 前期准备

- 已完成[安装并启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

- 已安装 [Python 3.8(or plus) version](https://www.python.org/downloads/)。

```
#检查 Python 版本号，确认是否安装
python3 -V
```

- 已安装 MySQL 客户端。

## 使用 pymysql 工具连接 MatrixOne 服务

PyMySQL 是一个纯 Python MySQL 客户端库。

1. 下载安装 pymysql 和 cryptography 工具：

    ```
    pip3 install pymysql
    pip3 install cryptography

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install cryptography -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

2. 使用 MySQL 客户端连接 MatrixOne。新建一个名称为 *test* 数据库：

    ```sql
    mysql> create database test;
    ```

3. 创建一个纯文本文件 *pymysql_connect_matrixone.py* 并将代码写入文件：

    ```python
    #!/usr/bin/python3

    import pymysql

    # Open database connection
    db = pymysql.connect(
            host='127.0.0.1',
	        port=6001,
            user='dump',
            password = "111",
            db='test',
            )
    # prepare a cursor object using cursor() method
    cursor = db.cursor()

    # execute SQL query using execute() method.
    cursor.execute("SELECT VERSION()")

    # Fetch a single row using fetchone() method.
    data = cursor.fetchone()
    print ("Database version : %s " % data)

    # disconnect from server
    db.close()

    ```

4. 打开一个终端，在终端内执行下面的命令：

    ```
    > python3 pymysql_connect_matrixone.py
    Database version : 8.0.30-MatrixOne-v0.6.0
    ```

## 使用 sqlalchemy 连接 MatrixOne

SQLAlchemy 是 Python SQL 工具包和对象关系映射器 (ORM)，它为应用开发人员提供了 SQL 的全部功能。

1. 下载并安装 sqlalchemy 工具，下载代码示例如下：

    ```
    pip3 install sqlalchemy

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install sqlalchemy -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

2. 使用 MySQL 客户端连接 MatrixOne。新建一个名称为 *test* 数据库，并且新建一个名称为 *student* 表，然后插入两条数据：

    ```sql
    mysql> create database test;
    mysql> use test;
    mysql> create table student (name varchar(20), age int);
    mysql> insert into student values ("tom", 11), ("alice", "10");

    ```

3. 创建一个纯文本文件 *sqlalchemy_connect_matrixone.py* 并将代码写入文件：

    ```python
    #!/usr/bin/python3
    from sqlalchemy import create_engine, text

    # Open database connection
    my_conn = create_engine("mysql+mysqldb://dump:111@127.0.0.1:6001/test")

    # execute SQL query using execute() method.
    query=text("SELECT * FROM student LIMIT 0,10")
    my_data=my_conn.execute(query)

    # print SQL result
    for row in my_data:
            print("name:", row["name"])
            print("age:", row["age"])

    ```

4. 打开一个终端，在终端内执行下面的命令：

    ```
    python3 sqlalchemy_connect_matrixone.py
    name: tom
    age: 11
    name: alice
    age: 10
    ```

## 参考文档

更多关于 Python 连接 MatrixOne 服务实践教程，参见[用 MatrixOne 构建一个简单的股票分析 Python 应用程序](../../Tutorial/develop-python-application.md)。
