# **l1_norm()**

## **函数说明**

`l1_norm` 函数用于计算 `l1`/曼哈顿/TaxiCab 范数。`l1` 范数通过对向量元素的绝对值求和得到。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/l1_norm.png?raw=true width=50% heigth=50%/>
</div>

你可以使用 `l1` 范数来计算 `l1` 距离。

```
l1_distance(a,b) = l1_norm(a-b)
```

这样的计算方式同样适用于从 `l2_Norm` 计算 `l2` 距离。

## **函数语法**

```
> SELECT l1_norm(vector) AS result FROM table_name;
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

mysql> select l1_norm(b) from vec_table;
+------------+
| l1_norm(b) |
+------------+
|          6 |
+------------+
1 row in set (0.00 sec)
```
