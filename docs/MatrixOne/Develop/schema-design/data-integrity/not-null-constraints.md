# NOT NULL 非空约束

NOT NULL 约束可用于限制一个列中不能包含 NULL 值。

## 语法说明

```
> column_name data_type NOT NULL;
```

你无法向包含 `NOT NULL` 约束的列中插入 `NULL` 值，或更新旧值为 `NULL`。

## 示例

```sql
create table t1(a int not null,b int);
mysql> insert into t1 values(null,1);
ERROR 3819 (HY000): constraint violation: Column 'a' cannot be null
mysql> insert into t1 values(1,null);
Query OK, 1 row affected (0.01 sec)
mysql> update t1 set a=null where a=1;
ERROR 3819 (HY000): constraint violation: Column 'a' cannot be null
```

**示例解释**：在上述示例中，因为 a 列存在非空约束，因此第 1 条插入语句会执行失败，第 2 条语句满足 a 列的非空约束，b 列不存在非空约束，因此可以成功插入。而更新语句因为触发了 a 列的非空约束，因此更新失败。

## 限制

MatrixOne 暂不支持删除 `NOT NULL` 约束。
