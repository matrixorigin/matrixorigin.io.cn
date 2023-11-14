# **SLEEP()**

## **函数说明**

`SLEEP()` 函数将当前查询暂停（睡眠）指定的秒数。结果将返回 0。

## **函数语法**

```
>
SLEEP(duration)
```

## **参数释义**

|  参数  | 说明 |
|  ----  | ----  |
| duration | 必需的。以秒为单位的睡眠时长。它应该大于或等于 0，并且可以带有小数部分。|

## **返回值**

- 当 `SLEEP()` 正常返回时（没有中断），它返回 0。

- 当 `SLEEP()` 被中断的查询调用唯一的结果时，它返回 1 并且查询本身不返回错误。

   示例如下：

   1. 在会话 1 中执行下面的命令，查询当前的 connection_id，并执行 `SLEEP()` 函数：

       ```sql
       mysql> select connection_id();
       +-----------------+
       | connection_id() |
       +-----------------+
       |            1476 |
       +-----------------+
       1 row in set (0.03 sec)
       mysql> select sleep(200);
       ```

   2. 此时，打开一个新的会话，中断会话 1，执行如下命令：

       ```sql
       mysql> kill 1476;
       Query OK, 0 rows affected (0.00 sec)
       ```

    3. 查看会话 1 的结果：

        ```
        mysql> select sleep(200);
        +------------+
        | sleep(200) |
        +------------+
        |          1 |
        +------------+
        1 row in set (26.50 sec)
        ```

- 部分查询被打断时，SLEEP() 返回错误，例如：

   ```sql
   mysql> SELECT 1 FROM t1 WHERE SLEEP(1000);
   ERROR 20101 (HY000): internal error: pipeline closed unexpectedly
   ```

## **示例**

```sql
-- without interruption
mysql> SELECT SLEEP(1);
+----------+
| sleep(1) |
+----------+
|        0 |
+----------+
1 row in set (1.01 sec)

-- without interruption
mysql> SELECT SLEEP(1000);
+-------------+
| sleep(1000) |
+-------------+
|           0 |
+-------------+
1 row in set (18 min 20.87 sec)

create table t1 (a int,b int);
insert into t1 values (1,1),(1,null);
mysql> select sleep(a) from t1;
+----------+
| sleep(a) |
+----------+
|        0 |
|        0 |
+----------+
2 rows in set (2.01 sec)
```
