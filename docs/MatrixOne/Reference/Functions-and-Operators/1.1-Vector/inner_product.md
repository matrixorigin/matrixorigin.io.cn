# **inner_product()**

## **函数说明**

`INNER PRODUCT` 函数用于计算两个向量之间的内积/点积，它是两个向量的对应元素相乘然后相加的结果。

![inner_product](https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/inner_product.png?raw=true)

## **函数语法**

```
> SELECT inner_product(vector1, vector2) AS result FROM table_name;
```

## **示例**

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

mysql> select inner_product(b,"[1,2,3]") from vec_table;
+---------------------------+
| inner_product(b, [1,2,3]) |
+---------------------------+
|                        14 |
+---------------------------+
1 row in set (0.00 sec)
```

## **限制**

两个参数向量必须具有相同的维度。
