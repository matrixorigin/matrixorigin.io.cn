# BITMAP 函数

## 函数说明

`BITMAP` 函数是一组用于处理位图（bitmap）的内置函数，bitmap 是存储为二进制数据类型的连续内存片段。这些函数特别适用于处理层次化聚合（如多个分组集合）时的不同值（distinct values）的计数，返回结果与 [`count(distinct)`]( count.md) 一致，但更高效。

我们可以只使用一个 bit 位标识一个元素的存在与否，存在为 1，不存在则为 0，用 bitmap 的第 n 个 bit 来记录这个元素是否存在。

我们规定 bitmap 最大宽度为 32768(2^15 = 4K)，对于非负整数 n，取其低 15 位（二进制）作为在 bitmap 的位置，其它高位作为位图桶 (bitmap bucket) 的编号。下图为 bitmap 的逻辑图：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/bitmap.png)

每个 bucket 是一个 bitmap，由于各个 bucket 是正交的，每个 bucket 做运算 (or，bit_count) 可以只在当前 bucket 中进行，而不必关心其它 bucket。

以下是一些常用的 `BITMAP` 函数及其用法：

### BITMAP_BUCKET_NUMBER

`BITMAP_BUCKET_NUMBER()` 函数的目的是确定给定值所属的 bucket 的编号。bucket 是一个更大的位集合，可以包含多个位，每个位代表数据集中的一个特定值。这个函数返回 bucket 的编号。一个 bucket 编号通常用于在执行聚合操作时对 bitmap 进行分组。

#### 语法

```
> BITMAP_BUCKET_NUMBER(numeric_expr)
```

#### 参数释义

|  参数  | 说明 |
|  ----  | ----  |
| numeric_expr | 必需的。可以 cast 成非负整型的表达式。|

#### 示例

```sql
mysql> SELECT bitmap_bucket_number(0);-- 返回 0，表示属于第一个 bucket，第一个 bucket 记录 0-32767 的位置
+-------------------------+
| bitmap_bucket_number(0) |
+-------------------------+
|                       0 |
+-------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bucket_number(32767);-- 返回 0，因为 32767 属于第一个 bucket 的末尾位置
+-----------------------------+
| bitmap_bucket_number(32767) |
+-----------------------------+
|                           0 |
+-----------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bucket_number(32768);-- 返回 1，因为 32768 属于第二个 bucket 的起始位置
+-----------------------------+
| bitmap_bucket_number(32768) |
+-----------------------------+
|                           1 |
+-----------------------------+
1 row in set (0.00 sec)
```

### BITMAP_BIT_POSITION

`BITMAP_BIT_POSITION()` 函数用于返回给定值在 bucket 中的相对位位置（从 0 开始索引到 32767 结束）。与 `BITMAP_BUCKET_NUMBER()` 配合使用，可以唯一标识 bitmap 中的任何数字。因为实际 `BITMAP_BIT_POSITION()` 标记参数的低 15 位（以二进制表示），`BITMAP_BUCKET_NUMBER()` 标记参数的高位。

#### 语法

```
BITMAP_BIT_POSITION(numeric_expr)
```

#### 参数释义

|  参数  | 说明 |
|  ----  | ----  |
| numeric_expr | 必需的。可以 cast 成非负整型的表达式。|

#### 示例

