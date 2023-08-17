# **LIKE**

## **语法说明**

`LIKE` 操作符用于在 `WHERE` 子句中搜索列中的指定模式。

有两个通配符经常与 `LIKE` 操作符一起使用：

- 百分号 `%` 通配符：表示匹配任意字符序列（包括空字符序列）。

    + %text：匹配以 "text" 结尾的字符串。
    + text%：匹配以 "text" 开头的字符串。
    + %text%：匹配包含 "text" 的字符串。

- 下划线 `_` 通配符：表示匹配单个字符。

    + `te_t`：可以匹配 "text"、"test" 等。

- 其他字符：`LIKE` 操作符对其他字符是大小写敏感的。

## **语法结构**

```
> SELECT column1, column2, ...
FROM table_name
WHERE columnN LIKE pattern;
```

## **示例**

```sql
drop table t1;
create table t1(a varchar(20));
insert into t1 values ('abc'), ('ABC'), ('abC');
select * from t1 where a ilike '%abC%';

mysql> select * from t1 where a like '%abC%';
+------+
| a    |
+------+
| abC  |
+------+
1 row in set (0.00 sec)
```
