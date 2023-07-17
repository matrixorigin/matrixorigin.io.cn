# **LOAD DATA**

## **概述**

`LOAD DATA` 语句可以极快地将文本文件中的行读入表中。你可以从服务器主机或 [S3 兼容对象存储](../../../Develop/import-data/bulk-load/load-s3.md)读取该文件。`LOAD DATA` 是 [`SELECT ... INTO OUTFILE`](../../../Develop/export-data/select-into-outfile.md) 相反的操作。

- 将文件读回表中，使用 `LOAD DATA`。
- 将表中的数据写入文件，使用 `SELECT ... INTO OUTFILE`。
- `FIELDS` 和 `LINES` 子句的语法对于 `LOAD DATA` 和 `SELECT ... INTO OUTFILE` 这两个语句的使用方式一致，使用 Fields 和 Lines 参数来指定如何处理数据格式。

## **语法结构**

```
> LOAD DATA [LOCAL]
    INFILE 'file_name'
    INTO TABLE tbl_name
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
    ]
    [LINES
        [STARTING BY 'string']
        [TERMINATED BY 'string']
    ]
    [IGNORE number {LINES | ROWS}]
    [SET column_name_1=nullif(column_name_1, expr1), column_name_2=nullif(column_name_2, expr2)...]
    [PARALLEL {'TRUE' | 'FALSE'}]
```

**参数解释**

上述语法结构中的参数解释如下：

### INFILE

- `LOAD DATA INFILE 'file_name'`：

   **命令行使用场景**：需要加载的数据文件与 MatrixOne 主机服务器在同一台机器上。
   `file_name` 可以是文件的存放位置的相对路径名称，也可以是绝对路径名称。

- `LOAD DATA LOCAL INFILE 'file_name'`：

   **命令行使用场景**：需要加载的数据文件与 MatrixOne 主机服务器不在同一台机器上，即，数据文件在客户机上。
   `file_name` 可以是文件的存放位置的相对路径名称，也可以是绝对路径名称。

### IGNORE LINES

`IGNORE number LINES` 子句可用于忽略文件开头的行。例如，你可以使用 `IGNORE 1 LINES` 跳过包含列名的初始标题行：

```
LOAD DATA INFILE '/tmp/test.txt' INTO TABLE table1 IGNORE 1 LINES;
```

### FIELDS 和 LINES 参数说明

使用 `FIELDS` 和 `LINES` 参数来指定如何处理数据格式。

对于 `LOAD DATA` 和 `SELECT ... INTO OUTFILE` 语句，`FIELDS` 和 `LINES` 子句的语法是相同的。这两个子句都是可选的，但如果两者都指定，则 `FIELDS` 必须在 `LINES` 之前。

如果指定 `FIELDS` 子句，那么 `FIELDS` 的每个子句（`TERMINATED BY`、`[OPTIONALLY] ENCLOSED BY`）也是可选的，除非你必须至少指定其中一个。

`LOAD DATA` 也支持使用十六进制 `ASCII` 字符表达式或二进制 `ASCII` 字符表达式作为 `FIELDS ENCLOSED BY` 和 `FIELDS TERMINATED BY` 的参数。

如果不指定处理数据的参数，则使用默认值如下：

```
FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n'
```

意义如下：

- `FIELDS TERMINATED BY ','`：以*,* 作为分隔符
- `ENCLOSED BY '"'`：使用双引号把各个字段括起来
- `LINES TERMINATED BY '\n'`：以 '\n' 为行间分隔符

**FIELDS TERMINATED BY**

`FIELDS TERMINATED BY` 表示字段与字段之间的分隔符，使用 `FIELDS TERMINATED BY` 就可以指定每个数据的分隔符号。

`FIELDS TERMINATED BY` 指定的值可以超过一个字符。

- **正确示例**：

例如，读取使用*逗号*分隔的文件，语法是：

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY ',';
```

- **错误示例**：

如果你使用如下所示的语句读取文件，将会产生报错，因为它表示的是 `LOAD DATA` 查找字段之间的制表符：

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY '\t';
```

这样可能会导致结果被解释为每个输入行都是一个字段，你可能会遇到 `ERROR 20101 (HY000): internal error: the table column is larger than input data column` 错误。

**FIELDS ENCLOSED BY**

`FIELDS TERMINATED BY` 指定的值包含输入值的字符。`ENCLOSED BY` 指定的值必须是单个字符；如果输入值不一定包含在引号中，需要在 `ENCLOSED BY` 选项之前使用 `OPTIONALLY`。

