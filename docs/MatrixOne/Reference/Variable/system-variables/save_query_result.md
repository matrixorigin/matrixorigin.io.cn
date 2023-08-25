# save_query_result 保存查询结果支持

开启 `save_query_result` 后，MatrixOne 会保存查询结果。

对保存查询结果有影响的参数有三个：

- `save_query_result`：开启/关闭保存查询结果。

- `query_result_timeout`：设置保存查询结果的时间。

- `query_result_maxsize`：设置单个查询结果最大值。

## 开启保存查询结果设置

- 仅对当前会话开启保存查询结果：

```sql
--  默认为 off
set global save_query_result = on  
```

- 如需全局开启，可在启动 MatrixOne 之前，修改配置文件 `cn.toml`，插入以下代码并保存：

```
[cn.frontend]
saveQueryResult = "on"  // 默认为 off
```

## 设置保存时间

设置保存时间单位为小时。

- 仅对当前会话开启查询结果保存时间：

```sql
-- 默认为 24
set global query_result_timeout = 48
```

- 如需全局开启，可在启动 MatrixOne 之前，修改配置文件 `cn.toml`，插入以下代码并保存：

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
set global query_result_maxsize = 200
```

- 如需全局开启，可在启动 MatrixOne 之前，修改配置文件 `cn.toml`，插入以下代码并保存：

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

```sql
-- 开启保存查询结果
mysql> set global save_query_result = on;
-- 设置保存时间为 24 小时
mysql> set global query_result_timeout = 24;
-- 设置单个查询结果最大值为 100M
mysql> set global query_result_maxsize = 200;
-- 建表并插入数据
mysql> create table t1 (a int);
mysql> insert into t1 values(1);
-- 可以查看一下表结构确认插入数据正确
mysql> select a from t1;
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
| c187873e-c25d-11ed-aa5a-acde48001122 |
+--------------------------------------+
1 row in set (0.12 sec)
-- 获取这个查询 ID 的查询结果
mysql> select * from result_scan('c187873e-c25d-11ed-aa5a-acde48001122') as t;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)
-- 查看这个查询 ID 的元数据
mysql> select * from meta_scan('c187873e-c25d-11ed-aa5a-acde48001122') as t;
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| query_id                             | statement        | account_id | role_id | result_path                                                         | create_time         | result_size          | tables | user_id | expired_time        | ColumnMap |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
| c187873e-c25d-11ed-aa5a-acde48001122 | select a from t1 |          0 |       0 | SHARED:/query_result/sys_c187873e-c25d-11ed-aa5a-acde48001122_1.blk | 2023-03-14 19:45:45 | 0.000003814697265625 | t1     |       1 | 2023-03-15 19:45:45 | t1.a -> a |
+--------------------------------------+------------------+------------+---------+---------------------------------------------------------------------+---------------------+----------------------+--------+---------+---------------------+-----------+
1 row in set (0.00 sec)

-- 将查询结果保存到本地
MODUMP QUERY_RESULT c187873e-c25d-11ed-aa5a-acde48001122 INTO 'etl:your_local_path';
```

## 限制

- 只支持保存 `SELECT` 语句和 `SHOW` 语句的结果。
