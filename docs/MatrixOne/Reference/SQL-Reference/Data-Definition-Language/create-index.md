# **CREATE INDEX**

## **语法说明**

在表中创建索引，以便更加快速高效地查询数据。

你无法看到索引，索引只能被用来加速搜索/查询。

更新一个包含索引的表需要比更新一个没有索引的表花费更多的时间，这是由于索引本身也需要更新。因此，理想的做法是仅仅在常常被搜索的列（以及表）上面创建索引。

索引有几种常见的类型，分别为：

- Primary Key：即主键索引，即标识在主键列上的索引。
- Unique Key：即唯一索引，在非主键列上的索引，可以确保该列每个值都是唯一的。
- Secondary Index：即二级索引，即在非主键列上标识的索引。

## **语法结构**

```
> CREATE [UNIQUE] INDEX index_name
ON tbl_name (key_part,...)
COMMENT 'string'
```

### 语法释义

#### CREATE UNIQUE INDEX 语法

在表上创建一个唯一的索引。不允许使用重复的值：唯一的索引意味着两个行不能拥有相同的索引值。

#### CREATE INDEX 语法

在表上创建一个次级索引。可以使用重复值和 Null 值。

## **示例**

- 示例 1：

```sql
drop table if exists t1;
create table t1(id int PRIMARY KEY,name VARCHAR(255),age int);
insert into t1 values(1,"Abby", 24);
insert into t1 values(2,"Bob", 25);
insert into t1 values(3,"Carol", 23);
insert into t1 values(4,"Dora", 29);
create unique index idx on t1(name);
mysql> select * from t1;
+------+-------+------+
| id   | name  | age  |
+------+-------+------+
|    1 | Abby  |   24 |
|    2 | Bob   |   25 |
|    3 | Carol |   23 |
|    4 | Dora  |   29 |
+------+-------+------+
4 rows in set (0.00 sec)

mysql> show create table t1;
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                     |
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`id` INT NOT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`age` INT DEFAULT NULL,
PRIMARY KEY (`id`),
UNIQUE KEY `idx` (`name`)
) |
+-------+--------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)


create table t2 (
col1 bigint primary key,
col2 varchar(25),
col3 float,
col4 varchar(50)
);
create unique index idx on t2(col2) comment 'create varchar index';
insert into t2 values(1,"Abby", 24,'zbcvdf');
insert into t2 values(2,"Bob", 25,'zbcvdf');
insert into t2 values(3,"Carol", 23,'zbcvdf');
insert into t2 values(4,"Dora", 29,'zbcvdf');
mysql> select * from t2;
+------+-------+------+--------+
| col1 | col2  | col3 | col4   |
+------+-------+------+--------+
|    1 | Abby  |   24 | zbcvdf |
|    2 | Bob   |   25 | zbcvdf |
|    3 | Carol |   23 | zbcvdf |
|    4 | Dora  |   29 | zbcvdf |
+------+-------+------+--------+
4 rows in set (0.00 sec)
mysql> show create table t2;
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                              |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t2    | CREATE TABLE `t2` (
`col1` BIGINT NOT NULL,
`col2` VARCHAR(25) DEFAULT NULL,
`col3` FLOAT DEFAULT NULL,
`col4` VARCHAR(50) DEFAULT NULL,
PRIMARY KEY (`col1`),
UNIQUE KEY `idx` (`col2`) COMMENT `create varchar index`
) |
+-------+---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)
```

- 示例 2：创建次级索引并查询

```sql
CREATE TABLE Employees (
    EmployeeID INT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Department VARCHAR(50),
    Salary INT
);

INSERT INTO Employees (EmployeeID, FirstName, LastName, Department, Salary)
VALUES (1, 'John', 'Doe', 'HR', 50000);

INSERT INTO Employees (EmployeeID, FirstName, LastName, Department, Salary)
VALUES (2, 'Jane', 'Smith', 'IT', 60000);

INSERT INTO Employees (EmployeeID, FirstName, LastName, Department, Salary)
VALUES (3, 'Mark', 'Johnson', 'IT', 55000);

INSERT INTO Employees (EmployeeID, FirstName, LastName, Department, Salary)
VALUES (4, 'Mary', 'Brown', 'Sales', 48000);

mysql> CREATE INDEX DepartmentIndex ON Employees (Department);
Query OK, 0 rows affected (0.01 sec)

mysql> SELECT * FROM Employees WHERE Department = 'IT';
+------------+-----------+----------+------------+--------+
| employeeid | firstname | lastname | department | salary |
+------------+-----------+----------+------------+--------+
|          2 | Jane      | Smith    | IT         |  60000 |
|          3 | Mark      | Johnson  | IT         |  55000 |
+------------+-----------+----------+------------+--------+
2 rows in set (0.00 sec)
```
