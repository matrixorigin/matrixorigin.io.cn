# SQL 常见问题

## 基本功能相关

**MatrixOne 对标识符大小写敏感吗？**

MatrixOne 默认对标识符大小写不敏感，并支持通过 lower_case_table_names 参数来进行大小写敏感的支持，对于参数的详细介绍可参见[大小写敏感支持](../Reference/Variable/system-variables/lower_case_tables_name.md)

 **MatrixOne 支持哪些 SQL 语句？**

MatrixOne 目前支持的 SQL 语句可以参考 [SQL 语句的分类](../Reference/SQL-Reference/SQL-Type.md)。

**MatrixOne 支持哪些数据类型？**

MatrixOne 目前支持常用的整型，浮点数，字符串，时间日期，布尔，枚举，二进制，JSON 类型，请参考[数据类型概览](../Reference/Data-Types/data-types.md)。

**MatrixOne 支持什么类型的字符集？**

MatrixOne 默认支持 UTF-8 字符集，且目前只支持 UTF-8。

**MatrixOne 支持哪些约束和索引？**

MatrixOne 目前支持主键 (Primary Key), 唯一 (Unique Key), 非空 (Not Null)，外键 (Foreign Key)，自增约束 (Auto Increment) 及次级索引（Secondary Index）。次级索引目前仅实现语法支持，没有加速作用。
另外 MatrixOne 还提供了针对无主键表的排序键 (Cluster by), 它可以帮助我们提前针对需要查询的列进行排序，加速查询。

 **MatrixOne 支持哪些查询类型？**

MatrixOne 支持大部分常用 SQL 查询：

基础查询：支持常见的分组，去重，过滤，排序，限定，正则表达式等基础查询能力。

高级查询：支持视图，子查询，联接，组合，公共表表达式（CTE），窗口函数，Prepare 预处理等高级查询能力。

聚合函数：支持常见的 AVG，COUNT，MIN，MAX，SUM 等聚合函数。

系统函数及操作符：支持常见的字符串，日期时间，数学函数及常见操作符。

**MatrixOne 有哪些保留关键字？**

MatrixOne 的保留关键字列表可参见[关键字](../Reference/Language-Structure/keywords.md)。

将保留关键字作为标识符使用时，必须使用反引号包裹，否则将产生报错。将非保留关键字作为标识符使用时，可以直接使用，无需使用反引号包裹。

**MatrixOne 支不支持物化视图？**

MatrixOne 目前不支持物化视图，在目前的 AP 性能支撑下，直接进行分析也可以获得较高的分析体验。物化视图功能也已经在 MatrixOne 的 Roadmap 中，如果您对物化视图有刚性较高的需求，欢迎给我们提 Issue 来描述您的场景：<https://github.com/matrixorigin/matrixone/issues>

 **MatrixOne 支不支持 Geometry？**

目前还不支持，后续会支持。

**MatrixOne 中的函数和关键字是否区分大小写？**

