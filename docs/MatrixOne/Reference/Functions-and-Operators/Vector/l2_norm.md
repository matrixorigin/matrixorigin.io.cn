# **l2_norm()**

## **函数说明**

`l2_norm` 函数用于计算 `l2`/欧几里得范数。`l2` 范数通过对向量元素的平方和进行平方根运算得到。

![l2_normy](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/l2_norm.png?raw=true)

## **函数语法**

```
> SELECT l2_norm(vector) AS result FROM table_name;
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

mysql> select l2_norm(b) from vec_table;
+--------------------+
| l2_norm(b)         |
+--------------------+
| 3.7416573867739413 |
+--------------------+
1 row in set (0.01 sec)
```
