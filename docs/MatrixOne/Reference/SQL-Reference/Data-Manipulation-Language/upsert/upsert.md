# UPSERT

## SQL 中的 Upsert 是什么？

`UPSERT` 是数据库管理系统管理数据库的基本功能之一，是 `UPDATE` 和 `INSERT` 的组合，它允许数据库操作语言在表中插入一条新的数据或更新已有的数据。当 `UPSERT` 操作的是一条新数据时，会触发 `INSERT` 操作，若记录已经存在于表中，则 `UPSERT` 类似于 `UPDATE` 语句。

例如，我们有一个 `student` 表，`id` 列作为主键：

```sql
> desc student;
+-------+-------------+------+------+---------+-------+---------+
| Field | Type        | Null | Key  | Default | Extra | Comment |
+-------+-------------+------+------+---------+-------+---------+
| id    | INT(32)     | NO   | PRI  | NULL    |       |         |
| name  | VARCHAR(50) | YES  |      | NULL    |       |         |
+-------+-------------+------+------+---------+-------+---------+
```

在更改此表中的学生信息时，我们可以使用 `upsert`。从逻辑上讲是这样的：

- 如果表中存在学生 id，请使用新信息更新该行。

- 如果表中不存在学生，请将其添加为新行。

然而，`UPSERT` 命令在 Matrixone 中不存在，但仍然可以实现 `UPSERT`。默认情况下，Matrixone 提供了以下三种方式来实现 Matrixone UPSERT 操作：

- [INSERT ON DUPLICATE KEY IGNORE](insert-on-duplicate-ignore.md)

- [INSERT ON DUPLICATE KEY UPDATE](insert-on-duplicate.md)

- [REPLACE](replace.md)

## INSERT ON DUPLICATE KEY IGNORE

当我们向表中插入非法行时，`INSERT ON DUPLICATE KEY IGNORE` 语句会忽略执行时的 error。比如，主键列不允许我们存储重复值。当我们使用 INSERT 向表中插入一条数据，而这条数据的主键已经在表中存在了，此时 Matrixone 服务器生成 error，语句执行失败。然而，当我们使用 `INSERT ON DUPLICATE KEY IGNORE` 来执行此语句时，Matrixone 服务器将不会生成 error。

## REPLACE

在某些情况下，我们希望更新已经存在的数据。此时可以使用 `REPLACE`，当我们使用 REPLACE 命令时，可能会有下列两种情况发生：

- 如果数据库中没有对应的记录，则执行标准的 `INSERT` 语句。

- 如果数据库中有对应的记录，则 `REPLACE` 语句会先删除数据库中的对应记录，再执行标准的 INSERT 语句（当主键或唯一索引重复时，会执行此更新操作）

在 `REPLACE` 语句中，更新数据分为两步：先删除原有记录，再插入要更新的记录。

## INSERT ON DUPLICATE KEY UPDATE

目前为止，我们已经看过两种 `UPSERT` 命令了，但它们都有一些限制。`INSERT ON DUPLICATE KEY IGNORE` 只是简单忽略了 `duplicate error`。`REPLACE` 会检测 `INSERT error`，但是它在添加新数据前会删除原有数据。因此，我们仍然需要一种更好的解决方案。

`INSERT ON DUPLICATE KEY UPDATE` 是一个更好的解决方案，它不会删除重复的行，当我们在 SQL 语句中使用 `ON DUPLICATE KEY UPDATE子` 句并且有一行数据在主键或唯一索引上产生 `duplicate error` 时，会在已有的数据上做更新。
