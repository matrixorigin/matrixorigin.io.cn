# 慢查询

慢查询，即在日志中记录运行比较慢的 SQL 语句。慢查询记录在慢查询日志中，通过慢查询日志，可以查找出哪些查询语句的执行效率低，以便进行优化。

当前 MatrixOne 的慢查询是超过 1000 毫秒的查询，暂不支持定向输出到对应的日志文件中，需要通过创建视图的方式进行过滤获取。

## 开启慢查询

慢查询日志默认关闭，要使用慢查询日志功能，首先要开启慢查询日志功能。

MatrixOne 的慢查询功能在版本 0.6.0 中提供了如下几个基础信息：

- `statement`：即 SQL 文本，用于提供完整的 SQL 语句。
- `request_at`：SQL 语句的的起始时间。
- `duration_second`：SQL 语句的实际执行时间。
- `exec_plan`：SQL 语句的详细执行计划。

执行如下内容的脚本，开启慢查询：

```sql
drop database if exists mo_ts;
create database mo_ts;
use mo_ts;
create view slow_query as select statement,request_at,duration/1000000000 as duration_second from system.statement_info where statement like 'select%' and duration/1000000000>1  order by request_at desc;
create view slow_query_with_plan as select statement,request_at,duration/1000000000 as duration_second,exec_plan from system.statement_info where statement like 'select%' and duration/1000000000>1  order by request_at desc;
```

对于所有超过 1 秒的查询，可以执行如下语句：

```sql
mysql> select * from mo_ts.slow_query;
mysql> select * from mo_ts.slow_query_with_plan;
```

**语句解释**

- `select * from mo_ts.slow_query;` ：不带执行计划。

- `select * from mo_ts.slow_query_with_plan;` ：带执行计划。

## 错误日志

在开启了慢查询的情况下，可以开启错误日志，检查日志，定位错误信息。

### 开启错误日志

执行如下内容脚本：

```sql
create database mo_ts;
use mo_ts;
create view error_message as select timestamp,message from system.log_info where level in ('error','panic','faltal');
create view error_sql as select si.request_at time_stamp,si.statement,si.error as SQL from system.statement_info si where si.user<>'internal' and si.status='Failed' ;
```

#### 查询数据库服务错误

查询数据库服务错误，执行如下 SQL：

```sql
mysql> select * from mo_ts.error_message;
```

查询结果示例如下：

