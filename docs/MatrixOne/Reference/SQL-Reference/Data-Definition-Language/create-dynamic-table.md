# **CREATE DYNAMIC TABLE**

## **语法说明**

`CREATE DYNAMIC TABLE` 将一个新的动态表添加到当前数据库中。

## **语法结构**


```sql
CREATE DYNAMIC TABLE [IF NOT EXISTS] table_name 
AS SELECT ... from stream_name ;
```


## 语法解释

- table_name: 动态表名称。动态表名称必须与当前数据库中任何现有的动态表名称不同。
- stream_name: 已经创建的 SOURCE 的名称。



## **示例**

```sql
create dynamic table dt_test as select * from stream_test;
Query OK, 0 rows affected (0.01 sec)
```

## 限制

创建动态表时暂不支持使用聚集函数、数学函数、字符串函数、日期函数以及limit、offset	、from subquery、not in/in subquery、group by、order by、having 语句。
创建动态表时暂不支持对两个SOURCE表的join、可以join SOURCE表和普通数据表。

