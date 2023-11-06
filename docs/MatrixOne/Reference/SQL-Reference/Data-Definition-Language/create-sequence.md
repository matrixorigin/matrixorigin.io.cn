# **CREATE SEQUENCE**

## **语法说明**

`CREATE SEQUENCE` 用户创建一个序列对象。序列（Sequence）是一种特殊的数据库对象，它可以被用来自动生成唯一的数字序列。通常情况下，序列被用来为一个表的主键字段自动生成唯一的值。

`CREATE SEQUENCE` 是一种用于创建自增数字序列的命令，用于生成唯一的、连续的数字值，通常用于为主键列或其他需要自增数字的列生成值。

## **语法结构**

```
> CREATE SEQUENCE [ IF NOT EXISTS ] SEQUENCE_NAME
    [ AS data_type ]
    [ INCREMENT [ BY ] increment ]
    [ MINVALUE minvalue] [ MAXVALUE maxvalue]
    [ START [ WITH ] start ] [ [ NO ] CYCLE ]
```

### 语法释义

#### data_type

可选子句 `AS data_type` 指定序列的数据类型。支持数据类型为 `smallint [unsigned]`、`integer [unsigned]` 和 `bigint [unsigned]`，默认 `bigint` 是默认值。数据类型决定了序列的默认最小值和最大值。

#### INCREMENT

可选子句 `INCREMENT [ BY ] increment` 指定将哪个值添加到当前序列值以创建新值。正值将生成升序，负值将生成降序；默认值为 1。

#### MINVALUE

可选子句 `MINVALUE minvalue` 确定序列可以生成的最小值。如果未提供此子句或未指定 `MINVALUE`，则将使用默认值。升序序列的默认值是 1。降序序列的默认值是数据类型的最小值。

#### MAXVALUE

可选子句 `MAXVALUE maxvalue` 确定序列的最大值。如果未提供此子句或未指定 `MAXVALUE`，则将使用默认值。升序序列的默认值是数据类型的最大值。降序序列的默认值为 -1。

#### START

可选子句 `START [ WITH ] start` 允许序列从任何地方开始。默认起始值是升序序列的最小值和降序序列的最大值。

#### CYCLE

`CYCLE` 选项允许序列在升序或降序序列分别达到最大值或最小值时回绕。如果达到限制，则生成的下一个数字将分别是最小值或最大值。

### 语法操作

对序列的值进行操作，使用的函数：

#### `NEXTVAL(sequence_name)`

将当前值设置成递增后的值，并返回。

#### `CURRVAL(sequence_name)`

返回当前值。

#### `SETVAL(sequence_name, n [,b])`

设置当前值；

- b 默认设置 true，下一次调用 nextval() 时，直接返回 n
- b 如果设置 false，则返回 n+increment

#### `LASTVAL()`

返回当前会话中，最近一次用 `NEXTVAL` 获取的任何序列的值，且 `LASTVAL()` 只能被 `NEXTVAL` 初始化。

`LASTVAL()` 受 `SETVAL(sequence_name, n [,true])` 改变当前值的影响，示例如下：

假设创建了一个名为 `seq_id` 的 Sequence，起始值为 1，每次增加 1，最大值为 1000：

```sql
CREATE SEQUENCE seq_id INCREMENT BY 1 MAXVALUE 1000 START with 1;
```

然后可以使用 `NEXTVAL()` 函数获取下一个序列值，并自动将序列的计数器增加 1：

```sql
SELECT NEXTVAL('seq_id');
```

接着，可以使用 `LASTVAL()` 函数返回当前 Sequence 的当前值：

```sql
SELECT LASTVAL();
```

也可以使用 `SETVAL()` 函数将当前值设置为 30，参数 `[,b]` 为 true：

```sql
SELECT SETVAL('seq_id', 30);
```

然后，可以再次使用 `NEXTVAL()` 函数获取下一个序列值：

```sql
SELECT NEXTVAL('seq_id');
```

