# 密码复杂度校验

MatrixOne 提供一系列系统变量用于配置密码复杂度校验，以确保密码安全性。这些变量支持动态修改，其中核心变量为 validate_password，其余设置仅在 validate_password 开启时生效。

- validate_password：控制密码复杂度校验功能的开关，取值范围：ON | OFF（默认值：OFF）。

- validate_password.changed_characters_percentage：指定新密码相较于旧密码所需更改的字符比例，取值范围：[0-100]（默认值：0）。

- 密码策略 (validate_password.policy)：用于定义全局密码复杂度策略，支持 0/low，1/medium 两种模式：

    <table border="1">
    <tr>
        <th>Policy</th>
        <th>生效的参数</th>
    </tr>
    <tr>
        <td>0/LOw</td>
        <td>validate_password.length</td>
    </tr>
    <tr>
        <td rowspan="4">1/MEDIUM</td>
        <td>validate_password.length</td>
    </tr>
    <tr>
        <td>validate_password.mixed_case_count</td>
    </tr>
    <tr>
        <td>validate_password.number_count</td>
    </tr>
     <tr>
        <td>validate_password.special_char_count</td>
    </tr>
    </table>

      - validate_password.length：指定密码的最低字符长度，取值范围：>= 0（默认值：8）。

      - validate_password.mixed_case_count：要求密码中包含的大小写字符的最少数量，取值范围：>= 0（默认值：1）。

      - validate_password.number_count：指定密码中必须包含的数字字符的最小数量，取值范围：>= 0（默认值：1）。

      - validate_password.special_char_count：指定密码中需包含的特殊字符的最少数量，取值范围：>= 0（默认值：1）。

## 查看

```sql
select @@global.validate_password;
select @@global.validate_password.changed_characters_percentage;
select @@global.validate_password.check_user_name;
select @@global.validate_password.length;
select @@global.validate_password.mixed_case_count;
select @@global.validate_password.number_count;
select @@global.validate_password.special_char_count;
```

## 设置

设置后需退出重连方可生效。

```sql
set global validate_password=xx; --默认为 0
set global validate_password.changed_characters_percentage=xx; --默认为 0
set global validate_password.check_user_name=xx;--默认为 1
set global validate_password.policy=xx;--默认为 0
set global validate_password.length=xx;--默认为 8
set global validate_password.mixed_case_count=xx;--默认为 1
set global validate_password.number_count=xx;--默认为 1
set global validate_password.special_char_count==xx;--默认为 1
```

## 示例

### validate_password

```sql
mysql> select @@global.validate_password;
+---------------------+
| @@validate_password |
+---------------------+
| 0                   |
+---------------------+
1 row in set (0.00 sec)

mysql> set global validate_password=1;
Query OK, 0 rows affected (0.02 sec)

mysql> select @@global.validate_password; --重连生效
+---------------------+
| @@validate_password |
+---------------------+
| 1                   |
+---------------------+
1 row in set (0.00 sec)

```

### validate_password.changed_characters_percentage

```sql
mysql> select @@global.validate_password.changed_characters_percentage;
+---------------------------------------------------+
| @@validate_password.changed_characters_percentage |
+---------------------------------------------------+
| 0                                                 |
+---------------------------------------------------+
1 row in set (0.01 sec)

# 创建用户u1，字符占比0%，创建成功
mysql> create user u1 identified by '12345678';
Query OK, 0 rows affected (0.02 sec)

mysql>set global validate_password.changed_characters_percentage=80;--设置字符占比为 80%：

mysql> select @@global.validate_password.changed_characters_percentage; --重连生效
+---------------------------------------------------+
| @@validate_password.changed_characters_percentage |
+---------------------------------------------------+
| 80                                                |
+---------------------------------------------------+
1 row in set (0.00 sec)

# 创建用户u2，字符占比0%，创建失败
mysql> create user u2 identified by '12345678';
ERROR 20301 (HY000): invalid input: Password '12345678' does not contain enough changed characters

# 创建用户u2，字符占比20%，创建失败
mysql> create user u2 identified by '12345678ab';
ERROR 20301 (HY000): invalid input: Password '12345678ab' does not contain enough changed characters

# 创建用户u2，字符占比80%，创建成功
mysql> create user u4 identified by '12abdefhij';
Query OK, 0 rows affected (0.01 sec)
```

### validate_password.policy 及其相关参数

下面参数需要开启 validate_password.policy 才能生效。

