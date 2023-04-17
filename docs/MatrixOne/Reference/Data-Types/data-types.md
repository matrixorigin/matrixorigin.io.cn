# **数据类型**

MatrixOne 的数据类型与 MySQL 数据类型的定义一致，可参考：
<https://dev.mysql.com/doc/refman/8.0/en/data-types.html>

## **整数类型**

|  数据类型   | 存储空间  |  最小值  | 最大值  |
|  ----  | ----  |  ----  | ----  |
| TINYINT  | 1 byte | 	-128  | 127 |
| SMALLINT  | 2 byte | -32768  | 32767 |
| INT  | 4 byte | 	-2147483648	  | 2147483647 |
| BIGINT  | 8 byte | -9223372036854775808	  | 9223372036854775807 |
| TINYINT UNSIGNED | 1 byte | 0	  | 255 |
| SMALLINT UNSIGNED | 2 byte | 0	  | 65535 |
| INT UNSIGNED | 4 byte | 0	  | 4294967295 |
| BIGINT UNSIGNED | 8 byte | 0	  | 18446744073709551615 |

### **示例**

- TINYINT and TINYINT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "tinyint", a "tinyint unsigned",
create table inttable ( a tinyint not null default 1, tinyint8 tinyint unsigned primary key);
insert into inttable (tinyint8) values (0),(255), (0xFE), (253);

mysql> select * from inttable order by 2 asc;
+------+----------+
| a    | tinyint8 |
+------+----------+
|    1 |        0 |
|    1 |      253 |
|    1 |      254 |
|    1 |      255 |
+------+----------+
4 rows in set (0.03 sec)
```

- SMALLINT 和 SMALLINT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "smallint", a "smallint unsigned",
drop table inttable;
create table inttable ( a smallint not null default 1, smallint16 smallint unsigned);
insert into inttable (smallint16) values (0),(65535), (0xFFFE), (65534), (65533);

mysql> select * from inttable;
+------+------------+
| a    | smallint16 |
+------+------------+
|    1 |          0 |
|    1 |      65535 |
|    1 |      65534 |
|    1 |      65534 |
|    1 |      65533 |
+------+------------+
5 rows in set (0.01 sec)
```

- INT 和 INT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "int", a "int unsigned",
drop table inttable;
create table inttable ( a int not null default 1, int32 int unsigned primary key);
insert into inttable (int32) values (0),(4294967295), (0xFFFFFFFE), (4294967293), (4294967291);

mysql> select * from inttable order by a desc, 2 asc;
+------+------------+
| a    | int32      |
+------+------------+
|    1 |          0 |
|    1 | 4294967291 |
|    1 | 4294967293 |
|    1 | 4294967294 |
|    1 | 4294967295 |
+------+------------+
5 rows in set (0.01 sec)
```

- BIGINT 和 BIGINT UNSIGNED

```sql
-- Create a table named "inttable" with 2 attributes of a "bigint", a "bigint unsigned",
drop table inttable;
create table inttable ( a bigint, big bigint primary key );
insert into inttable values (122345515, 0xFFFFFFFFFFFFE), (1234567, 0xFFFFFFFFFFFF0);

mysql> select * from inttable;
+-----------+------------------+
| a         | big              |
+-----------+------------------+
| 122345515 | 4503599627370494 |
|   1234567 | 4503599627370480 |
+-----------+------------------+
2 rows in set (0.01 sec)
```

## **浮点类型**

|  数据类型   | 存储空间  |  精度  | 最小值 | 最大值| 语法表示 |
|  ----  | ----  |  ----  | ----  |----  |----  |
| FLOAT32  | 4 bytes | 	23 bits  |-3.40282e+038|3.40282e+038| FLOAT(M, D)<br> M 表示的是最大长度，D 表示的显示的小数位数。M 的取值范围为（1=< M <=255）。<br> D 的取值范围为（1=< D <=30），且 M >= D。<br> 带精度的浮点数展示出要求精度的位数，在位数不足时，会进行末尾补 0。|
| FLOAT64  | 8 bytes |  53 bits  |-1.79769e+308|1.79769e+308| DOUBLE(M, D) <br>  M 表示的是最大长度，D 表示的显示的小数位数。M 的取值范围为（1=< M <=255）。<br> D 的取值范围为（1=< D <=30），且 M >= D。<br> 带精度的浮点数展示出要求精度的位数，在位数不足时，会进行末尾补 0。|

### **示例**

```sql
-- Create a table named "floatt1" with precision, a trailing zero is added when the number of bits falls short
create table floatt1(a float(5, 2));
insert into floatt1 values(1), (2.5), (3.56), (4.678);

