# 审计

## 概述

审计是用来记录数据库用户行为以及数据库内部重要事件的功能，它记录了所有用户在登录数据库后做出的所有数据库操作以及数据内部的重大事件。也是很多企业级数据库必备的功能之一。在 MatrixOne 0.7.0 的版本中，审计功能已经具备了最初的形态，可供用户进行测试体验。为了方便用户能够更方便地获取自己所需要的相关信息，可以通过本文档进行开启。

在日常的数据库运维中，为了确保数据库用户的所有行为合规合法，审计是非常有效的手段。在数据库发生重要事件时，例如启停、节点宕机等，审计内容可以非常方便地追踪到前后时段的护具库行为。

对于重要的业务信息表或系统配置表需要进行有效完整的行为监控时，数据库审计的开启十分有必要。例如监控对用户 A 在数据库中所有行为，以便于及时发现违规的数据修改或删除来源。对于数据库内部重大事件的监控，可以第一时间排查故障，并且追溯事故产生的根本原因。

## 开启审计

执行如下内容脚本，开启审计功能：

```sql
drop database if exists mo_audits;
create database mo_audits;
use mo_audits;
create view mo_user_action as select request_at,user,host,statement,status from system.statement_info where user in (select distinct user_name from mo_catalog.mo_user) and statement not like '______internal_%' order by request_at desc;
create view mo_events as select timestamp,level,message from system.log_info where level in ('error','panic','fatal') order by timestamp desc;
```

## 审计查询

对用户行为进行审计时，执行下面的 SQL 语句进行查看：

```sql
mysql> select * from mo_audits.mo_user_action;
```

查询示例结果如下：

```
+----------------------------+------+---------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+
| request_at                 | user | host    | statement                                                                                                                                                                                                                                      | status  |
+----------------------------+------+---------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+
| 2023-02-10 19:54:28.831970 | root | 0.0.0.0 | create view mo_user_action as select request_at, user, host, statement, status from system.statement_info where user in (select distinct user_name from mo_catalog.mo_user) and statement not like "______internal_%" order by request_at desc | Success |
| 2023-02-10 19:54:14.079939 | root | 0.0.0.0 | show tables                                                                                                                                                                                                                                    | Success |
| 2023-02-10 19:54:14.076260 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:54:14.071728 | root | 0.0.0.0 | use mo_audits                                                                                                                                                                                                                                  | Success |
| 2023-02-10 19:54:14.071108 | root | 0.0.0.0 | select database()                                                                                                                                                                                                                              | Success |
| 2023-02-10 19:54:01.007241 | root | 0.0.0.0 | create database mo_audits                                                                                                                                                                                                                      | Success |
| 2023-02-10 19:53:48.924819 | root | 0.0.0.0 | drop database if exists mo_audits                                                                                                                                                                                                              | Success |
| 2023-02-10 19:30:59.668646 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Success |
| 2023-02-10 19:30:53.438212 | root | 0.0.0.0 | show locks                                                                                                                                                                                                                                     | Success |
| 2023-02-10 19:30:44.258894 | root | 0.0.0.0 | show index from t                                                                                                                                                                                                                              | Success |
| 2023-02-10 19:30:43.662063 | root | 0.0.0.0 | create table t (a int, b int, c int, primary key (a))                                                                                                                                                                                          | Success |
| 2023-02-10 19:30:23.104830 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Success |
| 2023-02-10 19:30:20.062010 | root | 0.0.0.0 | show tables                                                                                                                                                                                                                                    | Success |
| 2023-02-10 19:30:20.060324 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:30:20.055515 | root | 0.0.0.0 | use aab                                                                                                                                                                                                                                        | Success |
| 2023-02-10 19:30:20.055186 | root | 0.0.0.0 | select database()                                                                                                                                                                                                                              | Success |
| 2023-02-10 19:30:17.152087 | root | 0.0.0.0 | create database aab                                                                                                                                                                                                                            | Success |
| 2023-02-10 19:30:10.621294 | root | 0.0.0.0 | create aab                                                                                                                                                                                                                                     | Failed  |
| 2023-02-10 19:29:59.983433 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:29:45.370956 | root | 0.0.0.0 | show index from t                                                                                                                                                                                                                              | Failed  |
| 2023-02-10 19:29:44.875580 | root | 0.0.0.0 | create table t (a int, b int, c int, primary key (a))                                                                                                                                                                                          | Failed  |
| 2023-02-10 19:29:44.859588 | root | 0.0.0.0 | drop table if exists t                                                                                                                                                                                                                         | Success |
| 2023-02-10 19:29:19.974775 | root | 0.0.0.0 | show index                                                                                                                                                                                                                                     | Failed  |
| 2023-02-10 19:29:11.188286 | root | 0.0.0.0 | show locks                                                                                                                                                                                                                                     | Success |
| 2023-02-10 19:29:06.618778 | root | 0.0.0.0 | show node list                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:19:11.319058 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Failed  |
| 2023-02-10 19:19:06.809302 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 19:18:52.840282 | root | 0.0.0.0 | show triggers                                                                                                                                                                                                                                  | Failed  |
| 2023-02-10 10:54:09.892254 | root | 0.0.0.0 | show databases                                                                                                                                                                                                                                 | Success |
| 2023-02-10 10:54:04.468721 | root | 0.0.0.0 | select @@version_comment limit 1                                                                                                                                                                                                               | Success |
+----------------------------+------+---------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+
30 rows in set (0.81 sec)
```

查询数据库内部状态变更查询，执行下面的 SQL 语句进行查看：

```sql
mysql> select * from mo_events;
```

查询示例结果如下：

```
|
| 2022-10-18 15:26:20.293735 | error | error: timeout, converted to code 20429                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2022-10-18 15:26:20.293725 | error | failed to propose initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2022-10-18 15:26:20.288695 | error | failed to set initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2022-10-18 15:26:20.288559 | error | failed to propose initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2022-10-18 15:26:20.285384 | error | failed to set initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2022-10-18 15:26:20.285235 | error | failed to propose initial cluster info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2022-10-18 15:26:18.473472 | error | failed to join the gossip group, 1 error occurred:
	* Failed to join 127.0.0.1:32022: dial tcp 127.0.0.1:32022: connect: connection refused                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2022-10-18 15:26:18.469029 | error | failed to join the gossip group, 1 error occurred:
	* Failed to join 127.0.0.1:32012: dial tcp 127.0.0.1:32012: connect: connection refused       
```

## 关闭审计

执行下面的 SQL 语句，关闭审计：

```sql
> drop database if exists mo_audits;
```
