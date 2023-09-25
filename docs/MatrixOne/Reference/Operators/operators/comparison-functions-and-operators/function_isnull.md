# **ISNULL**

## **语法说明**

可以使用 `ISNULL()` 函数代替 `=` 来测试值是否为 `NULL`。（使用 `=` 将值与 `NULL` 进行比较始终会产生 `NULL`。）

如果表达式为 `NULL`，则该函数返回 `true`。否则，它返回 `false`。

`ISNULL()` 函数与 `IS NULL` 比较运算符共享一些特殊行为。参见 [`IS NULL`](is-null.md) 的描述。

## **语法结构**

```
> ISNULL(expr)
```

## **示例**

- 示例 1：

```sql
mysql> SELECT ISNULL(1+1);
+---------------+
| isnull(1 + 1) |
+---------------+
| false         |
+---------------+
1 row in set (0.01 sec)
```

- 示例 2：

```sql
CREATE TABLE students (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL, birth_date DATE );

INSERT INTO students (name, birth_date) VALUES ('John Doe', '2000-05-15'), ('Alice Smith', NULL), ('Bob Johnson', '1999-10-20');

-- 使用ISNULL()函数查找没有填写出生日期的学生：
mysql> SELECT * FROM students WHERE ISNULL(birth_date);
+------+-------------+------------+
| id   | name        | birth_date |
+------+-------------+------------+
|    2 | Alice Smith | NULL       |
+------+-------------+------------+
1 row in set (0.00 sec)

-- ISNULL()函数也可以用IS NULL来实现相同的功能，所以以下查询也是等效的：
mysql> SELECT * FROM students WHERE birth_date IS NULL;
+------+-------------+------------+
| id   | name        | birth_date |
+------+-------------+------------+
|    2 | Alice Smith | NULL       |
+------+-------------+------------+
1 row in set (0.01 sec)
```
