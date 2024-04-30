# FOREIGN KEY 外键约束

FOREIGN KEY 外键约束允许表内或跨表交叉引用相关数据，有助于保持相关数据的一致性。

当建立外键时，Matrixone 默认会检查外键约束的完整性。如需禁用外键约束检查，请参考章节[外键约束检查](../../../Reference/Variable/system-variables/foreign_key_checks.md)。

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

- 外键自引用：是指一个表中的列引用同一个表的主键。这种设计通常用于表示层级关系或父子关系，比如组织结构、分类目录等。

- 多列外键：这种外键是在一个表中两个或更多的列联合起来引用另一个表的主键。也就是说，这些列共同定义了对另一个表的引用。它们必须以组的形式存在，且需要同时满足外键约束。

- 多层外键：这种情况通常涉及到三个或更多的表，并且它们之间存在依赖关系。一个表的外键可以是另一个表的主键，而这个表的外键又可以是第三个表的主键，形成多层外键的情况。

## 语法说明

外键是在子表中定义的，基本的外键约束语法如下：

```
> CREATE TABLE child_table (
    ...,
    foreign_key_column data_type,
    FOREIGN KEY (foreign_key_column) REFERENCES parent_table (parent_key_column)
    [ON DELETE reference_option]
    [ON UPDATE reference_option]
);

reference_option:
    RESTRICT | CASCADE | SET NULL | NO ACTION
```

**参数释义**

在上述外键约束的语法结构中，以下是各个参数的释义：

- `child_table`：子表的名称，即包含外键的表。
- `foreign_key_column`：子表中用于引用父表的外键列的名称。
- `data_type`：外键列的数据类型。
- `parent_table`：被引用的父表的名称。
- `parent_key_column`：父表中用于建立关系的主键列的名称。
- `[ON DELETE reference_option]`：可选参数，用于指定在删除父表中的记录时执行的操作。
    + `RESTRICT`：如果在引用表中有相关的外键数据存在，不允许删除引用表中的数据。这可以用来防止误删除关联数据，以维护数据的一致性。

    + `CASCADE`：当引用表中的数据被删除时，同时删除与之关联的外键数据。这可以用于级联删除关联数据，以确保数据的完整性。

    + `SET NULL`：当引用表中的数据被删除时，将外键列的值设置为 NULL。这可以用于在删除引用数据时保留外键数据，但断开与引用数据的关联。

    + `NO ACTION`：表示不采取任何操作，只是检查是否有关联数据存在。这类似于 `RESTRICT`，但可能在某些数据库中有微小的差异。

- `[ON UPDATE reference_option]`：可选参数，用于指定在更新父表中的记录时执行的操作。可能的值与 `[ON DELETE reference_option]` 相同。

这些参数一起定义了外键约束，它们确保了子表与父表之间的数据完整性关系。

## 示例

### 示例 1

```sql
-- 创建名为 t1 的表，包含两列：a 和 b。a 列为 int 类型并设为主键，b 列为 varchar 类型，长度为 5
create table t1(a int primary key, b varchar(5));

-- 创建名为 t2 的表，包含三列：a、b 和 c。a 列为 int 类型，b 列为 varchar 类型，长度为 5。c 列为 int 类型，并且被设定为外键，与 t1 表的 a 列建立关系
create table t2(a int ,b varchar(5), c int, foreign key(c) references t1(a));

-- 在 t1 表中插入两行数据：(101, 'abc') 和 (102, 'def')
mysql> insert into t1 values(101,'abc'),(102,'def');
Query OK, 2 rows affected (0.01 sec)

-- 在 t2 表中插入两行数据：(1, 'zs1', 101) 和 (2, 'zs2', 102)，其中的 101 和 102 是 t1 表的主键
mysql> insert into t2 values(1,'zs1',101),(2,'zs2',102);
Query OK, 2 rows affected (0.01 sec)

-- 在 t2 表中插入一行数据：(3, 'xyz', null)，其中的 null 表示这行数据在 c 列（即外键列）没有关联的主键
mysql> insert into t2 values(3,'xyz',null);
Query OK, 1 row affected (0.01 sec)

-- 尝试在 t2 表中插入一行数据：(3, 'xxa', 103)，但是 103 在 t1 表的主键中不存在，因此插入失败，违反了外键约束
mysql> insert into t2 values(3,'xxa',103);
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails

```

**示例解释**：在上述示例中，t2 的 c 列只能引用 t1 中 a 列的值或空值，因此插入 t2 的前 3 行操作都能够成功插入，但是第 4 行中的 103 并不是 t1 中 a 列的某个值，违反了外键约束，因此插入失败。

### 示例 2 - 外键自引用

