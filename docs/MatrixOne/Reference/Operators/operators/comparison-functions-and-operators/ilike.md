# **ILIKE**

## **语法说明**

`ILIKE` 操作符与 `LIKE` 操作符用法相似，用于在 WHERE 子句中搜索列中的指定模式。

`ILIKE` 操作符与 `LIKE` 操作符的主要区别在于大小写敏感性。使用 `ILIKE` 时，不论字符串中的字符是大写还是小写，它们都会被视为相同。

## **语法结构**

```
> SELECT column1, column2, ...
FROM table_name
WHERE columnN ILIKE pattern;
```

## **示例**

```sql
drop table t1;
create table t1(a varchar(20));
insert into t1 values ('abc'), ('ABC'), ('abC');
select * from t1 where a ilike '%abC%';

mysql> select * from t1 where a ilike '%abC%';
+------+
| a    |
+------+
| abc  |
| ABC  |
| abC  |
+------+
3 rows in set (0.01 sec)
```
