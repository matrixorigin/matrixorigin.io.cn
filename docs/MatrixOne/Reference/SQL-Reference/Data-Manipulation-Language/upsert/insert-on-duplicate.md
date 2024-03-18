# **INSERT ... ON DUPLICATE KEY UPDATE**

## **语法描述**

`INSERT ... ON DUPLICATE KEY UPDATE` 用于在向数据库表中插入数据时，如果数据已经存在，则更新该数据，否则插入新的数据。

`INSERT INTO` 语句是用于向数据库表中插入数据的标准语句；`ON DUPLICATE KEY UPDATE` 语句用于在表中有重复记录时进行更新操作。如果表中存在具有相同唯一索引或主键的记录，则使用 `UPDATE` 子句来更新相应的列值，否则使用 `INSERT` 子句插入新记录。

需要注意的是，使用该语法的前提是需要在表中建立主键约束，以便判断是否有重复记录。同时，更新操作和插入操作都需要设置对应的列值，否则会导致语法错误。

## **语法结构**

```
> INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...
  [ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2, column3 = value3, ...];
```

## **示例**

```sql
CREATE TABLE user (
    id INT(11) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT(3) NOT NULL
);
-- 插入一条新数据，id 不存在，于是录入新数据
INSERT INTO user (id, name, age) VALUES (1, 'Tom', 18)
ON DUPLICATE KEY UPDATE name='Tom', age=18;

mysql> select * from user;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.01 sec)

-- 将一个已经存在的记录的 age 字段增加 1，同时 name 字段保持不变
INSERT INTO user (id, name, age) VALUES (1, 'Tom', 18)
ON DUPLICATE KEY UPDATE age=age+1;

mysql> select * from user;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   19 |
+------+------+------+
1 row in set (0.00 sec)

-- 插入一条新记录，将 name 和 age 字段更新为指定值
INSERT INTO user (id, name, age) VALUES (2, 'Lucy', 20)
ON DUPLICATE KEY UPDATE name='Lucy', age=20;

mysql> select * from user;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   19 |
|    2 | Lucy |   20 |
+------+------+------+
2 rows in set (0.01 sec)
```

## **限制**

`INSERT ... ON DUPLICATE KEY UPDATE` 当前还不支持唯一键（Unique key），由于唯一键可以为 `NULL`，可能会导致一些未知错误。