```sql
-- 创建名为 categories 的表，用于存储商品分类信息
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,--id 是主键，用于唯一标识每个分类
    name VARCHAR(255) NOT NULL,--name 是分类的名称
    parent_id INT,
    FOREIGN KEY (parent_id) REFERENCES categories(id)--parent_id 是一个外键，它引用了 categories 表中的 id 列
);

--parent_id 列允许我们指定一个分类的父分类。如果没有父分类（即顶级分类），parent_id 可以设置为 NULL。接下来，我们可以插入一些数据来展示这种层级关系：

--插入顶级分类
mysql> INSERT INTO categories (name) VALUES ('Electronics'),('Books');
Query OK, 2 rows affected (0.01 sec)

--插入子分类
mysql> INSERT INTO categories (name, parent_id) VALUES ('Laptops', 1),('Smartphones', 1),('Science Fiction', 2),('Mystery', 2);
Query OK, 4 rows affected (0.01 sec)

mysql> select * from categories;
+------+-----------------+-----------+
| id   | name            | parent_id |
+------+-----------------+-----------+
|    1 | Electronics     |      NULL |
|    2 | Books           |      NULL |
|    3 | Laptops         |         1 |
|    4 | Smartphones     |         1 |
|    5 | Science Fiction |         2 |
|    6 | Mystery         |         2 |
+------+-----------------+-----------+
6 rows in set (0.01 sec)

```

**示例解释**：上述代码中，我们了创建名为 `categories` 的表，用于存储商品分类信息，首先插入了两个顶级分类 `Electronics` 和 `Books`。然后，我们为每个顶级分类添加了子分类，比如 `Laptops` 和 `Smartphones` 是 `Electronics` 的子分类，而 `Science Fiction` 和 `Mystery` 是 `Books` 的子分类。

### 示例 3 - 多列外键

```sql
-- 创建一个名为"Student"的表，用于存储学生信息
CREATE TABLE Student (
    StudentID INT, -- 学生 ID 字段，整型
    Name VARCHAR(100), -- 学生名字字段，最大长度 100 的字符串
    PRIMARY KEY (StudentID) -- 将 StudentID 设定为这个表的主键
);

-- 创建一个名为"Course"的表，用于存储课程信息
CREATE TABLE Course (
    CourseID INT, -- 课程 ID 字段，整型
    CourseName VARCHAR(100), -- 课程名字字段，最大长度 100 的字符串
    PRIMARY KEY (CourseID) -- 将 CourseID 设定为这个表的主键
);

-- 创建一个名为"StudentCourse"的表，用于存储学生选课信息
CREATE TABLE StudentCourse (
    StudentID INT, -- 学生 ID 字段，整型，与 Student 表的 StudentID 字段对应
    CourseID INT, -- 课程 ID 字段，整型，与 Course 表的 CourseID 字段对应
    PRIMARY KEY (StudentID, CourseID), -- 将 StudentID 和 CourseID 的组合设定为这个表的主键
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID), -- 设置 StudentID 字段为外键，引用 Student 表的 StudentID 字段
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) -- 设置 CourseID 字段为外键，引用 Course 表的 CourseID 字段
);
```

**示例解释**：上述示例中，一个是学生表 (Student)，一个是课程表 (Course)，还有一个选课表 (StudentCourse) 用于记录哪个学生选择了哪门课程。在这种情况下，选课表中的学生 ID 和课程 ID 可以作为外键，共同引用学生表和课程表的主键。

### 示例 4 - 多层外键

```sql
-- 创建一个名为"Country"的表，用于存储国家信息
CREATE TABLE Country (
    CountryID INT, -- 国家 ID 字段，整型
    CountryName VARCHAR(100), -- 国家名字字段，最大长度 100 的字符串
    PRIMARY KEY (CountryID) -- 将 CountryID 设定为这个表的主键
);

-- 创建一个名为"State"的表，用于存储州/省份信息
CREATE TABLE State (
    StateID INT, -- 州/省份 ID 字段，整型
    StateName VARCHAR(100), -- 州/省份名字字段，最大长度 100 的字符串
    CountryID INT, -- 国家 ID 字段，整型，与 Country 表的 CountryID 字段对应
    PRIMARY KEY (StateID), -- 将 StateID 设定为这个表的主键
    FOREIGN KEY (CountryID) REFERENCES Country(CountryID) -- 设置 CountryID 字段为外键，引用 Country 表的 CountryID 字段
);

-- 创建一个名为"City"的表，用于存储城市信息
CREATE TABLE City (
    CityID INT, -- 城市 ID 字段，整型
    CityName VARCHAR(100), -- 城市名字字段，最大长度 100 的字符串
    StateID INT, -- 州/省份 ID 字段，整型，与 State 表的 StateID 字段对应
    PRIMARY KEY (CityID), -- 将 CityID 设定为这个表的主键
    FOREIGN KEY (StateID) REFERENCES State(StateID) -- 设置 StateID 字段为外键，引用 State 表的 StateID 字段
);
```

**示例解释**：上述示例中，有三个表，国家表 (Country)，州/省份表 (State)，城市表 (City)。州/省份表有一个字段 CountryID，这是国家表的主键，同时也是州/省份表的外键。城市表有一个字段 StateID，这是州/省份表的主键，同时也是城市表的外键。这就形成了一种多层外键的情况。