此时将返回 31，因为当前值已经被设置为 30，`NEXTVAL()` 函数将返回下一个序列值 31。

```sql
SELECT LASTVAL();
```

使用 `LASTVAL()` 返回当前 Sequence 的当前值，此时将返回 31。

上述示例表示，如果先通过 `SETVAL(sequence_name, n [,true])` 设置了当前值，再使用 `NEXTVAL` 获取下一个序列值，那么再次使用 `LASTVAL()`，则返回 `NEXTVAL` 获取的序列的值。

### 在表中使用 `SEQUENCE`

要在表格中使用序列，需要完成以下步骤：

1. 创建一个序列对象：可以使用以下 SQL 命令创建一个名为 "my_sequence" 的序列：

    ```sql
    CREATE SEQUENCE my_sequence;
    ```

    这将创建一个简单的序列对象，它将从 1 开始，以 1 递增。

2. 将序列应用到表格中的字段：为了将序列应用到表格中的字段，需要在表格定义中指定一个默认值为序列的下一个值，如下所示：

    ```sql
    CREATE TABLE my_table (
      id INTEGER DEFAULT nextval('my_sequence'),
      name VARCHAR(50));
    ```

    上面的例子中，"id" 字段将自动从序列中获取下一个唯一的值作为其默认值。

3. 插入数据：表格和序列都已经定义完成后，可以使用 `INSERT` 语句来向表格中插入数据。当插入一行数据时，如果没有指定 "id" 字段的值，那么 MatrixOne 将会自动从序列中获取下一个唯一的值作为其默认值。

    例如，下面的语句将会向 "my_table" 表格中插入一行数据，并且自动为 "id" 字段分配一个唯一的值：

    ```sql
    INSERT INTO my_table (name) VALUES ('John');
    INSERT INTO my_table (name) VALUES ('Tom');
    ```

4. 通过使用序列，可以轻松地在表格中自动分配唯一的标识符，从而避免了手动分配标识符可能带来的错误。使用下面的语句进行查询验证：

    ```sql
    mysql> select * from my_table;
    +------+------+
    | id   | name |
    +------+------+
    |    1 | John |
    |    2 | Tom  |
    +------+------+
    2 rows in set (0.01 sec)
    ```

!!! note
    在表中使用 SEQUENCE 时，需要注意 `auto_increment` 与 `sequence` 不能一起用，否则会报错。

## **示例**

```sql
-- 创建了一个名为 "seq_id" 的序列，它从 1 开始，每次增加 1，最大值为 1000：
CREATE SEQUENCE seq_id INCREMENT BY 1 MAXVALUE 1000 START with 1;
-- 在创建序列之后，可以使用 NEXTVAL 函数获取下一个序列值，如下所示：
mysql> SELECT NEXTVAL('seq_id');
+-----------------+
| nextval(seq_id) |
+-----------------+
| 1               |
+-----------------+
1 row in set (0.02 sec)
-- 此命令将返回序列中的下一个值（例如 1），并自动将序列的计数器增加 1。

-- CURRVAL 函数返回当前值。
mysql> SELECT CURRVAL('seq_id');
+-----------------+
| currval(seq_id) |
+-----------------+
| 1               |
+-----------------+
1 row in set (0.01 sec)

-- 返回当前会话中，最近一次用 NEXTVAL 获取的任何序列的值。
mysql> SELECT LASTVAL();
+-----------+
| lastval() |
+-----------+
| 1         |
+-----------+
1 row in set (0.00 sec)

-- 设置当前值为 30。
mysql> SELECT SETVAL('seq_id', 30);
+--------------------+
| setval(seq_id, 30) |
+--------------------+
| 30                 |
+--------------------+
1 row in set (0.02 sec)

-- NEXTVAL 函数获取下一个序列值。
mysql> SELECT NEXTVAL('seq_id');
+-----------------+
| nextval(seq_id) |
+-----------------+
| 31              |
+-----------------+
1 row in set (0.00 sec)
```
