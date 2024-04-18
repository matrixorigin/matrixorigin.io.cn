# NORMALIZE_L2()

## 函数说明

`NORMALIZE_L2()` 函数对向量执行欧几里得归一化 (L2 normalization)。

L2 范数是向量元素平方和的平方根，因此 L2 normalization 的目的是使向量的长度（或范数）为 1，这通常被称为单位向量。这种归一化方法在机器学习中特别有用，尤其是在处理特征向量时，它可以帮助标准化特征的尺度，从而提高算法的性能。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/normalize_l2.png width=50% heigth=50%/>
</div>

## 函数语法

```
> SELECT NORMALIZE_L2(vector_column) FROM tbl;
```

## 示例

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

mysql> select normalize_l2(b) from vec_table;
+-------------------------------------+
| normalize_l2(b)                     |
+-------------------------------------+
| [0.26726124, 0.5345225, 0.80178374] |
+-------------------------------------+
1 row in set (0.00 sec)
```