```sql

mysql> SELECT bitmap_bit_position(0);-- 返回 0，因为 0 在第一个 bucket 的第一个位置
+------------------------+
| bitmap_bit_position(0) |
+------------------------+
|                      0 |
+------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bit_position(32767);-- 返回 32767，因为 32767 在第一个 bucket 中的位置是最后一个
+----------------------------+
| bitmap_bit_position(32767) |
+----------------------------+
|                      32767 |
+----------------------------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bit_position(32768);-- 返回 0，因为 32768 在第二个 bucket 的第一个位置
+----------------------------+
| bitmap_bit_position(32768) |
+----------------------------+
|                          0 |
+----------------------------+
1 row in set (0.00 sec)

--40000 的二进制为：1001110001000000，bitmap_bit_position 记录低 15 位：001110001000000，bitmap_bucket_number 记录高位：1
mysql> select bin(bitmap_bucket_number(40000)), bin(bitmap_bit_position(40000)),bin(40000);
+----------------------------------+---------------------------------+------------------+
| bin(bitmap_bucket_number(40000)) | bin(bitmap_bit_position(40000)) | bin(40000)       |
+----------------------------------+---------------------------------+------------------+
| 1                                | 1110001000000                   | 1001110001000000 |
+----------------------------------+---------------------------------+------------------+
1 row in set (0.01 sec)
```

### BITMAP_COUNT

`BITMAP_COUNT()` 函数用于计算 bitmap 中设置为 1 的位的数量，从而得到不同值的总数。这相当于对 bitmap 执行 `COUNT(DISTINCT)` 操作，但通常比传统的 `COUNT(DISTINCT)` 查询更快。

`BITMAP_COUNT()` 函数一般结合下述的 `BITMAP_CONSTRUCT_AGG()`、`BITMAP_OR_AGG()` 函数使用。

### `BITMAP_CONSTRUCT_AGG`

`BITMAP_CONSTRUCT_AGG()` 是一个聚合函数，它在数据库中用于构建 bitmap。

当需要对一组密集的非重复整数值进行计数时，`BITMAP_CONSTRUCT_AGG()` 函数非常有用，因为它可以高效地将这些值转换为 bitmap 形式。

#### 语法

```
BITMAP_CONSTRUCT_AGG( <bit_position> )
```

#### 参数释义

|  参数  | 说明 |
|  ----  | ----  |
| bit_position | 必需的。在 bitmap 中的位置（BITMAP_BIT_POSITION 函数返回）|

#### 示例

```sql
CREATE TABLE t1 ( n1 int);
INSERT INTO t1 VALUES(0),(1),(1),(32767);--插入 [0,32767] 内的数据

mysql> select * from t1;
+-------+
| n1    |
+-------+
|     0 |
|     1 |
|     1 |
| 32767 |
+-------+
4 rows in set (0.01 sec)

mysql> SELECT BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1)) AS bitmap FROM t1;
+------------------------+
| bitmap                 |
+------------------------+
| :0              ?  |
+------------------------+
1 row in set (0.00 sec)
```

!!! note
    bitmap 列包含 bitmap 的物理表示形式，不可读。为了确定哪些位被设置，我们应结合使用 `BITMAP` 函数（而不是自己检查二进制值）。

```sql
mysql> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS n1_discnt FROM t1;--bitmap 中设置为 1 的数量
+-----------+
| n1_discnt |
+-----------+
|         3 |
+-----------+
1 row in set (0.00 sec)

mysql> SELECT count(DISTINCT n1) AS n1_discnt FROM t1;--返回一致
+-----------+
| n1_discnt |
+-----------+
|         3 |
+-----------+
1 row in set (0.01 sec)

INSERT INTO t1 VALUES(32768),(32769),(65535);--插入大于 32767 的数据

mysql> select * from t1;
+-------+
| n1    |
+-------+
|     0 |
|     1 |
|     1 |
| 32767 |
| 32768 |
| 32769 |
| 65535 |
+-------+
7 rows in set (0.01 sec)

--结果与第一次插入一样，因为 bucket_bit_position = n1 % 32768，第二次插入的数据与第一次插入的数据位于不同 bucket 的相同位置，所以被去重了。
mysql> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS n1_discnt FROM t1;
+-----------+
| t1_bitmap |
+-----------+
|         3 |
+-----------+
1 row in set (0.00 sec)

mysql> SELECT bitmap_bit_position(0),bitmap_bit_position(1),bitmap_bit_position(32767),bitmap_bit_position(32768),bitmap_bit_position(65535);
+------------------------+------------------------+----------------------------+----------------------------+----------------------------+
| bitmap_bit_position(0) | bitmap_bit_position(1) | bitmap_bit_position(32767) | bitmap_bit_position(32768) | bitmap_bit_position(65535) |
+------------------------+------------------------+----------------------------+----------------------------+----------------------------+
|                      0 |                      1 |                      32767 |                          0 |                      32767 |
+------------------------+------------------------+----------------------------+----------------------------+----------------------------+
1 row in set (0.00 sec)
```

