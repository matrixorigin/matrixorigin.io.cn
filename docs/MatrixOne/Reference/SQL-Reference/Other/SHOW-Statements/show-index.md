# **SHOW INDEX**

## **语法说明**

`SHOW INDEX` 返回表的索引信息。

`SHOW INDEX` 返回以下字段：

|字段|描述|
|---|---|
|Table|表的名称。|
|Non_unique|如果索引不允许重复值，则为0；如果允许重复值，则为1。|
|Key_name|索引的名称。如果索引是主键，则名称始终为PRIMARY。|
|Seq_in_index|列在索引中的顺序号，从1开始。|
|Column_name|列的名称。请参阅Expression列的描述。|
|Collation|列在索引中的排序方式。可能的值为A（升序），D（降序）或NULL（未排序）。|
|Cardinality|索引中唯一值的估计数量。要更新此值，请运行ANALYZE TABLE或（对于MyISAM表）myisamchk -a。 <br>基数是基于存储为整数的统计信息计算的，因此即使对于小表，该值也不一定精确。基数越高，MySQL在执行连接操作时使用索引的可能性就越大。|
|Sub_part|索引的前缀。即，如果列只部分索引化，则为索引化的字符数；如果整列都索引化，则为NULL。<br> **注意：**前缀限制以字节为单位。但是，在CREATE TABLE、ALTER TABLE和CREATE INDEX语句中，用于索引规范的前缀长度解释为非二进制字符串类型（CHAR、VARCHAR、TEXT）的字符数，以及用于二进制字符串类型（BINARY、VARBINARY、BLOB）的字节数。在指定非二进制字符串列的前缀长度时，请考虑使用多字节字符集。|
|Packed|指示键是否被压缩。如果未压缩，则为NULL。|
|Null|如果列可能包含NULL值，则为YES；否则为空字符串。|
|Index_type|使用的索引方法（BTREE、FULLTEXT、HASH、RTREE）。|
|Comment|关于索引的其他信息，不在自己的列中描述，例如如果索引已禁用则为disabled。|
|Visible|索引是否对优化器可见。|
|Expression|对于非功能键部分，Column_name指示键部分索引的列，而Expression为NULL。<br>对于功能键部分，Column_name列为NULL，而Expression指示键部分的表达式。|

## **语法结构**

```
> SHOW {INDEX | INDEXES}
    {FROM | IN} tbl_name
    [{FROM | IN} db_name]
```

### 语法说明

`tbl_name FROM db_name` 语法的替代方法是 `db_name.tbl_name`。

## **示例**

```sql
CREATE TABLE show_01(sname varchar(30),id int);
mysql> show INDEX FROM show_01;
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+------------------+---------+------------+
| Table   | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment          | Visible | Expression |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+------------------+---------+------------+
| show_01 |          0 | id         |            1 | id          | A         |           0 | NULL     | NULL   | YES  |            |                  | YES     | NULL       |
| show_01 |          0 | sname      |            1 | sname       | A         |           0 | NULL     | NULL   | YES  |            |                  | YES     | NULL       |
| show_01 |          0 | __mo_rowid |            1 | __mo_rowid  | A         |           0 | NULL     | NULL   | NO   |            | Physical address | NO      | NULL       |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+------------------+---------+------------+
3 rows in set (0.02 sec)
```
