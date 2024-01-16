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
        若操作系统中同时拥有 Pyhon2 和 Python3，使用 UDF 前需要全局配置为 Python3，例如可以通过重命名 `/usr/bin/python`，然后在该处创建同名的 python3 软链来实现全局配置，相关命令示例：

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
    create or replace function py_add_2(a int, b int) 
    returns int 
    language python 
    import 
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
    create or replace function py_add_3(a int, b int) 
    returns int 
    language python 
    import 
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

## 函数 Vector

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

## 机器学习案例：信用卡欺诈检测

本节以“信用卡欺诈检测”为例，讲述了 python UDF 在机器学习推理流水线中的应用。（相关代码详见 [github-demo](https://github.com/matrixorigin/matrixone/tree/main/pkg/udf/pythonservice/demo)，包含以下即将下载和编写的文件）

### 环境配置

在本节中，我们需要确保本地 python 环境已安装了 numpy 和 scikit-learn 以及 joblib。

```bash
pip install numpy
pip install scikit-learn
pip install joblib
```

### 背景及数据

信用卡公司需要识别欺诈交易，以防止客户的信用卡被他人恶意使用。（详见 [kaggle Credit Card Fraud Detection](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud)）

数据集包含了 2013 年 9 月欧洲持卡人使用信用卡进行的交易记录。数据格式如下：

| 列名 | 类型 | 含义 |
| :--- | :--- | :--- |
| Time | int | 此交易与数据集中的第一个交易之间经过的秒数 |
| V1～V28 | double | 使用 PCA 提取的特征（以保护用户身份和敏感特征） |
| Amount | double | 交易金额 |
| Class | int | 1: 欺诈交易，0: 非欺诈交易 |

我们把数据按照 8: 1: 1 的比例划分为训练集、验证集和测试集。由于训练过程不是本文的重点，不在此处进行过多的介绍。

我们把测试集当作生产过程中新出现的数据存储到 MO 中，可以[点击此处](https://github.com/matrixorigin/matrixone/blob/main/pkg/udf/pythonservice/demo/ddl.sql)获得 `ddl.sql` 文件，使用以下语句导入数据表以及部分测试数据：

```mysql
source /your_download_path/ddl.sql
```

### 准备 python-whl 包

1. 编写 `detection.py`:

    ```python
    # coding = utf-8
    # -*- coding:utf-8 -*-
    import decimal
    import os
    from typing import List

    import joblib
    import numpy as np

    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'model_with_scaler')


    def detect(featuresList: List[List[int]], amountList: List[decimal.Decimal]) -> List[bool]:
        model_with_scaler = joblib.load(model_path)

        columns_features = np.array(featuresList)
        column_amount = np.array(amountList, dtype='float').reshape(-1, 1)
        column_amount = model_with_scaler['amount_scaler'].transform(column_amount)
        data = np.concatenate((columns_features, column_amount), axis=1)
        predictions = model_with_scaler['model'].predict(data)
        return [pred == 1 for pred in predictions.tolist()]


    detect.vector = True
    ```

2. 编写 `__init__.py`:

    ```python
    # coding = utf-8
    # -*- coding:utf-8 -*-
    from .detection import detect

    ```

3. [点击下载](https://github.com/matrixorigin/matrixone/blob/main/pkg/udf/pythonservice/demo/credit/model_with_scaler)已经训练好的模型 `model_with_scaler`

4. 编写 `setup.py`:

    ```python
    # coding = utf-8
    # -*- coding:utf-8 -*-
    from setuptools import setup, find_packages

    setup(
        name="detect",
        version="1.0.0",
        packages=find_packages(),
        package_data={
            'credit': ['model_with_scaler']
        },
    )

    ```

5. 将上述文件组织成下方的结构：

    ```bash
    |-- demo/
        |-- credit/
            |-- __init__.py
            |-- detection.py		# 推理函数
            |-- model_with_scaler	# 模型
        |-- setup.py
    ```

6. 进入目录 `demo`，使用以下命令构建 wheel 包 detect-1.0.0-py3-none-any.whl：

    ```bash
    python setup.py bdist_wheel 
    ```

### 使用 udf 进行欺诈检测

1. 创建 udf 函数：

    ```mysql
    create or replace function py_detect(features json, amount decimal) 
    returns bool 
    language python 
    import 'your_code_path/detect-1.0.0-py3-none-any.whl' -- 替换为 wheel 包所在目录
    handler 'credit.detect'; -- credit module 下的 detect 函数
    ```

2. 调用 udf 函数进行欺诈检测：

    ```mysql
    select id, py_detect(features, amount) as is_fraud from credit_card_transaction limit 10;
    ```

    输出：
    
    ```mysql
    +---------+----------+
    | id      | is_fraud |
    +---------+----------+
    |       1 | false    |
    |       2 | false    |
    |       3 | true     |
    |       4 | false    |
    |       5 | false    |
    |       6 | false    |
    |       7 | false    |
    |       8 | true     |
    |       9 | false    |
    |      10 | false    |
    +---------+----------+
    ```

至此，我们已经在 MO 中完成了信用卡欺诈检测任务的推理。

通过该案例可以看出，我们可以方便地使用 python UDF 来处理 SQL 解决不了的任务。Python UDF 既扩展了 SQL 的语义，又避免了我们手动编写数据移动和转换的程序，极大地提高了开发效率。

## 参考文档

有关 MatrixOne 中 UDF 的基础用法，参见 [UDF 基础用法](udf-python.md)。

有关 MatrixOne 对 UDF 创建的具体参数，参见[创建 UDF](../../Reference/SQL-Reference/Data-Definition-Language/create-function-python.md)。

有关 MatrixOne 对 UDF 删除的具体参数，参见[删除 UDF](../../Reference/SQL-Reference/Data-Definition-Language/drop-function.md)。
