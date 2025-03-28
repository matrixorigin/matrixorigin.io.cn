# **ALTER TABLE**

## **语法说明**

`ALTER TABLE` 用于修改现有数据表结构。

## **语法结构**

```
ALTER TABLE tbl_name
    [alter_option [, alter_option] ...]

alter_option: {
    table_options
  | ADD [COLUMN] col_name column_definition
        [FIRST | AFTER col_name]
  | ADD [COLUMN] (col_name column_definition,...)
  | ADD {[INDEX | KEY] [index_name]
        [index_option] ...
  | ADD [CONSTRAINT] UNIQUE [INDEX | KEY]
        [index_name][index_option] ...
  | ADD [CONSTRAINT] FOREIGN KEY
        [index_name] (col_name,...)
        reference_definition
  | ADD [CONSTRAINT [symbol]] PRIMARY KEY
        [index_type] (key_part,...)
  | CHANGE [COLUMN] old_col_name new_col_name column_definition
        [FIRST | AFTER col_name]
  | ALTER INDEX index_name {VISIBLE | INVISIBLE}
  | DROP [COLUMN] col_name
  | DROP {INDEX | KEY} index_name
  | DROP FOREIGN KEY fk_symbol
  | DROP PRIMARY KEY
  | RENAME [TO | AS] new_tbl_name
  | MODIFY [COLUMN] col_name column_definition
        [FIRST | AFTER col_name]
  | RENAME COLUMN old_col_name TO new_col_name
    }

key_part: {col_name [(length)] | (expr)} [ASC | DESC]
index_option: {
  COMMENT[=]'string'
}
table_options:
    table_option [[,] table_option] ...
table_option: {
  COMMENT [=] 'string'
}
```

### 语法释义

下面是各个参数的释义：

1. `ALTER TABLE tbl_name`：表示修改名为 `tbl_name` 的表。
2. `alter_option`：表示可以执行一个或多个更改选项，用逗号分隔。
    - `table_options`：用于设置或修改表的选项，例如表的注释（COMMENT）。
    - `ADD [COLUMN] col_name column_definition [FIRST | AFTER col_name]`：在表中添加一个新列，可以指定新列插入的位置（在某列之前或之后）。
    - `ADD [COLUMN] (col_name column_definition,...)`：同时添加多个新列。
    - `ADD {[INDEX | KEY] [index_name] [index_option] ...`：添加一个索引，可以指定索引名和索引选项（例如，注释）。
    - `ADD [CONSTRAINT] UNIQUE [INDEX | KEY] [index_name][index_option] ...`：添加一个 UNIQUE 约束或 UNIQUE 索引。
    - `ADD [CONSTRAINT] FOREIGN KEY [index_name] (col_name,...) reference_definition`：添加一个 FOREIGN KEY 约束。
    - `ADD [CONSTRAINT [symbol]] PRIMARY KEY [index_type] (key_part,...)`：添加主键约束。
    - `CHANGE [COLUMN] old_col_name new_col_name column_definition [FIRST | AFTER col_name]`：修改列定义、列名与顺序。
    - `ALTER INDEX index_name {VISIBLE | INVISIBLE}`：更改索引的可见性。
    - `DROP [COLUMN] col_name`：删除一个列。
    - `DROP {INDEX | KEY} index_name`：删除一个索引。
    - `DROP FOREIGN KEY fk_symbol`：删除一个 FOREIGN KEY 约束。
    - `DROP PRIMARY KEY`：删除主键。
    - `RENAME [TO | AS] new_tbl_name`：重命名整个表。
    - `MODIFY [COLUMN] col_name column_definition [FIRST | AFTER col_name]`：修改列定义与顺序。
    - `RENAME COLUMN old_col_name TO new_col_name`：重命名列。

