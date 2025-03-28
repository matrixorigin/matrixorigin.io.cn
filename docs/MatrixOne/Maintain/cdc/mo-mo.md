# MatrixOne 到 MatrixOne CDC 功能

## 场景描述

一家社交平台企业使用 MatrixOne 作为生产数据库存储用户活动日志（如登录、点赞、评论等）。为了支持实时分析（如活跃用户统计、行为趋势等），需要将用户活动数据从生产 MatrixOne 实时同步到另一个 MatrixOne 分析数据库中。通过 `mo_cdc` 工具，可以实现高效的数据同步，确保分析系统获取最新数据。

- **源数据库（生产数据库）**: MatrixOne 中的 `user_activities` 表，包含用户 ID、活动类型、时间戳等。
- **目标数据库（分析数据库）**: MatrixOne 中的 `analytics_activities` 表，用于实时分析用户行为。
- **同步需求**: 通过 `mo_cdc` 将 `user_activities` 数据实时同步到 `analytics_activities`，确保分析系统数据一致性。

## 操作流程

### 创建 PITR

```sql
create pitr pitr_activity for account range 2 "h";
```

### 源端建表并插数据

```sql
CREATE DATABASE production_db;
CREATE TABLE production_db.user_activities (
    activity_id INT PRIMARY KEY,
    user_id INT,
    activity_type VARCHAR(50),
    timestamp DATETIME,
    device VARCHAR(20)
);
INSERT INTO production_db.user_activities VALUES
    (1, 1001, 'login', '2024-01-01 09:00:00', 'mobile'),
    (2, 1002, 'like', '2024-01-01 10:15:00', 'desktop'),
    (3, 1003, 'comment', '2024-01-02 14:30:00', 'mobile');
```

### 在下游创建数据库

```sql
CREATE DATABASE analytics_db;
```

### 创建 `mo_cdc` 同步任务

```bash
./mo_cdc task create \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001" \
    --sink-type "matrixone" \
    --sink-uri "mysql://root:111@10.222.xx.xx:6001" \
    --level table \
    --tables "production_db.user_activities:analytics_db.analytics_activities"
```

### 查看任务状态

```bash
> ./mo_cdc task show \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
[
  {
    "task-id": "0195dbb6-e31e-7572-bfdb-812fd02714a1",
    "task-name": "activity_sync",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@10.222.xx.xx:6001",
    "state": "running",
    "err-msg": "",
    "checkpoint": "{\n}",
    "timestamp": "2025-03-28 15:46:06.077697 +0800 CST"
  }
]
```

### 验证全量同步

连接下游 matrixone 查看全量数据同步情况

```sql
mysql> SELECT * FROM analytics_db.analytics_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           1 |    1001 | login         | 2024-01-01 09:00:00 | mobile  |
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
3 rows in set (0.02 sec)
```

### 增量同步任务

任务建立后，在上游 MatrixOne 进行数据变更操作

```sql
INSERT INTO production_db.user_activities VALUES
    (4, 1004, 'share', '2024-01-03 16:45:00', 'desktop');
UPDATE production_db.user_activities SET activity_type = 'logout' WHERE activity_id = 1;
```

连接下游 matrixone 查看增量数据同步情况

```sql
mysql> SELECT * FROM analytics_db.analytics_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
|           4 |    1004 | share         | 2024-01-03 16:45:00 | desktop |
|           1 |    1001 | logout        | 2024-01-01 09:00:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
4 rows in set (0.01 sec)
```

### 断点续传

现在由于意外造成任务中断。

```bash
./mo_cdc task pause \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
```

任务中断期间，往上游 MatrixOne 继续插入数据。

```sql
INSERT INTO production_db.user_activities VALUES
    (5, 1005, 'login', '2024-01-04 08:00:00', 'mobile');

mysql> select * from production_db.user_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           4 |    1004 | share         | 2024-01-03 16:45:00 | desktop |
|           1 |    1001 | logout        | 2024-01-01 09:00:00 | mobile  |
|           5 |    1005 | login         | 2024-01-04 08:00:00 | mobile  |
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
5 rows in set (0.01 sec)
```

手动恢复任务。

```bash
> ./mo_cdc task resume \
    --task-name "activity_sync" \
    --source-uri "mysql://root:111@127.0.0.1:6001"
```

连接下游 mysql 查看断点续传情况。

```sql
mysql> -- 下游应包含中断期间的数据
SELECT * FROM analytics_db.analytics_activities;
+-------------+---------+---------------+---------------------+---------+
| activity_id | user_id | activity_type | timestamp           | device  |
+-------------+---------+---------------+---------------------+---------+
|           4 |    1004 | share         | 2024-01-03 16:45:00 | desktop |
|           1 |    1001 | logout        | 2024-01-01 09:00:00 | mobile  |
|           5 |    1005 | login         | 2024-01-04 08:00:00 | mobile  |
|           2 |    1002 | like          | 2024-01-01 10:15:00 | desktop |
|           3 |    1003 | comment       | 2024-01-02 14:30:00 | mobile  |
+-------------+---------+---------------+---------------------+---------+
5 rows in set (0.01 sec)
```

## 应用效果

通过该方案，企业实现了：

- 实时用户行为分析：如活跃用户统计、设备分布。
- 数据一致性保障：断点续传确保网络中断时不丢数据。
- 低延迟：分析系统始终与生产数据保持同步。