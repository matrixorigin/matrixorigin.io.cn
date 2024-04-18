# COSINE_DISTANCE()

## 函数说明

`COSINE_DISTANCE()` 函数用于计算两个向量的余弦距离。

余弦距离（Cosine Distance）是一种衡量两个向量在方向上的差异的度量方式，通常定义为 1 减去余弦相似度 ([Cosine Similarity](cosine_similarity.md))。余弦距离的值范围在 0 到 2 之间。0 表示两个向量的方向完全相同（距离最小）。2 表示两个向量的方向完全相反（距离最大）。在文本分析中，余弦距离可以用来衡量文档之间的相似性。由于它只考虑向量的方向而不考虑长度，因此对于长文本和短文本之间的比较是公平的，

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/cosine_distance.png width=50% heigth=50%/>
</div>

## 函数语法

```
> SELECT COSINE_DISTANCE(vector1, vector2) FROM tbl;
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
1 row in set (0.01 sec)

mysql> select cosine_distance(b,c) from vec_table;
+-----------------------+
| cosine_distance(b, c) |
+-----------------------+
|    0.0253681538029239 |
+-----------------------+
1 row in set (0.00 sec)

mysql> select cosine_distance(b,"[1,2,3]") from vec_table;
+-----------------------------+
| cosine_distance(b, [1,2,3]) |
+-----------------------------+
|                           0 |
+-----------------------------+
1 row in set (0.00 sec)

mysql> select cosine_distance(b,"[-1,-2,-3]") from vec_table;
+--------------------------------+
| cosine_distance(b, [-1,-2,-3]) |
+--------------------------------+
|                              2 |
+--------------------------------+
1 row in set (0.00 sec)
```
