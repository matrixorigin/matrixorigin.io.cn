# **TRUNCATE TABLE**

## **语法说明**

`TRUNCATE TABLE` 语句用于用于删除表中的所有行，而不记录单个行删除操作。`TRUNCATE TABLE` 与没有 `WHERE` 子句的 `DELETE` 语句类似；但是，`TRUNCATE TABLE` 速度更快，使用的系统资源和事务日志资源更少。

`TRUNCATE TABLE` 有以下特点：

- `TRUNCATE TABLE` 删除之后，不可恢复。

- 如果表具有 `AUTO_INCREMENT` 列，则 `TRUNCATE TABLE` 语句将自动递增值重置为零。

- 如果表具有任何外键约束（`FOREIGN KEY`），则 `TRUNCATE TABLE` 语句会逐个删除行。

- 如果表没有任何外键约束（`FOREIGN KEY`），则 `TRUNCATE TABLE` 语句将删除该表并重新创建一个具有相同结构的新表

`DROP TABLE`、`TRUNCATE TABLE` 和 `DELETE TABLE` 的区别：

- `DROP TABLE`：当你不再需要该表时，用 `DROP TABLE`。
- `TRUNCATE TABLE`：当你要删除所有记录，但仍要保留该表时，用 `TRUNCATE TABLE`。
- `DELETE TABLE`：当你要删除部分记录时，用 `DELETE TABLE`。

## **语法结构**

```
> TRUNCATE [TABLE] table_name;
```

### 语法释义

#### TABLE

TABLE 关键字是可选的。使用它来区分 `TRUNCATE TABLE` 语句和 `TRUNCATE` 函数。

## **示例**

```sql
create table index_table_05 (col1 bigint not null auto_increment,col2 varchar(25),col3 int,col4 varchar(50),primary key (col1),unique key col2(col2),key num_id(col4));
insert into index_table_05(col2,col3,col4) values ('apple',1,'10'),('store',2,'11'),('bread',3,'12');
mysql> select * from index_table_05;
+------+-------+------+------+
| col1 | col2  | col3 | col4 |
+------+-------+------+------+
|    1 | apple |    1 | 10   |
|    2 | store |    2 | 11   |
|    3 | bread |    3 | 12   |
+------+-------+------+------+
3 rows in set (0.00 sec)

mysql> truncate table index_table_05;
Query OK, 0 rows affected (0.12 sec)

mysql> select * from index_table_05;
Empty set (0.03 sec)
```