mysql> select * from floatt1;
+------+
| a    |
+------+
| 1.00 |
| 2.50 |
| 3.56 |
| 4.68 |
+------+
4 rows in set (0.00 sec)

-- Create a table named "floattable" with 1 attributes of a "float"
create table floattable ( a float not null default 1, big float(20,5) primary key);
insert into floattable (big) values (-1),(12345678.901234567),(92233720368547.75807);

mysql> select * from floattable order by a desc, big asc;
+------+----------------------+
| a    | big                  |
+------+----------------------+
|    1 |             -1.00000 |
|    1 |       12345679.00000 |
|    1 | 92233718038528.00000 |
+------+----------------------+
3 rows in set (0.01 sec)

mysql> select min(big),max(big),max(big)-1 from floattable;
+----------+----------------------+----------------+
| min(big) | max(big)             | max(big) - 1   |
+----------+----------------------+----------------+
| -1.00000 | 92233718038528.00000 | 92233718038527 |
+----------+----------------------+----------------+
1 row in set (0.05 sec)
```

## **字符串类型**

|  数据类型  | 存储空间 | 长度 | 语法表示 | 描述|
|  ----  | ---- | --- |   ----  |----  |
| char     | 24 bytes| 0 ~ 4294967295  |CHAR| 定长字符串 |
| varchar  | 24 bytes | 0 ~ 4294967295  |VARCHAR| 变长字符串|
| binary     |255 bytes| 0 ~ 65535  |BINARY(M)| 类似于 CHAR，二进制字符串 |
| varbinary  | 255 bytes| 0 ~ 65535  |VARBINARY(M)| 类似于 VARCHAR，二进制字符串|
| text    | 1 GB  |other types mapping | TEXT |长文本数据，不区分 TINY TEXT、MEDIUM TEXT 和 LONG TEXT|
| blob    | 1 GB | other types mapping  |BLOB|二进制的长文本数据，不区分 TINY BLOB、MEDIUM BLOB  和 LONGBLOB|
| enum  | 1 byte 或 2 bytes | 0 ~ 65535 | enum  | 一个枚举类型。它是一个字符串对象，只能从 `value1`、`value2` 等值列表中选择一个值，或者是 `NULL` 或特殊的 '' 错误值。枚举值在内部表示为整数。 |

### **示例**

- CHAR 和 VARCHAR

```sql
-- Create a table named "names" with 2 attributes of a "varchar" and a "char"
create table names(name varchar(255),age char(255));
insert into names(name, age) values('Abby', '24');
insert into names(name, age) values("Bob", '25');
insert into names(name, age) values('Carol', "23");
insert into names(name, age) values("Dora", "29");

mysql> select name,age from names;
+-------+------+
| name  | age  |
+-------+------+
| Abby  | 24   |
| Bob   | 25   |
| Carol | 23   |
| Dora  | 29   |
+-------+------+
4 rows in set (0.00 sec)
```

- BINARY 和 VARBINARY

```sql
-- Create a table named "names" with 2 attributes of a "varchar" and a "char"
create table names(name varbinary(255),age binary(255));
insert into names(name, age) values('Abby', '24');
insert into names(name, age) values("Bob", '25');
insert into names(name, age) values('Carol', "23");
insert into names(name, age) values("Dora", "29");

