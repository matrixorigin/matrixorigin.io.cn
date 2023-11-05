# **SELECT**

## **语法描述**

`SELECT` 语句用于从表中检索数据。

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
    [FOR {UPDATE}]
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

- 你可以将默认数据库中的表称为 `tbl_name` 或 `db_name.tbl_name`，主要用于明确指定数据库。您可以将列称为 `col_name`、`tbl_name.col_name` 或 `db_name.tbl_name.col_name`。你不需要为列指定 `tbl_name` 或 `db_name.tbl_name`，如果需要明确指定，可以添加 `tbl_name` 或 `db_name.tbl_name`。

- 可以使用 `tbl_name AS alias_name` 或 `tbl_name alias_name` 为表起别名。

#### `WHERE`

`WHERE` 子句（如果给定）指示要选择行必须满足的一个或多个条件。`where_condition` 表达式，对于要选择的每一行计算结果为真。如果没有 `WHERE` 子句，该语句将选择所有行。

#### `GROUP BY`

可以使用列名、列别名或列位置在 `ORDER BY` 和 `GROUP BY` 子句中引用选择的列。

!!! note
    - `GROUP BY` 或 `HAVING` 子句中，不允许使用一个别名来定义另一个别名。
    - 在 `GROUP BY` 或 `HAVING` 子句中，首先会尝试使用列名进行分组或条件过滤。如果在这两个子句中找不到相应的列名，那么它们会检查是否有别名与之匹配，然后再使用这个别名。
    - 在 `GROUP BY` 或 `HAVING` 子句中使用别名时应当避免出现列引用模糊不清的情况，因为当在 `GROUP BY` 或 `HAVING` 子句中使用别名时，它会查找与别名匹配的列，如果找到多个匹配的列，则会产生报错。
    - `ORDER BY` 子句首先会尝试使用别名排序，如果找不到别名，则再尝试使用列名进行排序。

#### `HAVING`

`HAVING` 子句与 `WHERE` 子句一样，指定选择条件。

#### `ORDER BY`

`ORDER BY` 默认为升序；可以使用 ASC 关键字明确指定。要以相反的顺序排序，请将（降序）关键字添加到你作为排序依据 DESC 的子句中的列的名称。

#### `LIMIT`

`LIMIT` 子句可用于限制 `SELECT` 语句返回的行数。

#### `FOR UPDATE`

`SELECT...FOR UPDATE` 主要用于在事务处理中锁定一组数据行，以防止被其他并发的事务修改。这个语句最常用于处理**读—改—写**场景，也就是说，当你需要读取一组数据，对其进行更改，然后将结果写回数据库，而在此过程中你不希望其他事务修改这组数据。

在一个事务中使用 `SELECT FOR UPDATE` 可以锁定所选的行，直到事务结束（通过提交或回滚）才释放锁。这样，其他尝试修改这些行的事务将被阻塞，直到第一个事务完成。

参见下面的例子：

```sql
START TRANSACTION;

SELECT * FROM Orders
WHERE OrderID = 1
FOR UPDATE;
```

在上面的事务中，使用 `SELECT FOR UPDATE` 语句选取了 `Orders` 表中 `OrderID` 为 1 的行，并且锁定了这一行。在事务结束前，其他事务不能修改这一行。当你完成对这一行的修改后，可以提交事务来释放锁：

```sql
UPDATE Orders
SET Quantity = Quantity - 1
WHERE OrderID = 1;

COMMIT;
```

上面的 `UPDATE` 语句更改了选取行的 `Quantity` 值，然后 `COMMIT` 语句提交了事务并释放了锁。此时，其他被阻塞的事务就可以继续执行了。如果你决定不做任何更改，可以使用 `ROLLBACK` 语句来结束事务并释放锁。

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

- `SELECT...FOR UPDATE` 当前仅支持单表查询。
- 部分支持 `INTO OUTFILE`。
