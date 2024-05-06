# SERIAL_EXTRACT 函数

## 函数说明

`SERIAL_EXTRACT()` 函数用于提取序列/元组值中的各个元素，需结合函数 [`MAX()`](../Aggregate-Functions/max.md)，[`MIN()`](../Aggregate-Functions/min.md)，[`SERIAL()`](../../Operators/operators/cast-functions-and-operators/serial.md)，[`SERIAL_NULL()`](../../Operators/operators/cast-functions-and-operators/serial_full.md) 使用。

## 函数语法

```
>SERIAL_EXTRACT(serial_col, pos as type)
```

## 参数释义

|  参数  | 说明 |
|  ----  | ----  |
| serial_col | 必要参数。保存 serial/serial_full 函数值的串行列。如需更换输出类型可结合[`CAST()`](../../Operators/operators/cast-functions-and-operators/cast.md)函数使用。|
| pos | 必要参数。要提取的字段的位置，0 为第一个。|
| type| 必要参数。导出的元素的原始类型。需要与提取的元素类型保持一致。|

## 示例

```sql
drop table if exists vtab64;
create table vtab64(id int primary key auto_increment,`vecf64_3` vecf64(3),`vecf64_5` vecf64(5));
insert into vtab64(vecf64_3,vecf64_5) values("[1,NULL,2]",NULL);
insert into vtab64(vecf64_3,vecf64_5) values(NULL,NULL);
insert into vtab64(vecf64_3,vecf64_5) values("[2,3,4]",NULL);
insert into vtab64(vecf64_3,vecf64_5) values ("[4,5,6]","[1,2,3,4,5]");
insert into vtab64(vecf64_3,vecf64_5) values ("[7,8,9]","[2,3,4,5,6]");

mysql> select * from vtab64;
+------+-----------+-----------------+
| id   | vecf64_3  | vecf64_5        |
+------+-----------+-----------------+
|    1 | NULL      | NULL            |
|    2 | [2, 3, 4] | NULL            |
|    3 | [4, 5, 6] | [1, 2, 3, 4, 5] |
|    4 | [7, 8, 9] | [2, 3, 4, 5, 6] |
+------+-----------+-----------------+
4 rows in set (0.01 sec)

--max(max(serial(id, `vecf64_3`, `vecf64_5`)) 得到一个最大的序列化值，然后正常获取到的 max 应该是 (4,[7, 8, 9],[2, 3, 4, 5, 6]) 这一条记录，但是 1 代表的是第二个位置的值，所以就是 [7, 8, 9]
mysql> select serial_extract(max(serial(id, `vecf64_3`, `vecf64_5`)), 1 as vecf64(3)) as a from vtab64;
+-----------+
| a         |
+-----------+
| [7, 8, 9] |
+-----------+
1 row in set (0.01 sec)

mysql> select serial_extract(min(serial(id, `vecf64_3`, `vecf64_5`)), 2 as vecf64(5)) as a from vtab64;
+-----------------+
| a               |
+-----------------+
| [1, 2, 3, 4, 5] |
+-----------------+
1 row in set (0.00 sec)

mysql> select serial_extract(max(serial_full(cast(id as decimal), `vecf64_3`)), 0 as decimal) as a from vtab64;
+------+
| a    |
+------+
|    4 |
+------+
1 row in set (0.01 sec)

mysql> select serial_extract(min(serial_full(cast(id as decimal), `vecf64_3`)), 1 as vecf64(3)) as a from vtab64;
+------+
| a    |
+------+
| NULL |
+------+
1 row in set (0.00 sec)
```
