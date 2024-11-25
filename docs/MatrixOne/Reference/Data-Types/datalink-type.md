# DATALINK 类型

`DATALINK` 类型用于存储指向文档 (例如 satge) 或文件链接的特殊数据类型。它的主要目的是在数据库中存储文档的链接地址，而不是存储文档本身。这种类型可以应用于各种场景，特别是在处理大规模文档管理时，提供对文档的快捷访问，而不需要将文档实际存储在数据库中。

使用 `DATALINK` 数据类型可以：

- 节省存储空间：文档实际存储在外部存储中（例如对象存储系统），而数据库只保存链接。
- 方便的文档访问：通过存储链接，系统可以快速访问文档，无需额外的存储和处理。
- 提高数据操作效率：避免了直接在数据库中处理大文件，提高了数据操作的速度和效率。

## 插入 DATALINK 类型数据

**语法结构**

```
INSERT INTO TABLE_NAME VALUES ('<file://<path>/<filename>>|<stage://<stage_name>/<path>/<file_name>>?<offset=xx>&<size=xxx>')
```

**参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| file   | 指向本地文件系统文件位置。|
| stage  | 指向 stage 指向文件位置。|
| offset | 非必填。偏移量，表明读的内容的起点。|
| size   | 非必填。指定读取内容的大小，单位为子节。|

## 读取 DATALINK 类型数据

如果要读 `DATALINK` 指向文件链接的数据，可以使用 [load_file](../../Reference/Functions-and-Operators/Other/load_file.md) 函数。
!!! note
    `load_file()` 函数以二进制模式读取文件，对于非文本文件（如图像、音频、视频等二进制格式文件），读取的内容将以原始字节流的形式返回，不会进行字符编码的转换。此外，由于在 UTF-8 编码中，中文字符通常占用 3 个字节，而英文字符只占用 1 个字节。因此，在指定文件的偏移量（offset）和读取大小（size）时，如果不考虑字符的字节数对齐，可能会导致中文字符被截断或无法正确读取，从而出现乱码。为了避免这种情况，需要根据字符编码正确换算 offset 和 size 的值，确保读取内容的字节数与字符的边界对齐。

## 示例

`/Users/admin/case` 下有文件 `t1.csv`

```bash
(base) admin@192 case % cat t1.csv 
this is a test message
```

```sql
drop table test01;
create table test01 (col1 int, col2 datalink);
create stage stage01 url='file:///Users/admin/case/';
insert into test01 values (1, 'file:///Users/admin/case/t1.csv');
insert into test01 values (2, 'file:///Users/admin/case/t1.csv?size=2');
insert into test01 values (3, 'file:///Users/admin/case/t1.csv?offset=4');
insert into test01 values (4, 'file:///Users/admin/case/t1.csv?offset=4&size=2');
insert into test01 values (5, 'stage://stage01/t1.csv');
insert into test01 values (6, 'stage://stage01/t1.csv?size=2');
insert into test01 values (7, 'stage://stage01/t1.csv?offset=4');
insert into test01 values (8, 'stage://stage01/t1.csv?offset=4&size=2');

mysql> select * from test01;
+------+-------------------------------------------------+
| col1 | col2                                            |
+------+-------------------------------------------------+
|    1 | file:///Users/admin/case/t1.csv                 |
|    2 | file:///Users/admin/case/t1.csv?size=2          |
|    3 | file:///Users/admin/case/t1.csv?offset=4        |
|    4 | file:///Users/admin/case/t1.csv?offset=4&size=2 |
|    5 | stage://stage01/t1.csv                          |
|    6 | stage://stage01/t1.csv?size=2                   |
|    7 | stage://stage01/t1.csv?offset=4                 |
|    8 | stage://stage01/t1.csv?offset=4&size=2          |
+------+-------------------------------------------------+
8 rows in set (0.01 sec)

mysql> select col1, load_file(col2) from test01;
+------+-------------------------+
| col1 | load_file(col2)         |
+------+-------------------------+
|    1 | this is a test message
 |
|    2 | th                      |
|    3 |  is a test message
     |
|    4 |  i                      |
|    5 | this is a test message
 |
|    6 | th                      |
|    7 |  is a test message
     |
|    8 |  i                      |
+------+-------------------------+
8 rows in set (0.01 sec)
```