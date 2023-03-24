# **DROP SEQUENCE**

## **语法说明**

`DROP SEQUENCE` 用于删除序列。它允许你删除先前使用 `CREATE SEQUENCE` 命令创建的序列。

删除序列会将序列的所有属性和值都删除。因此，在删除序列之前，必须确保没有任何表仍在使用该序列。

## **语法结构**

```
> DROP SEQUENCE [ IF EXISTS ] SEQUENCE_NAME [, ...]
  [IF EXISTS]
```

## **示例**

```sql
-- 删除了名为 "seq_id" 的序列
DROP SEQUENCE seq_id;
```
