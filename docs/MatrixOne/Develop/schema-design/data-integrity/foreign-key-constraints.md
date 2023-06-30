# FOREIGN KEY 外键约束

FOREIGN KEY 约束可用于在跨表交叉引用相关数据时，保持相关数据的一致性。

定义外键时，需要遵守下列规则：

- 主表必须已经存在于数据库中，或者是当前正在创建的表。如果是后一种情况，则主表与从表是同一个表，这样的表称为自参照表，这种结构称为自参照完整性。

- 必须为主表定义主键。

- 主键不能包含空值，但允许在外键中出现空值。也就是说，只要外键的每个非空值出现在指定的主键中，这个外键的内容就是正确的。

- 在主表的表名后面指定列名或列名的组合。这个列或列的组合必须是主表的主键或候选键。

- 外键中列的数目必须和主表的主键中列的数目相同。

- 外键中列的数据类型必须和主表主键中对应列的数据类型相同。

- 外键的值必须跟主表主键的值保持一致。

## 语法说明

```
> column_name data_type FOREIGN KEY;
```

## 示例

```sql
-- 创建名为t1的表，包含两列：a和b。a列为int类型并设为主键，b列为varchar类型，长度为5
create table t1(a int primary key, b varchar(5));

-- 创建名为t2的表，包含三列：a、b和c。a列为int类型，b列为varchar类型，长度为5。c列为int类型，并且被设定为外键，与t1表的a列建立关系
create table t2(a int ,b varchar(5), c int, foreign key(c) references t1(a));

-- 在t1表中插入两行数据：(101, 'abc') 和 (102, 'def')
mysql> insert into t1 values(101,'abc'),(102,'def');
Query OK, 2 rows affected (0.01 sec)

-- 在t2表中插入两行数据：(1, 'zs1', 101) 和 (2, 'zs2', 102)，其中的101和102是t1表的主键
mysql> insert into t2 values(1,'zs1',101),(2,'zs2',102);
Query OK, 2 rows affected (0.01 sec)

-- 在t2表中插入一行数据：(3, 'xyz', null)，其中的null表示这行数据在c列（即外键列）没有关联的主键
mysql> insert into t2 values(3,'xyz',null);
Query OK, 1 row affected (0.01 sec)

-- 尝试在t2表中插入一行数据：(3, 'xxa', 103)，但是103在t1表的主键中不存在，因此插入失败，违反了外键约束
mysql> insert into t2 values(3,'xxa',103);
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails

```

**示例解释**：在上述示例中，t2 的 c 列只能引用 t1 中 a 列的值或空值，因此插入 t2 的前 3 行操作都能够成功插入，但是第 4 行中的 103 并不是 t1 中 a 列的某个值，违反了外键约束，因此插入失败。
