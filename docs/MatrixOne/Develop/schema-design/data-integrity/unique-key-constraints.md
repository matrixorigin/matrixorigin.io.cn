# UNIQUE KEY 唯一约束

UNIQUE KEY 约束可用于确保将要被插入或更新的数据行的列或列组的值是唯一的，表的任意两行的某列或某个列集的值不重复，并且唯一键约束也必须非空。

## 语法说明

```
> column_name data_type UNIQUE KEY;
```

## 示例

```sql
create table t1(a int unique key, b int, c int, unique key(b,c));
mysql> insert into t1 values(1,1,1);
Query OK, 1 row affected (0.01 sec)
mysql> insert into t1 values(2,1,1);
ERROR 20307 (HY000): Duplicate entry '3a15013a1501' for key '__mo_index_idx_col'
mysql> insert into t1 values(1,1,2);
ERROR 20307 (HY000): Duplicate entry '1' for key '__mo_index_idx_col'
```

**示例解释**：在上述示例中，存在两个唯一键约束列 a 与列 (b,c)。在插入数据时，第 2 条插入语句违反了 (b,c) 的唯一约束，与第 1 条插入值重复，因此插入失败。第 3 条插入语句违反了列 a 的约束，也因此插入失败。

## 限制

MatrixOne 暂不支持 `alter table`，所以也不支持删除 `UNIQUE KEY` 约束。