3. `key_part`：表示索引的组成部分，可以使用列名（在创建一个文本列的索引时，你可以为索引指定一个长度，字符长度可变。如果您在创建索引时使用列名且不指定长度，索引将会使用整个列的值作为索引组成部分。这在某些情况下可能导致性能降低，特别是在处理较大文本列或二进制数据列时。对于较小的数据类型，例如整数或日期，通常不需要指定长度）。
4. `index_option`：表示索引的选项，例如注释（COMMENT）。
5. `table_options`：表示表的选项，如表的注释（COMMENT）。
6. `table_option`：具体的表选项，例如注释（COMMENT）。

## **示例**

- 示例 1：删除外键约束

```sql
-- 创建 f1 表，包含两个整数列：fa（主键）和 fb（具有唯一约束的键）
CREATE TABLE f1(fa INT PRIMARY KEY, fb INT UNIQUE KEY);
-- 创建 c1 表，包含两个整数列：ca 和 cb
CREATE TABLE c1 (ca INT, cb INT);
-- 为 c1 表添加一个名为 ffa 的外键约束，将 c1 表的 ca 列与 f1 表的 fa 列相关联
ALTER TABLE c1 ADD CONSTRAINT ffa FOREIGN KEY (ca) REFERENCES f1(fa);
-- 向 f1 表插入一条记录：(2, 2)
INSERT INTO f1 VALUES (2, 2);
-- 向 c1 表插入一条记录：(1, 1)
INSERT INTO c1 VALUES (1, 1);
-- 向 c1 表插入一条记录：(2, 2)
INSERT INTO c1 VALUES (2, 2);
-- 从 c1 表中选择所有记录，并按 ca 列排序
mysql> select ca, cb from c1 order by ca;
+------+------+
| ca   | cb   |
+------+------+
|    2 |    2 |
+------+------+
1 row in set (0.01 sec)
-- 从 c1 表中删除名为 ffa 的外键约束
ALTER TABLE c1 DROP FOREIGN KEY ffa;
-- 向 c1 表插入一条记录：(1, 1)
INSERT INTO c1 VALUES (1, 1);
-- 从 c1 表中选择所有记录，并按 ca 列排序
mysql> select ca, cb from c1 order by ca;
+------+------+
| ca   | cb   |
+------+------+
|    1 |    1 |
|    2 |    2 |
+------+------+
2 rows in set (0.01 sec)
```

- 示例 2：添加主键

```sql
-- 创建一个名为 't1' 的新表，包含列 a、b、c 和 d。列 'a' 的数据类型为 INTEGER，'b' 的数据类型为 CHAR(10)，'c' 的数据类型为 DATE，'d' 的数据类型为 DECIMAL(7,2)。在列 'a' 和 'b' 上添加了一个唯一键。
CREATE TABLE t1(a INTEGER, b CHAR(10), c DATE, d DECIMAL(7,2), UNIQUE KEY(a, b));

-- 查看表 't1' 的结构。
mysql> desc t1;
+-------+--------------+------+------+---------+-------+---------+
| Field | Type         | Null | Key  | Default | Extra | Comment |
+-------+--------------+------+------+---------+-------+---------+
| a     | INT(32)      | YES  |      | NULL    |       |         |
| b     | CHAR(10)     | YES  |      | NULL    |       |         |
| c     | DATE(0)      | YES  |      | NULL    |       |         |
| d     | DECIMAL64(7) | YES  |      | NULL    |       |         |
+-------+--------------+------+------+---------+-------+---------+
4 rows in set (0.01 sec)

-- 向表 't1' 插入三行数据。
INSERT INTO t1 VALUES(1, 'ab', '1980-12-17', 800);
INSERT INTO t1 VALUES(2, 'ac', '1981-02-20', 1600);
INSERT INTO t1 VALUES(3, 'ad', '1981-02-22', 500);

-- 显示表 't1' 中的所有行。
mysql> select * from t1;
+------+------+------------+---------+
| a    | b    | c          | d       |
+------+------+------------+---------+
|    1 | ab   | 1980-12-17 |  800.00 |
|    2 | ac   | 1981-02-20 | 1600.00 |
|    3 | ad   | 1981-02-22 |  500.00 |
+------+------+------------+---------+
3 rows in set (0.01 sec)

-- 修改表 't1'，在列 'a' 和 'b' 上添加主键 'pk1'。
mysql> alter table t1 add primary key pk1(a, b);
Query OK, 0 rows affected (0.02 sec)

-- 再次查看修改后的表 't1' 的结构。
mysql> desc t1;
+-------+--------------+------+------+---------+-------+---------+
| Field | Type         | Null | Key  | Default | Extra | Comment |
+-------+--------------+------+------+---------+-------+---------+
| a     | INT(32)      | NO   | PRI  | null    |       |         |
| b     | CHAR(10)     | NO   | PRI  | null    |       |         |
| c     | DATE(0)      | YES  |      | null    |       |         |
| d     | DECIMAL64(7) | YES  |      | null    |       |         |
+-------+--------------+------+------+---------+-------+---------+
4 rows in set (0.01 sec)

-- 添加主键后，再次显示表 't1' 中的所有行。
mysql> select * from t1;
+------+------+------------+---------+
| a    | b    | c          | d       |
+------+------+------------+---------+
|    1 | ab   | 1980-12-17 |  800.00 |
|    2 | ac   | 1981-02-20 | 1600.00 |
|    3 | ad   | 1981-02-22 |  500.00 |
+------+------+------------+---------+
3 rows in set (0.00 sec)
```

