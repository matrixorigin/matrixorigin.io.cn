# **CREATE OR REPLACE VIEW**

## **语法说明**

`CREATE OR REPLACE VIEW` 用于创建一个新的视图，也可以用作当视图已经存在时，则替换已有的视图。这表示在视图已经存在时更新视图的定义，而不需要删除已有的视图。

## **语法结构**

```
> CREATE OR REPLACE VIEW view_name AS
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

### 语法释义

- `view_name`：要创建或替换的视图的名称，需要为视图指定一个唯一的名称。

- `AS`：用于指示以下的查询语句是视图的查询定义。

- `SELECT column1, column2, ...`：在 AS 关键字之后，你需要指定视图的查询定义。这是一个 SELECT 语句，可以选择表中的特定列，也可以使用计算字段、表达式等等。视图会将这个查询的结果作为其自身的数据。

- `FROM table_name`：`FROM` 子句，用于指定要查询的表名。你可以选择一个或多个表，并在视图中进行相关操作。

- `WHERE condition`：可选的 `WHERE` 子句，用于筛选查询结果。

## **示例**

```sql
-- 创建表 t1 包括两列 a 和 b
create table t1 (a int, b int);

-- 向表 t1 插入三行数据
insert into t1 values (1, 11), (2, 22), (3, 33);

-- 创建视图 v1，该视图包含表 t1 中的所有数据
create view v1 as select * from t1;

-- 查询视图 v1 的所有数据
mysql> select * from v1;
+------+------+
| a    | b    |
+------+------+
|    1 |   11 |
|    2 |   22 |
|    3 |   33 |
+------+------+
3 rows in set (0.01 sec)

-- 查询视图 v1 中列 a 大于 1 的数据
mysql> select * from v1 where a > 1;
+------+------+
| a    | b    |
+------+------+
|    2 |   22 |
|    3 |   33 |
+------+------+
2 rows in set (0.00 sec)

-- 替换视图 v1，新的视图仅包含表 t1 中列 a 小于 2 的数据
create or replace view v1 as select * from t1 where a < 2;

-- 再次查询视图 v1，现在只包含满足新条件的数据
mysql> select * from v1;
+------+------+
| a    | b    |
+------+------+
|    1 |   11 |
+------+------+
1 row in set (0.08 sec)
```
