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
| CREATED_TIME        | 创建时间                | timestamp       | mo_account                                   |
| STATUS         | 当前状态，OPEN 或 SUSPENDED | varchar         | mo_account                                   |
| SUSPENDED_TIME | 停用时间                | timestamp       | mo_account                                   |
| DB_COUNT       | 数据库数量               | bigint unsigned | mo_tables                                    |
| TBL_COUNT      | 表数量                 | bigint unsigned | mo_tables                                    |
| SIZE           | 使用空间总量（MB）          | decimal(29,3)   | sum(mo_table_size(mt.reldatabase,mt.relname) |
| SNAPSHOT_SIZE   | 备份的数据存储大小（MB）    | --             | -- |
| COMMENTS        | 创建时的 COMMENT 信息      | varchar         | mo_account                                   |

## **示例**

```sql
mysql> show accounts;
+--------------+------------+---------------------+--------+----------------+----------+-----------+----------+---------------+----------------+
| account_name | admin_name | created_time        | status | suspended_time | db_count | tbl_count | size     | snapshot_size | comments       |
+--------------+------------+---------------------+--------+----------------+----------+-----------+----------+---------------+----------------+
| acc0         | root       | 2024-12-09 06:07:44 | open   | NULL           |        5 |        65 |        0 |             0 |                |
| sys          | root       | 2024-12-09 02:19:22 | open   | NULL           |        7 |       108 | 8.298243 |             0 | system account |
+--------------+------------+---------------------+--------+----------------+----------+-----------+----------+---------------+----------------+
2 rows in set (0.01 sec)
```
