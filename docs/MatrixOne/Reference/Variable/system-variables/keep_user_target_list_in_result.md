# keep_user_target_list_in_result 保持查询结果集列名与用户指定大小写一致

在 MatrixOne 查询中，保持结果集列名与用户指定的名称大小一致，除了可以通过使用别名（alias）来实现，还可以通过设置参数来实现。

`keep_user_target_list_in_result` 是 MatrixOne 设置查询结果集列名与用户指定的名称大小写是否一致的一个参数。

## 配置

在命令行执行以下语句：

```sql
set global keep_user_target_list_in_result = 1;// 默认为 0，重新连接数据库生效
```

## 示例

```sql
create table t1(aa int, bb int, cc int, AbC varchar(25), A_BC_d double);
insert into t1 values (1,2,3,'A',10.9);

mysql> select * from t1; 
+------+------+------+------+--------+
| aa   | bb   | cc   | abc  | a_bc_d |
+------+------+------+------+--------+
|    1 |    2 |    3 | A    |   10.9 |
+------+------+------+------+--------+
1 row in set (0.00 sec)

mysql> select @@keep_user_target_list_in_result;--查询参数值，默认关闭
+-----------------------------------+
| @@keep_user_target_list_in_result |
+-----------------------------------+
| 0                                 |
+-----------------------------------+
1 row in set (0.01 sec)

mysql> select aA, bB, CC, abc, a_Bc_D from t1;--在设置关闭情况下，查询结果集列名与用户指定的名称大小写不一致
+------+------+------+------+--------+
| aa   | bb   | cc   | abc  | a_bc_d |
+------+------+------+------+--------+
|    1 |    2 |    3 | A    |   10.9 |
+------+------+------+------+--------+
1 row in set (0.00 sec)

mysql> set global keep_user_target_list_in_result =1;--开启查询结果集列名与用户指定的名称大小一致设置
Query OK, 0 rows affected (0.01 sec)

mysql> exit;--退出数据库重新连接后参数生效

mysql> select @@keep_user_target_list_in_result;--查询参数值，开启成功
+-----------------------------------+
| @@keep_user_target_list_in_result |
+-----------------------------------+
| 1                                 |
+-----------------------------------+
1 row in set (0.00 sec)

mysql> select aA, bB, CC, abc, a_Bc_D from t1;--在设置开启情况下，查询结果集列名与用户指定的名称大小写一致
+------+------+------+------+--------+
| aA   | bB   | CC   | abc  | a_Bc_D |
+------+------+------+------+--------+
|    1 |    2 |    3 | A    |   10.9 |
+------+------+------+------+--------+
1 row in set (0.00 sec)

```
