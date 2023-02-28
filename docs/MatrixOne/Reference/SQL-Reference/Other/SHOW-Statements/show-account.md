# **SHOW ACCOUNTS**

## **函数说明**

列出为你的账户下创建的租户用户的元信息和统计信息。

## **函数语法**

```
> SHOW ACCOUNTS;
```

### 租户用户信息详情

| 列名             | 信息                  | 类型              | 数据源头                                         |
| -------------- | ------------------- | --------------- | -------------------------------------------- |
| ACCOUNT_NAME   | 租户名称                | varchar         | mo_account                                   |
| ADMIN_NAME     | 创建时默认超级管理员名称        | varchar         | 每个租户下的 mo_user 表中                               |
| CREATED        | 创建时间                | timestamp       | mo_account                                   |
| STATUS         | 当前状态，OPEN 或 SUSPENDED | varchar         | mo_account                                   |
| SUSPENDED_TIME | 停用时间                | timestamp       | mo_account                                   |
| DB_COUNT       | 数据库数量               | bigint unsigned | mo_tables                                    |
| TABLE_COUNT    | 表数量                 | bigint unsigned | mo_tables                                    |
| ROW_COUNT      | 总行数                 | bigint unsigned | sum(mo_table_rows())                         |
| SIZE           | 使用空间总量（MB）          | decimal(29,3)   | sum(mo_table_size(mt.reldatabase,mt.relname) |
| COMMENT        | 创建时的 COMMENT 信息       | varchar         | mo_account                                   |

## **示例**

```sql
mysql> show accounts;
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| account_name | admin_name | created             | status | suspended_time | db_count | table_count | row_count | size  | comment        |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| sys          | root       | 2023-02-14 06:58:15 | open   | NULL           |        8 |          57 |      2681 | 0.351 | system account |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
1 row in set (0.14 sec)
```
