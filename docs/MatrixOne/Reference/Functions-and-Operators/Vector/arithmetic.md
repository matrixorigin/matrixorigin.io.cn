# 算术运算符

MatrixOne 支持基本的算术运算符，如向量的加法、减法、乘法和除法。这些运算符执行逐元素的算术操作，并返回一个新的向量。

!!! note
    减法（`-`）、乘法（`*`）和除法（`/`）都与加法示例类似，不作赘述。

## Add

### **函数说明**

`+` 用于将两个向量元素相加。

### **函数语法**

```
> SELECT vector1 + vector2 AS result_vector FROM table_name;
```

### **示例**

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[1,2,3]", "[4,5,6]");
mysql> select * from vec_table;
+------+-----------+-----------+
| a    | b         | c         |
+------+-----------+-----------+
|    1 | [1, 2, 3] | [4, 5, 6] |
+------+-----------+-----------+
1 row in set (0.00 sec)

mysql> select b + "[1,2,3]" from vec_table;
+-------------+
| b + [1,2,3] |
+-------------+
| [2, 4, 6]   |
+-------------+
1 row in set (0.00 sec)
```

### **限制**

- 两个参数向量的维度应相同。
- 如果两个向量的数据类型分分别为 vecf32 和 vecf64，那么结果会转换为 vecf64。
- 两个向量的数据类型必须相同，即其中一个向量的数据类型为文本格式，那么另一个参数也应该为文本格式。如果两个参数的数据类型都是 TEXT，则查询时将视其为字符串。

## Divide

### **函数说明**

`/` 用于将两个向量元素相除。

## **函数语法**

```
> SELECT vector1 / vector2 AS result_vector FROM table_name;
```

### **示例**

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[1,2,3]", "[4,5,6]");
mysql> select * from vec_table;
+------+-----------+-----------+
| a    | b         | c         |
+------+-----------+-----------+
|    1 | [1, 2, 3] | [4, 5, 6] |
+------+-----------+-----------+
1 row in set (0.00 sec)

mysql> select b/b from vec_table;
+-----------+
| b / b     |
+-----------+
| [1, 1, 1] |
+-----------+
1 row in set (0.00 sec)
```

### **限制**

- 分母向量中的元素不允许为 0，否则产生报错。
- 两个参数向量的维度应相同。
- 如果两个向量的数据类型分别为 vecf32 和 vecf64，那么结果会转换为 vecf64。
- 两个向量的数据类型必须相同，即其中一个向量的数据类型为文本格式，那么另一个参数也应该为文本格式。如果两个参数的数据类型都是 TEXT，则查询时将视其为字符串。
