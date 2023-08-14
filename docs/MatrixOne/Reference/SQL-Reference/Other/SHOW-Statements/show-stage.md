# **SHOW STAGES**

## **语法说明**

以列表的形式展现当前数据库创建的数据阶段。

MatrixOne 用户使用 `SHOW STAGES` 查看当前数据库所有的数据阶段，可以选择将数据导出到的有效路径。

## **语法结构**

```
> SHOW STAGES [LIKE 'pattern']
```

## **示例**

```sql
CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
INSERT INTO user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');

-- 创建内部数据阶段
mysql> CREATE STAGE stage1 URL='/tmp' ENABLE = TRUE;

-- 将数据从表导出到数据阶段
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
-- 你可以在你本地目录下看到你导出的表

-- 列表的形式展现当前数据库创建的数据阶段。
mysql> SHOW STAGES;
+------------+-----------------------------+---------+---------+
| STAGE_NAME | URL                         | STATUS  | COMMENT |
+------------+-----------------------------+---------+---------+
| stage1     | /tmp                        | ENABLED |         |
+------------+-----------------------------+---------+---------+
1 row in set (0.00 sec)
```
