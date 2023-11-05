# **SPLIT_PART()**

## **函数说明**

`SPLIT_PART()` 用于在给定的分隔符基础上将一个字符串分解成多个部分，并返回指定的部分。

如果指定的部分（由 `unsigned_integer` 参数指定）超出了实际存在的部分数量，`SPLIT_PART()` 将返回 `NULL`。

`SPLIT_PART()` 只会从左到右开始计数部分，如果 `unsigned_integer` 为负数，将会报错。

## **函数语法**

```
> SPLIT_PART(expr, delimiter, unsigned_integer)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
|expr|必要参数。要被拆分的字符串。|
|delimiter|必要参数。用于分割字符串的分隔符。|
|unsigned_integer|必要参数。这是一个整数，指定返回字符串的哪个部分。第一个部分是 1，第二个部分是 2，依此类推。|

## **示例**

- 示例 1

```sql
-- 拆分字符串 'axbxc'，并使用'x'作为分隔符，该函数将返回字符串'axbxc'的第一部分。所以执行这条 SQL 语句的结果是 'a'，因为在'x'分隔符的基础上分割字符串'axbxc'后的第一部分是 'a'。
mysql> select split_part('axbxc','x',1);
+-------------------------+
| split_part(axbxc, x, 1) |
+-------------------------+
| a                       |
+-------------------------+
1 row in set (0.00 sec)
```

- 示例 2

```sql
-- 创建一个新的表't1'，它有三个列：'a'（varchar 类型），'b'（varchar 类型），和'c'（int 类型）。
create table t1(a varchar,b varchar,c int);
-- 向't1'表中插入多行数据
insert into t1 values('axbxc','x',1),('axbxcxd','x',2),('axbxcxd','x',3),('axbxcxd','xc',1),('axbxcxd','xc',2),('axbxcxd','xc',3),('axbxcxd','asas',1),('axbxcxd','asas',2),(null,'asas',3),('axbxcxd',null,3),('axbxcxd','asas',null),('axxx','x',1),('axxx','x',2);
-- 查询使用 split_part 函数处理't1'表中的每行数据。对于每行，它都会把'a'列的值分割成多个部分（使用'b'列的值作为分隔符），然后返回指定的部分（由'c'列的值指定）。例如，对于第一行数据（'axbxc', 'x', 1），它会返回'a'，因为'a'是在'x'分隔符的基础上分割字符串'axbxc'后的第一部分。
mysql> select split_part(a,b,c) from t1;
+---------------------+
| split_part(a, b, c) |
+---------------------+
| a                   |
| b                   |
| c                   |
| axb                 |
| xd                  |
| NULL                |
| axbxcxd             |
| NULL                |
| NULL                |
| NULL                |
| NULL                |
| a                   |
| NULL                |
+---------------------+
13 rows in set (0.01 sec)
```
