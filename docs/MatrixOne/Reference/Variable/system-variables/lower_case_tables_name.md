# lower_case_table_names 大小写敏感支持

`lower_case_table_names` 是 MatrixOne 设置大小写是否敏感的一个全局变量。

!!! note
    与 mysql 不同的是，MatrixOne 暂时只支持 **0** 和 **1** 两种模式，且在 linux 和 mac 系统下默认值都为 1。

## 查看 lower_case_table_names

在 MatrixOne 中使用以下命令查看 `lower_case_table_names`：

```sql
show variables like "lower_case_table_names";--默认为 1
```

## 设置 lower_case_table_names

在 MatrixOne 中使用以下命令设置 `lower_case_table_names`：

```sql
set global lower_case_table_names = 0;--默认为 1，重新连接数据库生效
```

## 参数解释

### 参数设置为 0

将 `lower_case_table_names` 设置为 0。标识符存储为原始字符串，名称比较大小写敏感。

**示例**

```sql
mysql> show variables like "lower_case_table_names";--查看默认参数，默认值为 1
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_table_names | 1     |
+------------------------+-------+
1 row in set (0.00 sec)

set global lower_case_table_names = 0;--重新连接数据库生效

mysql> show variables like "lower_case_table_names";--重连数据库查看参数，修改成功
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_table_names | 0     |
+------------------------+-------+
1 row in set (0.00 sec)

create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;--名称比较大小写敏感
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### 参数设置为 1

将 `lower_case_table_names` 设置为 1。标识符存储为小写，名称比较大小写不敏感。

**示例**

```sql
set global lower_case_table_names = 1;--重新连接数据库生效

mysql> show variables like "lower_case_table_names";--重连数据库查看参数，修改成功
+------------------------+-------+
| Variable_name          | Value |
+------------------------+-------+
| lower_case_table_names | 1     |
+------------------------+-------+
1 row in set (0.00 sec)

create table Tt (Aa int,Bb int);
insert into Tt values (1,2), (2,3), (3,4);

mysql> select Aa from Tt;--名称比较大小写不敏感
+------+
| aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)

-- 列的别名在返回结果集时会显示原始字符串，但名称比较时大小写不敏感，示例如下：
mysql> select Aa as AA,Bb from Tt;
+------+------+
| AA   | bb   |
+------+------+
|    1 |    2 |
|    2 |    3 |
|    3 |    4 |
+------+------+
3 rows in set (0.00 sec)
```