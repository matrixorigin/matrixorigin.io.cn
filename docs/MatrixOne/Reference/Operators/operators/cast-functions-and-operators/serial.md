# SERIAL()

## 函数说明

`SERIAL()` 函数用于序列化连接串，将单个或多个列/值组合成二进制格式，返回类型为 `VARCHAR`。它类似于 [`CONCAT()`](../../../Functions-and-Operators/String/concat.md)，但在 `CONCAT()` 中不能捕获值的类型信息。一般搭配 [`SERIAL_EXTRACT()`](../../../Functions-and-Operators/Other/serial_extract.md) 函数使用。

`SERIAL()` 中如果有任何一个参数为 NULL，则返回 NULL。如需处理 NULL 值，可使用 [`SERIAL_FULL()`](serial_full.md)。

## 函数语法

```
> SERIAL(para)
```

## 参数释义

|  参数   | 说明  |
|  ----  | ----  |
|  para   | 要序列化的列/值|

## 示例

```sql
create table t1(a varchar(3), b int);
insert into t1 values("ABC",1);
insert into t1 values("DEF",NULL);

mysql> select serial(a,b) from t1;--查询返回为 a 列和 b 列组合序列化的结果，当有 NULL 值时输出为 NULL
+--------------+
| serial(a, b) |
+--------------+
| FABC :    |
| NULL         |
+--------------+
2 rows in set (0.00 sec)

mysql> select serial(a,'hello') from t1;--查询返回为 a 列和值 hello 组合序列化的结果
+------------------+
| serial(a, hello) |
+------------------+
| FABC Fhello    |
| FDEF Fhello    |
+------------------+
2 rows in set (0.00 sec)
```
