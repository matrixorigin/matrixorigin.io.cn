# **PURGE_LOG()**

## **函数说明**

`PURGE_LOG()` 用于删除日志。

!!! note
    目前，仅有 sys 用户（即集群管理员）拥有执行 `PURGE_LOG()` 函数以进行日志删除操作的权限。

## **函数语法**

```
> PURGE_LOG('sys_table_name', 'datetime')
```

## **参数释义**

|  参数  | 说明 |
|  ----  | ----  |
| 'sys_table_name' | 当前可进行删除的系统表仅三个：metric，raw_log，statement_info。<br> __Note:__ 'sys_table_name' 必须用单引号包裹。|
| 'datetime'  | 选择日期，删除该日期之前产生的日志。<br> __Note:__ 'datetime' 必须用单引号包裹。|

## **示例**

- 示例 1：

```sql
-- 删除 2023-06-30 这一天之前的 statement_info 类型的日志
mysql> select purge_log('statement_info', '2023-06-30') a;
+------+
| a    |
+------+
|    0 |
+------+
1 row in set (0.01 sec)
```

- 示例 2：

```sql
-- 查询 metric 日志采集的时间和数量
mysql> select date(collecttime), count(1) from system_metrics.metric group by date(collecttime);
+-------------------+----------+
| date(collecttime) | count(1) |
+-------------------+----------+
| 2023-07-04        |    74991 |
| 2023-07-03        |    38608 |
| 2023-07-05        |      378 |
+-------------------+----------+
3 rows in set (0.04 sec)

-- 删除 2023-07-04 这一天之前的 rawlog，statement_info，和 metric 三种类型的日志
mysql> select purge_log('rawlog,statement_info,metric', '2023-07-04');
+-----------------------------------------------------+
| purge_log(rawlog,statement_info,metric, 2023-07-04) |
+-----------------------------------------------------+
|                                                   0 |
+-----------------------------------------------------+
1 row in set (0.03 sec)

-- 再次查询 2023-07-04，2023-07-03 和 2023-07-05 这三天的 metric 日志数量
mysql> select date(collecttime), count(1) from system_metrics.metric group by date(collecttime);
+-------------------+----------+
| date(collecttime) | count(1) |
+-------------------+----------+
| 2023-07-05        |      598 |
+-------------------+----------+
1 rows in set (0.01 sec)
```
