# SQL 模式

sql_mode 是 MatrixOne 中的一个系统参数，用于指定 MatrixOne 执行查询和操作的模式。sql_mode 可以影响 MatrixOne 的语法和语义规则，从而改变  MatrixOne 查询 SQL 的行为。在本篇文章中，将为你介绍 sql_mode 的作用、常见模式以及如何设置 sql_mode。

## 为什么要设置 sql_mode

sql_mode 可以控制MatrixOne的行为，包括如何处理 NULL 值、如何执行插入操作、如何排序和比较字符串等。它可以确保严格执行 SQL 标准，避免不符合标准的行为。此外，sql_mode 还可以帮助开发人员更好地排除 SQL 语句的错误和潜在问题。

## sql_mode 默认模式

sql_mode 常见的模式如下，在 MatrixOne 中也是默认的模式：

- `ONLY_FULL_GROUP_BY`：`GROUP BY` 子句用于对查询结果进行分组，并对每个组执行聚合计算，例如 `COUNT`、`SUM`、`AVG` 等。在 `GROUP BY` 子句中，指定的列是用于分组的列。而在 `SELECT` 列表中，可以指定其他列，这些列可以是聚合函数或非聚合函数列。在没有 `ONLY_FULL_GROUP_BY` 模式的情况下，如果在 `SELECT` 列表中指定了非聚合函数列，MatrixOne 会默认选择任意一个与 `GROUP BY` 列匹配的值，并将其用于计算聚合函数。

   !!! note
       如果你的表结构复杂，为了便于查询，你可以选择将 `ONLY_FULL_GROUP_BY` 模式关闭。

- `STRICT_TRANS_TABLES`：在执行 `INSERT` 和 `UPDATE` 语句时，如果数据不符合表定义的规则，则会报错。

- `NO_ZERO_IN_DATE`：禁止 在 `DATE` 或` DATETIME` 类型的字段中插入零值。

- `NO_ZERO_DATE`：禁止将 `0000-00-00` 作为日期或日期时间类型的字段值进行插入或更新操作，如果执行这样的操作，将会报错。该模式的作用是避免在日期或日期时间字段中插入无效或非法的值，强制要求使用有效的日期或日期时间值。需要注意的是，`NO_ZERO_DATE` 模式只对插入或更新操作有效，对于已经存在的 `0000-00-00` 值，可以继续查询和使用。

- `ERROR_FOR_DIVISION_BY_ZERO`：在执行除零操作时抛出错误。

- `NO_ENGINE_SUBSTITUTION`：该模式在执行 `ALTER TABLE` 或 `CREATE TABLE` 语句时，如果指定的存储引擎不可用或不存在，则会报错，而不是自动替换为另一个可用的存储引擎。该模式的作用是强制要求使用指定的存储引擎，防止出现数据不一致或性能问题。如果需要允许自动替换存储引擎，可以将该模式从 sql_mode 中移除或设置为其他支持的 sql_mode 模式。需要注意的是，该模式只对 `ALTER TABLE` 或 `CREATE TABLE` 语句有效，对于已经存在的表，其存储引擎不受 sql_mode 的影响。

## sql_mode 的可选模式

- ANSI：ANSI 是一种标准的 SQL 语言规范，由 ANSI（美国国家标准学会）制定。在 ANSI 模式下，SQL 语句必须符合 ANSI SQL 标准，这意味着你不能使用特定于某个数据库的 SQL 语言扩展或特性。

- ALLOW_INVALID_DATES：ALLOW_INVALID_DATES 在 MatrixOne SQL 模式中被称为“宽松模式”（loose mode）。在 ALLOW_INVALID_DATES 模式下，MatrixOne 允许插入一些在标准日期格式中是无效的日期，如 '0000-00-00' 或 '2000-00-00'。此模式是为了兼容一些早期版本的 MySQL 和非标准的日期格式而存在的。需要注意的是，在 ALLOW_INVALID_DATES 模式下插入无效日期可能会导致一些意外的行为，因为无效的日期不会被正确地处理。因此，建议始终使用标准日期格式。

