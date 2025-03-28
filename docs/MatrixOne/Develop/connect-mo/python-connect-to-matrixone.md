# Python 连接

MatrixOne 支持 Python 连接，支持 `pymysql` 和 `sqlalchemy` 两种驱动程序。

本篇文档将指导你了解如何通过这两个 *python* 驱动程序连接 MatrixOne。

## 开始前准备

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
            user='root',
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
    Database version : 8.0.30-MatrixOne-v2.1.0
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
    mysql> create table student (id int primary key,name varchar(20), age int);
    mysql> insert into student values (1,"tom", 11), (2,"alice", "10");
    ```

3. 创建一个纯文本文件 *sqlalchemy_connect_matrixone.py* 并将代码写入文件：

    ```python
    from sqlalchemy import create_engine
    from sqlalchemy.orm import declarative_base as _declarative_base
    from sqlalchemy import Column, Integer, String
    from sqlalchemy.orm import sessionmaker

    #使用 SQLAlchemy 创建到 MatrixOne 的连接字符串，并创建一个引擎（Engine）
    connection_string = 'mysql+pymysql://root:111@127.0.0.1:6001/test'
    engine = create_engine(connection_string)

    Base = _declarative_base()

    #定义一个 Python 类来映射 student 表。
    class Student(Base):
        __tablename__ = 'student'
        id = Column(Integer, primary_key=True)
        name = Column(String)
        age = Column(Integer)

    #使用 sessionmaker 创建一个会话来执行查询
    Session = sessionmaker(bind=engine)
    session = Session()

    #使用 SQLAlchemy 的查询接口来查询 student 表中的数据。
    users = session.query(Student).all()
    for user in users:
        print(f'ID: {user.id}, Name: {user.name}, Age: {user.age}')
    ```

4. 打开一个终端，在终端内执行下面的命令：

    ```
    python3 sqlalchemy_connect_matrixone.py
    ID: 1, Name: tom, Age: 11
    ID: 2, Name: alice, Age: 10
    ```
