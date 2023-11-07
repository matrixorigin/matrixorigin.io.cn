# 插入 jsonlines 文件

本篇文档将指导你如何将 JSONLines 格式数据（即 *jl* 或 *jsonl* 文件）导入 MatrixOne。

## 有关 JSONLines 格式

JSON（JavaScript Object Notation）是一种轻量级的数据交换格式。你可以参见[官方文档](https://www.json.org/json-en.html)获取更多有关 JSON 的信息。

[JSONLines](https://jsonlines.org/) 文本格式，也称为换行符分隔的 JSON，它是一种更为方便存储结构化的数据格式，可以一次处理一条记录。它每一行都是完整、合法的 JSON 值；它采用 `\n` 作为行分隔符。JSONLines 的每一行都是独立的，因此行的开头或结尾不需要逗号。JSONLines 的全部内容也不需要用 `[]` 或 `{}` 括起来。

JSONLines 对于数据流来说更为友好。因为每一个新的行意味着一个单独的条目，因此 JSON 行格式的文件可以流式传输。它不需要自定义解析器。只需读取一行，解析为 JSON，再读取一行，解析为 JSON，一直到完成。

JSONLines 格式有以下三个要求：

* **UTF-8 编码**：JSON 允许仅使用 ASCII 转义序列对 Unicode 字符串进行编码，但是在文本编辑器中，这些转义难以阅读。JSON Lines 文件的作者可以选择转义字符来处理纯 ASCII 文件。

* **每行都是一个合法的 JSON 值**：最常见的值是对象或数组，任何 JSON 值都是合法的。

* **行分隔符为 `\n`**：由于在解析 JSON 值时会隐式忽略周围的空格在支持行分隔符 `\n` 的同时也支持“\r\n”。

## 对于 MatrixOne 有效的 JSONLines 格式

JSONLines 格式只需要每一行都有一个有效的 JSON 值。但 MatrixOne 需要更结构化的 JSONLines 格式，在 MatrixOne 中只允许具有相同类型值和普通结构的 JSON 对象或 JSON 数组。如果您的 JSONLines 文件有嵌套结构，MatrixOne 暂时不支持加载它。

一个有效对象 JSONLines 示例：

```
{"id":1,"father":"Mark","mother":"Charlotte"}
{"id":2,"father":"John","mother":"Ann"}
{"id":3,"father":"Bob","mother":"Monika"}
```

无效对象 JSONLines 示例（具有嵌套结构）：

```
{"id":1,"father":"Mark","mother":"Charlotte","children":["Tom"]}
{"id":2,"father":"John","mother":"Ann","children":["Jessika","Antony","Jack"]}
{"id":3,"father":"Bob","mother":"Monika","children":["Jerry","Karol"]}
```

一个有效数组 JSONLines 示例，它更像是 *csv* 格式。

```
["Name", "Session", "Score", "Completed"]
["Gilbert", "2013", 24, true]
["Alexa", "2013", 29, true]
["May", "2012B", 14, false]
["Deloise", "2012A", 19, true]
```

无效数组 JSONLines 示例（无效原因是因为数据类型和列号不匹配）：

```
["Gilbert", "2013", 24, true, 100]
["Alexa", "2013", "twenty nine", true]
["May", "2012B", 14, "no"]
["Deloise", "2012A", 19, true, 40]
```

## 语法结构

- 数据文件与 MatrixOne 服务器在同一台机器上：

```
LOAD DATA INFILE
    {'filepath'='FILEPATH', 'compression'='COMPRESSION_FORMAT', 'format'='FILE_FORMAT', 'jsondata'='object'/'array'} INTO TABLE table_name [IGNORE x LINES/ROWS]
    [PARALLEL {'TRUE' | 'FALSE'}];
```

- 数据文件与 MatrixOne 服务器在不同的机器上：

```
LOAD DATA LOCAL INFILE
    {'filepath'='FILEPATH', 'compression'='COMPRESSION_FORMAT', 'format'='FILE_FORMAT', 'jsondata'='object'/'array'} INTO TABLE table_name [IGNORE x LINES/ROWS]
    [PARALLEL {'TRUE' | 'FALSE'}];
```

**参数说明**

|参数 | 值 | 必须/可选 | 描述|
|:-:|:-:|:-:|:-:|
|filepath|String| 必须 | 文件路径|
|compression|auto/none/bz2/gzip/lz4|可选 | 压缩格式 |
|format|csv/jsonline|可选 |加载文件格式，默认 *.csv*|
|jsondata|object/array|可选 | JSON 数据格式。如果 `format` 为 *jsonline*，则**必须**指定 *jsondata*|
|table_name|String|必须 | 需加载数据到表的表名称|
|x|Number|可选 | 加载时要忽略的行|

**JSONLines 格式数据的 DDL 指南**

在将 JSONLines 数据加载到 MatrixOne 之前，你需要先创建一个表。

由于 JSON 数据类型与 MatrixOne 的数据类型不同，参见下表，可以查看 JSON 数据类型对应到 MatrixOne 中时的数据类型：

|JSON 类型 |  MatrixOne 中的数据类型|
|:-:|:-:|
|String| VARCHAR (定长字符串)|
|String| TEXT (长文本数据)|
|String| DATETIME or TIMESTAMP (格式为 "YYYY-MM-DD HH:MM:SS.XXXXXX")|
|String| DATE (格式为 "YYYY-MM-DD")|
|String| TIME (格式为 "HH-MM-SS.XXXXXX")|
|Number| INT (整数)|
|Number| FLOAT 或 DOUBLE (浮点数) |
|Boolean| BOOL(true/false)|
|Object| Json 类型|
|Array| Json 类型|
|Null| 支持所有类型|

例如，你可以先使用 SQL 语句为 JSONLines 格式文件先创建一个数据表，如下所示：

```
mysql> create table t1 (name varchar(100), session varchar(100), score int, completed bool);
```

```
["Name", "Session", "Score", "Completed"]
["Gilbert", "2013", 24, true]
["Alexa", "2013", 29, true]
["May", "2012B", 14, false]
["Deloise", "2012A", 19, true]
```

**示例**

以下代码段是将 JSONLines 文件加载到 MatrixOne 的完整 SQL 示例。

```
#Load a BZIP2 compressed jsonline object file
load data infile {'filepath'='data.bzip2', 'compression'='bz2','format'='jsonline','jsondata'='object'} into table db.a

#Load a plain jsonline array file
load data infile {'filepath'='data.jl', 'format'='jsonline','jsondata'='array'} into table db.a

#Load a gzip compressed jsonline array file and ignore the first line
load data infile {'filepath'='data.jl.gz', 'compression'='gzip','format'='jsonline','jsondata'='array'} into table db.a ignore 1 lines;
```

## 教程示例

在本教程中将指导你如何加载两个具有对象和数组 json 格式的 jsonline 文件。

__Note:__ 本教程中，数据文件与 MatrixOne 服务器在同一台机器上。如果数据文件与 MatrixOne 服务器在不同的机器上，也可以使用 `Load Data` 进行数据导入。

1. 准备数据。你也可以下载使用我们准备好的 *jl* 文件。

    - 示例数据 1：*[jsonline_object.jl](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/jsonline_object.jl)*
    - 示例数据 2：*[jsonline_array.jl](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/jsonline_array.jl)*

2. 打开终端，进入到 *jl* 文件所在目录，输入下面的命令行，显示文件内的具体内容：

    ```shell
    > cd /$filepath
    > head jsonline_object.jl
    {"col1":true,"col2":1,"col3":"var","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col6":"2020-09-07 00:00:00","col7":"18","col8":121.11}
    {"col1":"true","col2":"1","col3":"var","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col6":"2020-09-07 00:00:00","col7":"18","col8":"121.11"}
    {"col6":"2020-09-07 00:00:00","col7":"18","col8":"121.11","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col1":"true","col2":"1","col3":"var"}
    {"col2":1,"col3":"var","col1":true,"col6":"2020-09-07 00:00:00","col7":"18","col4":"2020-09-07","col5":"2020-09-07 00:00:00","col8":121.11}
    > head jsonline_array.jl
    [true,1,"var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18",121.11]
    ["true","1","var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18","121.11"]
    ```

3. 启动 MySQL 客户端，连接到 MatrixOne。

    ```
    mysql -h 127.0.0.1 -P 6001 -uroot -p111
    ```

    __Note:__ 如果你的数据文件与 MatrixOne 服务器在不同的机器上，即数据文件在你所使用的客户端机器上时，那么你连接 MatrixOne 服务主机需要使用命令行：`mysql -h <mo-host-ip> -P <mo-host-ip> -uroot -p111 --local-infile`；并且导入的命令行需要使用 `LOAD DATA LOCAL INFILE` 语法。

    !!! note
        上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../../Security/password-mgmt.md)。

4. 在 MatrixOne 建表：

    ```sql
    create database db1;
    use db1;
    drop table if exists t1;
    create table t1(col1 bool,col2 int,col3 varchar, col4 date,col5 datetime,col6 timestamp,col7 decimal,col8 float);
    drop table if exists t2;
    create table t2(col1 bool,col2 int,col3 varchar, col4 date,col5 datetime,col6 timestamp,col7 decimal,col8 float);
    ```

5. 在 MySQL 客户端对对应的文件路径执行 `LOAD DATA`，导入 *jsonline_object.jl* 和 *jsonline_array.jl* 文件：

    ```sql
    load data infile {'filepath'='$filepath/jsonline_object.jl','format'='jsonline','jsondata'='object'} into table t1;
    load data infile {'filepath'='$filepath/jsonline_array.jl','format'='jsonline','jsondata'='array'} into table t2;
    ```

6. 导入成功后，使用如下 SQL 语句查看导入结果：

    ```sql
    select * from t1;
    col1	col2	col3	col4	col5	col6	col7	col8
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    true	1	var	2020-09-07	2020-09-07 00:00:00	2020-09-07 00:00:00	18	121.11
    ```

!!! note
    如果您使用 Docker 启动 MatrixOne，当你需要导入 JSONline 文件时，请确保你已将数据目录挂载到容器。你也可以查看[导入 *csv* 格式数据](load-csv.md)，了解如何使用 Docker 挂载数据。
