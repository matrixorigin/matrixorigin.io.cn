# SQLAlchemy 基础示例

本篇文档将指导你如何使用 **Python** 和 **SQLAlchemy** 构建一个简单的应用程序，并实现 CRUD（创建、读取、更新、删除）功能。

**SQLAlchemy** 是 Python 语言中最流行的 ORM 工具之一。

## 开始前准备

相关软件的简单介绍：

* SQLAlchemy：SQLAlchemy 是一个 Python 库，可以促进 Python 程序和数据库之间的通信。大多数时候，这个库用作对象关系映射器 (ORM) 工具，将 Python 类转换为关系数据库上的表，并自动将函数调用转换为 SQL 语句。

* Faker：Faker 是一个生成假数据的 Python 库。虚假数据通常用于测试或用一些虚拟数据填充数据库。

### 环境配置

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。通过 MySQL 客户端连接 MatrixOne 并创建一个命名为 *test* 的数据库：

    ```
    mysql> create database test;
    ```

- 确认你已完成安装 [Python 3.8(or plus) version](https://www.python.org/downloads/)。

   使用下面的代码检查 Python 版本确认安装成功：

    ```
    #To check with Python installation and its version
    python3 -V
    ```

- 确认你已完成安装 MySQL。

- 下载安装 `sqlalchemy`、`pymysql`、`cryptography` 和 `faker` 工具。

   使用下面的代码下载安装 `sqlalchemy`、`pymysql`、`cryptography` 和 `faker` 工具：

    ```
    pip3 install sqlalchemy
    pip3 install pymysql
    pip3 install cryptography
    pip3 install faker

    #If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
    pip3 install sqlalchemy -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install cryptography -i https://pypi.tuna.tsinghua.edu.cn/simple
    pip3 install faker -i https://pypi.tuna.tsinghua.edu.cn/simple
    ```

你可以参考 [Python 连接 MatrixOne 服务](../Develop/connect-mo/python-connect-to-matrixone.md)了解如何通过 `SQLAlchemy` 连接到 MatrixOne，本篇文档将指导你如何实现 CRUD（创建、读取、更新、删除)。

## 新建表

作为对象关系映射器（ORM）工具，SQLAlchemy 允许开发人员创建 Python 类来映射关系数据库中的表。

在下面的代码示例中，将创建一个 `Customer` 类，它定义的 `Customer` 的代码相当于一条 SQL 语句，它表示 MatrixOne 中的命名为 `Customer` 的表：

```
CREATE TABLE `User` (
`id` INT NOT NULL AUTO_INCREMENT,
`cname` VARCHAR(64) DEFAULT NULL,
`caddress` VARCHAR(512) DEFAULT NULL,
PRIMARY KEY (`id`)
)
```

新建一个 `sqlalchemy_create.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
from faker import Factory
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

faker = Factory.create()

engine = create_engine('mysql+pymysql://dump:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()


class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


# Generate 10 Customer records
Customers = [Customer(name= faker.name(),address = faker.address()) for i in range(10)]

# Create the table
Base.metadata.create_all(engine)

# Insert all customer records to Customer table
session.add_all(Customers)

session.commit()

```

打开终端，使用以下代码运行此 *python* 文件：

```
> python3 sqlalchemy_create.py
```

你可以使用 MySQL 客户端验证表是否创建成功：