- ANSI_QUOTES：ANSI_QUOTES 是 SQL 模式中的严格模式（strict mode），用于更加严格地执行 SQL 标准。在 ANSI_QUOTES 模式下，MatrixOne 将双引号视为标识符引号，而不是字符串引号。这意味着，如果你想使用双引号引用一个标识符（如表名或列名），你必须使用双引号，而不是单引号。例如，以下 SQL 语句是在 ANSI_QUOTES 模式下正确的：

   ```sql
   SELECT "column_name" FROM "table_name";
   ```

   而在默认的 SQL 模式下，使用双引号将会被解释为字符串引号，导致错误的语法。因此，如果你需要使用双引号引用标识符，你需要将 MatrixOne 设置为 ANSI_QUOTES 模式。

   需要注意的是，使用 ANSI_QUOTES 模式可能会导致与其他数据库系统的 SQL 语法不兼容，因为大多数其他数据库系统使用双引号作为字符串引号，而不是标识符引号。因此，在编写可移植的 SQL 语句时，应该谨慎使用 ANSI_QUOTES 模式。

- HIGH_NOT_PRECEDENCE：HIGH_NOT_PRECEDENCE 在 MatrixOne SQL 模式中被称为“高优先级 NOT 操作符”（high-priority NOT operator）模式。在 HIGH_NOT_PRECEDENCE 模式下，MatrixOne 将 NOT 操作符视为高优先级操作符，即它的优先级高于其他大多数操作符。这意味着，如果你在一个 SQL 语句中同时使用了 NOT 操作符和其他操作符，MatrixOne 会首先计算 NOT 操作符的结果，然后再计算其他操作符的结果。例如：

   ```sql
   SELECT * FROM table WHERE NOT column = 1 AND column2 = 'value';
   ```

   在 HIGH_NOT_PRECEDENCE 模式下，MatrixOne 会先计算 NOT column = 1 的结果，再计算 column2 = 'value' 的结果。如果 NOT 操作符没有被正确地放置在语句中，可能会导致产生意外结果。

   需要注意的是，在 MatrixOne 的默认 SQL 模式中，NOT 操作符的优先级与其他操作符相同。如果你需要使用 HIGH_NOT_PRECEDENCE 模式，请确保你的 SQL 语句中正确地使用了括号来明确优先级。

- IGNORE_SPACE：IGNORE_SPACE 在 MatrixOne SQL 模式中被称为“忽略空格”（ignore space）模式。在 IGNORE_SPACE 模式下，MatrixOne 将忽略 SQL 语句中的多个空格或制表符，而只将一个空格或制表符视为分隔符。这意味着，在 IGNORE_SPACE 模式下，以下两个 SQL 语句是等效的：

   ```sql
   SELECT * FROM my_table;
   SELECT*FROM my_table;
   ```

   这种模式的作用在于，使得 SQL 语句在书写时更加灵活，可以在各个关键字之间添加任意数量的空格或制表符，从而提高可读性。不过需要注意的是，在某些情况下，这种模式可能会导致意外的行为，例如当空格或制表符被错误地放置在 SQL 函数或列名中时，可能会导致语法错误。

   默认情况下，MatrixOne 不启用 IGNORE_SPACE 模式。如果需要启用该模式，可以在连接 MatrixOne 时使用 SQL 命令 SET sql_mode='IGNORE_SPACE' 来开启。

- NO_AUTO_VALUE_ON_ZERO：NO_AUTO_VALUE_ON_ZERO 在 MatrixOne SQL 模式中被称为“禁止自动增量列为0”（no auto value on zero）模式。在 NO_AUTO_VALUE_ON_ZERO 模式下，当你向一个自动增量列插入值为 0 的数据时，MatrixOne 不会将该值视为自动增量值，而是将其视为普通的 0 值。这意味着，如果你向一个自动增量列插入值为0的数据，在 NO_AUTO_VALUE_ON_ZERO 模式下，该列的值不会自动增加，而是保持为 0。例如，以下 SQL 语句在 NO_AUTO_VALUE_ON_ZERO 模式下不会将 id 列自动增量：

   ```sql
   CREATE TABLE my_table (
     id INT(11) NOT NULL AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     PRIMARY KEY (id)
   );

   INSERT INTO my_table (id, name) VALUES (0, 'John');
   ```

   在默认的 SQL 模式下，当你向一个自动增量列插入值为 0 的数据时，MatrixOne 会将该值视为自动增量值，自动将其增加为下一个可用的自动增量值。但是，在某些情况下，这可能不是你想要的行为，因此可以使用 NO_AUTO_VALUE_ON_ZERO 模式来禁止该行为。

   需要注意的是，如果你使用 NO_AUTO_VALUE_ON_ZERO 模式，插入值为0的数据可能会导致主键重复或唯一键冲突的问题。因此，在插入数据时需要格外注意。

