# UDF-Python

您可以使用 Python 编写用户自定义函数 (UDF) 的处理程序。本篇文档将指导你如何创建一个简单 Python UDF，包括使用环境要求、UDF 创建、查看、使用和删除。

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

## 嵌入式构建 UDF

MatrixOne 支持在 SQL 中通过 AS 关键字直接使用 Python 代码编写函数体来创建 UDF，以这种形式创建的 UDF 被称为**嵌入式 UDF**。

1. 创建一个测试库

    在创建 UDF 函数之前，需要先创建一个测试库：

    ```mysql
    mysql> create database udf_test;
    Query 0k, 1 row affected (0.02 sec)
    mysql> use udf_test;
    Database changed
    ```

2. 创建 UDF 函数

    在目标库内，可执行 CREATE 命令配合 Python 语句创建 UDF 函数。例如使用如下 SQL 定义一个名为 **py_add** 的函数，定义参数列表接收两个类型为 int 的参数，函数功能是返回两个参数的和，具体的函数逻辑在 as 后的 python 代码中，然后，使用 handler 关键字指定调用的 python 函数名称：

    ```mysql
    create or replace function py_add(a int, b int) returns int language python as 
    $$
    def add(a, b):
        return a + b
    $$
    handler 'add';
    ```

    !!! note
        当前版本 matrixone 不会在创建 UDF 时检查 python 语法，用户需要自行保证 python 语法的正确性，否则在执行后续执行函数时会报错。

3. 调用 UDF 函数

    函数创建完成后，可使用**函数名 + 匹配类型的参数列表**来调用 UDF 函数，例如：

    ```mysql
    select py_add(12345,23456);
    +-------------------------+
    |  py_add(12345, 23456)   |
    +-------------------------+
    |                   35801 |
    +-------------------------+
    1 row in set (0.02 sec)
    ```

## 删除 UDF

可通过 `drop function` 命令对已创建的 UDF 函数进行删除。MatrixOne 通过 **`函数名(参数列表)`** 来完整标识一个 UDF 函数，因此删除 UDF 函数时需要显式指定**函数名**与**参数列表**，例如：

```mysql
drop function py_add(int, int);
```

## 查看 UDF

已创建 UDF 函数的信息会保存在 MatrixOne 的元数据中，可通过查询系统表 `mo_catalog.mo_user_defined_function` 来获取 MatrixOne 中已有的 UDF 详细信息，例如：

```mysql
mysql> select * from mo_catalog.mo_user_defined_function\G
*************************** 1. row ***************************
         function_id: 9000016
                name: py_add
               owner: 0
                args: [{"name": "a", "type": "int"}, {"name": "b", "type": "int"}]
             rettype: int
                body: {"handler":"add","import":false,"body":"\ndef add(a, b):\n  return a + b\n"}
            language: python
                  db: udf_test
             definer: root
       modified_time: 2023-12-26 13:59:39
        created_time: 2023-12-26 13:59:39
                type: FUNCTION
       security_type: DEFINER
             comment: 
character_set_client: utf8mb4
collation_connection: utf8mb4_0900_ai_ci
  database_collation: utf8mb4_0900_ai_ci
```

## 参考文档

有关 MatrixOne 中 UDF 的进阶用法，参见 [UDF 进阶用法](udf-python-advanced.md)。

有关 MatrixOne 对 UDF 创建的具体参数，参见[创建 UDF](../../Reference/SQL-Reference/Data-Definition-Language/create-function-python.md)。

有关 MatrixOne 对 UDF 删除的具体参数，参见[删除 UDF](../../Reference/SQL-Reference/Data-Definition-Language/drop-function.md)。