mysql> select name,age from names;
+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| name         | age                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| 0x41626279   | 0x323400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| 0x426F62     | 0x323500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| 0x4361726F6C | 0x323300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| 0x446F7261   | 0x323900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
+--------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
4 rows in set (0.01 sec)
```

- TEXT

```sql
-- Create a table named "texttest" with 1 attribute of a "text"
create table texttest (a text);
insert into texttest values('abcdef');
insert into texttest values('_bcdef');
insert into texttest values('a_cdef');
insert into texttest values('ab_def');
insert into texttest values('abc_ef');
insert into texttest values('abcd_f');
insert into texttest values('abcde_');

mysql> select * from texttest where a like 'ab\_def' order by 1 asc;
+--------+
| a      |
+--------+
| ab_def |
+--------+
1 row in set (0.01 sec)
```

- BLOB

```sql
--  Create a table named "blobtest" with 1 attribute of a "blob"
create table blobtest (a blob);
insert into blobtest values('abcdef');
insert into blobtest values('_bcdef');
insert into blobtest values('a_cdef');
insert into blobtest values('ab_def');
insert into blobtest values('abc_ef');
insert into blobtest values('abcd_f');
insert into blobtest values('abcde_');

mysql> select * from blobtest where a like 'ab\_def' order by 1 asc;
+----------------+
| a              |
+----------------+
| 0x61625F646566 |
+----------------+
1 row in set (0.01 sec)
```

- ENUM

```sql
--  Create a table named "enumtest" with 1 attribute of a "enum"
CREATE TABLE enumtest (color ENUM('red', 'green', 'blue'),);
INSERT INTO enumtest (color) VALUES ('red');
mysql> SELECT * FROM enumtest WHERE color = 'green';

```

## **JSON 数据类型**

|JSON 数据类型 | 解释 |
|---|---|
|对象 |对象使用 `{}` 括起来，元素之间用 `,` 分隔。JSON 对象中的值/键可以为 String、Nubmber、Bool、时间。|
|数组 | 数组使用 `[]` 括起来，元素之间用逗号 `,` 分隔。JSON 数组中值可以为 String、Nubmber、Bool、时间。|

### **示例**

```sql
-- Create a table named "jsontest" with 1 attribute of a "json"
create table jsontest (a json,b int);
insert into jsontest values ('{"t1":"a"}',1),('{"t1":"b"}',2);

mysql> select * from jsontest;
+-------------+------+
| a           | b    |
+-------------+------+
| {"t1": "a"} |    1 |
| {"t1": "b"} |    2 |
+-------------+------+
2 rows in set (0.01 sec)
```

## **时间与日期**

|  数据类型  | 存储空间  | 精度 |  最小值   | 最大值  | 语法表示 |
|  ----  | ----  |   ----  |  ----  | ----  |   ----  |
|  Time  | 8 byte  |   microsecond  |  -2562047787:59:59.999999 | 2562047787:59:59.999999  |   hh:mm:ss.ssssss  |
| Date  | 4 byte | day | 0001-01-01  | 9999-12-31 | YYYY-MM-DD/YYYYMMDD |
| DateTime  | 8 byte | microsecond | 0001-01-01 00:00:00.000000  | 9999-12-31 23:59:59.999999 | YYYY-MM-DD hh:mi:ssssss |
| TIMESTAMP|8 byte|microsecond|0001-01-01 00:00:00.000000|9999-12-31 23:59:59.999999|YYYYMMDD hh:mi:ss.ssssss|

### **示例**

- TIME

```sql
-- Create a table named "timetest" with 1 attributes of a "time"
create table time_02(t1 time);
insert into time_02 values(200);
insert into time_02 values("");

mysql> select * from time_02;
+----------+
| t1       |
+----------+
| 00:02:00 |
| NULL     |
+----------+
2 rows in set (0.00 sec)
```

- DATE

```sql
-- Create a table named "datetest" with 1 attributes of a "date"
create table datetest (a date not null, primary key(a));
insert into datetest values ('2022-01-01'), ('20220102'),('2022-01-03'),('20220104');