- 示例 3：修改列名

```sql
CREATE TABLE t1 (a INTEGER PRIMARY KEY, b CHAR(10));
mysql> desc t1;
+-------+----------+------+------+---------+-------+---------+
| Field | Type     | Null | Key  | Default | Extra | Comment |
+-------+----------+------+------+---------+-------+---------+
| a     | INT(32)  | NO   | PRI  | NULL    |       |         |
| b     | CHAR(10) | YES  |      | NULL    |       |         |
+-------+----------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

insert into t1 values(1, 'ab');
insert into t1 values(2, 'ac');
insert into t1 values(3, 'ad');

mysql> select * from t1;
+------+------+
| a    | b    |
+------+------+
|    1 | ab   |
|    2 | ac   |
|    3 | ad   |
+------+------+
3 rows in set (0.01 sec)

-- 修改表 't1'，将列 'a' 的名称改为 'x'，并将数据类型修改为 VARCHAR(20)。
mysql> alter table t1 change a x VARCHAR(20);
Query OK, 0 rows affected (0.01 sec)

mysql> desc t1;
+-------+-------------+------+------+---------+-------+---------+
| Field | Type        | Null | Key  | Default | Extra | Comment |
+-------+-------------+------+------+---------+-------+---------+
| x     | VARCHAR(20) | NO   | PRI  | null    |       |         |
| b     | CHAR(10)    | YES  |      | null    |       |         |
+-------+-------------+------+------+---------+-------+---------+
2 rows in set (0.01 sec)

mysql> select * from t1;
+------+------+
| x    | b    |
+------+------+
| 1    | ab   |
| 2    | ac   |
| 3    | ad   |
+------+------+
3 rows in set (0.00 sec)
```

- 示例 4：表重命名

```sql
CREATE TABLE t1 (a INTEGER PRIMARY KEY, b CHAR(10));

mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t1            |
+---------------+
1 row in set (0.01 sec)

mysql> alter table t1 rename to t2;
Query OK, 0 rows affected (0.03 sec)

mysql> show tables;
+---------------+
| Tables_in_db1 |
+---------------+
| t2            |
+---------------+
1 row in set (0.01 sec)
```

## 限制

1. 这些子句：`CHANGE [COLUMN]`，`MODIFY [COLUMN]`，`RENAME COLUMN`，`ADD [CONSTRAINT [symbol]] PRIMARY KEY`，`DROP PRIMARY KEY` 和 `ALTER COLUMN ORDER BY` 可以在 ALTER TABLE 语句中自由组合使用，但暂时不支持与其他子句一起使用。
2. 临时表暂不支持使用 `ALTER TABLE` 修改表结构。
3. 使用 `CREATE TABLE ... CLUSTER BY...` 所建的表，不支持使用 `ALTER TABLE` 修改表结构。
