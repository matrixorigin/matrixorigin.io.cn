# **Rename Table**

## **语法说明**

在 MatrixOne 中，`RENAME TABLE` 语句用于更改表的名称。可以一次更改多个表的名称。

注意事项：

- RENAME TABLE 是原子操作。如果任何一个重命名失败，所有的重命名操作都会回滚。
- 不能跨不同的数据库重命名表。如果想跨数据库重命名表，可以先将表复制到目标数据库，然后删除原表
- 在重命名表之前，确保没有正在使用该表的活动事务或锁定。

## **语法结构**

```
> RENAME TABLE
    tbl_name TO new_tbl_name
    [, tbl_name2 TO new_tbl_name2] ...
```

## **示例**

```sql
create table old_table1(n1 int);
create table old_table2(n1 int);
create table old_table3(n1 int);

RENAME TABLE old_table1 TO new_table1;
RENAME TABLE old_table2 TO new_table2,old_table3 TO new_table3;

mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| new_table1    |
| new_table2    |
| new_table3    |
+---------------+
3 rows in set (0.00 sec)
```
