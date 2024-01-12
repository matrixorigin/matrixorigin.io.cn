# **DROP FUNCTION**

## **语法说明**

`DROP FUNCTION` 语句表示删除用户自定义函数。

## **语法结构**

```
> DROP FUNCTION <name> ([<arg_data_type> ]… )
```

## **示例**

```sql
create or replace function py_add(a int, b int) returns int language python as 
$$
def add(a, b):
  return a + b
$$
handler 'add';

mysql> select py_add(1,2);
+--------------+
| py_add(1, 2) |
+--------------+
|            3 |
+--------------+
1 row in set (0.01 sec)

--当我们不再需要该函数时，可以将其删除
drop function py_add(int, int);

```