mysql> select * from datetest order by a asc;
+------------+
| a          |
+------------+
| 2022-01-01 |
| 2022-01-02 |
| 2022-01-03 |
| 2022-01-04 |
+------------+
```

- DATETIME

```sql
-- Create a table named "datetimetest" with 1 attributes of a "datetime"
create table datetimetest (a datetime(0) not null, primary key(a));
insert into datetimetest values ('20200101000000'), ('2022-01-02'), ('2022-01-02 00:00:01'), ('2022-01-02 00:00:01.512345');

mysql> select * from datetimetest order by a asc;
+---------------------+
| a                   |
+---------------------+
| 2020-01-01 00:00:00 |
| 2022-01-02 00:00:00 |
| 2022-01-02 00:00:01 |
| 2022-01-02 00:00:02 |
+---------------------+
4 rows in set (0.02 sec)
```

- TIMESTAMP

```sql
-- Create a table named "timestamptest" with 1 attribute of a "timestamp"
create table timestamptest (a timestamp(0) not null, primary key(a));
insert into timestamptest values ('20200101000000'), ('2022-01-02'), ('2022-01-02 00:00:01'), ('2022-01-02 00:00:01.512345');

mysql> select * from timestamptest;
+---------------------+
| a                   |
+---------------------+
| 2020-01-01 00:00:00 |
| 2022-01-02 00:00:00 |
| 2022-01-02 00:00:01 |
| 2022-01-02 00:00:02 |
+---------------------+
```

## **Bool**

|  数据类型  | 存储空间  |
|  ----  | ----  |
| True  | 1 byte |
|False|1 byte|

### **示例**

```sql
-- Create a table named "booltest" with 2 attribute of a "boolean" and b "bool"
create table booltest (a boolean,b bool);
insert into booltest values (0,1),(true,false),(true,1),(0,false),(NULL,NULL);

mysql> select * from booltest;
+-------+-------+
| a     | b     |
+-------+-------+
| false | true  |
| true  | false |
| true  | true  |
| false | false |
| NULL  | NULL  |
+-------+-------+
5 rows in set (0.00 sec)
```

## **定点类型 Decimal**

|  数据类型   | 存储空间  |  精度   | 语法表示 |
|  ----  | ----  |  ----  | ----  |
| Decimal64  | 8 byte | 	18 位  | Decimal(N,S) <br> N 表示数字位数的总数，范围是 (1 ~ 18)，小数点和 -（负数）符号不包括在 N 中。<br>如果 N 被省略，默认值应该取最大，即取值 18。<br>S 表示是小数点（标度）后面的位数，范围是 (0 ~ N)<br>如果 S 是 0，则值没有小数点或分数部分。如果 S 被省略，默认是 0，例如 Decimal(10)，等同于 Decimal(10, 0) <br>例如 Decimal(10,8)，即表示数字总长度为 10，小数位为 8。|
| Decimal128  | 16 byte | 	38 位  | Decimal(N,S) <br> N 表示数字位数的总数，范围是 (18 ~ 38)，小数点和 -（负数）符号不包括在 N 中。<br>如果 N 被省略，默认值应该取最大，即取值 38。<br>S 表示是小数点（标度）后面的位数，范围是 (0 ~ N)<br>如果 S 是 0，则值没有小数点或分数部分。如果 S 被省略，默认是 0，例如 Decimal(20)，等同于 Decimal(20, 0)。<br>例如 Decimal(20,19)，即表示数字总长度为 20，小数位为 19。 |

### **示例**

```sql
-- Create a table named "decimalTest" with 2 attribute of a "decimal" and b "decimal"
create table decimalTest(a decimal(6,3), b decimal(24,18));
insert into decimalTest values(123.4567, 123456.1234567891411241355);

mysql> select * from decimalTest;
+---------+---------------------------+
| a       | b                         |
+---------+---------------------------+
| 123.457 | 123456.123456789141124136 |
+---------+---------------------------+
1 row in set (0.01 sec)
```
