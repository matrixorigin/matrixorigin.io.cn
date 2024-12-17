# Django 基础示例

本篇文档将指导你如何使用 **Django** 构建一个简单的应用程序，并实现 CRUD（创建、读取、更新、删除）功能。

**Django** 是一个由 Python 编写的一个开放源代码的 Web 应用框架。

## 开始前准备

相关软件的简单介绍：

* Django 是一个高级的 Python Web 框架，用于快速开发可维护和可扩展的 Web 应用程序。使用 Django，只要很少的代码，Python 的程序开发人员就可以轻松地完成一个正式网站所需要的大部分内容，并进一步开发出全功能的 Web 服务。

### 软件安装

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。

- 确认你已完成安装 [Python 3.8(or plus) version](https://www.python.org/downloads/)。使用下面的代码检查 Python 版本确认安装成功：

```
python3 -V
```

- 确认你已完成安装 MySQL 客户端。

- 确认你已完成安装 [Django](https://www.djangoproject.com/download/)。使用下面的代码检查 Django 版本确认安装成功：

```
python3 -m django --version
```

- 下载安装 `pymysql` 工具。使用下面的代码下载安装 `pymysql` 工具：

```
pip3 install pymysql

#If you are in China mainland and have a low downloading speed, you can speed up the download by following commands.
pip3 install pymysql -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 环境配置

1. 通过 MySQL 客户端连接到 MatrixOne。创建一个名为 *test* 的新数据库。

    ```
    mysql> create database test;
    ```

2. 创建项目 `django_crud_matrixone`。

    ```
    django-admin startproject django_crud_matrixone
    ```

    创建完成后我们可以查看下项目的目录结构：

    ```bash
    cd django_crud_matrixone/

    django_crud_matrixone/
    ├── __init__.py
    └── asgi.py
    └── settings.py
    └── urls.py
    └── wsgi.py
    manage.py
    ```

3. 接下来我们进入 django_crud_matrixone 目录输入以下命令，启动服务器：

    ```
    python3 manage.py runserver 0.0.0.0:8000
    ```

    0.0.0.0 让其它电脑可连接到开发服务器，8000 为端口号。如果不说明，那么端口号默认为 8000。

    在浏览器输入你服务器的 ip（这里我们输入本机 IP 地址：127.0.0.1:8000）及端口号，如果正常启动，输出结果如下：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/django/django-1.png)

4. 我们在项目的 settings.py 文件中找到 DATABASES 配置项，将其信息修改为：

    ```python
    DATABASES = { 
     'default': 
     { 
        'ENGINE': 'django.db.backends.mysql',    # 数据库引擎
        'NAME': 'test', # 数据库名称
        'HOST': '127.0.0.1', # 数据库地址，本机 ip 地址 127.0.0.1 
        'PORT': 6001, # 端口 
        'USER': 'root',  # 数据库用户名
        'PASSWORD': '111', # 数据库密码
        'OPTIONS': {
        'autocommit': True
    }
     }  
    }
    ```

5. 接下来，告诉 Django 使用 pymysql 模块连接 mysql 数据库，在与 settings.py 同级目录下的 __init__. py 中引入模块和进行配置：

    ```python
    import pymysql
    pymysql.install_as_MySQLdb()
    ```

6. 创建 app，Django 规定，如果要使用模型，必须要创建一个 app。我们使用以下命令创建一个 TestModel 的 app:

    ```
    django-admin startapp TestModel
    ```

    目录结构如下：

    ```bash
    django_crud_matrixone/
    ├── __init__.py
    └── asgi.py
    ...
    TestModel
    └── migrations
    └── __init__.py
    └── admin.py
    └── apps.py
    └── models.py
    └── tests.py
    └── views.py
    ```

7. 接下来在 settings.py 中找到 INSTALLED_APPS 这一项，如下：

    ```python
    INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "TestModel",                 #添加此项   
    ]
    ```

## 新建表

- 修改 TestModel/models.py 文件，定义一个*书本表*的信息代码如下：

```python
from django.db import models
class Book(models.Model): 
    id = models.AutoField(primary_key=True) # id 会自动创建，可以手动写入
    title = models.CharField(max_length=32) # 书籍名称
    price = models.DecimalField(max_digits=5, decimal_places=2) # 书籍价格 
    publish = models.CharField(max_length=32) # 出版社名称 
    pub_date = models.DateField() # 出版时间
```

Django 模型使用自带的 ORM。以上的类名代表了数据库表名（*testmodel_book*)，且继承了 models.Model，类里面的字段代表数据表中的字段，数据类型：AutoField（相当于 int）、CharField（相当于 varchar）、DecimalField (相当于 decimal)、DateField（相当于 date），max_length 参数限定长度。

ORM 对应关系表：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/django/django-7.png width=70% heigth=70%/>
</div>

有关更多模型字段类型请参考：<https://docs.djangoproject.com/en/5.0/ref/models/fields/>。

- 在命令行中运行

```
python3 manage.py makemigrations TestModel  # 生成配置文件并放到app下面的migrations目录
python3 manage.py migrate TestModel   # 根据配置文件自动生成相应的SQL语句
```

进入到 *test* 数据库中，可以看到 *testmodel_book 表*已生成。其中 *django_migrations 表*中生成执行过的操作的记录。

```sql
mysql> show tables;
+-------------------+
| Tables_in_test    |
+-------------------+
| django_migrations |
| testmodel_book    |
+-------------------+
2 rows in set (0.01 sec)
```

## 插入数据

- 添加数据需要先创建对象，然后通过 ORM 提供的 objects 提供的方法 create 来实现。在先前创建的 django_crud_matrixone 目录下的 django_crud_matrixone 目录新建一个 views.py 文件，并输入代码：

```
from django.shortcuts import render,HttpResponse
from TestModel import models 
def add_book(request):
    books = models.Book.objects.create(title="白夜行",price=39.50,publish="南海出版公司",pub_date="2010-10-10") 
    return HttpResponse("<p>数据添加成功！</p>")
```

- 接着，绑定 URL 与视图函数。打开 urls.py 文件，删除原来代码，将以下代码复制粘贴到 urls.py 文件中：

```
from django.contrib import admin
from django.urls import path
from . import views
 
urlpatterns = [
    path('', views.add_book),
    ]
```

- 接下来我们进入 django_crud_matrixone 目录输入以下命令，启动服务器：

```
python3 manage.py runserver 0.0.0.0:8000
```

在浏览器输入你服务器的 ip（这里我们输入本机 IP 地址：127.0.0.1:8000）及端口号，如果正常启动，输出结果如下：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/django/django-2.png width=50% heigth=50%/>
</div>

- 连接数据库查询数据，可以看到，数据成功插入：

```sql
mysql> select * from testmodel_book;
+------+-----------+-------+--------------------+------------+
| id   | title     | price | publish            | pub_date   |
+------+-----------+-------+--------------------+------------+
|    1 | 白夜行     | 39.50 | 南海出版公司         | 2010-10-10 |
+------+-----------+-------+--------------------+------------+
1 row in set (0.00 sec)
```

## 查询数据

- 修改 django_crud_matrixone 目录下的 views.py 文件，并添加代码：

```python
def src_book(request):
    books = models.Book.objects.all()#使用 all() 方法来查询所有内容
    for i in books:
       print(i.id,i.title,i.price,i.publish,i.pub_date)
    return HttpResponse("<p>查找成功！</p>")  
```

有关查询相关的更多方法，请参考：<https://docs.djangoproject.com/en/5.0/ref/models/querysets/>

- 修改 urls.py 文件：

    ```
    urlpatterns = [
    path('', views.src_book),
    ]
    ```

- 接下来我们进入 django_crud_matrixone 目录输入以下命令，启动服务器：

```
python3 manage.py runserver 0.0.0.0:8000
```

在浏览器输入你服务器的 ip（这里我们输入本机 IP 地址：127.0.0.1:8000）及端口号，如果正常启动，输出结果如下：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/django/django-3.png width=50% heigth=50%/>
</div>

命令行结果为：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/django/django-4.png width=50% heigth=50%/>
</div>

## 更新数据

- 更新数据使用 QuerySet 类型数据 `.update()`，以下例子为 id 值为 1 的记录的 price 值更新为 50。修改 django_crud_matrixone 目录下的 views.py 文件，并添加代码：

```python
def upd_book(request):
    books = models.Book.objects.filter(pk=1).update(price=50)
    return HttpResponse("<p>更新成功！</p>")
```

pk=1 的意思是主键 primary key=1，相当于 id=1。

- 修改 urls.py 文件：

```
urlpatterns = [
path('', views.upd_book),
]
```

- 接下来我们进入 django_crud_matrixone 目录输入以下命令，启动服务器：

```
python3 manage.py runserver 0.0.0.0:8000
```

在浏览器输入你服务器的 ip（这里我们输入本机 IP 地址：127.0.0.1:8000）及端口号，如果正常启动，输出结果如下：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/django/django-5.png width=40% heigth=40%/>
</div>

- 查看 *testmodel_book 表*，可以看到数据成功更新：

```sql
mysql> select * from testmodel_book;
+------+-----------+-------+--------------------+------------+
| id   | title     | price | publish            | pub_date   |
+------+-----------+-------+--------------------+------------+
|    1 | 白夜行     | 50.00 | 南海出版公司         | 2010-10-10 |
+------+-----------+-------+--------------------+------------+
1 row in set (0.00 sec)
```

## 删除数据

- 删除数据使用 QuerySet 类型数 `.delete()`，以下例子为删除 price 为 50 的记录。修改 django_crud_matrixone 目录下的 views.py 文件，并添加代码：

```python
def del_book(request):
    books=models.Book.objects.filter(price=50).delete()
    return HttpResponse("<p>删除成功！</p>")
```

- 修改 urls.py 文件：

```
urlpatterns = [
path('', views.del_book),
]
```

- 接下来我们进入 django_crud_matrixone 目录输入以下命令，启动服务器：

```
python3 manage.py runserver 0.0.0.0:8000
```

在浏览器输入你服务器的 ip（这里我们输入本机 IP 地址：127.0.0.1:8000）及端口号，如果正常启动，输出结果如下：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/django/django-6.png width=50% heigth=50%/>
</div>

- 查看 *testmodel_book 表*，可以看到数据被成功删除。

 ```sql
mysql> select * from testmodel_book;
Empty set (0.00 sec)
```
