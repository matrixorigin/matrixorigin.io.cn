# **CREATE DATABASE**

## **语法说明**

`CREATE DATABASE` 语句同于创建一个数据库。

## **语法结构**

```
> CREATE DATABASE [IF NOT EXISTS] <database_name> [create_option] ...

> create_option: [DEFAULT] {
	CHARACTER SET [=] charset_name
  | COLLATE [=] collation_name
  | ENCRYPTION [=] {'Y' | 'N'}
}
```

## **示例**

```sql
CREATE DATABASE IF NOT EXISTS test01;
```

**预期结果**

你可以使用 [`SHOW DATABASES`](../Database-Administration-Statements/SHOW-Statements/show-databases.md) 检查数据库是否已创建。

```sql
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| mo_task            |
| information_schema |
| mysql              |
| system_metrics     |
| system             |
| test01             |
| mo_catalog         |
+--------------------+
10 rows in set (0.01 sec)
```

可以看到，除了已存在的 6 个系统数据库以外，新的数据库 *test01* 已经创建。

## **限制**

- 目前只支持 `UTF-8` 字符集。
- `CHARACTER SET`，`COLLATE`，`ENCRYPTION` 目前可以使用但无法生效。
