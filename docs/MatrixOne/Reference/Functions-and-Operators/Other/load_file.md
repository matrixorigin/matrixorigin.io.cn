# **LOAD_FILE()**

## **函数说明**

`LOAD_FILE()` 函数用于读取 datalink 类型指向文件的内容。

!!! note
    当使用 load_file() 加载大文件时，若文件数据量过大，可能会超出系统内存限制，导致内存溢出。建议结合 [DATALINK](../../Data-Types/datalink-type.md) 的 `offset` 和 `size` 使用。

## **函数语法**

```
>LOAD_FILE(datalink_type_data) ;
```

## **参数释义**

|  参数  | 说明 |
|  ----  | ----  |
| datalink_type_data | datalink 类型数据，可以使用[cast()](../../../Reference/Operators/operators/cast-functions-and-operators/cast/)函数进行转换|

## **示例**

`/Users/admin/case` 下有文件 `t1.csv`

```bash
(base) admin@192 case % cat t1.csv 
this is a test message
```

```sql
create table t1 (col1 int, col2 datalink);
create stage stage1 url='file:///Users/admin/case/';
insert into t1 values (1, 'file:///Users/admin/case/t1.csv');
insert into t1 values (2, 'stage://stage1//t1.csv');

mysql> select * from t1;
+------+---------------------------------+
| col1 | col2                            |
+------+---------------------------------+
|    1 | file:///Users/admin/case/t1.csv |
|    2 | stage://stage1//t1.csv          |
+------+---------------------------------+
2 rows in set (0.00 sec)

mysql> select col1, load_file(col2) from t1;
+------+-------------------------+
| col1 | load_file(col2)         |
+------+-------------------------+
|    1 | this is a test message
 |
|    2 | this is a test message
 |
+------+-------------------------+
2 rows in set (0.01 sec)


mysql> select load_file(cast('file:///Users/admin/case/t1.csv' as datalink));
+--------------------------------------------------------------+
| load_file(cast(file:///Users/admin/case/t1.csv as datalink)) |
+--------------------------------------------------------------+
| this is a test message
                                      |
+--------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select load_file(cast('stage://stage1//t1.csv' as datalink));
+-----------------------------------------------------+
| load_file(cast(stage://stage1//t1.csv as datalink)) |
+-----------------------------------------------------+
| this is a test message
                             |
+-----------------------------------------------------+
1 row in set (0.00 sec)
```
