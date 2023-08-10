# ENUM 类型

`ENUM` 是一个字符串的列表，`ENUM` 用于存储一组预定义的离散值。它可以定义一个具有离散值的类型，每个枚举常量都代表了一个特定的值。

`ENUM` 数据类型列适合存储状态和标识等有限数量的固定值的数据。

`ENUM` 数据类型具有以下优点：

- 列值的可读性更强。
- 紧凑的数据存储。MatrixOne 存储 ENUM 时只存储枚举值对应的数字索引 (1, 2, 3, …)。

## 语法结构

```
ENUM ('value1', 'value2', ..., 'valuen')
```

例如，定义 ENUM 列，你可以使用以下语法：

```sql
CREATE TABLE table_name (
    ...
    col ENUM ('value1','value2','value3'),
    ...
);
```

### 语法解释

- `ENUM` 是一个关键字，用来声明一个枚举类型。
- value1 到 valuen 是此 `ENUM` 类型的可选项列表，使用 ENUM 类型的列的值只能是上面值中的其中一个。
- 枚举值可以是 string、int 或 time 类型。

__Note:__ 在 `ENUM` 数据类型中，你可以拥有多个枚举值。但是，建议将枚举值的数量保持在 20 以下。

## 示例解释

`ENUM` 类型的值必须从一个预定义的值列表中选择，下面的例子将帮助你理解：

```sql
CREATE TABLE enumtable (
    id INT NOT NULL AUTO_INCREMENT,
    color ENUM('red', 'green', 'blue'),
    PRIMARY KEY (id)
);
```

上述语句将创建一个名为 `enumtable` 的表，其中包含一个名为 `color` 的枚举类型字段。`color` 字段的值必须为 `red`、`green` 或 `blue` 中的一个。同时，按照列定义时的顺序，`red`、`green` 和 `blue` 的索引分别为 1，2，3。

### 插入 ENUM 值

当向枚举类型的字段中插入数据时，只能插入预定义的枚举值或者 `NULL`。如果插入的值不在预定义的列表中，则产生报错。例如：

```sql
INSERT INTO enumtable (id, color) VALUES ('01', 'red');
-- 'red' 在预定义的列表中，插入成功
INSERT INTO enumtable (id, color) VALUES ('02', 'yellow');
-- 'yellow' 不在预定义的列表中，则会产生报错
INSERT INTO enumtable (id, color) VALUES ('03', NULL);
-- 枚举成员并没有定义 not null，插入成功
```

除了枚举值，还可以使用枚举成员的数字索引将数据插入到 ENUM 列中。例如：

```sql
INSERT INTO enumtable (id, color) VALUES ('04', 2);
-- 由于 `green` 的索引是 2，所以这条数据插入成功
```

- **非空约束对于 ENUM 的限制**

假如建表时，我们定义了 `color` 列 `NOT NULL`：

```sql
CREATE TABLE enumtable (
    id INT NOT NULL AUTO_INCREMENT,
    color ENUM('red', 'green', 'blue') NOT NULL,
    PRIMARY KEY (id)
);
```

当插入一个新行而不指定 color 列的值时，MatrixOne 将使用第一个枚举成员作为默认值：

```sql
INSERT INTO enumtable (id) VALUES ('05');
-- 这里将给 id 为 05 的列指定第一个枚举成员 `red` 为默认值
```

## 与 MySQL 的差异

与 MySQL 不同的是，MatrixOne 的 ENUM 类型在 WHERE 条件里只能跟字符串类型进行比较。

可以看这个例子：

`update orders set status= 2 where status='Processing';` 

在这个示例中，你需要将 `status` 为 `Processing` 的行的 `status` 更新为2。由于 ENUM 类型的特性，在 WHERE 条件中，MatrixOne 将 2 隐式地转换为字符串 `2`，然后与 `Processing` 进行比较。

!!! note
    以下章节**过滤 ENUM 值**和**排序 ENUM 值**是 MySQL 的 ENUM 特性，MatrixOne 暂不支持。

### 过滤 ENUM 值

在查询数据时，可以使用枚举常量或整数值来筛选数据。例如：

```sql
SELECT * FROM enumtable WHERE color = 'green';
SELECT * FROM enumtable WHERE color = 2;
-- 'green' 在预定义的列表中排在第二位，其对应的整数值为 2
```

### 排序 ENUM 值

MatrixOne 根据索引号对 `ENUM` 值进行排序。因此，枚举成员的顺序取决于它们在枚举列表中的定义方式。

需要注意的是，`ENUM` 类型的值在 SQL 内部被表示为整数值，而非字符串值。因此，在执行查询时，如果使用整数值来筛选数据，则需要将其与枚举常量的整数值进行匹配。

如果你需要按照枚举列进行排序，那么在创建列时按照要排序的顺序定义枚举值。

## 限制

当前修改 ENUM 枚举成员需要使用 `ALTER TABLE` 语句重建表。
