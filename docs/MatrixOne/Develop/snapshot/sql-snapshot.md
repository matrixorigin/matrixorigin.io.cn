# 使用 SQL 进行快照备份恢复

MatrixOne 支持以下两种方式进行租户级别快照备份恢复：

- sql 语句
- [mo_br 工具](mo-backup-snapshot.md)

本篇文档主要介绍如何使用 sql 语句来进行快照备份恢复。

## 开始前准备

- 已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## 示例

创建一个名为 inventory 的表，用于存储商品库存信息

```sql
CREATE TABLE inventory (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    quantity_in_stock INT NOT NULL
);
INSERT INTO inventory (item_name, quantity_in_stock) VALUES ('Widget', 150);
INSERT INTO inventory (item_name, quantity_in_stock) VALUES ('Gadget', 200);
INSERT INTO inventory (item_name, quantity_in_stock) VALUES ('Doohickey', 80);

mysql> select * from inventory;
+---------+-----------+-------------------+
| item_id | item_name | quantity_in_stock |
+---------+-----------+-------------------+
|       1 | Widget    |               150 |
|       2 | Gadget    |               200 |
|       3 | Doohickey |                80 |
+---------+-----------+-------------------+
3 rows in set (0.01 sec)
```

由于业务原因，需要进行系统升级，为了防止升级过程造成数据丢失，在升级前我们可以为租户创建快照。

```sql
create snapshot sp1 for account acc1;
```

假设在一次系统升级中，inventory 表的数据不慎丢失了。幸运的是，我们有之前创建的快照。模拟数据丢失情况并恢复数据：

```sql
truncate table inventory;

mysql> select * from inventory;
Empty set (0.01 sec)
```

这时我们可以使用快照恢复数据并验证数据的一致性。

```sql
restore account acc1 FROM snapshot sp1;

mysql> select * from inventory;
+---------+-----------+-------------------+
| item_id | item_name | quantity_in_stock |
+---------+-----------+-------------------+
|       1 | Widget    |               150 |
|       2 | Gadget    |               200 |
|       3 | Doohickey |                80 |
+---------+-----------+-------------------+
3 rows in set (0.00 sec)
```

可以看到，数据成功恢复。

## 参考文档

对于快照相关的更多语法说明和支持范围可参考以下文档：

- [CREATE SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [DROP SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/drop-snapshot.md)
- [SHOW SNAPSHOTS](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [RESTORE ACCOUNT](../../Reference/SQL-Reference/Data-Definition-Language/restore-account.md)
