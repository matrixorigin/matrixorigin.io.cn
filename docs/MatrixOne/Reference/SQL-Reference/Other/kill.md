# **KILL**

## **语法说明**

`KILL` 语句用于终止正在运行的查询或进程。

!!! info
    终止进程或查询可能会导致未保存的数据丢失；终止正在运行的查询可能会占用系统资源，并且可能会影响其他正在运行的查询。

## **语法结构**

```
> KILL [CONNECTION | QUERY] process_id;
```

### 语法解释

`process_id` 是指要终止的进程或查询的标识符。如果使用 `CONNECTION` 关键字，则 `process_id` 是连接标识符，而如果使用 `QUERY` 关键字，则 `process_id` 是查询标识符。

## **示例**

```sql
select connection_id();
+-----------------+
| connection_id() |
+-----------------+
|            1008 |
+-----------------+
1 row in set (0.00 sec)

-- 终止查询进程
mysql> kill query 1008;
Query OK, 0 rows affected (0.00 sec)

-- 终止连接进程
mysql> kill connection 1008;
Query OK, 0 rows affected (0.00 sec)

-- 测试是否断开了连接
mysql> show databases;
ERROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
Connection id:    1180
-- 已经断开了连接，服务又开始重新连接
```