如下面的例子所示，即表示一部分输入值用可以用引号括起来，另一些可以不用引号括起来：

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"';
```

如果 `ENCLOSED BY` 前不加 `OPTIONALLY`，比如说，`ENCLOSED BY '"'` 就表示使用双引号把各个字段都括起来。

**LINES TERMINATED BY**

`LINES TERMINATED BY` 用于指定一行的结束符。`LINES TERMINATED BY` 值可以超过一个字符。

例如，*csv* 文件中的行以回车符/换行符对结束，你在加载它时，可以使用 `LINES TERMINATED BY '\r\n'` 或 `LINES TERMINATED BY '\n'`：

```
LOAD DATA INFILE 'data.txt' INTO TABLE table1
  FIELDS TERMINATED BY ',' ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';
```

**LINE STARTING BY**

如果所有输入行都有一个你想忽略的公共前缀，你可以使用 `LINES STARTING BY` 'prefix_string' 来忽略前缀和前缀之前的任何内容。

如果一行不包含前缀，则跳过整行。如下语句所示：

```
LOAD DATA INFILE '/tmp/test.txt' INTO TABLE table1
  FIELDS TERMINATED BY ','  LINES STARTING BY 'xxx';
```

如果数据文件是如下样式：

```
xxx"abc",1
something xxx"def",2
"ghi",3
```

则输出的结果行是 ("abc"，1) 和 ("def"，2)。文件中的第三行由于没有前缀，则被忽略。

### SET

MatrixOne 当前仅支持 `SET column_name=nullif(column_name,expr)`。即，当 `column_name = expr`，返回 `NULL`；否则，则返回 `column_name`。例如，`SET a=nullif(a, 1)`，当 a=1 时，返回 `NULL`；否则，返回 a 列原始的值。

使用这种方法，可以在加载文件时，设置参数 `SET column_name=nullif(column_name,"null")`，用于返回列中的 `NULL` 值。

**示例**

1. 本地文件 `test.txt` 详情如下：

    ```
    id,user_name,sex
    1,"weder","man"
    2,"tom","man"
    null,wederTom,"man"
    ```

2. 在 MatrixOne 中新建一个表 `user`：

    ```sql
    create database aaa;
    use aaa;
    CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
    ```

3. 使用下面的命令行将 `test.txt` 导入至表 `user`：

    ```sql
    LOAD DATA INFILE '/tmp/test.txt' INTO TABLE user SET id=nullif(id,"null");
    ```

4. 导入后的表内容如下：

    ```sql
    select * from user;
    +------+-----------+------+
    | id   | user_name | sex  |
    +------+-----------+------+
    |    1 | weder     | man  |
    |    2 | tom       | man  |
    | null | wederTom  | man  |
    +------+-----------+------+
    ```

### PARALLEL

对于一个格式良好的大文件，例如 *JSONLines* 文件，或者一行数据中没有换行符的 *CSV* 文件，都可以使用 `PARALLEL` 对该文件进行并行加载，以加快加载速度。

例如，对于 2 个 G 的大文件，使用两个线程去进行加载，第 2 个线程先拆分定位到 1G 的位置，然后一直往后读取并进行加载。这样就可以做到两个线程同时读取大文件，每个线程读取 1G 的数据。

**开启/关闭并行加载命令行示例**：

```sql
--  打开并行加载
load data infile 'file_name' into table tbl_name FIELDS TERMINATED BY '|' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES PARALLEL 'TRUE';

--  关闭并行加载
load data infile 'file_name' into table tbl_name FIELDS TERMINATED BY '|' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES PARALLEL 'FALSE';

