# save_query_result 保存查询结果支持

开启 `save_query_result` 后，MatrixOne 会保存查询结果。

对保存查询结果有影响的参数有三个：

- `save_query_result`：开启/关闭保存查询结果。

- `query_result_timeout`：设置保存查询结果的时间。

- `query_result_maxsize`：设置单个查询结果最大值。

## 限制

- 只支持保存带有返回结果的语句，如 `SELECT`, `SHOW`, `DESC`, `EXECUTE` 语句
- 对于 `SELECT` 语句，只保存以 `/* cloud_user */` 和 `/* save_result */` 固定开头的 `SELECT` 语句的结果。

## 开启保存查询结果设置

- 仅对当前会话开启保存查询结果：

```sql
--  默认为 off
set save_query_result = on  
```

- 对全局开启保存查询结果：

```sql
--  默认为 off
set global save_query_result = on  
```

全局开启也可在启动 MatrixOne 之前，修改配置文件 `cn.toml`，插入以下代码并保存：

```
[cn.frontend]
saveQueryResult = "on"  // 默认为 off
```

## 设置保存时间

设置保存时间单位为小时。

- 仅对当前会话开启查询结果保存时间：

```sql
-- 默认为 24
set query_result_timeout = 48
```

- 对全局开启查询结果保存时间：

```sql
-- 默认为 24
set global query_result_timeout = 48
```

全局开启也可在启动 MatrixOne 之前，修改配置文件 `cn.toml`，插入以下代码并保存：

```
[cn.frontend]
queryResultTimeout = 48  // 默认为 24
```

__Note:__ 保存时间如果设置的值比上一次设置的短，不影响之前的保存结果。

## 设置单个查询结果的最大值

设置单个查询结果的最大值单位为 MB。

- 仅对当前会话设置查询结果的最大值：

```sql
-- 默认为 100
set query_result_maxsize = 200
```

- 对全局设置查询结果的最大值：

```sql
-- 默认为 100
set global query_result_maxsize = 200
```

全局开启也可在启动 MatrixOne 之前，修改配置文件 `cn.toml`，插入以下代码并保存：

```
[cn.frontend]
queryResultMaxsize = 200 // 默认为 100
```

__Note:__ 单个查询结果的最大值如果设置的值比上一次设置的小，不影响之前的保存结果大小。

### 查询元数据信息

查询元数据信息可以使用下面的 SQL 语句：

```sql
select * from meta_scan(query_id) as u;
当前 account_id
select query_id from meta_scan(query_id) as u;
```

元数据信息如下：

| 列名         | 类型      | 备注                                                         |
| ------------ | --------- | ------------------------------------------------------------ |
| query_id     | uuid      | 查询结果 ID                          |
| statement    | text      | 执行的 SQL 语句                        |
| account_id   | uint32    | 账户 ID                                                      |
| role_id      | uint32    | 角色 ID                                                       |
| result_path  | text      | 保存查询结果的路径，默认保存路径为 matrixone 文件夹 mo-data/s3，如需修改默认保存的路径，需修改配置文件中的 `data-dir = "mo-data/s3"`。如需查阅配置文件参数说明，参见[通用参数配置](../../System-Parameters/system-parameter.md) |
| created_time | timestamp | 创建时间                                                     |
| result_size  | float     | 结果大小，单位为 MB。 |
| tables       | text      | SQL 所用到的表                       |
| user_id      | uint32    | 用户 ID                                                       |
| expired_time | timestamp | 查询结果的超时时间|
| column_map   | text      | 查询如果有同名的列结果名，result scan 会对列名做重映射       |

## 保存查询结果

你可以将查询结果保存在你的本地磁盘或 S3 中。

### 语法结构

```sql
MODUMP QUERY_RESULT query_id INTO s3_path
     [FIELDS TERMINATED BY 'char']
     [ENCLOSED BY 'char']
     [LINES TERMINATED BY 'string']
     [header 'bool']
     [MAX_FILE_SIZE unsigned_number]
```

- query_id：是 UUID 的字符串。

