# **ALTER STAGE**

## **语法说明**

`ALTER STAGE` 用于修改现有已命名的内部或外部阶段的属性。

!!! note
    集群管理员（即 root 用户）和租户管理员可以修改数据阶段。

## **语法结构**

```
> ALTER STAGE [ IF EXISTS ] { stage_name }
   { StageParams }
   [ directoryTableParams ]
   [ COMMENT = '<string_literal>' ]

StageParams (for Amazon S3) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "role_arn"='xxxx', "external_id"='yyy', "filepath"='<string>', "region"='<string>', "compression"='<string>'}

StageParams (for Aliyun OSS) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "role_arn"='xxxx', "external_id"='yyy', "filepath"='<string>', "region"='<string>', "compression"='<string>'}

StageParams (for File System) :
URL= 'filepath'

directoryTableParams :
ENABLE = { TRUE | FALSE }
```

## 语法解释

- `IF NOT EXISTS`：可选参数，用于在创建 Stage 时检查是否已存在同名的 Stage，避免重复修改。

- `stage_name`：要修改的 Stage 的名称。

- `StageParams`：这是一个参数组，用于指定 Stage 的配置参数。

    - `endpoint`：Stage 的连接 URL，指定对象存储服务的位置。对于不同的对象存储服务（如 Amazon S3、Aliyun OSS、文件系统等），这个 URL 的内容可能有所不同。例如：s3.us-west-2.amazonaws.com

    - `CREDENTIALS`：这是一个 JSON 对象，包含连接到对象存储服务所需的凭证信息，如 `access_key_id`、`secret_access_key`、`bucket` 等。

    - `role_arn`、`external_id`：这两个参数通常与跨账号的访问权限有关，用于授权访问。__Note:__ MatrixOne 暂不支持这两个参数。

    - `filepath`：指定要加载或卸载的文件的路径，可以支持正则表达式，例如 `/files/*.csv`。

    - `region`：对象存储服务的地区。

    - `compression`：S3 文件的压缩格式，可选项为 `"auto"`、`"none"`、`"gzip"`、`"bz2"`、`"lz4"`。

- `directoryTableParams`：这是一个参数组，用于指定 Stage 的目录表（directory table）的配置。

    - `ENABLE`：是否修改启用目录表，值为 `TRUE` 或 `FALSE`。

## **示例**

```sql
CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
INSERT INTO user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');

-- 创建内部数据阶段
mysql> CREATE STAGE stage1 URL='/tmp' ENABLE = TRUE;

-- 将数据从表导出到数据阶段
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
-- 你可以在你本地目录下看到你导出的表

mysql> SHOW STAGES;
+------------+-----------------------------+---------+---------+
| STAGE_NAME | URL                         | STATUS  | COMMENT |
+------------+-----------------------------+---------+---------+
| stage1     | /Users/Prinz/03testrepo/csv | ENABLED |         |
+------------+-----------------------------+---------+---------+
1 row in set (0.01 sec)

-- 修改 stage
mysql> ALTER STAGE stage1 SET COMMENT 'user stage';

mysql> SHOW STAGES;
+------------+-----------------------------+---------+------------+
| STAGE_NAME | URL                         | STATUS  | COMMENT    |
+------------+-----------------------------+---------+------------+
| stage1     | /Users/Prinz/03testrepo/csv | ENABLED | user stage |
+------------+-----------------------------+---------+------------+
1 row in set (0.00 sec)

-- 禁用名为 'stage1' 的数据阶段
mysql> ALTER STAGE stage1 SET ENABLE = FALSE;
Query OK, 0 rows affected (0.00 sec)

-- 尝试将 user 表的数据导出到名为 'stage1:/user.csv' 的数据阶段中，但 stage1 已经被禁用，所以已不可用，产生报错
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
ERROR 20101 (HY000): internal error: stage 'stage1' is invalid, please check
```
