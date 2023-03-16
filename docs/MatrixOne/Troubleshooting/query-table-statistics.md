# MatrixOne 数据库统计信息

MatrixOne 数据库统计信息是指数据库通过采样、统计出来的表、列的相关信息，例如，表的个数、表的列数、表所占的存储空间等。MatrixOne 数据库在生成执行计划时，需要根据统计信息进行估算，计算出最优的执行计划。

MatrixOne 数据库的统计信息维度如下：

## 查看数据库下表的个数

通过该命令，可以查看指定数据库下表的总数。

**语法结构**：

```
SHOW TABLE_NUMBER FROM {DATABASE_NAME}
```

### 示例

- **示例 1**：查看系统数据库 mo_catalog 下的表的总数：

```sql
mysql> show table_number from mo_catalog;
+--------------------------------+
| Number of tables in mo_catalog |
+--------------------------------+
|                             11 |
+--------------------------------+

-- 验证一下是哪些表
mysql> use mo_catalog;
mysql> show tables;
+----------------------------+
| Tables_in_mo_catalog       |
+----------------------------+
| mo_user                    |
| mo_account                 |
| mo_role                    |
| mo_user_grant              |
| mo_role_grant              |
| mo_role_privs              |
| mo_user_defined_function   |
| mo_columns                 |
| mo_mysql_compatbility_mode |
| mo_tables                  |
| mo_database                |
+----------------------------+
11 rows in set (0.01 sec)
```

- **示例 2**：创建数据库，并创建了新的表，查询指定数据库下表的总数：

```sql
create database demo_1;
use demo_1;
-- 创建三个新的表
CREATE TABLE t1(a bigint, b varchar(10), c varchar(10));
CREATE TABLE t2(a bigint, b int);
CREATE TABLE t3(a int, b varchar(10), c varchar(10));

-- 查询出数据库 demo_1 中有三个表
mysql> show table_number from demo_1;
+----------------------------+
| Number of tables in demo_1 |
+----------------------------+
|                          3 |
+----------------------------+
1 row in set (0.01 sec)
```

## 查看表拥有的列数

通过该命令，可以查看指定表的总列数。

**语法结构**：

```
SHOW COLUMN_NUMBER FROM {[DATABASE_NAME.]TABLE_NAME}
```

### 示例

```sql
use mo_catalog;
use mo_user;
mysql> show column_number from mo_user;
+------------------------------+
| Number of columns in mo_user |
+------------------------------+
|                           11 |
+------------------------------+

-- 或者使用下面的命令
mysql> show column_number from mo_catalog.mo_user;
+------------------------------+
| Number of columns in mo_user |
+------------------------------+
|                           11 |
+------------------------------+

-- 查看验证有哪些列
mysql> desc mo_catalog.mo_user;
+-----------------------+--------------+------+------+---------+-------+---------+
| Field                 | Type         | Null | Key  | Default | Extra | Comment |
+-----------------------+--------------+------+------+---------+-------+---------+
| user_id               | INT          | YES  |      | NULL    |       |         |
| user_host             | VARCHAR(100) | YES  |      | NULL    |       |         |
| user_name             | VARCHAR(300) | YES  |      | NULL    |       |         |
| authentication_string | VARCHAR(100) | YES  |      | NULL    |       |         |
| status                | VARCHAR(8)   | YES  |      | NULL    |       |         |
| created_time          | TIMESTAMP    | YES  |      | NULL    |       |         |
| expired_time          | TIMESTAMP    | YES  |      | NULL    |       |         |
| login_type            | VARCHAR(16)  | YES  |      | NULL    |       |         |
| creator               | INT          | YES  |      | NULL    |       |         |
| owner                 | INT          | YES  |      | NULL    |       |         |
| default_role          | INT          | YES  |      | NULL    |       |         |
+-----------------------+--------------+------+------+---------+-------+---------+
11 rows in set (0.01 sec)
```

## 查看表中所有列包含的最大与最小值

通过该命令，可以查看指定表中的每一列的最大值与最小值。

__Note:__ 如果指定表中各列值的数据类型不一致，则排序规则为：按照数字的大小排序；日期按照时间先后排序；字符类按照 ASCII 码排序；当几种数据类型混合排序时，非字符类型的则先转换为字符类型，然后按 ASCII 码排序。

**语法结构**：

```
SHOW TABLE_VALUES FROM {[DATABASE_NAME.]TABLE_NAME}
```

### 示例

```sql
create table t1(
col1 int,
col2 float,
col3 varchar
);
insert into t1 values(1,1.11,'1.111'),(2,2.22,'1.222'),(3,0,'abc');

mysql> show table_values from t1;
+-----------+-----------+-----------+-----------+-----------+-----------+
| max(col1) | min(col1) | max(col2) | min(col2) | max(col3) | min(col3) |
+-----------+-----------+-----------+-----------+-----------+-----------+
|         3 |         1 |      2.22 |         0 | abc       | 1.111     |
+-----------+-----------+-----------+-----------+-----------+-----------+
```

## 查看表中的数据总行数

通过调用该函数，即可获得数据库中某张表的数据总行数。

**语法结构**：

```
MO_TABLE_ROWS({DATABASE_NAME},{TABLE_NAME})
```

### 示例

```sql
-- 查询数据库 mo_catalog 下表 mo_tables 的总行数
mysql> select mo_table_rows('mo_catalog','mo_tables');
+--------------------------------------+
| mo_table_rows(mo_catalog, mo_tables) |
+--------------------------------------+
|                                   64 |
+--------------------------------------+
```

## 查看表在存储中占用的空间

通过调用该函数，即可获得数据库中某张表占用的存储空间，单位是字节数。

**语法结构**：

```
MO_TABLE_SIZE({DATABASE_NAME},{TABLE_NAME})
```

### 示例

```sql
-- 查询数据库 mo_catalog 下表 mo_tables 占用的存储空间
mysql> select mo_table_size('mo_catalog','mo_tables');
+--------------------------------------+
| mo_table_size(mo_catalog, mo_tables) |
+--------------------------------------+
|                                16128 |
+--------------------------------------+
```