- s3_path：是查询结果文件保存的路径。默认保存路径为 matrixone 文件夹 mo-data/s3，如需修改默认保存路径，需修改配置文件中的 `data-dir = "mo-data/s3"`。如需查阅配置文件参数说明，参见[通用参数配置](../../System-Parameters/system-parameter.md)

   ```
   root@rootMacBook-Pro 02matrixone % cd matrixone/mo-data
   root@rootMacBook-Pro mo-data % ls
   tn-data         etl             local           logservice-data s3
   ```

   __Note:__ 如果你需要导出 `csv` 文件。路径需要以 `etl:` 开头。

- [FIELDS TERMINATED BY 'char']：可选参数。字段分割符号，默认为单引号 `'`。

- [ENCLOSED BY 'char']：可选参数。字段包括符号，默认为引双号 `“`。

- [LINES TERMINATED BY 'string']：可选参数。行结束符号，默认为换行符号 `\n`。

- [header 'bool']：可选参数。bool 类型可以选择 `true` 或 `false`。`csv` 文件第一行为各个列名的标题行。

- [MAX_FILE_SIZE unsigned_number]：可选参数。文件最大文件大小，单位为 KB。默认为 0。

## 示例

- 示例 1

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> /* cloud_user */select a from t1;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.16 sec)
-- 查询当前会话中最近执行的查询 ID
mysql> select last_query_id();
+--------------------------------------+
| last_query_id()                      |
+--------------------------------------+
| f005ebc6-a3dc-11ee-bb76-26dd28356ef3 |
+--------------------------------------+
1 row in set (0.12 sec)
-- 获取这个查询 ID 的查询结果
mysql> select * from result_scan('f005ebc6-a3dc-11ee-bb76-26dd28356ef3') as t;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)
-- 查看这个查询 ID 的元数据
mysql> select * from meta_scan('f005ebc6-a3dc-11ee-bb76-26dd28356ef3') as t;
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| query_id                             | statement        | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| f005ebc6-a3dc-11ee-bb76-26dd28356ef3 | select a from t1 |          0 |       0 | SHARED:/query_result/sys_f005ebc6-a3dc-11ee-bb76-26dd28356ef3_1.blk | 2023-12-26 18:53:01 | 0.000003814697265625 | t1     |       0 | 2023-12-27 18:53:01 | a -> a    |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
1 row in set (0.01 sec)

-- 将查询结果保存到本地
MODUMP QUERY_RESULT 'f005ebc6-a3dc-11ee-bb76-26dd28356ef3' INTO 'etl:your_local_path';
```

- 示例 2

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> /* save_result */select a from t1;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.02 sec)

mysql> select last_query_id();
+--------------------------------------+
| last_query_id()                      |
+--------------------------------------+
| afc82394-a45e-11ee-bb9a-26dd28356ef3 |
+--------------------------------------+
1 row in set (0.00 sec)

mysql> select * from result_scan('afc82394-a45e-11ee-bb9a-26dd28356ef3') as t;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

mysql> select * from meta_scan('afc82394-a45e-11ee-bb9a-26dd28356ef3') as t;
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| query_id                             | statement        | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| afc82394-a45e-11ee-bb9a-26dd28356ef3 | select a from t1 |          0 |       0 | SHARED:/query_result/sys_afc82394-a45e-11ee-bb9a-26dd28356ef3_1.blk | 2023-12-27 10:21:47 | 0.000003814697265625 | t1     |       0 | 2023-12-28 10:21:47 | a -> a    |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
1 row in set (0.00 sec)
```

- 示例 3

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> show create table t1;
+-------+--------------------------------------------+
| Table | Create Table                               |
+-------+--------------------------------------------+
| t1    | CREATE TABLE `t1` (
`a` INT DEFAULT NULL
) |
+-------+--------------------------------------------+
1 row in set (0.02 sec)