--  默认关闭并行加载
load data infile 'file_name' into table tbl_name FIELDS TERMINATED BY '|' ENCLOSED BY '\"' LINES TERMINATED BY '\n' IGNORE 1 LINES;
```

!!! note
    `[PARALLEL {'TRUE' | 'FALSE'}]` 内字段，当前仅支持 `TRUE` 或 `FALSE`，且大小写不敏感。

__Note:__ `LOAD` 语句中如果不加 `PARALLEL` 字段，对于 *CSV* 文件，是默认关闭并行加载；对于 *JSONLines* 文件，默认开启并行加载。如果 *CSV* 文件中有行结束符，比如 '\n'，那么有可能会导致文件加载时数据出错。如果文件过大，建议从换行符为起止点手动拆分文件后再开启并行加载。

## 支持的文件格式

在 MatrixOne 当前版本中，`LOAD DATA` 支持 *CSV* 格式和 *JSONLines* 格式文件。

有关导入这两种格式的文档，参见[导入*. csv* 格式数据](../../../Develop/import-data/bulk-load/load-csv.md)和[导入 JSONLines 数据](../../../Develop/import-data/bulk-load/load-jsonline.md)。

### *CSV* 格式标准说明

MatrixOne 加载 *CSV* 格式符合 RFC4180 标准，规定 *CSV* 格式如下：

1. 每条记录位于单独的一行，由换行符（CRLF）分隔：

    ```
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx CRLF
    ```

    导入到表内如下所示：

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | b bb    | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

2. 文件中最后一条记录可以有结束换行符，也可以无结束换行符（CRLF）：

    ```
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx
    ```

    导入到表内如下所示：

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | b bb    | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

3. 可选的标题行作为文件的第一行出现，其格式与普通记录行相同。例如：

    ```
    field_name,field_name,field_name CRLF
    aaa,bbb,ccc CRLF
    zzz,yyy,xxx CRLF
    ```

    导入到表内如下所示：

    +------------+------------+------------+
    | field_name | field_name | field_name |
    +------------+------------+------------+
    | aaa        | bbb        | ccc        |
    | zzz        | yyy        | xxx        |
    +------------+------------+------------+

4. 在标题和每条记录中，可能有一个或多个字段，字段之间以逗号分隔。字段内的空格属于字段的一部分，不应忽略。每条记录中的最后一个字段后面不能跟逗号。例如：

    ```
    aaa,bbb,ccc
    ```

    或：

    ```
    a aa, bbb,cc c
    ```

    这两个例子都是合法的。

    导入到表内如下所示：

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | bbb     | ccc     |
    +---------+---------+---------+

    或：

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | a aa    |  bbb    | cc c    |
    +---------+---------+---------+

5. 每个字段可以用双引号括起来，也可以不用双引号括起来。如果字段没有用双引号引起来，那么双引号不能出现在字段内。例如：

    ```
    "aaa","bbb","ccc" CRLF
    zzz,yyy,xxx
    ```

    或：

    ```
    "aaa","bbb",ccc CRLF
    zzz,yyy,xxx
    ```

    这两个例子都是合法的。

    导入到表内如下所示：

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | bbb     | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

6. 包含换行符（CRLF）、双引号和逗号的字段应该用双引号引起来。例如：

    ```
    "aaa","b CRLF
    bb","ccc" CRLF
    zzz,yyy,xxx
    ```

    导入到表内如下所示：

    +---------+---------+---------+
    | col1    | col2    | col3    |
    +---------+---------+---------+
    | aaa     | b bb    | ccc     |
    | zzz     | yyy     | xxx     |
    +---------+---------+---------+

7. 如果使用双引号将字段括起来，那么出现在字段内的多个双引号也必须使用双引号括起来，否则字段内两个双引号的第一个引号将被解析为转义字符，从而只保留一个双引号。例如：

    ```
    "aaa","b""bb","ccc"
    ```

    上面这个 *CSV* 会把 `"b""bb"` 解析为 `b"bb`，如果正确的字段为 `b""bb`，那么应该写成：

    ```
    "aaa","b""""bb","ccc"
    ```

    或：

    ```
    "aaa",b""bb,"ccc"
    ```

## **示例**

你可以在 SSB 测试中了解 `LOAD DATA` 语句的用法，参见[完成 SSB 测试](../../../Test/performance-testing/SSB-test-with-matrixone.md)。

语法示例如下：

```
> LOAD DATA INFILE '/ssb-dbgen-path/lineorder_flat.tbl ' INTO TABLE lineorder_flat;
```