不区分大小写。在 MatrixOne 中，只有一种情况需要区分大小写：如果你创建的表和属性带有 \`\`，\`\` 中的名称需要注意大小写。查询这个表名或属性名，那么表名和属性名也需要被包含在\`\`里。

**MatrixOne 是否支持事务？支持的事务隔离级别是什么？**

MatrixOne 支持 ACID（原子性、一致性、隔离性、持久性）的事务能力，支持悲观和乐观事务，默认使用悲观事务。使用悲观事务的时候会采用 Read Committed 隔离级别，切换成乐观事务的时候会采用 Snapshot Isolation 隔离级别。

**MatrixOne 中的函数和关键字是否区分大小写？**

不区分大小写。在 MatrixOne 中，只有一种情况需要区分大小写：如果你创建的表和属性带有 \`\`，\`\` 中的名称需要注意大小写。查询这个表名或属性名，那么表名和属性名也需要被包含在\`\`里。

## 数据导入/导出相关

**如何将数据导入到 MatrixOne 中？**

MatrixOne 支持与 MySQL 相同的 [`INSERT`](../Develop/import-data/insert-data.md) 数据插入语句，可以通过 `INSERT` 进行实时数据写入，同时也支持 [`LOAD DATA`](../Develop/import-data/bulk-load/bulk-load-overview.md) 的离线批量导入语句。

**如何将数据从 MatrixOne 导出到文件？**

在 MatrixOne 中，你可以使用 [`mo-dump`](../Develop/export-data/modump.md) 这个二进制工具把数据导出成 SQL 或者 csv 文件，或者使用 [`SELECT INTO`](../Develop/export-data/select-into-outfile.md) 导出 `csv` 文件。

 **如何通过 mo-dump 工具只导出表结构？**

可以在导出命令后加-no-data 参数，指定不导出数据。

**使用 load data 导入的 json 对象中缺少某些字段，导入会报错吗？**

会报错，导入 json 中，字段多于表中字段，可以正常导入，不过多出字段会被忽略，如果少于的话，则无法导入。

**在执行 source 导入的时候导入文件是否可以写相对路径？**

可以，但是是相对于您使用 mysql 客户端的当前路径，防止出错，还是建议写全路径，另需注意文件权限问题。

**使用 load data 命令导入一个大文件时比较耗时，能否优化呢？**

您可以在导入时候指定 PARALLEL 为 true 开启并行导入，例如，对于 2 个 G 的大文件，使用两个线程去进行加载，第 2 个线程先拆分定位到 1G 的位置，然后一直往后读取并进行加载。这样就可以做到两个线程同时读取大文件，每个线程读取 1G 的数据。也可以自己切分数据文件。

 **load data 导入有事务吗？**

所有的 load 语句都是有事务的。

**source 导入 sql 时涉及触发器和存储过程会执行生效吗？**

目前如果 sql 中存在不兼容的数据类型、触发器、函数或存储过程，仍需要手动修改，否则执行会报错。

**mo-dump 支持批量导出多个数据库吗？**

目前仅支持导出单个数据库的备份，如果你有多个数据库需要备份，需要手动运行 mo-dump 多次。

**MatrixOne 支持从 Minio 导入数据吗？**

是支持的，load data 命令支持从本地文件、S3 对象存储服务以及 S3 兼容的对象存储服务中导入数据到 matrixone 中，
而 Minio 也是基于 S3 协议的，所以也是支持的，详情参见[本地对象存储导入数据](https://docs.matrixorigin.cn/1.1.2/MatrixOne/Deploy/import-data-from-minio-to-mo/)

**MatrixOne 导入导出数据时，如果出现编码问题，导致数据乱码，我们一般是怎么解决的**

由于 matrixone 默认只支持 UTF8 这一种编码且无法更改，所以在导入数据时如果出现了乱码，我们就不能通过修改数据库和表的字符集来解决，可以试着转换数据编码为 UTF8。常见的转换工具有 iconv 和 recode，比如：将 GBK 编码的数据转换为 UTF-8 编码：iconv -f GBK -t UTF8 t1.sql > t1_utf8.sql。

**MatrixOne 导入导出时，需要哪些权限？**

如果是租户管理员的话，通过默认角色可以直接进行导入、导出操作。普通用户的话，导入时，需要导入表的 'insert' 权限；select...into outfile 方式导出时，需要导出表的 'select' 权限；mo-dump 导出时，需要所有表 (table*.*) 的 'select' 权限和所有库 (database*.*) 的 'show tables' 权限。

## 权限相关

**普通用户能授予 MOADMIN 角色吗？**

不可以的，MOADMIN 为最高的集群管理员权限，只有 root 用户拥有。

## 其它

**MatrixOne 中的 `sql_mode` 是什么？**

  MatrixOne 默认的 `sql_mode` 是 MySQL 中的 `only_full_group_by`。因此默认查询语法中所有 `select` 的字段，除聚合函数中的字段，都必须在 `group by` 中出现。但是 MatrixOne 也支持修改 `sql_mode` 以兼容不完全规范的 `group by` 语法。

**MatrixOne 中 show tables 无法查看临时表，如何查看是否创建成功？**

目前可以通过 "show create table 临时表名" 来查看，由于临时表在创建后只在当前会话可见，在当前会话结束时，数据库自动删除临时表并释放所有空间，在它的生命周期内我们通常是可以人为感知的。

**如何查看我的 Query 执行计划？**

  要查看 MatrixOne 对给定查询的执行情况，可以使用 [`EXPLAIN`](../Reference/SQL-Reference/Other/Explain/explain.md) 语句，它将打印出查询计划。

  ```
  EXPLAIN SELECT col1 FROM tbl1;
 ```