因此如果要对大于 32767 的数据去重需结合 `BITMAP_BUCKET_NUMBER()` 函数。

```sql
--以 bucket 分组，第一个 bucket 里面有三个非重复数（0,1,32767),第二个 bucket 里有三个非重复数 (32768,32769,65535)。
mysql> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS t1_bitmap FROM t1 GROUP BY BITMAP_BUCKET_NUMBER(n1);
+-----------+
| t1_bitmap |
+-----------+
|         3 |
|         3 |
+-----------+
2 rows in set (0.01 sec)

--结合 sum() 函数计算 n1 的非重复值
mysql> SELECT SUM(t1_bitmap) FROM (
    -> SELECT bitmap_count(BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(n1))) AS t1_bitmap
    -> FROM t1 
    -> GROUP BY BITMAP_BUCKET_NUMBER(n1)
    -> );
+----------------+
| sum(t1_bitmap) |
+----------------+
|              6 |
+----------------+
1 row in set (0.01 sec)
```

### BITMAP_OR_AGG

`BITMAP_OR_AGG()` 函数用于计算多个 bitmap 的按位或（OR）结果。通常用于合并多个 bitmap，以便在一个 bitmap 中表示所有输入 bitmap 的组合信息。

当需要对不同维度的数据进行集合并集操作时，`BITMAP_OR_AGG()` 十分有用，尤其是在数据仓库和分析型查询中。

#### 语法

```
BITMAP_OR_AGG( bitmap )
```

#### 参数释义

|  参数  | 说明 |
|  ----  | ----  |
| bitmap | 必需的。所有 bitmap 按位或合并得到的 bitmap。|

#### 示例

