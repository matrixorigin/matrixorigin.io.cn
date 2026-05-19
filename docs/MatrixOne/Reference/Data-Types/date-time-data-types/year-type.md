# YEAR 类型

YEAR 类型是用于表示年份值的 1 字节类型。可以声明为 YEAR，其隐式显示宽度为 4 个字符，或等效地声明为 `YEAR(4)`，显式指定显示宽度为 4。

MatrixOne 以 YYYY 格式显示 YEAR 值，范围从 0001 年到 9999 年。

YEAR 接受各种格式的输入值：

- 作为范围在 '0001' 到 '9999' 之间的 4 位字符串。
- 作为范围在 0001 到 9999 之间的 4 位数字。
- 作为范围在 '0' 到 '99' 之间的 1 位或 2 位字符串。MatrixOne 将范围在 '0' 到 '00' 和之间的值转换为 YEAR 值，自动补全前两位 '00'，即 '0000' ~ '0099'。
- 作为返回在 YEAR 上下文中可接受的值的函数的结果，例如 `NOW()`。

## 日期中的两位数年份

由于日期中的两位数年份缺乏世纪数值，其含义不够明确。为了内部存储的一致性，MatrixOne 必须将这些日期值解释为 4 位数字形式。

对于 DATETIME、DATE 和 TIMESTAMP 类型，MatrixOne 遵循以下规则解释具有不明确年份值的日期：

- 范围 00-99 内的年份值变为 0000-0099。

下面是关于涉及 2 位年份日期的例子：

1. 解释 DATETIME 类型的日期：

假设我们有一个名为 `event_date` 的 DATETIME 类型的列，其中包含以下日期值：

| event_date         |
|--------------------|
| 2023-07-12 08:30   |
| 99-01-15 13:45     |
| 23-05-06 09:00     |

根据规则，日期值中的 2 位年份被解释为：

- 99-01-15 被解释为 0099 年 1 月 15 日。
- 23-05-06 被解释为 0023 年 5 月 6 日。

2. 解释 DATE 类型的日期：

假设我们有一个名为 `birth_date` 的 DATE 类型的列，其中包含以下日期值：

| birth_date         |
|--------------------|
| 95-08-21           |
| 04-11-30           |
| 88-03-17           |

根据规则，日期值中的 2 位年份被解释为：

- 95-08-21 被解释为 0095 年 8 月 21 日。
- 04-11-30 被解释为 0004 年 11 月 30 日。
- 88-03-17 被解释为 0088 年 3 月 17 日。

3. 解释 YEAR 类型的日期：

假设我们有一个名为 `graduation_year` 的 YEAR 类型的列，其中包含以下年份值：

| graduation_year    |
|--------------------|
| 65                 |
| 78                 |
| 03                 |

根据规则，年份值中的 2 位年份被解释为：

- 65 被解释为 0065 年。
- 78 被解释为 0078 年。
- 03 被解释为 0003 年。

## 示例

```
DROP DATABASE IF EXISTS year_demo_db;
CREATE DATABASE year_demo_db;
USE year_demo_db;

-- 创建含 YEAR 列的表
CREATE TABLE t_year (id INT, y YEAR);

-- 插入 4 位数字年份
INSERT INTO t_year VALUES (1, 2024), (2, 1901), (3, 2155), (4, 1970), (5, 2000);

-- 插入 4 位字符串年份
INSERT INTO t_year VALUES (6, '2024'), (7, '1901'), (8, '2155');

-- 插入 2 位字符串年份（'0'-'69' -> 2000-2069, '70'-'99' -> 1970-1999）
INSERT INTO t_year VALUES (9, '0'), (10, '24'), (11, '69');
INSERT INTO t_year VALUES (12, '70'), (13, '99');

-- 特殊值 0 -> 0000
INSERT INTO t_year VALUES (14, 0);

-- NULL 值
INSERT INTO t_year VALUES (15, NULL);

SELECT * FROM t_year ORDER BY id;

-- CAST 类型转换
SELECT CAST(y AS SIGNED) FROM t_year WHERE id = 1;
SELECT CAST(2024 AS YEAR);
SELECT CAST(0 AS YEAR);
SELECT CAST('24' AS YEAR);
SELECT CAST('70' AS YEAR);
SELECT CAST(y AS CHAR(4)) FROM t_year WHERE id = 1;

-- 比较与范围查询
SELECT * FROM t_year WHERE y = 2024 ORDER BY id;
SELECT * FROM t_year WHERE y > 2000 ORDER BY id;
SELECT * FROM t_year WHERE y IS NULL;

-- YEAR(4) 语法（兼容性支持）
CREATE TABLE t_year4 (a YEAR(4) NOT NULL);
DROP TABLE t_year4;

DROP TABLE t_year;
DROP DATABASE year_demo_db;
```
