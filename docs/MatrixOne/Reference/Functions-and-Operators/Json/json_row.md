# **JSON_ROW()**

## **函数说明**

`JSON_ROW()` 用于将每一行转化为 json 数组。

## **语法结构**

```sql
select json_row(col) from tabl_name;
```

## **示例**

```sql
create table student(n1 int,n2 json);
insert into student values
    (1,'{"name": "tom", "age": 18, "score": 90,"gender": "male"}'),
    (2,'{"name": "bob", "age": 20, "score": 80,"gender": "male"}'),
    (3,'{"name": "jane", "age": 17, "score": 95,"gender": "female"}'),
    (4,'{"name": "lily", "age": 19, "score": 79,"gender": "female"}');

mysql> select json_row(null,n2)  from student;
+---------------------------------------------------------------------+
| json_row(null, n2)                                                  |
+---------------------------------------------------------------------+
| [null,{"age": 18, "gender": "male", "name": "tom", "score": 90}]    |
| [null,{"age": 20, "gender": "male", "name": "bob", "score": 80}]    |
| [null,{"age": 17, "gender": "female", "name": "jane", "score": 95}] |
| [null,{"age": 19, "gender": "female", "name": "lily", "score": 79}] |
+---------------------------------------------------------------------+
4 rows in set (0.00 sec) 
```