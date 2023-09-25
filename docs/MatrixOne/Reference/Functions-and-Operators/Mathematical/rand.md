# **RAND()**

## **函数说明**

`RAND()` 函数用于生成一个介于 0 和 1 之间的 Float64 类型的随机数。它不接受任何参数，每次调用都会产生一个不可预测且不重复的随机数。

如果需要从表中随机选择数据，可以使用 `RAND()` 函数生成一个随机数，你可以根据这个随机数对表中的数据使用 `ORDER BY` 进行排序。例如：

```sql
-- 从表中随机获取所有数据，并按照随机顺序进行排序，每次查询结果的顺序可能都不同
SELECT * FROM table ORDER BY RAND();
```

## **函数语法**

```
> RAND([seed])
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| seed | 可选参数。是一个整数值，用于指定生成随机数时的种子值。如果不指定 `seed` 参数，则默认以当前时间为种子值。 返回值类型与输入类型保持一致。<br> MatrixOne 暂不支持指定种子值。 |

## **示例**

- 示例 1

```sql
mysql> SELECT RAND();
+---------------------+
| rand()              |
+---------------------+
| 0.25193285156620004 |
+---------------------+
1 row in set (0.00 sec)
```

- 示例 2

```sql
CREATE TABLE Users (
    ID INT PRIMARY KEY AUTO_INCREMENT,
    UserName VARCHAR(255) NOT NULL,
    Email VARCHAR(255));

INSERT INTO Users (UserName, Email) VALUES
    ('John', 'john@example.com'),
    ('Jane', 'jane@example.com'),
    ('Alice', 'alice@example.com'),
    ('Bob', 'bob@example.com');

-- 从Users表中随机选择一个用户的信息
mysql> SELECT * FROM Users ORDER BY RAND() LIMIT 1;
+------+----------+-----------------+
| id   | username | email           |
+------+----------+-----------------+
|    4 | Bob      | bob@example.com | -- Bob的信息被随机选中
+------+----------+-----------------+
1 row in set (0.01 sec)

-- 再次执行上述查询，选中的可能会是另一个用户
mysql> SELECT * FROM Users  ORDER BY RAND() LIMIT 1;
+------+----------+-------------------+
| id   | username | email             |
+------+----------+-------------------+
|    3 | Alice    | alice@example.com | -- Alice的信息被随机选中
+------+----------+-------------------+
1 row in set (0.01 sec)
```

## **限制**

MatrixOne 暂不支持指定 `RAND(seed)` 函数的种子值（即 `seed` 参数）。
