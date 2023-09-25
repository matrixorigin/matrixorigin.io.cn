# **CREATE STAGE**

## **语法说明**

`CREATE STAGE` 用于在 MatrixOne 数据库中创建一个命名的内部或外部数据阶段（Stage），用于**数据导出**，你可以创建一个数据阶段，通过将数据导出到数据阶段，你可以将数据文件下载到本地或将其存储在云存储服务中。

- **内部阶段（Internal Stage）**：内部阶段将数据文件存储在 MatrixOne 内部。内部阶段可以是永久性的或临时性的。

- **外部阶段（External Stage）**：外部阶段引用存储在 MatrixOne 之外位置的数据文件。目前，支持以下云存储服务：

    - Amazon S3 存储桶
    - Aliyun 存储桶

存储位置可以是私有/受保护的，也可以是公开的。但是，无法访问需要恢复才能检索的存档云存储类别中的数据。

内部或外部阶段可以包括一个目录表。目录表在云存储中存储分阶段文件的目录。

- 配置一个指定路径，控制用户 `SELECT INTO` 的写入权限，在创建之后，用户只能写入指定的 `STAGE` 路径

- 如果不创建 `STAGE` 或全部 `STAGE` 都在 `DISABLED` 状态下，用户可以在操作系统或对象存储的权限允许情况下，写入任何路径。

- 如果不使用 `STAGE`，用户 `SELECT INTO` 时必须强行加入 `credential` 信息。

!!! note
    1. 集群管理员（即 root 用户）和租户管理员可以创建数据阶段。
    2. 创建完成数据阶段以后，数据表只能导入至 STAGE 指定路径。

## **语法结构**

```
> CREATE STAGE [ IF NOT EXISTS ] { stage_name }
   { StageParams }
   [ directoryTableParams ]
   [ COMMENT = '<string_literal>' ]

StageParams (for Amazon S3) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>', "filepath"='<string>', "region"='<string>'}

StageParams (for Aliyun OSS) :
URL =  "endpoint"='<string>' CREDENTIALS = {"access_key_id"='<string>', "secret_access_key"='<string>'}

StageParams (for File System) :
URL= 'filepath'

directoryTableParams :
ENABLE = { TRUE | FALSE }
```

## 语法解释

- `IF NOT EXISTS`：可选参数，用于在创建 Stage 时检查是否已存在同名的 Stage，避免重复创建。

- `stage_name`：要创建的 Stage 的名称。

- `StageParams`：这是一个参数组，用于指定 Stage 的配置参数。

    - `endpoint`：Stage 的连接 URL，指定对象存储服务的位置。对于不同的对象存储服务（如 Amazon S3、Aliyun OSS、文件系统等），这个 URL 的内容可能有所不同。例如：s3.us-west-2.amazonaws.com

    - `CREDENTIALS`：这是一个 JSON 对象，包含连接到对象存储服务所需的凭证信息，

         + `access_key_id`：用于身份验证的访问密钥 ID。
         + `secret_access_key`：与访问密钥 ID 相关联的密钥。
         + `"filepath"='<string>`：指定 S3 存储中的文件路径或目录。
         + `"region"='<string>'`：指定 Amazon S3 存储所在的 AWS 区域。

- `directoryTableParams`：这是一个参数组，用于指定 Stage 的目录表（directory table）的配置。

    - `ENABLE`：是否启用目录表，值为 `TRUE` 或 `FALSE`。

## **示例**

```sql
CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
INSERT INTO user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');

-- 创建内部数据阶段
mysql> CREATE STAGE stage1 URL='/tmp' ENABLE = TRUE;

-- 将数据从表导出到数据阶段
mysql> SELECT * FROM user INTO OUTFILE 'stage1:/user.csv';
-- 你可以在你本地目录下看到你导出的表

-- 当设置好数据阶段以后，数据表只能导出到指定路径，导出到其他路径将报错
mysql> SELECT * FROM user INTO OUTFILE '~/tmp/csv2/user.txt';
ERROR 20101 (HY000): internal error: stage exists, please try to check and use a stage instead
```
