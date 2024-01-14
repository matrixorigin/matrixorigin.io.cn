# UDF-Python-进阶

本篇文档将指导你如何使用 UDF 进阶功能，包括以 phython 文件、whl 包构建 UDF。

## 开始前准备

### 环境配置

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成安装 [Python 3.8(or plus)](https://www.python.org/downloads/), 使用下面的代码检查 Python 版本确认安装成功：

    ```bash

    #To check with Python installation and its version
    python3 -V

    ```

    !!! note
        若操作系统中同时拥有 Pyhon2 和 Python3，使用 UDF 前需要全局配置为 Python3，例如可以通过重命名`/usr/bin/python`，然后在该处创建同名的 python3 软链来实现全局配置，相关命令示例：

        ```bash
        mv /usr/bin/python /usr/bin/python.bak
        ln -s /usr/local/python3/bin/python3 /usr/bin/python
        ```

- 下载安装 `protobuf` 和 `grpcio` 工具，使用下面的代码下载安装 `protobuf` 和 `grpcio` 工具：

    ```
    pip3 install protobuf
    pip3 install grpcio
    ```

- 确认你已完成安装 MySQL 客户端。

### 启动 MatrixOne

1. 按照[快速开始](../../Get-Started/install-standalone-matrixone.md)章节的步骤使用 mo_ctl 完成 MatrixOne 的部署。部署完成后执行如下命令修改 mo_ctl 的配置：

    ```bash
    mo_ctl set_conf MO_CONF_FILE="\${MO_PATH}/matrixone/etc/launch-with-python-udf-server/launch.toml"
    ```

2. 修改配置后需要启动（或重启）MatrixOne 服务来使配置生效，例如使用 mo_ctl 启动 MatrixOne 服务：

    ```bash
    mo_ctl start
    ```

3. 待 MatrixOne 服务正常启动（若 MatrixOne 是首次启动，后台初始化会需要十秒左右的时间，初始化完成后才可连接）。执行如下命令访问 MatrixOne 服务：

    ```
    mo_ctl connect
    ```

    连接成功后将进入 mysql client 命令行工具。

## 导入 phython 文件以构建 UDF

嵌入式 UDF 将函数体直接写在 SQL 中，若函数逻辑十分复杂，会让 SQL 语句膨胀且不利于代码的维护。为避免这种情况，我们可以将 UDF 函数体编写在外部单独的 Python 文件中，然后通过导入 Python 文件的方式在 MatrixOne 中创建函数。

1. 准备好 python 文件

    可将原 SQL 函数体中的 python 代码编写在 `/opt/add_func.py` 文件内：

    ```python
    def add(a, b):
    return a + b
    ```

2. 创建 UDF 函数

    使用如下命令来创建函数，我们使用 import 关键字来导入指定路径下的 add_func.py 文件。

    ```mysql
    create or replace function py_add_2(a int, b int) returns int language python import 
    '/opt/add_func.py' -- python 文件在操作系统中的绝对路径
    handler 'add';
    ```

3. 调用 UDF 函数

    函数创建完成后，可使用**函数名 + 匹配类型的参数列表**来调用 UDF 函数，例如：

    ```mysql
    select py_add_2(12345,23456);
    +-------------------------+
    |  py_add(12345, 23456)   |
    +-------------------------+
    |                   35801 |
    +-------------------------+
    1 row in set (0.02 sec)
    ```

## 导入 whl 包以构建 UDF

WHL file 是用于 python 分发的标准内置包格式，允许在不构建源代码分发的情况下运行安装包，WHL file 本质上是 ZIP 文件。

### 准备工作

1. 在构建 whl 包前，我们需要安装以下工具：

    ```bash
    pip install setuptools wheel
    # setuptools：用于构建和打包 Python 库
    # wheel：用于生成.whl 文件
    ```

### 构建 whl 包

1. 按照如下的文件结构创建文件以及内容

    我们使用一个简单的 Python 工程目录 `func_add`（文件夹名称可任意命名），其目录结构如下：

    ```bash
    func_add/
    ├── add_udf.py
    └── setup.py
    ```

    其中，`add_udf.py` 是可正常可执行的 Python 代码文件，用来实现函数方法体逻辑，也可将其视为一个模块（module）。`add_udf.py` 中的代码例如：

    ```python
    # function

    def add(a, b):
    return a + b
    ```

    `setup.py` 文件用来定义库的元数据和配置信息等，代码例如：

    ```python
    # setup.py

    from setuptools import setup

    setup(
    name="udf",
    version="1.0.0",
    # 包含函数体的 python 文件名去掉拓展名.py 后即为模块名
    py_modules=["add_udf"]
    )
    ```

2. 构建 whl 包

    工程文件编写就位后，在 `func_add` 目录内执行如下命令构建 wheel 包：

    ```bash
    python setup.py bdist_wheel
    ```

    打包完成后，会在 `func_add/dist` 目录下生成 `udf-1.0.0-py3-none-any.whl` 文件。

### 创建以及调用 UDF 函数

1. 创建 UDF 函数

    将 whl 包拷贝至规划中的函数存放目录，例如路径为：`/opt/udf/udf-1.0.0-py3-none-any.whl`，在创建语句中使用该 whl 包创建 UDF 函数，创建语句示例如下：

    ```mysql
    create or replace function py_add_3(a int, b int) returns int language python import 
    '/opt/udf/udf-1.0.0-py3-none-any.whl'   -- wheel 包所在目录
    handler 'add_udf.add';   -- 指定调用 whl 包中 add_udf 模块的 add 函数
    ```

2. 调用 UDF 函数

    函数创建完成后，可使用**函数名 + 匹配类型的参数列表**来调用 UDF 函数，例如：

    ```mysql
    select py_add_3(12345,23456);
    +-------------------------+
    |  py_add(12345, 23456)   |
    +-------------------------+
    |                   35801 |
    +-------------------------+
    1 row in set (0.02 sec)
    ```

## 函数 Vector 选项

在部分场景下，我们会希望 python 函数一次性接收多个元组来提高运行效率。如在模型推理时，我们通常是以一个 batch 为单位进行，这里的 batch 即为元组的 vector，MatrixOne 提供函数的 vector 选项来处理这种情况。我们仍以 py_add 函数为例，来展示 vector 选项的用法。

1. 在 udf_test 库下创建一张名为 grades 的数据表：

    ```mysql
    create table grades(chinese int,math int);
    ```

2. 插入几条测试数据：

    ```mysql
    insert into grades values(97,100),(85,89),(79,99);
    ```

3. 查看下表里的数据：

    ```mysql
    select * from grades;
    +---------+------+
    | chinese | math |
    +---------+------+
    |      97 |  100 |
    |      85 |   89 |
    |      79 |   99 |
    +---------+------+
    ```

4. 执行如下命令创建 UDF 函数
    我们使用 `add.vector = True` 来标记 python 函数 add 接收两个 int 列表（vector）而不是 int 值：

    ```mysql
    create or replace function py_add_4(a int, b int) returns int language python as 
    $$
    def add(a, b):  # a, b are list
    return [a[i] + b[i] for i in range(len(a))]
    add.vector = True
    $$
    handler 'add';
    ```

5. 调用 UDF 函数

    同样通过函数名和参数列表来调用函数，该处的参数列表我们可以使用 grades 表中的两个整数字段列，例如：

    ```mysql
    select py_add_4(chinese,math) as Total from grades;
    +-------+
    | Total |
    +-------+
    |   197 |
    |   174 |
    |   178 |
    +-------+
    ```

    使用 vector 选项，我们就可以自由的选择函数的处理形式，例如一次一元组，或者一次多元组。

    !!! note
        不论是否添加 vector 参数，MatrixOne UDF 都可以处理列，vector 只用于改变开发者编写 python 函数的逻辑，该选项是基于性能上的设计而非功能上的。

## 参考文档

有关 MatrixOne 中 UDF 的基础用法，参见 [UDF 基础用法](udf-python.md)。

有关 MatrixOne 对 UDF 创建的具体参数，参见[创建 UDF](../../Reference/SQL-Reference/Data-Definition-Language/create-function-python.md)。

有关 MatrixOne 对 UDF 删除的具体参数，参见[删除 UDF](../../Reference/SQL-Reference/Data-Definition-Language/drop-function.md)。
