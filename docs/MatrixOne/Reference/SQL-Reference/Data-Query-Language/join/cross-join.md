# **CROSS JOIN**

## **语法说明**

`CROSS JOIN` 用于实现两个表的笛卡尔积，也就是生成两个表中所有行的组合。

## **语法结构**

```
>SELECT column_list
FROM table1
CROSS JOIN table2;
```

## **示例**

```sql
CREATE TABLE Colors (
    color_id INT AUTO_INCREMENT,
    color_name VARCHAR(50),
    PRIMARY KEY (color_id)
);

CREATE TABLE Fruits (
    fruit_id INT AUTO_INCREMENT,
    fruit_name VARCHAR(50),
    PRIMARY KEY (fruit_id)
);

INSERT INTO Colors (color_name) VALUES ('Red'), ('Green'), ('Blue');
INSERT INTO Fruits (fruit_name) VALUES ('Apple'), ('Banana'), ('Cherry');

mysql> SELECT c.color_name, f.fruit_name FROM Colors c CROSS JOIN Fruits f;--生成一个包含所有颜色和所有水果组合的结果集
+------------+------------+
| color_name | fruit_name |
+------------+------------+
| Red        | Apple      |
| Green      | Apple      |
| Blue       | Apple      |
| Red        | Banana     |
| Green      | Banana     |
| Blue       | Banana     |
| Red        | Cherry     |
| Green      | Cherry     |
| Blue       | Cherry     |
+------------+------------+
9 rows in set (0.00 sec)

mysql> SELECT c.color_name,f.fruit_name FROM Colors c CROSS JOIN Fruits f WHERE c.color_name = 'Red' AND f.fruit_name = 'Apple';--筛选出特定颜色和特定水果的组合
+------------+------------+
| color_name | fruit_name |
+------------+------------+
| Red        | Apple      |
+------------+------------+
1 row in set (0.01 sec)
```
