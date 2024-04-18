# L2_DISTANCE()

## 函数说明

`L2_DISTANCE()` 函数用于计算两个向量之间的欧几里得距离。返回一个 FLOAT64 类型的值。

L2 距离 (l2 distance)，也被称为欧几里得距离（Euclidean Distance），是向量空间中最常用的距离度量方式之一。它测量的是多维空间中两点之间的直线距离。l2 distance 距离具有许多实际应用，包括机器学习、计算机视觉和空间分析等领域。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/l2_distance.png width=50% heigth=50%/>
</div>

## 函数语法

```
> SELECT L2_DISTANCE(vector,  const_vector) FROM tbl;
```

## 示例

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[1,2,3]", "[4,5,6]"),(2, "[1,1,1]", "[2,2,2]");
mysql> select * from vec_table;
+------+-----------+-----------+
| a    | b         | c         |
+------+-----------+-----------+
|    1 | [1, 2, 3] | [4, 5, 6] |
|    2 | [1, 1, 1] | [2, 2, 2] |
+------+-----------+-----------+
2 rows in set (0.00 sec)

mysql> select l2_distance(b,c) from vec_table;
+--------------------+
| l2_distance(b, c)  |
+--------------------+
|  5.196152422706632 |
| 1.7320508075688772 |
+--------------------+
2 rows in set (0.00 sec)
```
