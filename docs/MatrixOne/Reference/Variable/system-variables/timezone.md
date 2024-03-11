# time_zone 时区支持

MatrixOne 使用的时区取决于三个系统变量：`global.time_zone`，`session.time_zone` 和 `global.system_time_zone`。

* `global.system_time_zone` 表示服务器系统时区。当服务器启动时，它会尝试确定主机的时区，并使用它来设置系统时区（`system_time_zone`）。

* `global.time_zone` 表示服务器当前时区。初始 `time_zone` 值为 `SYSTEM`，表示服务器时区与系统时区相同。

你可以使用以下语句在运行时设置全局服务器时区，设置完成后无法在当前会话中生效，你需要先退出当前会话，再次重新连接 MatrixOne 时才会生效。

```
> SET GLOBAL time_zone = timezone;
```

* 每个会话都有自己的会话时区，由当时的会话 `time_zone` 变量决定。最初，会话时区的变量值从全局 `time_zone` 变量中获得，但会话客户端可以更改自己的时区。但是这个这个设置只会在当前会话期间有效。

```
SET time_zone = timezone;
```

使用以下 SQL 语句查看当前全局时区、客户端时区和系统时区的值：

```sql
> SELECT @@global.time_zone, @@session.time_zone, @@global.system_time_zone;
+-------------+-------------+--------------------+
| @@time_zone | @@time_zone | @@system_time_zone |
+-------------+-------------+--------------------+
| timezone    | +08:00      | CST                |
+-------------+-------------+--------------------+
1 row in set (0.01 sec)
```

设置 time_zone 的值的格式：

- 值 `SYSTEM` 表示时区应与服务器系统时区相同。

- 值 `UTC` 表示时区设置为 UTC（Coordinated Universal Time，协调世界时）。仅支持“UTC”缩写作为时区使用。

- 该值可以作为字符串给出，表示 UTC 时间的偏移，格式为“HH:MM”，带有 + 或 -，例如 `+10:00` 或者 `-6:00`。允许的范围是“-13:59”到“+14:00”。

当前会话时区设置会影响时区敏感时间值的显示和存储。即会影响执行 `NOW()` 等函数查询到的值以及存储在 `TIMESTAMP` 列中和从 `TIMESTAMP` 列中查询到的值。

会话时区设置不影响 `UTC_TIMESTAMP()` 等函数显示的值或 `DATE`、`TIME` 或 `DATETIME` 列中的值。

!!! note
    只有 Timestamp 数据类型的值是受时区影响的。可以理解为，Timestamp 数据类型的实际表示使用的是（字面值 + 时区信息）。其它时间和日期类型，比如 Datetime/Date/Time 是不包含时区信息的，所以也不受到时区变化的影响。

```sql
> SELECT @@global.time_zone, @@session.time_zone, @@global.system_time_zone;
+-------------+-------------+--------------------+
| @@time_zone | @@time_zone | @@system_time_zone |
+-------------+-------------+--------------------+
| SYSTEM      | SYSTEM      | CST                |
+-------------+-------------+--------------------+
1 row in set (0.00 sec)

> create table t (ts timestamp, dt datetime);
Query OK, 0 rows affected (0.02 sec)

mysql> set @@time_zone = 'UTC';
Query OK, 0 rows affected (0.00 sec)

mysql> insert into t values ('2017-09-30 11:11:11', '2017-09-30 11:11:11');
Query OK, 1 row affected (0.02 sec)

mysql> set @@time_zone = '+08:00';
Query OK, 0 rows affected (0.00 sec)

mysql> select * from t;
+---------------------+---------------------+
| ts                  | dt                  |
+---------------------+---------------------+
| 2017-09-30 19:11:11 | 2017-09-30 11:11:11 |
+---------------------+---------------------+
1 row in set (0.00 sec)
```

上面的例子中，无论怎么调整时区的值，Datetime 类型字段的值是不受影响的，而 Timestamp 则随着时区改变，显示的值会发生变化。其实 Timestamp 持久化到存储的值始终没有变化过，只是根据时区的不同显示值不同。

!!! note
    Timestamp 类型和 Datetime 等类型的值，两者相互转换的过程中，会涉及到时区。这种情况一律基于当前 time_zone 时区处理。

## 修改 MatrixOne 时区

1. 查看当前时间或时区：

```sql
> select now();
+----------------------------+
| now()                      |
+----------------------------+
| 2022-10-14 18:38:27.876181 |
+----------------------------+
1 row in set (0.00 sec)

> show variables like "%time_zone%";
+------------------+--------+
| Variable_name    | Value  |
+------------------+--------+
| system_time_zone | CST    |
| time_zone        | SYSTEM |
+------------------+--------+
2 rows in set (0.00 sec)
```

- `time_zone`：使用 system 的时区。

- `system_time_zone` 说明 system 使用服务器系统时区。

2. 修改当前时区：

```
set global time_zone = '+08:00';
set time_zone = '+08:00';
```

- `set global time_zone = '+08:00';`：修改 MatrixOne 全局时区为北京时间，即我们所在的东 8 区。
- `set time_zone = '+08:00';`：修改当前会话时区。

## 限制

MatrixOne 仅支持 `(+/-)HH:MM` 格式和 `UTC` 来设置 `time_zone` 的值。
