# lower_case_table_names 大小写敏感支持

`lower_case_table_names` 是 MatrixOne 设置大小写是否敏感的一个参数。

!!! note
    与 mysql 不同的是，MatrixOne 暂时只支持 **0** 和 **1** 两种模式，且在 linux 和 mac 系统下默认值都为 1。

## 配置

在命令行执行以下语句：

```sql
set global lower_case_table_names = 0;// 默认为 1，重新连接数据库生效
```

## 参数解释

### 0

将 `lower_case_table_names` 设置为 0。标识符存储为原始字符串，名称比较大小写敏感。

**示例**

```sql
create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### 1

将 `lower_case_table_names` 设置为 1。标识符存储为小写，名称比较大小写不敏感。

**示例**

```sql
create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;
+------+
| aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

```sql
create table t(a int);
insert into t values(1), (2), (3);

-- 列的别名在返回结果集时会显示原始字符串，但名称比较时大小写不敏感，示例如下：
mysql> select A as Aa from t;
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)
```