```sql

--创建一张表，用来存储作者出版书籍的信息，包含作者名称，出版年份和书籍 id
CREATE TABLE book_table(
    id int auto_increment primary key,
    author varchar(100),
    pub_year varchar(100),
    book_id int
);
INSERT INTO book_table(author,pub_year,book_id) VALUES
('A 作者','2020',1),('A 作者','2020',1),('A 作者','2020',32768),
('A 作者','2021',32767),('A 作者','2021',32768),('A 作者','2021',65536),
('B 作者','2020',2),('B 作者','2020',10),('B 作者','2020',32769),
('B 作者','2021',5),('B 作者','2021',65539);

mysql> select * from book_table;
+------+----------+----------+---------+
| id   | author   | pub_year | book_id |
+------+----------+----------+---------+
|    1 | A 作者   | 2020     |       1 |
|    2 | A 作者   | 2020     |       1 |
|    3 | A 作者   | 2020     |   32768 |
|    4 | A 作者   | 2021     |   32767 |
|    5 | A 作者   | 2021     |   32768 |
|    6 | A 作者   | 2021     |   65536 |
|    7 | B 作者   | 2020     |       2 |
|    8 | B 作者   | 2020     |      10 |
|    9 | B 作者   | 2020     |   32769 |
|   10 | B 作者   | 2021     |       5 |
|   11 | B 作者   | 2021     |   65539 |
+------+----------+----------+---------+
11 rows in set (0.00 sec)

--定义一张预计算表，把粗粒度的计算结果保存在表中，后续各种不同维度聚合可以使用预计算表中的结果，经过简单的计算就可以得到结果，加速查询。
CREATE TABLE precompute AS
SELECT
  author,
  pub_year,
  BITMAP_BUCKET_NUMBER(book_id) as bucket,
  BITMAP_CONSTRUCT_AGG(BITMAP_BIT_POSITION(book_id)) as bitmap 
FROM book_table
GROUP BY  author,pub_year,bucket;

mysql> select * from precompute;
+---------+----------+--------+----------------------+
| author  | pub_year | bucket | bitmap               |
+---------+----------+--------+----------------------+
| A作者   | 2020     |      0 | :0                |
| A作者   | 2020     |      1 | :0                 |
| A作者   | 2021     |      0 | :0            ?    |
| A作者   | 2021     |      1 | :0                 |
| A作者   | 2021     |      2 | :0                 |
| B作者   | 2020     |      0 | :0                |
| B作者   | 2020     |      1 | :0                |
| B作者   | 2021     |      0 | :0                |
| B作者   | 2021     |      2 | :0                |
+---------+----------+--------+----------------------+

--计算在作者和出版年份聚合情况下 book_id 的去重数量，反应的是作者在不同年份出版书籍类型的数量。
--sum() 函数累加不同 bucket 的 bitmap 中 1 的数量。
--例如当 author=A 作者，pub_year=2020 时，book_id=(1,1,32768)，去重后为 book_id=(1,32768)，但是 1 位于第一个 bucket,32768 位于第二个 bucket，所以需要 sum 作累加。
mysql> SELECT
    ->   author,
    ->   pub_year,
    ->   SUM(BITMAP_COUNT(bitmap))
    -> FROM precompute
    -> GROUP BY  author,pub_year;
+---------+----------+---------------------------+
| author  | pub_year | sum(bitmap_count(bitmap)) |
+---------+----------+---------------------------+
| A作者   | 2020     |                         2 |
| A作者   | 2021     |                         3 |
| B作者   | 2020     |                         3 |
| B作者   | 2021     |                         2 |
+---------+----------+---------------------------+
4 rows in set (0.00 sec)

mysql> SELECT author,pub_year,count( DISTINCT book_id) FROM book_table group by author,pub_year;--返回一致
+----------+----------+-------------------------+
| author   | pub_year | count(distinct book_id) |
+----------+----------+-------------------------+
| A 作者   | 2020     |                       2 |
| A 作者   | 2021     |                       3 |
| B 作者   | 2020     |                       3 |
| B 作者   | 2021     |                       2 |
+----------+----------+-------------------------+
4 rows in set (0.00 sec)

--计算在作者聚合情况下 book_id 的去重数量，反应的是作者一共出版书籍类型的数量。
--BITMAP_OR_AGG() 函数合并不同维度（相同作者不同年份）的 bitmap。
--例如当 author=A 作者，pub_date=2020 时，book_id 去重后为 (1,32768)，pub_date=2021 时，book_id 去重后为 (32767,32768,65536)，BITMAP_OR_AGG 对两个不同年份的 bitmap 做或运算得到 book_id=(1,32767,32768,65536)，最后 sum() 累加不同 bucktet 的 book_id。
mysql> SELECT author, SUM(cnt) FROM (
    ->   SELECT
    ->     author,
    ->     BITMAP_COUNT(BITMAP_OR_AGG(bitmap)) cnt
    ->   FROM precompute
    ->   GROUP BY author,bucket
    -> )
    -> GROUP BY author;
+---------+----------+
| author  | sum(cnt) |
+---------+----------+
| A作者   |        4 |
| B作者   |        5 |
+---------+----------+
2 rows in set (0.01 sec)

mysql> SELECT author,count(DISTINCT book_id) FROM book_table GROUP BY author;--返回一致
+----------+-------------------------+
| author   | count(distinct book_id) |
+----------+-------------------------+
| A 作者   |                       4 |
| B 作者   |                       5 |
+----------+-------------------------+
2 rows in set (0.00 sec)

```