上面这行语句表示：将 */ssb-dbgen-path/* 这个目录路径下的 *lineorder_flat.tbl* 数据集加载到 MatrixOne 的数据表 *lineorder_flat* 中。

你也可以参考以下语法示例，来快速了解 `LOAD DATA`：

### 示例 1：LOAD CSV

#### 简单导入示例

本地命名为 *char_varchar.csv* 文件内数据如下：

```
a|b|c|d
"a"|"b"|"c"|"d"
'a'|'b'|'c'|'d'
"'a'"|"'b'"|"'c'"|"'d'"
"aa|aa"|"bb|bb"|"cc|cc"|"dd|dd"
"aa|"|"bb|"|"cc|"|"dd|"
"aa|||aa"|"bb|||bb"|"cc|||cc"|"dd|||dd"
"aa'|'||aa"|"bb'|'||bb"|"cc'|'||cc"|"dd'|'||dd"
aa"aa|bb"bb|cc"cc|dd"dd
"aa"aa"|"bb"bb"|"cc"cc"|"dd"dd"
"aa""aa"|"bb""bb"|"cc""cc"|"dd""dd"
"aa"""aa"|"bb"""bb"|"cc"""cc"|"dd"""dd"
"aa""""aa"|"bb""""bb"|"cc""""cc"|"dd""""dd"
"aa""|aa"|"bb""|bb"|"cc""|cc"|"dd""|dd"
"aa""""|aa"|"bb""""|bb"|"cc""""|cc"|"dd""""|dd"
|||
||||
""|""|""|
""""|""""|""""|""""
""""""|""""""|""""""|""""""
```

在 MatrixOne 中建表：

```sql
mysql> drop table if exists t1;
Query OK, 0 rows affected (0.01 sec)

mysql> create table t1(
    -> col1 char(225),
    -> col2 varchar(225),
    -> col3 text,
    -> col4 varchar(225)
    -> );
Query OK, 0 rows affected (0.02 sec)
```

将数据文件导入到 MatrixOne 中的表 t1：

```sql
load data infile '<your-local-file-path>/char_varchar.csv' into table t1 fields terminated by'|';
```

查询结果如下：

```
mysql> select * from t1;
+-----------+-----------+-----------+-----------+
| col1      | col2      | col3      | col4      |
+-----------+-----------+-----------+-----------+
| a         | b         | c         | d         |
| a         | b         | c         | d         |
| 'a'       | 'b'       | 'c'       | 'd'       |
| 'a'       | 'b'       | 'c'       | 'd'       |
| aa|aa     | bb|bb     | cc|cc     | dd|dd     |
| aa|       | bb|       | cc|       | dd|       |
| aa|||aa   | bb|||bb   | cc|||cc   | dd|||dd   |
| aa'|'||aa | bb'|'||bb | cc'|'||cc | dd'|'||dd |
| aa"aa     | bb"bb     | cc"cc     | dd"dd     |
| aa"aa     | bb"bb     | cc"cc     | dd"dd     |
| aa"aa     | bb"bb     | cc"cc     | dd"dd     |
| aa""aa    | bb""bb    | cc""cc    | dd""dd    |
| aa""aa    | bb""bb    | cc""cc    | dd""dd    |
| aa"|aa    | bb"|bb    | cc"|cc    | dd"|dd    |
| aa""|aa   | bb""|bb   | cc""|cc   | dd""|dd   |
|           |           |           |           |
|           |           |           |           |
|           |           |           |           |
| "         | "         | "         | "         |
| ""        | ""        | ""        | ""        |
+-----------+-----------+-----------+-----------+
20 rows in set (0.00 sec)
```

### 增加条件导入示例

沿用上面的简单示例，你可以修改一下 LOAD DATA 语句，在末尾增加条件 `LINES STARTING BY 'aa' ignore 10 lines;`：

```sql
delete from t1;
load data infile '<your-local-file-path>/char_varchar.csv' into table t1 fields terminated by'|' LINES STARTING BY 'aa' ignore 10 lines;
```

查询结果如下：

```sql
mysql> select * from t1;
+---------+---------+---------+---------+
| col1    | col2    | col3    | col4    |
+---------+---------+---------+---------+
| aa"aa   | bb"bb   | cc"cc   | dd"dd   |
| aa""aa  | bb""bb  | cc""cc  | dd""dd  |
| aa""aa  | bb""bb  | cc""cc  | dd""dd  |
| aa"|aa  | bb"|bb  | cc"|cc  | dd"|dd  |
| aa""|aa | bb""|bb | cc""|cc | dd""|dd |
|         |         |         |         |
|         |         |         |         |
|         |         |         |         |
| "       | "       | "       | "       |
| ""      | ""      | ""      | ""      |
+---------+---------+---------+---------+
10 rows in set (0.00 sec)
```

可以看到，查询结果忽略了前 10 行，并且忽略了公共前缀 aa。

有关如何导入 *CSV* 格式文件的详细步骤，参见[导入*. csv* 格式数据](../../../Develop/import-data/bulk-load/load-jsonline.md)。

### 示例 2：LOAD JSONLines

#### 简单导入示例

本地命名为 *jsonline_array.jl* 文件内数据如下：

```
[true,1,"var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18",121.11,["1",2,null,false,true,{"q":1}],"1qaz",null,null]
["true","1","var","2020-09-07","2020-09-07 00:00:00","2020-09-07 00:00:00","18","121.11",{"c":1,"b":["a","b",{"q":4}]},"1aza",null,null]
```

在 MatrixOne 中建表：

```sql
mysql> drop table if exists t1;
Query OK, 0 rows affected (0.01 sec)

mysql> create table t1(col1 bool,col2 int,col3 varchar(100), col4 date,col5 datetime,col6 timestamp,col7 decimal,col8 float,col9 json,col10 text,col11 json,col12 bool);
Query OK, 0 rows affected (0.03 sec)
```

将数据文件导入到 MatrixOne 中的表 t1：

```
load data infile {'filepath'='<your-local-file-path>/jsonline_array.jl','format'='jsonline','jsondata'='array'} into table t1;
```

查询结果如下：

```sql
mysql> select * from t1;
+------+------+------+------------+---------------------+---------------------+------+--------+---------------------------------------+-------+-------+-------+
| col1 | col2 | col3 | col4       | col5                | col6                | col7 | col8   | col9                                  | col10 | col11 | col12 |
+------+------+------+------------+---------------------+---------------------+------+--------+---------------------------------------+-------+-------+-------+
| true |    1 | var  | 2020-09-07 | 2020-09-07 00:00:00 | 2020-09-07 00:00:00 |   18 | 121.11 | ["1", 2, null, false, true, {"q": 1}] | 1qaz  | NULL  | NULL  |
| true |    1 | var  | 2020-09-07 | 2020-09-07 00:00:00 | 2020-09-07 00:00:00 |   18 | 121.11 | {"b": ["a", "b", {"q": 4}], "c": 1}   | 1aza  | NULL  | NULL  |
+------+------+------+------------+---------------------+---------------------+------+--------+---------------------------------------+-------+-------+-------+
2 rows in set (0.00 sec)
```

#### 增加条件导入示例

沿用上面的简单示例，你可以修改一下 LOAD DATA 语句，增加 `ignore 1 lines` 在语句的末尾，体验一下区别：

```
delete from t1;
load data infile {'filepath'='<your-local-file-path>/jsonline_array.jl','format'='jsonline','jsondata'='array'} into table t1 ignore 1 lines;
```

查询结果如下：

```sql
mysql> select * from t1;
+------+------+------+------------+---------------------+---------------------+------+--------+-------------------------------------+-------+-------+-------+
| col1 | col2 | col3 | col4       | col5                | col6                | col7 | col8   | col9                                | col10 | col11 | col12 |
+------+------+------+------------+---------------------+---------------------+------+--------+-------------------------------------+-------+-------+-------+
| true |    1 | var  | 2020-09-07 | 2020-09-07 00:00:00 | 2020-09-07 00:00:00 |   18 | 121.11 | {"b": ["a", "b", {"q": 4}], "c": 1} | 1aza  | NULL  | NULL  |
+------+------+------+------------+---------------------+---------------------+------+--------+-------------------------------------+-------+-------+-------+
1 row in set (0.00 sec)
```

可以看到，查询结果忽略掉了第一行。

有关如何导入 *JSONLines* 格式文件的详细步骤，参见[导入 JSONLines 数据](../../../Develop/import-data/bulk-load/load-jsonline.md)。

## **限制**

1. `REPLACE` 和 `IGNORE` 修饰符用来解决唯一索引的冲突：`REPLACE` 表示若表中已经存在，则用新的数据替换掉旧的数据；`IGNORE` 则表示保留旧的数据，忽略掉新数据。这两个修饰符在 MatrixOne 中尚不支持。
2. MatrixOne 当前部分支持 `SET`，仅支持 `SET columns_name=nullif(col_name,expr2)`。
3. 开启并行加载操作时必须要保证文件中每行数据中不包含指定的行结束符，比如 '\n'，否则有可能会导致文件加载时数据出错。
4. 文件的并行加载要求文件必须是非压缩格式，暂不支持并行加载压缩格式的文件。
5. 如果你需要用 `LOAD DATA LOCAL` 进行本地加载，则需要使用命令行连接 MatrixOne 服务主机：`mysql -h <mo-host -ip> -P 6001 -uroot -p111 --local-infile`。
6. MatrixOne 当前暂不支持 `ESCAPED BY`，写入或读取特殊字符与 MySQL 存在一定的差异。
