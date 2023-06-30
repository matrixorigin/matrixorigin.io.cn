# FOREIGN KEY 外键约束

FOREIGN KEY 约束可用于在跨表交叉引用相关数据时，保持相关数据的一致性。

**遵循规则**

定义外键时，需要遵守下列规则：

- 主表必须已经存在于数据库中，或者是当前正在创建的表。如果是后一种情况，则主表与从表是同一个表，这样的表称为自参照表，这种结构称为自参照完整性。

- 必须为主表定义主键。

- 主键不能包含空值，但允许在外键中出现空值。也就是说，只要外键的每个非空值出现在指定的主键中，这个外键的内容就是正确的。

- 在主表的表名后面指定列名或列名的组合。这个列或列的组合必须是主表的主键或候选键。

- 外键中列的数目必须和主表的主键中列的数目相同。

- 外键中列的数据类型必须和主表主键中对应列的数据类型相同。

- 外键的值必须跟主表主键的值保持一致。

**外键特性**

- 多列外键: 这种外键是在一个表中两个或更多的列联合起来引用另一个表的主键。也就是说，这些列共同定义了对另一个表的引用。它们必须以组的形式存在，且需要同时满足外键约束。

- 多层外键: 这种情况通常涉及到三个或更多的表，并且它们之间存在依赖关系。一个表的外键可以是另一个表的主键，而这个表的外键又可以是第三个表的主键，形成多层外键的情况。

## 语法说明

外键是在子表中定义的，基本的外键约束语法如下：

```
> CREATE TABLE table_name (
    column1 datatype [NOT NULL],
    column2 datatype [NOT NULL],
    ...
    FOREIGN KEY (column1, column2, ... column_n)
    REFERENCES parent_table (column1, column2, ... column_n)
);
```

**参数释义**

- `FOREIGN KEY (column1, column2, ... column_n)`：定义了作为外键的列。
- `REFERENCES parent_table (column1, column2, ... column_n)`：`REFERENCES` 定义了被引用的父表和父表中的列。

## 示例

### 示例 1

```sql
-- 创建名为t1的表，包含两列：a和b。a列为int类型并设为主键，b列为varchar类型，长度为5
create table t1(a int primary key, b varchar(5));

-- 创建名为t2的表，包含三列：a、b和c。a列为int类型，b列为varchar类型，长度为5。c列为int类型，并且被设定为外键，与t1表的a列建立关系
create table t2(a int ,b varchar(5), c int, foreign key(c) references t1(a));

-- 在t1表中插入两行数据：(101, 'abc') 和 (102, 'def')
mysql> insert into t1 values(101,'abc'),(102,'def');
Query OK, 2 rows affected (0.01 sec)

-- 在t2表中插入两行数据：(1, 'zs1', 101) 和 (2, 'zs2', 102)，其中的101和102是t1表的主键
mysql> insert into t2 values(1,'zs1',101),(2,'zs2',102);
Query OK, 2 rows affected (0.01 sec)

-- 在t2表中插入一行数据：(3, 'xyz', null)，其中的null表示这行数据在c列（即外键列）没有关联的主键
mysql> insert into t2 values(3,'xyz',null);
Query OK, 1 row affected (0.01 sec)

-- 尝试在t2表中插入一行数据：(3, 'xxa', 103)，但是103在t1表的主键中不存在，因此插入失败，违反了外键约束
mysql> insert into t2 values(3,'xxa',103);
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails

```

**示例解释**：在上述示例中，t2 的 c 列只能引用 t1 中 a 列的值或空值，因此插入 t2 的前 3 行操作都能够成功插入，但是第 4 行中的 103 并不是 t1 中 a 列的某个值，违反了外键约束，因此插入失败。

### 示例 2 - 多列外键

```sql
-- 创建一个名为"Student"的表，用于存储学生信息
CREATE TABLE Student (
    StudentID INT, -- 学生ID字段，整型
    Name VARCHAR(100), -- 学生名字字段，最大长度100的字符串
    PRIMARY KEY (StudentID) -- 将StudentID设定为这个表的主键
);

-- 创建一个名为"Course"的表，用于存储课程信息
CREATE TABLE Course (
    CourseID INT, -- 课程ID字段，整型
    CourseName VARCHAR(100), -- 课程名字字段，最大长度100的字符串
    PRIMARY KEY (CourseID) -- 将CourseID设定为这个表的主键
);

-- 创建一个名为"StudentCourse"的表，用于存储学生选课信息
CREATE TABLE StudentCourse (
    StudentID INT, -- 学生ID字段，整型，与Student表的StudentID字段对应
    CourseID INT, -- 课程ID字段，整型，与Course表的CourseID字段对应
    PRIMARY KEY (StudentID, CourseID), -- 将StudentID和CourseID的组合设定为这个表的主键
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID), -- 设置StudentID字段为外键，引用Student表的StudentID字段
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) -- 设置CourseID字段为外键，引用Course表的CourseID字段
);
```

**示例解释**：上述示例中，一个是学生表 (Student)，一个是课程表 (Course)，还有一个选课表 (StudentCourse) 用于记录哪个学生选择了哪门课程。在这种情况下，选课表中的学生 ID 和课程 ID 可以作为外键，共同引用学生表和课程表的主键。

### 示例 3 - 多层外键

```sql
-- 创建一个名为"Country"的表，用于存储国家信息
CREATE TABLE Country (
    CountryID INT, -- 国家ID字段，整型
    CountryName VARCHAR(100), -- 国家名字字段，最大长度100的字符串
    PRIMARY KEY (CountryID) -- 将CountryID设定为这个表的主键
);

-- 创建一个名为"State"的表，用于存储州/省份信息
CREATE TABLE State (
    StateID INT, -- 州/省份ID字段，整型
    StateName VARCHAR(100), -- 州/省份名字字段，最大长度100的字符串
    CountryID INT, -- 国家ID字段，整型，与Country表的CountryID字段对应
    PRIMARY KEY (StateID), -- 将StateID设定为这个表的主键
    FOREIGN KEY (CountryID) REFERENCES Country(CountryID) -- 设置CountryID字段为外键，引用Country表的CountryID字段
);

-- 创建一个名为"City"的表，用于存储城市信息
CREATE TABLE City (
    CityID INT, -- 城市ID字段，整型
    CityName VARCHAR(100), -- 城市名字字段，最大长度100的字符串
    StateID INT, -- 州/省份ID字段，整型，与State表的StateID字段对应
    PRIMARY KEY (CityID), -- 将CityID设定为这个表的主键
    FOREIGN KEY (StateID) REFERENCES State(StateID) -- 设置StateID字段为外键，引用State表的StateID字段
);
```

**示例解释**：上述示例中，有三个表，国家表 (Country)，州/省份表 (State)，城市表 (City)。州/省份表有一个字段 CountryID，这是国家表的主键，同时也是州/省份表的外键。城市表有一个字段 StateID，这是州/省份表的主键，同时也是城市表的外键。这就形成了一种多层外键的情况。
