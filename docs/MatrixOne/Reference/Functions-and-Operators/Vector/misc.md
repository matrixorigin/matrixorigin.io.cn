# 数学类函数

向量支持以下数学类函数：

## SQRT

### **函数说明**

`sqrt` 函数用于计算向量中每个元素的平方根。

### **函数语法**

```
> SELECT sqrt(vector_column) FROM table_name;
```

#### 返回类型

返回一个新的 vecf64 类型的向量，其中包含原始向量中每个元素的平方根。

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

mysql> select sqrt(b) from vec_table;
+---------------------------------------------+
| sqrt(b)                                     |
+---------------------------------------------+
| [1, 1.4142135623730951, 1.7320508075688772] |
+---------------------------------------------+
1 row in set (0.00 sec)
```

### **限制**

- 向量的元素不能为负数。

## ABS

### **函数说明**

`abs` 函数用于计算向量的绝对值。

### **函数语法**

```
> SELECT ABS(vector_column) FROM table_name;
```

#### 返回类型

返回一个相同类型的新向量，其中包含原始向量中每个元素的绝对值。

### **示例**

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[-1,-2,3]", "[4,5,6]");
  mysql> select * from vec_table;
  +------+-------------+-----------+
  | a    | b           | c         |
  +------+-------------+-----------+
  |    1 | [-1, -2, 3] | [4, 5, 6] |
  +------+-------------+-----------+
  1 row in set (0.00 sec)

mysql> select abs(b) from vec_table;
+-----------+
| abs(b)    |
+-----------+
| [1, 2, 3] |
+-----------+
1 row in set (0.01 sec)
```

## CAST

### **函数说明**

cast 函数用于显式将一个向量从一个向量类型转换为另一个向量类型。

### **函数语法**

```
> SELECT CAST(vector AS vector_type) FROM table_name;
```

#### 参数

- `vector`：输入向量。
- `vector_type`：新的向量类型。

#### 返回类型

新的 `vector_type` 向量。

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

mysql> select b + cast("[1,2,3]" as vecf32(3)) from vec_table;
+--------------------------------+
| b + cast([1,2,3] as vecf32(3)) |
+--------------------------------+
| [2, 4, 6]                      |
+--------------------------------+
1 row in set (0.00 sec)
```

## SUMMATION

### **函数说明**

`summation` 函数返回向量中所有元素的总和。

### **函数语法**

```
> SELECT SUMMATION(vector_column) FROM table_name;
```

#### 返回类型

返回一个 FLOAT64 值，即向量中所有元素的总和。

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

mysql> select summation(b) from vec_table;
+--------------+
| summation(b) |
+--------------+
|            6 |
+--------------+
1 row in set (0.00 sec)
```