```
mysql> show tables;
+----------------+
| tables_in_test |
+----------------+
| Customer       |
+----------------+
1 row in set (0.04 sec)
mysql> select * from `Customer`;
+------+------------------+-----------------------------------------------------+
| id   | cname            | caddress                                            |
+------+------------------+-----------------------------------------------------+
|    1 | Wendy Luna       | 002 Brian Plaza
Andrewhaven, SC 88456               |
|    2 | Meagan Rodriguez | USCGC Olson
FPO AP 21249                            |
|    3 | Angela Ramos     | 029 Todd Curve Apt. 352
Mooreville, FM 15950        |
|    4 | Lisa Bruce       | 68103 Mackenzie Mountain
North Andrew, UT 29853     |
|    5 | Julie Moore      | Unit 1117 Box 1029
DPO AP 87468                     |
|    6 | David Massey     | 207 Wayne Groves Apt. 733
Vanessashire, NE 34549    |
|    7 | David Mccann     | 97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558 |
|    8 | Morgan Price     | 57463 Lisa Drive
Thompsonshire, NM 88077            |
|    9 | Samuel Griffin   | 186 Patel Crossing
North Stefaniechester, WV 08221  |
|   10 | Tristan Pierce   | 593 Blankenship Rapids
New Jameshaven, SD 89585     |
+------+------------------+-----------------------------------------------------+
10 rows in set (0.03 sec)
```

## 读取数据

在下面的示例中，将通过两种方式从 `Customer` 表中读取数据。

第一种方式是全表扫描：

```
select * from `Customer`
```

第二种方式是点查询：

```
select * from `Customer` where `cname` = 'David Mccann';
```

新建一个 `sqlalchemy_read.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql+pymysql://dump:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


# query all data
customers = session.query(Customer).all()

for customer in customers:
     print(customer.__str__() +"\n--------------------------\n")

# query with a filter condition
Mccann = session.query(Customer).filter_by(cname='David Mccann').first()
print(Mccann)
print("\n------------------------\n")

```

打开终端，使用以下代码运行此 *python* 文件并查看结果：

```
> python3 sqlalchemy_read.py
cname:Wendy Luna caddress:002 Brian Plaza
Andrewhaven, SC 88456
--------------------------

cname:Meagan Rodriguez caddress:USCGC Olson
FPO AP 21249
--------------------------

cname:Angela Ramos caddress:029 Todd Curve Apt. 352
Mooreville, FM 15950
--------------------------

cname:Lisa Bruce caddress:68103 Mackenzie Mountain
North Andrew, UT 29853
--------------------------

cname:Julie Moore caddress:Unit 1117 Box 1029
DPO AP 87468
--------------------------

cname:David Massey caddress:207 Wayne Groves Apt. 733
Vanessashire, NE 34549
--------------------------

cname:David Mccann caddress:97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558
--------------------------

cname:Morgan Price caddress:57463 Lisa Drive
Thompsonshire, NM 88077
--------------------------

cname:Samuel Griffin caddress:186 Patel Crossing
North Stefaniechester, WV 08221
--------------------------

cname:Tristan Pierce caddress:593 Blankenship Rapids
New Jameshaven, SD 89585
--------------------------

cname:David Mccann caddress:97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558

------------------------
```

## 更新数据

在下面的示例中，将指导你更新 *Customer* 表的第一个 *cname* 列为另一个值。

新建一个 `sqlalchemy_update.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql+pymysql://dump:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


customer = session.query(Customer).first()
print(customer)
print("\n---------------------\n")

# Rename customer
customer.cname = "Coby White"


session.commit()

# See the updated result
customer = session.query(Customer).first()
print(customer)
```

打开终端，使用以下代码运行此 *python* 文件并查看结果：

```
> python3 sqlalchemy_update.py     
cname:Wendy Luna caddress:002 Brian Plaza
Andrewhaven, SC 88456

---------------------

cname:Coby White caddress:002 Brian Plaza
Andrewhaven, SC 88456
```

你可以使用 MySQL 客户端验证表是否更新成功：

