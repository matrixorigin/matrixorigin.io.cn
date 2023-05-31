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
  | ALTER [COLUMN] col_name {
        SET DEFAULT {literal | (expr)}
      | DROP DEFAULT
    }
  | ALTER INDEX index_name {VISIBLE | INVISIBLE}
  | DROP [COLUMN] col_name
  | DROP {INDEX | KEY} index_name
  | DROP FOREIGN KEY fk_symbol
   | ORDER BY col_name [, col_name] ...  
  | RENAME [TO | AS] new_tbl_name
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
    - `ALTER [COLUMN] col_name {SET DEFAULT {literal | (expr)} | DROP DEFAULT}`：更改列的默认值或删除默认值。
    - `ALTER INDEX index_name {VISIBLE | INVISIBLE}`：更改索引的可见性。
    - `DROP [COLUMN] col_name`：删除一个列。
    - `DROP {INDEX | KEY} index_name`：删除一个索引。
    - `DROP FOREIGN KEY fk_symbol`：删除一个 FOREIGN KEY 约束。
    - `ORDER BY col_name [, col_name] ...`：按指定列重新排序表中的行。
    - `RENAME [TO | AS] new_tbl_name`：重命名整个表。

3. `key_part`：表示索引的组成部分，可以使用列名（在创建一个文本列的索引时，你可以为索引指定一个长度，字符长度可变。如果您在创建索引时使用列名且不指定长度，索引将会使用整个列的值作为索引组成部分。这在某些情况下可能导致性能降低，特别是在处理较大文本列或二进制数据列时。对于较小的数据类型，例如整数或日期，通常不需要指定长度。）。
4. `index_option`：表示索引的选项，例如注释（COMMENT）。
5. `table_options`：表示表的选项，如表的注释（COMMENT）。
6. `table_option`：具体的表选项，例如注释（COMMENT）。

## **示例**

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

## 限制

MatrixOne 当前仅支持 `ORDER BY col_name [, col_name] ...` 语法，不会更改表的实际顺序。
