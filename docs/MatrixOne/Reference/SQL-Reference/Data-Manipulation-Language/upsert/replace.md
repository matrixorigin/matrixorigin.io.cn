# **REPLACE**

## **语法描述**

`REPLACE` 不仅是一个字符串函数，还是一个替换操作的数据操作语句。`REPLACE` 语句的作用是向表中插入数据，如果表中已经存在符合条件的记录，则会先删除该记录，然后再插入新的数据。如果表中不存在符合条件的记录，则直接插入新的数据。

`REPLACE` 通常在具有唯一约束的表中使用。

- `REPLACE` 语句要求表中必须存在主键或唯一索引，用于判断是否已经存在相同的记录。
- 使用 `REPLACE` 语句插入新记录时，如果已经存在相同主键或唯一索引的记录，旧记录将被删除，然后插入新记录，这可能导致自增列的值发生变化。

## **语法结构**

```
REPLACE
    [INTO] tbl_name
    [(col_name [, col_name] ...)]
    { VALUES(value_list)
      |
      VALUES row_constructor_list
    }

REPLACE
    [INTO] tbl_name
    SET assignment_list

value:
    {expr | DEFAULT}

value_list:
    value [, value] ...

row_constructor_list:
    ROW(value_list)

assignment:
    col_name = value

assignment_list:
    assignment [, assignment] ...
```

### 参数释义

`REPLACE` 语句用于向表中插入数据或更新已存在的数据。它的语法有两种形式：一种是基于列名的插入形式，另一种是基于 SET 子句的更新形式。

以下是各个参数的解释：

1. `INTO`: 可选关键字，表示向哪张表插入数据或更新数据。

2. `tbl_name`: 表示要插入或更新数据的表的名称。

3. `col_name`: 可选参数，表示要插入或更新的列名。在插入形式中，可以通过列名指定要插入的列；在更新形式中，指定要更新的列。

4. `value`: 表示要插入或更新的值。可以是具体的表达式（expr）或默认值（DEFAULT）。

5. `value_list`: 表示一组要插入的值。多个值之间用逗号分隔。

6. （暂不支持）`row_constructor_list`: 表示用于插入的一组值构成的行。每一行的值使用括号括起来，并用逗号分隔。

7. `assignment`: 表示一个列名和其对应的值的关联，用于更新形式。

8. `assignment_list`: 表示多个列名和对应值的关联，用于更新形式。多个列名和值之间用逗号分隔。

!!! note
    - 当使用插入形式时，可以使用 `VALUES` 关键字后跟 `value_list` 或 `row_constructor_list` 来插入数据。`VALUES` 后跟 `value_list` 表示插入一行数据，`VALUES` 后跟 `row_constructor_list` 表示插入多行数据。
    - 当使用更新形式时，使用 `SET` 关键字后跟 `assignment_list` 来指定要更新的列和对应的值。

## **示例**

```sql
create table names(id int PRIMARY KEY,name VARCHAR(255),age int);

-- 插入一行数据，id=1，name="Abby"，age=24
replace into names(id, name, age) values(1,"Abby", 24);
mysql> select name, age from names where id = 1;
+------+------+
| name | age  |
+------+------+
| Abby |   24 |
+------+------+
1 row in set (0.00 sec)

mysql> select * from names;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Abby |   24 |
+------+------+------+
1 row in set (0.00 sec)

-- 使用 replace 语句更新 id=1 的记录的 name 和 age 列的值为"Bob"和 25
replace into names(id, name, age) values(1,"Bobby", 25);

mysql> select name, age from names where id = 1;
+-------+------+
| name  | age  |
+-------+------+
| Bobby |   25 |
+-------+------+
1 row in set (0.00 sec)

mysql> select * from names;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Bobby |   25 |
+------+-------+------+
1 row in set (0.01 sec)

-- 使用 replace 语句插入一行数据，id=2，name="Ciro"，age 为 NULL
replace into names set id = 2, name = "Ciro";

mysql> select name, age from names where id = 2;
+------+------+
| name | age  |
+------+------+
| Ciro | NULL |
+------+------+
1 row in set (0.01 sec)

mysql> select * from names;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Bobby |   25 |
|    2 | Ciro  | NULL |
+------+-------+------+
2 rows in set (0.00 sec)

-- 使用 replace 语句更新 id=2 的记录的 name 列的值为 "Ciro"，age 列的值为 17
replace into names set id = 2, name = "Ciro", age = 17;

mysql> select name, age from names where id = 2;
+------+------+
| name | age  |
+------+------+
| Ciro |   17 |
+------+------+
1 row in set (0.01 sec)

mysql> select * from names;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Bobby |   25 |
|    2 | Ciro  |   17 |
+------+-------+------+
2 rows in set (0.01 sec)
```

## **限制**

MatrixOne 当前不支持使用 `VALUES row_constructor_list` 参数插入的一组值构成的行。
