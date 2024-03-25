# INSERT IGNORE

## 语法描述

`INSERT IGNORE` 用于在向具有相同唯一索引或主键的数据库表中插入数据时，如果数据已经存在，则忽略该数据，而不是返回报错，否则插入新的数据。

与 MySQL 不同的是，在对唯一索引或主键插入重复值时，MatrixOne 会忽略报错，而 MySQL 会有告警信息。  

## 语法结构

```
> INSERT IGNORE INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...;
```

## 示例

```sql
CREATE TABLE user (
    id INT(11) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT(3) NOT NULL
);
-- 插入一条新数据，id 不存在，于是录入新数据
mysql> INSERT IGNORE INTO user VALUES (1, 'Tom', 18);
Query OK, 0 rows affected (0.02 sec)

mysql> SELECT * FROM USER;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.01 sec)

-- 再插入一条新数据，id 存在，于是数据忽略
mysql> INSERT IGNORE INTO user VALUES (1, 'Jane', 16);
Query OK, 0 rows affected (0.00 sec)

mysql> SELECT * FROM USER;
+------+------+------+
| id   | name | age  |
+------+------+------+
|    1 | Tom  |   18 |
+------+------+------+
1 row in set (0.01 sec)
```

## 限制
  
- `INSERT IGNORE` 不支持对 `NOT NULL` 列写入 `NULL`。
- `INSERT IGNORE` 不支持对错误的数据类型转换。
- `INSERT IGNORE` 不支持处理分区表中插入数据包含不匹配分区值的操作。