- NO_BACKSLASH_ESCAPES：NO_BACKSLASH_ESCAPES 在 MatrixOne SQL 模式中被称为“禁止反斜杠转义”（no backslash escapes）模式。在 NO_BACKSLASH_ESCAPES 模式下，MatrixOne 不会将反斜杠视为转义符号。这意味着，在 SQL 语句中，你不能使用反斜杠来转义特殊字符，例如引号或百分号。相反，如果你需要在 SQL 语句中使用这些特殊字符，需要使用其他方式来转义它们，例如使用单引号来表示字符串中的双引号。例如，在 NO_BACKSLASH_ESCAPES 模式下，以下 SQL 语句会导致语法错误：

   ```sql
   SELECT 'It's a nice day' FROM my_table;
   ```

   在默认的 SQL 模式下，MatrixOne 允许使用反斜杠来转义特殊字符，因此可以在 SQL 语句中使用反斜杠来转义引号、百分号等字符。但是，在某些情况下，使用反斜杠转义可能会导致混淆或错误的结果，因此可以使用 NO_BACKSLASH_ESCAPES 模式来禁止该行为。

   需要注意的是，如果你使用 NO_BACKSLASH_ESCAPES 模式，需要使用其他方式来转义特殊字符，这可能会使 SQL 语句变得更加复杂和难以理解。因此，在使用该模式时需要仔细考虑。

- NO_DIR_IN_CREATE：NO_DIR_IN_CREATE 在 MatrixOne SQL 模式中被称为“禁止在CREATE TABLE中使用目录路径”（no directory in create）模式。在 NO_DIR_IN_CREATE 模式下，当你在 CREATE TABLE 语句中使用目录路径时，MatrixOne 会报错。目录路径指的是在列定义中使用的包含文件名的路径，例如：

   ```sql
   CREATE TABLE my_table (
     id INT(11) NOT NULL AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     datafile '/var/lib/MatrixOne/my_table_data.dat',
     PRIMARY KEY (id)
   );
   ```

   在上面的 SQL 语句中，datafile 列定义了一个包含文件名的路径，指定了存储表数据的文件。在 NO_DIR_IN_CREATE 模式下，MatrixOne 不允许在 CREATE TABLE 语句中使用这种目录路径，而需要将文件路径和文件名分开定义，例如：

   ```sql
   CREATE TABLE my_table (
     id INT(11) NOT NULL AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     datafile VARCHAR(255) NOT NULL,
     PRIMARY KEY (id)
   ) DATA DIRECTORY '/var/lib/MatrixOne/' INDEX DIRECTORY '/var/lib/MatrixOne/';
   ```

   在上面的 SQL 语句中，datafile 列仅定义了文件名，而文件路径则在 CREATE TABLE 语句的 DATA DIRECTORY 和 INDEX DIRECTORY 子句中分别定义。

   需要注意的是，NO_DIR_IN_CREATE 模式不影响已经创建的表中的列定义，只影响 CREATE TABLE 语句中的列定义。因此，在使用该模式时需要仔细考虑，以确保你的 SQL 语句符合该模式的要求。