```sql
+----------------------------+-------------------------------------------------------------------------+
| timestamp                  | message                                                                 |
+----------------------------+-------------------------------------------------------------------------+
| 2022-11-28 14:47:31.324762 | error: SQL parser error: table "error_sql" does not exist               |
| 2022-11-28 14:47:31.324837 | SQL parser error: table "error_sql" does not exist                      |
| 2022-11-28 14:47:31.324872 | query trace status                                                      |
| 2022-11-28 14:40:06.579795 | read loop stopped                                                       |
| 2022-11-28 14:40:06.585220 | gc inactive backends task stopped                                       |
| 2022-11-28 14:40:06.591082 | error: cannot locate ha keeper                                          |
| 2022-11-28 14:40:08.442515 | failed to propose initial cluster info                                  |
| 2022-11-28 14:40:08.442667 | failed to set initial cluster info                                      |
| 2022-11-28 14:40:09.411286 | error: timeout, converted to code 20429                                 |
| 2022-11-28 14:40:09.411508 | read loop stopped                                                       |
| 2022-11-28 14:40:09.416557 | gc inactive backends task stopped                                       |
| 2022-11-28 14:40:10.052585 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:10.052630 | failed to create init tasks                                             |
| 2022-11-28 14:40:11.053926 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:11.054059 | failed to create init tasks                                             |
| 2022-11-28 14:40:12.054578 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:12.054630 | failed to create init tasks                                             |
| 2022-11-28 14:40:13.055828 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:13.055896 | failed to create init tasks                                             |
| 2022-11-28 14:40:14.057102 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:14.057208 | failed to create init tasks                                             |
| 2022-11-28 14:40:15.058425 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:15.058563 | failed to create init tasks                                             |
| 2022-11-28 14:40:16.059867 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:16.060031 | failed to create init tasks                                             |
| 2022-11-28 14:40:16.443234 | read loop stopped                                                       |
| 2022-11-28 14:40:16.443162 | read from backend failed                                                |
| 2022-11-28 14:40:16.448858 | gc inactive backends task stopped                                       |
| 2022-11-28 14:40:16.457276 | error: file dnservice/dd4dccb4-4d3c-41f8-b482-5251dc7a41bf is not found |
| 2022-11-28 14:40:17.061260 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:17.061323 | failed to create init tasks                                             |
| 2022-11-28 14:40:18.062165 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:18.062249 | failed to create init tasks                                             |
| 2022-11-28 14:40:18.642097 | error: dn shard uuid , id 2 not reported                                |
| 2022-11-28 14:40:19.062775 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:19.062937 | failed to create init tasks                                             |
| 2022-11-28 14:40:20.063237 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:20.063252 | failed to create init tasks                                             |
| 2022-11-28 14:40:21.064529 | failed to create init tasks                                             |
| 2022-11-28 14:40:21.064457 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:21.463193 | read loop stopped                                                       |
| 2022-11-28 14:40:21.468423 | gc inactive backends task stopped                                       |
| 2022-11-28 14:40:21.474688 | error: file cnservice/dd1dccb4-4d3c-41f8-b482-5251dc7a41bf is not found |
| 2022-11-28 15:24:56.210577 | error: SQL parser error: table "error_sql" does not exist               |
| 2022-11-28 15:24:56.210773 | SQL parser error: table "error_sql" does not exist                      |
| 2022-11-28 15:24:56.210898 | query trace status                                                      |
| 2022-11-28 14:40:22.065723 | error: internal error: failed to get task service                       |
| 2022-11-28 14:40:22.065838 | failed to create init tasks                                             |
| 2022-11-28 14:40:22.478229 | error: invalid state no cn in the cluster                               |
| 2022-11-28 14:40:22.478846 | failed to refresh task storage                                          |
| 2022-11-28 14:40:23.090160 | error: invalid database mo_task                                         |
| 2022-11-28 14:40:23.090274 | invalid database mo_task                                                |
| 2022-11-28 14:40:23.090604 | query trace status                                                      |
| 2022-11-28 15:32:30.354364 | error: SQL parser error: table "slow_query" does not exist              |
| 2022-11-28 15:32:30.354485 | SQL parser error: table "slow_query" does not exist                     |
| 2022-11-28 15:32:30.354605 | query trace status                                                      |
| 2022-11-28 15:26:59.639892 | error: SQL parser error: table "error_sql" does not exist               |
| 2022-11-28 15:26:59.640039 | SQL parser error: table "error_sql" does not exist                      |
| 2022-11-28 15:26:59.640208 | query trace status                                                      |
| 2022-11-28 15:37:29.289457 | error: table slow_query already exists                                  |
| 2022-11-28 15:37:29.289486 | table slow_query already exists                                         |
| 2022-11-28 15:37:29.289518 | query trace status                                                      |
| 2022-11-28 15:37:45.773829 | error: table slow_query_with_plan already exists                        |
| 2022-11-28 15:37:45.773856 | table slow_query_with_plan already exists                               |
| 2022-11-28 15:37:45.773888 | query trace status                                                      |
| 2022-11-28 14:45:48.821324 | error: not supported: function or operator 'interval'                   |
| 2022-11-28 14:45:48.823261 | error: not supported: function or operator 'interval'                   |
| 2022-11-28 14:45:48.823426 | error: not supported: function or operator 'interval'                   |
| 2022-11-28 14:45:48.823525 | error: not supported: function or operator 'interval'                   |
| 2022-11-28 14:47:14.513831 | error: SQL parser error: table "statement_info" does not exist          |
| 2022-11-28 14:47:14.513929 | SQL parser error: table "statement_info" does not exist                 |
| 2022-11-28 14:47:14.513962 | query trace status                                                      |
+----------------------------+-------------------------------------------------------------------------+
72 rows in set (0.13 sec)
```

#### 查询 SQL 错误

查询 SQL 错误，执行如下命令：

```sql
mysql> select * from mo_ts.error_sql;
```

查询结果示例如下：

```sql
+----------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------+
| time_stamp                 | statement                                                                                                                                                                                                                              | sql                                                     |
+----------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------+
| 2022-11-28 14:40:23.073188 | use mo_task                                                                                                                                                                                                                            | invalid database mo_task                                |
| 2022-11-28 15:26:59.637130 | select * from mo_ts.error_sql                                                                                                                                                                                                          | SQL parser error: table "error_sql" does not exist      |
| 2022-11-28 15:37:29.283683 | create view slow_query as select statement, request_at, duration / 1000000000 as duration_second from system.statement_info where statement like "select%" and duration / 1000000000 > 1 order by request_at desc                      | table slow_query already exists                         |
| 2022-11-28 15:37:45.765394 | create view slow_query_with_plan as select statement, request_at, duration / 1000000000 as duration_second, exec_plan from system.statement_info where statement like "select%" and duration / 1000000000 > 1 order by request_at desc | table slow_query_with_plan already exists               |
| 2022-11-28 15:32:30.351695 | select * from mo_ts.slow_query                                                                                                                                                                                                         | SQL parser error: table "slow_query" does not exist     |
| 2022-11-28 14:47:14.510060 | create view error_sql as select si.request_at as time_stamp, si.statement as sql, el.err_code from statement_info as si cross join error_info as el where si.statement_id = el.statement_id and user != "internal"                     | SQL parser error: table "statement_info" does not exist |
| 2022-11-28 14:47:31.323884 | select * from mo_ts.error_sql                                                                                                                                                                                                          | SQL parser error: table "error_sql" does not exist      |
| 2022-11-28 15:24:56.208171 | select * from mo_ts.error_sql                                                                                                                                                                                                          | SQL parser error: table "error_sql" does not exist      |
+----------------------------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------------------------------------------------------+
8 rows in set (0.14 sec)
```
