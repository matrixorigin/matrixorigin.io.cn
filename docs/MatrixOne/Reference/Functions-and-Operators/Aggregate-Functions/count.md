# **COUNT**

## **函数说明 n**

`COUNT()` 是聚合函数的一种，计算了查询结果的记录数，结果是一个 BIGINT 值。当没有匹配的行或 `COUNT(NULL)` 时返回 0。

## **函数语法**

```
> COUNT(expr)
```

```
> COUNT(distinct column)
```

## **参数释义**

<table>
  <tr>
    <th>参数</th>
    <th>说明</th>
  </tr>
  <tr>
    <td >expr</td>
    <td>任何查询结果，既可以是列名，也可以是一个函数或者数学运算的结果。当不带 distinct 参数时也可以使用 `*`，直接统计行数</td>
  </tr>
  <tr>
    <td nowrap>distinct column</td>
  <td>对列中重复值去重。</td>
  </tr>
</table>

## **示例**

```sql
drop table if exists tbl1,tbl2;
create table tbl1 (col_1a tinyint, col_1b smallint, col_1c int, col_1d bigint, col_1e char(10) not null);
insert into tbl1 values (0,1,1,7,"a");
insert into tbl1 values (0,1,2,8,"b");
insert into tbl1 values (0,1,3,9,"c");
insert into tbl1 values (0,1,4,10,"D");
insert into tbl1 values (0,1,5,11,"a");
insert into tbl1 values (0,1,6,12,"c");

> select count(col_1b) from tbl1;
+---------------+
| count(col_1b) |
+---------------+
|             6 |
+---------------+

> select count(*) from tbl1 where col_1d<10;
+----------+
| count(*) |
+----------+
|        3 |
+----------+

mysql> select count(distinct col_1b) from tbl1;
+------------------------+
| count(distinct col_1b) |
+------------------------+
|                      1 |
+------------------------+
```
