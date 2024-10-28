# **SAVE_FILE()**

## **函数说明**

`SAVE_FILE()` 函数用于向 datalink 指向文件中写入内容，指行返回写入内容字节长度。

## **函数语法**

```
>SAVE_FILE(datalink_type_data,content) ;
```

## **参数释义**

|  参数  | 说明 |
|  ----  | ----  |
| datalink_type_data | datalink 类型数据，可以使用[cast()](../../../Reference/Operators/operators/cast-functions-and-operators/cast/)函数进行转换|
| content | 需要写入 datalink 指向文件的内容|

## 示例

```
drop stage if exists tab1;
create stage stage01 url='file:///Users/admin/case/';
mysql> select save_file(cast('stage://stage01/test.csv' as datalink), 'this is a test message');
+-------------------------------------------------------------------------------+
| save_file(cast(stage://stage01/test.csv as datalink), this is a test message) |
+-------------------------------------------------------------------------------+
|                                                                            22 |
+-------------------------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select save_file(cast('file:///Users/admin/case/test1.csv' as datalink), 'this is another test message');
+-----------------------------------------------------------------------------------------------+
| save_file(cast(file:///Users/admin/case/test1.csv as datalink), this is another test message) |
+-----------------------------------------------------------------------------------------------+
|                                                                                            28 |
+-----------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)

```

```bash
(base) admin@192 case % cat test.csv
this is a test message

(base) admin@192 case % cat test1.csv
this is another test message
```