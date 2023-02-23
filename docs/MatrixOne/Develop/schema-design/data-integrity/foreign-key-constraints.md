# FOREIGN KEY 完整性约束

FOREIGN KEY 约束可用于在跨表交叉引用相关数据时，保持相关数据的一致性。

定义外键时，需要遵守下列规则：

- 主表必须已经存在于数据库中，或者是当前正在创建的表。如果是后一种情况，则主表与从表是同一个表，这样的表称为自参照表，这种结构称为自参照完整性。
- 必须为主表定义主键。

- 在主表的表名后面指定列名或列名的组合。这个列或列的组合必须是主表的主键或候选键。当前 MatrixOne 仅支持单列外键约束。

- 外键中列的数目必须和主表的主键中列的数目相同。

- 外键中列的数据类型必须和主表主键中对应列的数据类型相同。

## 语法说明

```
> column_name data_type FOREIGN KEY;
```

## 示例

```sql
create table t1(a int primary key,b varchar(5));
create table t2(a int ,b varchar(5),c int, foreign key(c) references t1(a));
mysql> insert into t1 values(101,'abc'),(102,'def');
Query OK, 2 rows affected (0.01 sec)

mysql> insert into t2 values(1,'zs1',101),(2,'zs2',102);
Query OK, 2 rows affected (0.01 sec)

mysql> insert into t2 values(3,'xyz',null);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t2 values(3,'xxa',103);
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails
```

**示例解释**：在上述示例中，t2 的 c 列只能引用 t1 中 a 列的值或空值，因此插入 t2 的前 3 行操作都能够成功插入，但是第 4 行中的 103 并不是 t1 中 a 列的某个值，违反了外键约束，因此插入失败。

## 限制

MatrixOne 暂不支持 `alter table`，所以也不支持删除 `FOREIGN KEY` 约束。
