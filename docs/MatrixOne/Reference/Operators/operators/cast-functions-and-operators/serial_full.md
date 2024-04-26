# SERIAL_FULL()

## 函数说明

`SERIAL_FULL()` 用于用于序列化连接串，将单个或者多个列/值组合转换成二进制格式，返回类型为 `VARCHAR`，一般搭配 [`SERIAL_EXTRACT()`](../../../Functions-and-Operators/Other/serial_extract.md) 函数使用。`SERIAL_FULL()` 类似于 [`SERIAL()`](serial.md)，但 `SERIAL_FULL()` 会保留 NULL 值。

## 函数语法

```
> SERIAL_FULL(para)
```

## 参数释义

|  参数    | 说明  |
|  ----   | ----  |
|  para   | 要序列化的列/值|

## 示例

```sql
create table t1(a varchar(3), b int);
insert into t1 values("ABC",1);
insert into t1 values("DEF",NULL);

mysql> select serial_full(a,b) from t1;--查询返回为 a 列和 b 列组合序列化的结果，当有 NULL 值时保留 NULL 值
+-------------------+
| serial_full(a, b) |
+-------------------+
| FABC :         |
| FDEF             |
+-------------------+
2 rows in set (0.00 sec)

mysql> select serial_full(1.2,'world') ;--查询返回为值 1.2 和值 hello 组合序列化的结果
+-------------------------+
| serial_full(1.2, world) |
+-------------------------+
| D?      
          Fworld         |
+-------------------------+
1 row in set (0.01 sec)
```