mysql> select * from meta_scan(last_query_id()) as t;
+--------------------------------------+----------------------+------------+---------+---------------------------------------------------------------------+---------------------+-----------------------+--------+---------+---------------------+----------------------------------------------+
| query_id                             | statement            | account_id | role_id | result_path                                                         | create_time         | result_size           | tables | user_id | expired_time        | ColumnMap                                    |
+--------------------------------------+----------------------+------------+---------+---------------------------------------------------------------------+---------------------+-----------------------+--------+---------+---------------------+----------------------------------------------+
| 617647f4-a45c-11ee-bb97-26dd28356ef3 | show create table t1 |          0 |       0 | SHARED:/query_result/sys_617647f4-a45c-11ee-bb97-26dd28356ef3_1.blk | 2023-12-27 10:05:17 | 0.0000858306884765625 |        |       0 | 2023-12-28 10:05:17 | Table -> Table, Create Table -> Create Table |
+--------------------------------------+----------------------+------------+---------+---------------------------------------------------------------------+---------------------+-----------------------+--------+---------+---------------------+----------------------------------------------+
1 row in set (0.00 sec)
```

- 示例 4

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> desc t1;
+-------+---------+------+------+---------+-------+---------+
| Field | Type    | Null | Key  | Default | Extra | Comment |
+-------+---------+------+------+---------+-------+---------+
| a     | INT(32) | YES  |      | NULL    |       |         |
+-------+---------+------+------+---------+-------+---------+
1 row in set (0.03 sec)

mysql> select * from meta_scan(last_query_id()) as t;
+--------------------------------------+-----------+------------+---------+---------------------------------------------------------------------+---------------------+---------------------+------------+---------+---------------------+----------------------------------------------------------------------------------------------------------------+
| query_id                             | statement | account_id | role_id | result_path                                                         | create_time         | result_size         | tables     | user_id | expired_time        | ColumnMap                                                                                                      |
+--------------------------------------+-----------+------------+---------+---------------------------------------------------------------------+---------------------+---------------------+------------+---------+---------------------+----------------------------------------------------------------------------------------------------------------+
| 143a54b6-a45d-11ee-bb97-26dd28356ef3 | desc t1   |          0 |       0 | SHARED:/query_result/sys_143a54b6-a45d-11ee-bb97-26dd28356ef3_1.blk | 2023-12-27 10:10:17 | 0.00016021728515625 | mo_columns |       0 | 2023-12-28 10:10:17 | Field -> Field, Type -> Type, Null -> Null, Key -> Key, Default -> Default, Extra -> Extra, Comment -> Comment |
+--------------------------------------+-----------+------------+---------+---------------------------------------------------------------------+---------------------+---------------------+------------+---------+---------------------+----------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

- 示例 5

```sql
mysql> CREATE TABLE numbers(pk INTEGER PRIMARY KEY, ui BIGINT UNSIGNED, si BIGINT);
Query OK, 0 rows affected (0.02 sec)

mysql> INSERT INTO numbers VALUES (0, 0, -9223372036854775808), (1, 18446744073709551615, 9223372036854775807);
Query OK, 2 rows affected (0.01 sec)

mysql> SET @si_min = -9223372036854775808;
Query OK, 0 rows affected (0.00 sec)

mysql> PREPARE s2 FROM 'SELECT * FROM numbers WHERE si=?';
Query OK, 0 rows affected (0.01 sec)

mysql> EXECUTE s2 USING @si_min;
+------+------+----------------------+
| pk   | ui   | si                   |
+------+------+----------------------+
|    0 |    0 | -9223372036854775808 |
+------+------+----------------------+
1 row in set (0.02 sec)

mysql> select * from meta_scan(last_query_id()) as t;
+--------------------------------------+---------------------------------------------------------------------------------------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+------------------------------+
| query_id                             | statement                                                                                         | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap                    |
+--------------------------------------+---------------------------------------------------------------------------------------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+------------------------------+
| e83b8df2-a45d-11ee-bb98-26dd28356ef3 | EXECUTE s2 USING @si_min // SELECT * FROM numbers WHERE si=? ; SET @si_min = -9223372036854775808 |          0 |       0 | SHARED:/query_result/sys_e83b8df2-a45d-11ee-bb98-26dd28356ef3_1.blk | 2023-12-27 10:16:13 | 0.000019073486328125 |        |       0 | 2023-12-28 10:16:13 | pk -> pk, ui -> ui, si -> si |
+--------------------------------------+---------------------------------------------------------------------------------------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+------------------------------+
1 row in set (0.00 sec)
```

- 示例 6

```sql
mysql> set global save_query_result = on;
mysql> set global query_result_timeout = 24;
mysql> set global query_result_maxsize = 200;
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
mysql> select * from t1;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.00 sec)

mysql> select * from meta_scan(last_query_id()) as t;
ERROR 20405 (HY000): file query_result_meta/sys_c16859e4-a462-11ee-bba0-26dd28356ef3.blk is not found
```