# **ALTER USER**

## **语法说明**

修改数据库用户的属性和密码。

!!! note
    1. 租户可以修改它所创建的用户的密码，每次只修改 1 个用户的密码，修改后的密码将在下次登录生效，当前会话不会被中断。
    2. 用户可以修改自己的密码，修改后的密码将在下次登录生效，当前会话不会被中断。

## **语法结构**

```
ALTER USER [IF EXISTS]
    user auth_option

auth_option: {
    IDENTIFIED BY 'auth_string'}
```

## **参数释义**

### auth_option

修改用户的帐号名和授权方式，`auth_string` 表示显式返回指定密码。

## **示例**

```sql
-- 创建一个名为 "admin_1" 密码为 "123456" 用户
mysql> create user admin_1 identified by '123456';
Query OK, 0 rows affected (0.02 sec)

-- 将用户的初始密码 "123456" 修改为 "111111"
mysql> alter user 'admin_1' identified by '111111';
Query OK, 0 rows affected (0.02 sec)

-- 查看是否修改密码成功
mysql> select * from mo_catalog.mo_user;
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
| user_id | user_host | user_name | authentication_string | status | created_time        | expired_time | login_type | creator | owner | default_role |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
|       0 | localhost | root      | 111                   | unlock | 2023-04-19 06:37:58 | NULL         | PASSWORD   |       0 |     0 |            0 |
|       1 | localhost | root      | 111                   | unlock | 2023-04-19 06:37:58 | NULL         | PASSWORD   |       0 |     0 |            0 |
|       2 | localhost | admin_1   | 111111                | unlock | 2023-04-21 06:21:31 | NULL         | PASSWORD   |       1 |     0 |            1 |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
3 rows in set (0.01 sec)
```

<!--select admin_1, mr.role_name  from mo_catalog.mo_role mr, mo_catalog.mo_user mu, mo_catalog.mo_user_grant mur
where mr.role_id =mur.role_id and mu.user_id = mur.user_id
order by mu.user_id asc, mr.role_id ;-->