- NO_UNSIGNED_SUBTRACTION：NO_UNSIGNED_SUBTRACTION 在 MatrixOne SQL 模式中被称为“禁止无符号数减法”（no unsigned subtraction）模式。

   在 NO_UNSIGNED_SUBTRACTION 模式下，当你使用减法运算符 (-) 对无符号整数进行减法运算时，MatrixOne 会将结果视为有符号整数，而不是无符号整数。这意味着，如果无符号整数的值小于减数，结果将是负数，而不是无符号整数。例如：

   ```sql
   SET SQL_MODE = 'NO_UNSIGNED_SUBTRACTION';
   SELECT CAST(1 AS UNSIGNED) - CAST(2 AS UNSIGNED);
   ```

   在上面的 SQL 语句中，NO_UNSIGNED_SUBTRACTION 模式将 CAST(1 AS UNSIGNED) - CAST(2 AS UNSIGNED) 视为有符号整数运算，因此结果为 -1，而不是无符号整数运算的结果 4294967295。

   需要注意的是，NO_UNSIGNED_SUBTRACTION 模式只影响使用减法运算符 (-) 进行减法运算的无符号整数，其他使用无符号整数的运算不受影响。如果你需要在 MatrixOne 中进行大量的无符号整数运算，建议在代码中使用合适的类型转换来避免潜在的错误。

- PAD_CHAR_TO_FULL_LENGTH ：PAD_CHAR_TO_FULL_LENGTH 在 MatrixOne SQL 模式中被称为“使用全字符集填充 CHAR 列”（pad CHAR to full length）模式。

   在 PAD_CHAR_TO_FULL_LENGTH 模式下，当你定义 CHAR 类型的列时，MatrixOne 会在该列的值后面使用空格填充，以使该值的长度达到该列定义的长度。这是因为在 MatrixOne 中，CHAR 类型的列在存储时总是占用定义的长度，不足部分会使用空格填充。但是，在默认情况下，MatrixOne 使用的字符集可能是多字节字符集，因此如果填充的字符是空格，可能会导致长度计算错误。

   在 PAD_CHAR_TO_FULL_LENGTH 模式下，MatrixOne 使用字符集的最大字符长度来填充 CHAR 类型的列，以确保占用的长度和定义的长度一致。这可以避免使用多字节字符集时计算长度错误的问题，但是也会增加存储空间的使用。

   需要注意的是，PAD_CHAR_TO_FULL_LENGTH 模式只影响 CHAR 类型的列，不影响其他类型的列。如果你需要在 MatrixOne 中使用 CHAR 类型的列，并且在多字节字符集下需要正确计算列值的长度，可以考虑使用 PAD_CHAR_TO_FULL_LENGTH 模式。

- PIPES_AS_CONCAT：PIPES_AS_CONCAT 在 MatrixOne SQL 模式中被称为“管道符作为字符串连接符”（pipes as concatenation）模式。在 PIPES_AS_CONCAT 模式下，MatrixOne 将竖线符号（|）视为字符串连接符，而不是位运算符。这意味着，如果你使用竖线符号连接两个字符串，MatrixOne 会将它们连接为一个字符串，而不是将它们看作是二进制位的运算。

   例如，以下 SQL 语句在默认模式下会返回错误，因为 MatrixOne 将竖线符号视为位运算符：

   ```sql
   SELECT 'abc' | 'def';
   ```

   但是，如果将 SQL 模式设置为 PIPES_AS_CONCAT，则上面的 SQL 语句将返回字符串 'abcdef'。

   需要注意的是，如果你使用的 SQL 语句中包含竖线符号并且需要将其视为位运算符，请不要使用 PIPES_AS_CONCAT 模式。反之，如果你需要将竖线符号视为字符串连接符，请使用 PIPES_AS_CONCAT 模式。

- REAL_AS_FLOAT：REAL_AS_FLOAT 在 MatrixOne SQL 模式中被称为“将 REAL 类型视为 FLOAT 类型”（real as float）模式。

   在 REAL_AS_FLOAT 模式下，MatrixOne 将 REAL 类型的数据视为 FLOAT 类型的数据。这意味着，MatrixOne 将使用 FLOAT 类型的存储格式来存储 REAL 类型的数据，而不是使用更精确但也更占用空间的 DOUBLE 类型的存储格式。

   需要注意的是，由于 FLOAT 类型的数据存储格式比 DOUBLE 类型的数据占用更少的空间，因此在某些情况下，将 REAL 类型的数据视为 FLOAT 类型的数据可以节省存储空间。但是，这样做也会降低数据的精度，因为 FLOAT 类型的数据只能提供大约 7 位有效数字的精度，而 DOUBLE 类型的数据可以提供大约 15 位有效数字的精度。

   如果你需要在 MatrixOne 中存储精度较高的浮点数数据，建议不要使用 REAL_AS_FLOAT 模式，并使用 DOUBLE 类型的数据来存储。如果你对数据精度要求不高，可以考虑使用 REAL_AS_FLOAT 模式来节省存储空间。

