# **cosine_similarity()**

## **函数说明**

`cosine_similarity()` 是余弦相似度，它衡量了两个向量之间夹角的余弦值，通过它们在多维空间中的接近程度来表示它们的相似性，其中 1 表示完全相似，-1 表示完全不相似。余弦相似度的计算是通过将两个向量的内积除以它们的 l2 范数的乘积来实现的。

![cosine_similarity](https://github.com/matrixorigin/artwork/blob/main/docs/reference/vector/cosine_similarity.png?raw=true)

## **函数语法**

```
> SELECT cosine_similarity(vector1, vector2) AS similarity FROM table_name;
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

mysql> select cosine_similarity(b,"[1,2,3]") from vec_table;
+-------------------------------+
| cosine_similarity(b, [1,2,3]) |
+-------------------------------+
|                             1 |
+-------------------------------+
1 row in set (0.00 sec)
```

## **限制**

- 两个参数向量必须具有相同的维度。
- 余弦相似度的值位于 -1 和 1 之间。