```
mysql> select * from `Customer`;
+------+------------------+-----------------------------------------------------+
| id   | cname            | caddress                                            |
+------+------------------+-----------------------------------------------------+
|    1 | Coby White       | 002 Brian Plaza
Andrewhaven, SC 88456               |
|    2 | Meagan Rodriguez | USCGC Olson
FPO AP 21249                            |
|    3 | Angela Ramos     | 029 Todd Curve Apt. 352
Mooreville, FM 15950        |
|    4 | Lisa Bruce       | 68103 Mackenzie Mountain
North Andrew, UT 29853     |
|    5 | Julie Moore      | Unit 1117 Box 1029
DPO AP 87468                     |
|    6 | David Massey     | 207 Wayne Groves Apt. 733
Vanessashire, NE 34549    |
|    7 | David Mccann     | 97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558 |
|    8 | Morgan Price     | 57463 Lisa Drive
Thompsonshire, NM 88077            |
|    9 | Samuel Griffin   | 186 Patel Crossing
North Stefaniechester, WV 08221  |
|   10 | Tristan Pierce   | 593 Blankenship Rapids
New Jameshaven, SD 89585     |
+------+------------------+-----------------------------------------------------+
10 rows in set (0.02 sec)
```

## 删除数据

在下面的示例中，将指导你删除 *Customer* 表的第一条数据。

新建一个 `sqlalchemy_detele.py` 的文本文件，将以下代码拷贝粘贴到文件内：

```
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql+pymysql://dump:111@127.0.0.1:6001/test')

Session = sessionmaker(bind=engine)
session = Session()

Base = declarative_base()

class Customer(Base):
    __tablename__ = "Customer"
    id = Column(Integer, primary_key=True,autoincrement=True)
    cname = Column(String(64))
    caddress = Column(String(512))

    def __init__(self,name,address):
        self.cname = name
        self.caddress = address

    def __str__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress

    def __repr__(self):
        return "cname:"+self.cname +" caddress:"+self.caddress


# delete the first record
customer = session.query(Customer).first()

session.delete(customer)
session.commit()

# query all data
customers = session.query(Customer).all()

for customer in customers:
     print(customer.__str__() +"\n--------------------------\n")
```

打开终端，使用以下代码运行此 *python* 文件并查看结果：

```
> python3 sqlalchemy_delete.py         
cname:Meagan Rodriguez caddress:USCGC Olson
FPO AP 21249
--------------------------

cname:Angela Ramos caddress:029 Todd Curve Apt. 352
Mooreville, FM 15950
--------------------------

cname:Lisa Bruce caddress:68103 Mackenzie Mountain
North Andrew, UT 29853
--------------------------

cname:Julie Moore caddress:Unit 1117 Box 1029
DPO AP 87468
--------------------------

cname:David Massey caddress:207 Wayne Groves Apt. 733
Vanessashire, NE 34549
--------------------------

cname:David Mccann caddress:97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558
--------------------------

cname:Morgan Price caddress:57463 Lisa Drive
Thompsonshire, NM 88077
--------------------------

cname:Samuel Griffin caddress:186 Patel Crossing
North Stefaniechester, WV 08221
--------------------------

cname:Tristan Pierce caddress:593 Blankenship Rapids
New Jameshaven, SD 89585
--------------------------
```

你可以使用 MySQL 客户端验证表种的记录是否删除成功：

```
mysql> select * from `Customer`;
+------+------------------+-----------------------------------------------------+
| id   | cname            | caddress                                            |
+------+------------------+-----------------------------------------------------+
|    2 | Meagan Rodriguez | USCGC Olson
FPO AP 21249                            |
|    3 | Angela Ramos     | 029 Todd Curve Apt. 352
Mooreville, FM 15950        |
|    4 | Lisa Bruce       | 68103 Mackenzie Mountain
North Andrew, UT 29853     |
|    5 | Julie Moore      | Unit 1117 Box 1029
DPO AP 87468                     |
|    6 | David Massey     | 207 Wayne Groves Apt. 733
Vanessashire, NE 34549    |
|    7 | David Mccann     | 97274 Sanders Tunnel Apt. 480
Anthonyberg, DC 06558 |
|    8 | Morgan Price     | 57463 Lisa Drive
Thompsonshire, NM 88077            |
|    9 | Samuel Griffin   | 186 Patel Crossing
North Stefaniechester, WV 08221  |
|   10 | Tristan Pierce   | 593 Blankenship Rapids
New Jameshaven, SD 89585     |
+------+------------------+-----------------------------------------------------+
9 rows in set (0.04 sec)
```
