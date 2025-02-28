# **ALTER PITR**

## **语法说明**

`ALTER PITR` 用于更改 PITR。

## **语法结构**

```
> ALTER PITR <pitr_name> RANGE <value> <unit>
```

## **示例**

```sql
mysql> create pitr cluster_pitr1 for cluster range 1 "d";
Query OK, 0 rows affected (0.04 sec)

mysql> alter pitr cluster_pitr1 range 2 "d";
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr;
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME     | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| cluster_pitr1 | 2025-02-28 15:57:49 | 2025-02-28 15:58:27 | cluster    | *            | *             | *          |           2 | d         |
+---------------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)
```
