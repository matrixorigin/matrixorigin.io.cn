# UUID 类型

UUID 是一种通用唯一标识符，它由 32 位十六进制数字以及 4 位连字符组成。UUID 具有全局的唯一性，而不是数据库中的唯一性，即使是在两个未连接的独立运行的设备上执行 UUID 调用，预计会生成两个不同的值。UUID 常常被用来为对应行生成的一个随机值，以确保每条记录的唯一性。UUID 适合在集群环境中作为唯一标识符。

!!! info
    尽管 `UUID()` 值唯一，但它们并非是不可猜测或不可预测的。如果需要不可预测性，则应以其他方式生成 UUID 值。

`UUID()` 返回一个符合 [RFC 4122](http://www.ietf.org/rfc/rfc4122.txt) 标准的版本 1 UUID 的值，为 128 位数字，它表示是一个 utf8mb3 由五个十六进制数字组成的字符串，即 aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee，格式解释如下：

- 前三个数字是从时间戳的低、中和高部分生成的。高位部分还包括 UUID 版本号。

- 第四个数字保留时间唯一性，以防时间戳值失去单一性（例如，夏令时）。

- 第五个数字是空间唯一性的 IEEE 802 节点号。如果后者不可用（例如，因为主机设备没有以太网卡，或者不知道如何在主机操作系统上找到接口的硬件地址），则用随机数代替。在这种情况下，无法保证空间唯一性。然而，第五位数字重合的概率很低。

**UUID 类型支持的 SQL 语句**：

- **DDL - `CREATE` 语句**：可以创建具有 UUID 类型字段的表。
- **DML - `INSERT`/`UPDATE`/`DELETE` 语句**：允许对 UUID 类型的数据进行插入、更新和删除操作。
- **DQL - `SELECT` 语句**：可以查询 UUID 类型字段，查询结果在客户端以字符串形式展示。

**UUID 类型支持的 SQL 语句子句**：

- **`ORDER BY` 子句**：UUID 类型字段可以用作排序条件。
- **`WHERE` 子句**：UUID 类型字段可以用在 `WHERE` 子句中，支持比较操作。
- **`HAVING` 子句**：UUID 类型字段可以用在 `HAVING` 子句中，支持比较操作。
- **`GROUP BY` 子句**：UUID 类型字段可以用作 `GROUP BY` 的分组条件。

**其他支持的 UUID 类型功能**：

- UUID 类型字段可以设置为表的主键。
- UUID 类型字段可以作为聚合函数（如 max, min, count）的参数。
- UUID 类型数据可在字符串类型之间进行转换。

## 示例解释

- 示例 1

```sql
mysql> select uuid();
+--------------------------------------+
| uuid()                               |
+--------------------------------------+
| 4aa4f4de-1b00-11ee-b656-5ad2460dea50 |
+--------------------------------------+
1 row in set (0.00 sec)
```

- 示例 2

```sql
drop table if exists t1;
-- 创建一个新的表 't1'，包含两个列 'a' 和 'b'，列 'a' 的类型为 INT，列 'b' 的类型为 float
create table t1(a INT,  b float);

-- 向表 't1' 插入两行数据
insert into t1 values(12124, -4213.413), (12124, -42413.409);

-- 查询 't1' 表的行数，并生成每一行的 uuid() 函数的长度，注意这里 uuid() 函数生成的是一个新的 UUID，
-- 不依赖于 't1' 表的任何数据，返回的长度为 36，因为 UUID 是一个包含 32 个字符和 4 个短划线的 36 个字符的字符串
mysql> SELECT length(uuid()) FROM t1;

+----------------+
| length(uuid()) |
+----------------+
|             36 |
|             36 |
+----------------+
2 rows in set (0.00 sec)
```

- 示例 3

```sql
-- 创建一个名为 't1' 的表，其中包含一个名为 'a' 的列，数据类型为 VARCHAR，最大长度为 20
create table t1(a varchar(20));

-- 在 't1' 表中插入一行数据， 'a' 列的值为 '123123sdafsdf'
insert into t1 values('123123sdafsdf');

-- 从 't1' 表中选择所有的行，并返回每一行的 'a' 列的值，以及一个新生成的 UUID 值
mysql> select uuid(),a from t1;
+--------------------------------------+---------------+
| uuid()                               | a             |
+--------------------------------------+---------------+
| 664f1a96-1981-11ee-a041-5ad2460dea50 | 123123sdafsdf |
+--------------------------------------+---------------+
1 row in set (0.01 sec)
```

- 示例 4：

```sql
-- 创建名为 namelists 的表，包含 id 和 name 两个字段
CREATE TABLE namelists (
    id UUID DEFAULT uuid() PRIMARY KEY, -- id 字段是 UUID 类型，默认值为 uuid() 函数生成的 UUID 值，作为主键
    name VARCHAR NOT NULL -- name 字段是 VARCHAR 类型，不能为空
);
INSERT INTO namelists (name) VALUES ('Tom'), ('Jane'), ('Bob');
mysql> select * from namelists;
+--------------------------------------+--------+
| id                                   | name   |
+--------------------------------------+--------+
| 61400e9c-1bbc-11ee-b512-5ad2460dea50 | Tom    |
| 61400ea6-1bbc-11ee-b512-5ad2460dea50 | Jane   |
| 61400ea6-1bbc-11ee-b513-5ad2460dea50 | Bob    |
+--------------------------------------+--------+
3 rows in set (0.00 sec)
```
