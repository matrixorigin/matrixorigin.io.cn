# **JOIN**

## **语法说明**

``JOIN`` 用于把来自两个或多个表的行结合起来。

下图展示了 ``LEFT JOIN``、``RIGHT JOIN``、``INNER JOIN``、和 ``OUTER JOIN``。

**``LEFT JOIN``**

- 语法

```sql
SELECT [select_list] FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key
```

```sql
SELECT [select_list] FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key WHERE B.Key IS NULL
```

- 图示

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/left_join.png width=30% heigth=30%/>
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/left_join_where.png width=30% heigth=30%/>
    </div>  

**``RIGHT JOIN``**

- 语法

```sql
SELECT [select_list] FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key
```

```sql
SELECT [select_list] FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL
```

- 图示

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/right_join.png width=30% heigth=30%/>
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/right_join_where.png width=30% heigth=30%/>
    </div>

**``INNER JOIN``**

- 语法

```sql
select_list] FROM TableA A INNER JOIN TableB B ON A.Key=B.Key
```

- 图示

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/inner_join.png width=30% heigth=30%/>
    </div>

**``FULL JOIN``**

- 语法

```sql
SELECT [select_list] FROM TableA A FULL OUTER JOIN TableB B ON A.Key=B.Key
```

```sql
SELECT [select_list] FROM TableA A FULL OUTER JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL OR B.Key IS NULL
```

- 图示

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/full_join.png width=30% heigth=30%/>
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/full_join_where.png width=30% heigth=30%/>
    </div>

更多信息，参考：

- [LEFT JOIN](left-join.md)
- [RIGHT JOIN](right-join.md)
- [INNER JOIN](inner-join.md)
- [FULL JOIN](full-join.md)
- [OUTER JOIN](outer-join.md)
- [NATURAL JOIN](natural-join.md)
