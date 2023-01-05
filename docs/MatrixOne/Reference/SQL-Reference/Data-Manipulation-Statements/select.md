# **SELECT**

## **语法描述**

`SELECT`语句用于从表中检索数据。

## **语法结构**

``` sql
SELECT
    [ALL | DISTINCT ]
    select_expr [, select_expr] [[AS] alias] ...
    [INTO variable [, ...]]
    [FROM table_references
    [WHERE where_condition]
    [GROUP BY {col_name | expr | position}
      [ASC | DESC]]
    [HAVING where_condition]
    [ORDER BY {col_name | expr | position}
      [ASC | DESC]] [ NULLS { FIRST | LAST } ]
    [LIMIT {[offset,] row_count | row_count OFFSET offset}]
```

### 语法解释

`SELECT` 语句中最常用的子句或条件释义如下：

#### `select_expr`

每个 `select_expr` 表达式表示你需要查询的列，并且必须至少有一个 `select_expr`。

`select_expr` 列表包含指示要查询所选列表的哪些列。`select_expr` 指定列，也可以使用 * 指定全部查询列：

```
SELECT * FROM t1
```

- `tbl_name.*` 可用作以从表中选择所有列：

```
SELECT t1.*, t2.* FROM t1
```

- `select_expr` 可以使用 `AS` 为表指定别名。

#### `table_references`

- 你可以将默认数据库中的表称为 `tbl_name` 或 `db_name.tbl_name`，主要用于明确指定数据库。您可以将列称为`col_name`、`tbl_name.col_name` 或 `db_name.tbl_name.col_name`。你不需要为列指定 `tbl_name` 或 `db_name.tbl_name`，如果需要明确指定，可以添加 `tbl_name` 或 `db_name.tbl_name`。

- 可以使用 `tbl_name AS alias_name` 或 `tbl_name alias_name` 为表起别名。

#### `WHERE`

`WHERE` 子句（如果给定）指示要选择行必须满足的一个或多个条件。 `where_condition` 表达式，对于要选择的每一行计算结果为真。如果没有 `WHERE` 子句，该语句将选择所有行。

#### `GROUP BY`

可以使用列名、列别名或列位置在 `ORDER BY` 和 `GROUP BY` 子句中引用选择的列。

#### `HAVING`

`HAVING` 子句与 `WHERE` 子句一样，指定选择条件。

#### `ORDER BY`

`ORDER BY` 默认为升序；可以使用 ASC 关键字明确指定。要以相反的顺序排序，请将（降序）关键字添加到你作为排序依据 DESC 的子句中的列的名称。

#### `LIMIT`

`LIMIT` 子句可用于限制 `SELECT` 语句返回的行数。

## **示例**

```sql
create table t1 (spID int,userID int,score smallint);
insert into t1 values (1,1,1);
insert into t1 values (2,2,2);
insert into t1 values (2,1,4);
insert into t1 values (3,3,3);
insert into t1 values (1,1,5);
insert into t1 values (4,6,10);
insert into t1 values (5,11,99);
insert into t1 values (null,0,99);

mysql> SELECT * FROM t1 WHERE spID>2 AND userID <2 || userID >=2 OR userID < 2 LIMIT 3;
+------+--------+-------+
| spid | userid | score |
+------+--------+-------+
| NULL |      0 |    99 |
|    1 |      1 |     1 |
|    2 |      2 |     2 |
+------+--------+-------+

mysql> SELECT userID,MAX(score) max_score FROM t1 WHERE userID <2 || userID > 3 GROUP BY userID ORDER BY max_score;
+--------+-----------+
| userid | max_score |
+--------+-----------+
|      1 |         5 |
|      6 |        10 |
|      0 |        99 |
|     11 |        99 |
+--------+-----------+

mysql> select userID,count(score) from t1 group by userID having count(score)>1 order by userID;
+--------+--------------+
| userid | count(score) |
+--------+--------------+
|      1 |            3 |
+--------+--------------+

mysql> select userID,count(score) from t1 where userID>2 group by userID having count(score)>1 order by userID;
Empty set (0.01 sec)s

mysql> select * from t1 order by spID asc nulls last;
+------+--------+-------+
| spid | userid | score |
+------+--------+-------+
|    1 |      1 |     1 |
|    1 |      1 |     5 |
|    2 |      2 |     2 |
|    2 |      1 |     4 |
|    3 |      3 |     3 |
|    4 |      6 |    10 |
|    5 |     11 |    99 |
| NULL |      0 |    99 |
+------+--------+-------+
```

## **限制**

- 在 `GROUP BY` 中暂不支持表别名。
- 暂不支持 `SELECT...FOR UPDATE` 。
- 部分支持 `INTO OUTFILE`。