- STRICT_ALL_TABLES：STRICT_ALL_TABLES 在 MatrixOne SQL 模式中被称为“启用严格模式”（strict all tables）模式。在 STRICT_ALL_TABLES 模式下，MatrixOne 启用了一系列的严格性检查，以确保插入、更新和删除操作符合数据类型、NULL 值和外键等约束。具体来说，STRICT_ALL_TABLES 模式会执行以下操作：

   拒绝将非法值插入到任何列中。
   拒绝将 NULL 值插入到非允许 NULL 的列中。
   拒绝将超出允许范围的值插入到任何列中。
   拒绝将字符串插入到数字类型的列中。
   拒绝将日期或时间字符串插入到非日期或时间类型的列中。
   拒绝将超出列定义长度的值插入到 CHAR、VARCHAR 和 TEXT 类型的列中。
   拒绝将具有不匹配数据类型的值插入到外键列中。

   需要注意的是，启用严格模式可能会导致一些旧的应用程序出现问题，因为它们可能假定 MatrixOne 不会执行强制性的约束检查。如果你在更新或迁移应用程序时遇到问题，请考虑禁用严格模式或修改应用程序以符合严格模式的要求。

- TIME_TRUNCATE_FRACTIONAL：TIME_TRUNCATE_FRACTIONAL 在 MatrixOne SQL 模式中被称为“截断时间的小数部分”（time truncate fractional）模式。在 TIME_TRUNCATE_FRACTIONAL 模式下，MatrixOne 将截断 TIME、DATETIME 和 TIMESTAMP 类型的数据中的小数部分，只保留整数部分。这意味着，如果你将一个带有小数部分的时间数据插入到一个 TIME、DATETIME 或 TIMESTAMP 类型的列中，MatrixOne 会将小数部分截断，并将其设置为 0。

   需要注意的是，启用 TIME_TRUNCATE_FRACTIONAL 模式可能会导致一些数据的精度丢失，因为截断小数部分可能会丢失一些关键的时间信息。如果你需要存储和操作精确的时间数据，建议不要使用 TIME_TRUNCATE_FRACTIONAL 模式。

- TRADITIONAL：TRADITIONAL 是 MatrixOne SQL 模式中的一种模式，它被称为“传统模式”（traditional）模式。在 TRADITIONAL 模式下，MatrixOne 启用了一系列的严格性检查，以确保插入、更新和删除操作符合 SQL 标准的约束。具体来说，TRADITIONAL 模式会执行以下操作：

   启用了 STRICT_TRANS_TABLES 和 STRICT_ALL_TABLES 模式。
   拒绝在 INSERT 语句中省略列名，这样可以确保所有列都被明确地赋值。
   拒绝将具有不明确数据类型的值插入到外键列中。
   拒绝将字符串插入到数字类型的列中。
   拒绝将日期或时间字符串插入到非日期或时间类型的列中。
   拒绝将超出列定义长度的值插入到 CHAR、VARCHAR 和 TEXT 类型的列中。
   拒绝在 GROUP BY 子句中使用非聚合列。
   拒绝在 SELECT 语句中使用未列出的非聚合列。

   需要注意的是，启用传统模式可能会导致一些旧的应用程序出现问题，因为它们可能假定 MatrixOne 不会执行强制性的约束检查。如果你在更新或迁移应用程序时遇到问题，请考虑禁用传统模式或修改应用程序以符合传统模式的要求。

## 如何设置 sql_mode

可以使用 `SET` 语句来设置 sql_mode，例如：

```sql
SET sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ONLY_FULL_GROUP_BY';
```

也可以在 MatrixOne 的配置文件中设置 sql_mode，例如：

```
sql_mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,ONLY_FULL_GROUP_BY
```

在以上设置示例中，MatrixOne 将使用 `STRICT_TRANS_TABLES`、`NO_ZERO_IN_DATE` 和 `ONLY_FULL_GROUP_BY` 模式。

## 限制

MatrixOne 为兼容 MySQL，当前对于本章节所介绍的 sql_mode 的所有模式仅实现语法支持。
