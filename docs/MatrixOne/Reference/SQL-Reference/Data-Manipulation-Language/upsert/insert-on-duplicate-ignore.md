# **INSERT ... ON DUPLICATE KEY IGNORE**

## **语法描述**

`INSERT ... ON DUPLICATE KEY IGNORE` 用于在向具有相同唯一索引或主键的数据库表中插入数据时，如果数据已经存在，则忽略该数据，而不是返回报错，否则插入新的数据。

`INSERT INTO` 语句是用于向数据库表中插入数据的标准语句，`ON DUPLICATE KEY IGNORE` 语句用于在表中有重复记录时进行忽略操作。如果表中存在具有相同唯一索引或主键的记录，则忽略该列，否则使用 `INSERT` 子句插入新记录。

## **语法结构**

```
> INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...
  [ON DUPLICATE KEY IGNORE];
```

## **示例**

```sql
CREATE TABLE user (
    id INT(11) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT(3) NOT NULL
);
-- 插入一条新数据，id 不存在，于是录入新数据
mysql> INSERT INTO user VALUES (1, 'Tom', 18) ON DUPLICATE KEY IGNORE;
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT * FROM USER;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.00 sec)

-- 再插入一条新数据，id 存在，于是数据忽略
mysql> INSERT INTO user VALUES (1, 'Jane', 16) ON DUPLICATE KEY IGNORE;
Query OK, 0 rows affected (0.00 sec)

mysql>  SELECT * FROM USER;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.00 sec)
```

## **限制**

`INSERT ... ON DUPLICATE KEY IGNORE` 使用唯一键（Unique key）或唯一索引（Unique index) 判断重复记录时，相应字段属性应为 `NOT NULL`，否则可能会导致一些未知错误。
