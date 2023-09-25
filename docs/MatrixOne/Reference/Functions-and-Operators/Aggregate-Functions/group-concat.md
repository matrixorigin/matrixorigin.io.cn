# **GROUP_CONCAT**

## **函数说明**

`GROUP_CONCAT` 函数返回一个字符串，它将通过列或者表达式指定的内容连接起来。

如果结果集没有任何行，此函数将返回 `NULL`。

## **函数语法**

```
> GROUP_CONCAT(expr)
```

完整的语法如下：

```
GROUP_CONCAT([DISTINCT] expr [,expr ...]
             [ORDER BY {unsigned_integer | col_name | expr}
                 [ASC | DESC] [,col_name ...]]
             [SEPARATOR str_val])
```

## **参数释义**

|  参数  | 说明 |
|  ----  | ----  |
| expr  | 必须参数。它指定了要连接的一个或者多个列或表达式。 |
| DISTINCT | 可选参数。它用于消除重复值。|
| ORDER BY | 可选参数。它用于对要连接的内容排序。默认情况下，它按升序排序值。如果要按降序对值进行排序，则需要明确指定 `DESC` 选项。|
|SEPARATOR | 可选参数。连接符。默认是 `,`。|

## **返回值**

返回值是一个非二进制或二进制字符串，这取决于参数 `expr` 是非二进制还是二进制字符串。

如果结果集没有任何行，此函数将返回 `NULL`。

## **示例**

```sql
create table t1(a int,b text,c text);
insert into t1 values(1,"a","bc"),(2,"ab","c"),(3,"aa","bb"),(3,"aa","bb");

mysql> select group_concat(distinct a,b,c separator '|') from t1;
+-----------------------------------+
| group_concat(distinct a, b, c, |) |
+-----------------------------------+
| 1abc|2abc|3aabb                   |
+-----------------------------------+
1 row in set (0.01 sec)

mysql> select group_concat(distinct b,c separator '|') from t1 group by a;
+--------------------------------+
| group_concat(distinct b, c, |) |
+--------------------------------+
| abc                            |
| abc                            |
| aabb                           |
+--------------------------------+
3 rows in set (0.01 sec)

mysql> select group_concat(distinct b,c separator '|') from t1;
+--------------------------------+
| group_concat(distinct b, c, |) |
+--------------------------------+
| abc|abc|aabb                   |
+--------------------------------+
1 row in set (0.01 sec)
```
