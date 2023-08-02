# **ALTER ACCOUNT**

## **语法说明**

修改租户信息。

!!! note
    1. 集群管理员（即 root 用户）可以修改它所创建的租户的密码。
    2. 租户本身可以修改自己的密码。
    2. 仅集群管理员（即 root 用户）可以执行**暂停（SUSPEND）**、**恢复（OPEN）**和**限制（RESTRICTED）**租户的操作。

## **语法结构**

```
> ALTER ACCOUNT [IF EXISTS]
account auth_option [COMMENT 'comment_string']

auth_option: {
ADMIN_NAME [=] 'admin_name'
IDENTIFIED BY 'auth_string'
}

status_option: {
OPEN
| SUSPEND
| RESTRICTED
}
```

## **参数释义**

### auth_option

修改租户的帐号名和授权方式，`auth_string` 表示显式返回指定密码。

### status_option

设置租户的状态。作为 VARCHAR 类型存储在系统数据库 mo_catalog 下的 mo_account 表中。

- SUSPEND：暂停某个租户的服务，即暂停后该租户不能再访问 MatrixOne；正在访问的租户仍然可以继续访问，关闭会话后，将不能再访问 MatrixOne。
- OPEN：恢复某个暂停状态的租户，恢复后，该租户将正常访问 MatrixOne。
- RESTRICTED：允许用户访问并做出有限的行为。对租户启用了 `RESTRICTED` 状态以后，这个租户只能对数据库进行 `SHOW`/`DELETE`/`SELECT`/`USE`/`SET` 操作，其他操作不可以使用。
    * 对该租户启用了 `RESTRICTED` 状态后，即使租户正在访问，访问行为也将受到限制。
    * 解除对用户的限制，将状态切换为 `OPEN` 即可解除限制，即使用 `ALTER ACCOUNT account_name OPEN` 解除限制。

### comment

租户注释作为 VARCHAR 类型存储在系统数据库 mo_catalog 下的 mo_account 表中。

COMMENT 可以是任意引用的文本，新的 COMMENT 替换任何现有的用户注释。如下所示：

```sql
mysql> desc mo_catalog.mo_account;
+----------------+--------------+------+------+---------+-------+---------+
| Field          | Type         | Null | Key  | Default | Extra | Comment |
+----------------+--------------+------+------+---------+-------+---------+
| account_id     | INT          | YES  |      | NULL    |       |         |
| account_name   | VARCHAR(300) | YES  |      | NULL    |       |         |
| status         | VARCHAR(300) | YES  |      | NULL    |       |         |
| created_time   | TIMESTAMP    | YES  |      | NULL    |       |         |
| comments       | VARCHAR(256) | YES  |      | NULL    |       |         |
| suspended_time | TIMESTAMP    | YES  |      | null    |       |         |
+----------------+--------------+------+------+---------+-------+---------+
6 rows in set (0.06 sec)
```

## **示例**

- 示例 1：修改租户信息

```sql
-- 创建一个名为 "root1" 密码为 "111" 租户
mysql> create account acc1 admin_name "root1" identified by "111";
Query OK, 0 rows affected (0.42 sec)
-- 将租户的初始密码 "111" 修改为 "Abcd_1234@1234"
mysql> alter account acc1 admin_name "root1" identified by "Abcd_1234@1234";
Query OK, 0 rows affected (0.01 sec)
-- 修改租户 "root1" 的备注
mysql> alter account acc1 comment "new accout";
Query OK, 0 rows affected (0.02 sec)
-- 查看验证是否给租户 "root1" 增加了 "new accout" 的备注
mysql> show accounts;
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| account_name | admin_name | created             | status | suspended_time | db_count | table_count | row_count | size  | comment        |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
| acc1         | root1      | 2023-02-15 06:26:51 | open   | NULL           |        5 |          34 |       787 | 0.036 | new accout     |
| sys          | root       | 2023-02-14 06:58:15 | open   | NULL           |        8 |          57 |      3767 | 0.599 | system account |
+--------------+------------+---------------------+--------+----------------+----------+-------------+-----------+-------+----------------+
3 rows in set (0.19 sec)
```

- 示例 2：修改租户状态

```sql
-- 创建一个名为 "root1" 密码为 "111" 租户
mysql> create account accx admin_name "root1" identified by "111";
Query OK, 0 rows affected (0.27 sec)
-- 修改租户状态为 "suspend"，即暂停用户访问 MatrixOne
mysql> alter account accx suspend;
Query OK, 0 rows affected (0.01 sec)
-- 查看一下是否修改状态成功
mysql> show accounts;
+--------------+------------+---------------------+---------+---------------------+----------+-------------+-----------+-------+----------------+
| account_name | admin_name | created             | status  | suspended_time      | db_count | table_count | row_count | size  | comment        |
+--------------+------------+---------------------+---------+---------------------+----------+-------------+-----------+-------+----------------+
| accx         | root1      | 2023-02-15 06:26:51 | suspend | 2023-02-15 06:27:15 |        5 |          34 |       787 | 0.036 | new accout     |
| sys          | root       | 2023-02-14 06:58:15 | open    | NULL                |        8 |          57 |      3767 | 0.599 | system account |
+--------------+------------+---------------------+---------+---------------------+----------+-------------+-----------+-------+----------------+
2 rows in set (0.15 sec)
```
