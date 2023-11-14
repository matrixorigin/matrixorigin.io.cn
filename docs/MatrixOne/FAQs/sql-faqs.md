# **SQL 常见问题**

* **MatrixOne 兼容哪个数据库？**

MatrixOne 在使用上保持对 MySQL 8.0 的高度兼容，包括 SQL 语法，传输协议，操作符与函数等等。与 MySQL 8.0 兼容性的差异列表可以详细参考 [MySQL 兼容性列表](../Overview/feature/mysql-compatibility.md)。

* **MatrixOne 支持哪些 SQL 语句？**

MatrixOne 目前支持的 SQL 语句可以参考[该详细列表](../Reference/SQL-Reference/SQL-Type.md)。

* **MatrixOne 支持哪些数据类型？**

MatrixOne 目前支持常用的整型，浮点数，字符串，时间日期，布尔，枚举，二进制，JSON 类型，请参考[详细列表](../Reference/Data-Types/data-types.md)。

* **MatrixOne 支持什么类型的字符集？**

MatrixOne 默认支持 UTF-8 字符集，且目前只支持 UTF-8。

* **MatrixOne 支持哪些约束和索引？**

MatrixOne 目前支持主键 (Primary Key), 唯一 (Unique Key), 非空 (Not Null)，外键 (Foreign Key)，自增约束 (Auto Increment) 及次级索引（Secondary Index）。次级索引目前仅实现语法支持，没有加速作用。
另外 MatrixOne 还提供了针对无主键表的排序键 (Cluster by), 它可以帮助我们提前针对需要查询的列进行排序，加速查询。

* **MatrixOne 支持哪些查询类型？**

MatrixOne 支持大部分常用 SQL 查询：

基础查询：支持常见的分组，去重，过滤，排序，限定，正则表达式等基础查询能力。

高级查询：支持视图，子查询，联接，组合，公共表表达式（CTE），窗口函数，Prepare 预处理等高级查询能力。

聚合函数：支持常见的 AVG，COUNT，MIN，MAX，SUM 等聚合函数。

系统函数及操作符：支持常见的字符串，日期时间，数学函数及常见操作符。

* **MatrixOne 有哪些保留关键字？**

MatrixOne 的保留关键字列表可参见[该详细列表](../Reference/Language-Structure/keywords.md)。

将保留关键字作为标识符使用时，必须使用反引号包裹，否则将产生报错。将非保留关键字作为标识符使用时，可以直接使用，无需使用反引号包裹。

* **MatrixOne 中的函数和关键字是否区分大小写？**

不区分大小写。

在 MatrixOne 中，只有一种情况需要区分大小写：如果你创建的表和属性带有 \`\`，\`\` 中的名称需要注意大小写。查询这个表名或属性名，那么表名和属性名也需要被包含在\`\`里。

* **如何将数据导入到 MatrixOne 中？**

MatrixOne 支持与 MySQL 相同的 [`INSERT`](../Develop/import-data/insert-data.md) 数据插入语句，可以通过 `INSERT` 进行实时数据写入，同时也支持 [`LOAD DATA`](../Develop/import-data/bulk-load/bulk-load-overview.md) 的离线批量导入语句。

* **如何将数据从 MatrixOne 导出到文件？**

在 MatrixOne 中，你可以使用 [`mo-dump`](../Develop/export-data/modump.md) 这个二进制工具把数据导出成 SQL 或者 csv 文件，或者使用 [`SELECT INTO`](../Develop/export-data/select-into-outfile.md) 导出 `csv` 文件。

* **MatrixOne 是否支持事务？支持的事务隔离级别是什么？**

MatrixOne 支持 ACID（原子性、一致性、隔离性、持久性）的事务能力，支持悲观和乐观事务，默认使用悲观事务。使用悲观事务的时候会采用 Read Committed 隔离级别，切换成乐观事务的时候会采用 Snapshot Isolation 隔离级别。

* **MatrixOne 中的 `sql_mode` 是什么？**

  MatrixOne 默认的 `sql_mode` 是 MySQL 中的 `only_full_group_by`。因此默认查询语法中所有 `select` 的字段，除聚合函数中的字段，都必须在 `group by` 中出现。但是 MatrixOne 也支持修改 `sql_mode` 以兼容不完全规范的 `group by` 语法。

* **如何查看我的 Query 执行计划？**

  要查看 MatrixOne 对给定查询的执行情况，可以使用 [`EXPLAIN`](../Reference/SQL-Reference/Other/Explain/explain.md) 语句，它将打印出查询计划。

  ```
  EXPLAIN SELECT col1 FROM tbl1;
  ```
