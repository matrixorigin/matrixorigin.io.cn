# **DROP STAGE**

## **语法说明**

`DROP STAGE` 用于从数据库中删除一个已命名的内部或外部数据阶段。数据阶段是用于加载数据从文件到数据库表中，或将数据从数据库表导出到文件的临时存储区域。使用 `DROP STAGE` 命令可以将不再需要的数据阶段从数据库中移除，从而释放存储空间并避免产生额外的存储费用。

!!! note
    集群管理员（即 root 用户）和租户管理员可以删除数据阶段。

## **语法结构**

```
-- 删除内部阶段
> DROP STAGE [IF EXISTS] {internal_stage_name};

-- 删除外部阶段
> DROP STAGE  [IF EXISTS] {external_stage_name};
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

-- 删除 stage1
mysql> drop stage stage1;
Query OK, 0 rows affected (0.01 sec)

-- stage1 已经被删除，数据阶段不可用
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
ERROR 20101 (HY000): internal error: stage 'stage1' is not exists, please check
```