```sql
mysql> select @@global.validate_password.policy;
+----------------------------+
| @@validate_password.policy |
+----------------------------+
| 0                          |
+----------------------------+
1 row in set (0.00 sec)
set global validate_password.policy=1;

mysql> select @@global.validate_password.policy;--重连生效
+----------------------------+
| @@validate_password.policy |
+----------------------------+
| 1                          |
+----------------------------+
1 row in set (0.00 sec)
```

#### validate_password.length

```sql
mysql> select @@global.validate_password.length;
+----------------------------+
| @@validate_password.length |
+----------------------------+
| 8                          |
+----------------------------+
1 row in set (0.00 sec)

# 创建用户u3，密码长度为8，创建成功
mysql> create user u3 identified by 'Pass123!';
Query OK, 0 rows affected (0.01 sec)

mysql> set global validate_password.length=9;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.length;
+----------------------------+
| @@validate_password.length |
+----------------------------+
| 9                          |
+----------------------------+
1 row in set (0.00 sec)

# 创建用户u4，密码长度为8，创建失败
mysql> create user u4 identified by 'Pass123!';
ERROR 20301 (HY000): invalid input: Password 'Pass123!' is too short, require at least 9 characters

# 创建用户u4，密码长度为9，创建成功
mysql> create user u4 identified by 'Pass1234!';
Query OK, 0 rows affected (0.02 sec)
```

#### validate_password.mixed_case_count

```sql
mysql> select @@global.validate_password.mixed_case_count;
+--------------------------------------+
| @@validate_password.mixed_case_count |
+--------------------------------------+
| 1                                    |
+--------------------------------------+
1 row in set (0.00 sec)

--创建用户 u4，密码包含一个大写字母和一个小写字母，创建成功
mysql> create user u4 identified by 'Pa12345!';
Query OK, 0 rows affected (0.01 sec)

--将 validate_password.mixed_case_count 设置为 2
mysql> set global validate_password.mixed_case_count=2;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.mixed_case_count; --重连生效
+--------------------------------------+
| @@validate_password.mixed_case_count |
+--------------------------------------+
| 2                                    |
+--------------------------------------+
1 row in set (0.00 sec)

--创建用户 u5，密码包含一个大写字母和一个小写字母，创建失败
mysql> create user u5 identified by 'Pa12345!';
ERROR 20301 (HY000): invalid input: Password 'Pa12345!' does not meet the Lowercase requirements

--创建用户 u5，密码包含两个大写字母和两个小写字母，创建失败
mysql> create user u5 identified by 'PPaa123!';
Query OK, 0 rows affected (0.01 sec)
```

#### validate_password.number_count

```sql
mysql> select @@global.validate_password.number_count;
+----------------------------------+
| @@validate_password.number_count |
+----------------------------------+
| 1                                |
+----------------------------------+
1 row in set (0.00 sec)

--创建用户 u6，密码包含 1 个数字，创建成功
mysql> create user u6 identified by 'Password1!';
Query OK, 0 rows affected (0.01 sec)

mysql> set global validate_password.number_count=2;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.number_count;
+----------------------------------+
| @@validate_password.number_count |
+----------------------------------+
| 2                                |
+----------------------------------+
1 row in set (0.00 sec)

--创建用户 u7，密码包含一个数字，创建失败
mysql> create user u7 identified by 'Password1!';
ERROR 20301 (HY000): invalid input: Password 'Password1!' does not meet the Number requirements

--创建用户 u7，密码包含两个数字，创建成功
mysql> create user u7 identified by 'Password12!';
Query OK, 0 rows affected (0.01 sec)
```

#### validate_password.special_char_count

```sql
mysql> select @@global.validate_password.special_char_count;
+----------------------------------------+
| @@validate_password.special_char_count |
+----------------------------------------+
| 1                                      |
+----------------------------------------+
1 row in set (0.00 sec)

--创建用户 u8，密码包含一个特殊字符，创建成功
mysql> create user u8 identified by 'Password123!';
Query OK, 0 rows affected (0.01 sec)

mysql> set global validate_password.special_char_count=2;
Query OK, 0 rows affected (0.01 sec)

mysql> select @@global.validate_password.special_char_count; --重连后生效
+----------------------------------------+
| @@validate_password.special_char_count |
+----------------------------------------+
| 2                                      |
+----------------------------------------+
1 row in set (0.00 sec)

--创建用户 u9，密码包含一个特殊字符，创建失败
mysql> create user u9 identified by 'Password123!';
ERROR 20301 (HY000): invalid input: Password 'Password123!' does not meet the Special Char requirements

--创建用户 u9，密码包含两个特殊字符，创建成功
mysql> create user u9 identified by 'Password123!!';
Query OK, 0 rows affected (0.01 sec)
```