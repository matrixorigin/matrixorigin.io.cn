# lower_case_table_names 大小写敏感支持

关于 MatrixOne 大小写模式有 5 种，大小写参数 `lower_case_table_names` 可以设置为 0，1，2，3 和 4。

## 参数解释

### 参数值设置为 O

将 `lower_case_table_names` 设置为 0。标识符存储为原始字符串，名称比较大小写敏感。

**示例**

```sql
set global lower_case_table_names = 0;
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

### 参数值设置为 1

将 `lower_case_table_names` 设置为 1。标识符存储为小写，名称比较大小写不敏感。

**示例**

```sql
set global lower_case_table_names = 1;
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
set global lower_case_table_names = 1;
create table t(a int);
insert into t values(1), (2), (3);

-- 列的别名在返回结果集时会显示原始字符串，但名称比较时大小写不敏感，示例如下：
mysql> select a as Aa from t;
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### 参数值设置为 2

将 `lower_case_table_names` 设置为 2。标识符存储为原始字符串，名称比较时大小写不敏感。

**示例**

```sql
set global lower_case_table_names = 2;
create table Tt (Aa int);
insert into tt values (1), (2), (3);

mysql> select AA from tt;
+------+
| Aa   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### 参数值设置为 3

将 `lower_case_table_names` 设置为 3。标识符存储为大写，名称比较时大小写不敏感。

**示例**

```sql
set global lower_case_table_names = 3;
create table Tt (Aa int);
insert into Tt values (1), (2), (3);

mysql> select Aa from Tt;
+------+
| AA   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.03 sec)
```

### 参数值设置为 4

将 `lower_case_table_names` 设置为 4。带有 `` 的标识符存储为原始字符串，大小写敏感，其他转小写。

## 配置参数

- 如需全局配置，可在启动 MatrixOne 之前，修改配置文件 `cn.toml`，插入以下代码并保存：

```
[cn.frontend]
lowerCaseTableNames = "0" // 默认为 1
# 0 标识符存储为原始字符串，名称比较时大小写时，大小写敏感
# 1 标识符存储为小写，名称比较时大小写时，大小写不敏感
# 2 标识符存储为原始字符串，名称比较时大小写时，大小写不敏感
# 3 标识符存储为大写，名称比较时大小写时，大小写不敏感
# 4 带有``的标识符存储为原始字符串，大小写敏感，其他转小写
```

全局配置时，如果启动了多个 cn，那么每个 cn 都需要配置。如需查阅配置文件参数说明，参见[通用参数配置](../../System-Parameters/configuration-settings.md)。

!!! note
    当前仅支持设置参数为 0 或 1。但暂不支持设置为参数为 2，3 或 4。

- 仅对当前会话开启保存查询结果：

```sql
set global lower_case_table_names = 1;
```

在创建数据库时，MatrixOne 会自动获取 `lower_case_table_names` 的值，作为初始化数据库配置的默认值。

## 与 MySQL 有差异的特性说明

MatrixOne lower_case_table_names 默认设置为 1，且仅支持设置该值为 0 或 1。

MySQL 默认如下：

- Linux 系统中该值为 0，表示表名和数据库名按照在 CREATE TABLE 或 CREATE DATABASE 语句中指定的字母大小写存储在磁盘上，且名称比较时区分大小写。
- Windows 系统中该值为 1，表示表名按照小写字母存储在磁盘上，名称比较时不区分大小写。MySQL 在存储和查询时将所有表名转换为小写。该行为也适用于数据库名称和表的别名。
- macOS 系统中该值为 2，表示表名和数据库名按照在 CREATE TABLE 或 CREATE DATABASE 语句中指定的字母大小写存储在磁盘上，但 MySQL 在查询时将它们转换为小写。名称比较时不区分大小写。

## **限制**

MatrixOne 系统变量 `lower_case_table_names` 大小写模式暂不支持设置值 2，3 和 4。
