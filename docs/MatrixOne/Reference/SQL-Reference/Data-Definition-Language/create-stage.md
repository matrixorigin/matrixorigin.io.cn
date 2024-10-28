# **CREATE STAGE**

## **语法说明**

`CREATE STAGE` 用于提供一种高效、安全的方式来与外部存储（如 Amazon S3、文件系统）进行数据交互。通过创建一个外部 Stage，MatrixOne 可以从外部存储中读取文件，并将其快速加载到 MatrixOne 数据库表中。例如，将 Amazon S3 上的 CSV 文件加载到表中。

目前支持以下外部存储：

- Amazon S3
- MinIO
- File System

## **语法结构**

```
> CREATE STAGE [ IF NOT EXISTS ] { stage_name }
   { StageParams }
   [ COMMENT = '<string_literal>' 

StageParams (for MinIO/Amazon S3) :
URL =  "s3://<bucket>[/<path>/]" CREDENTIALS = {"AWS_KEY_ID"='<string>', "AWS_SECRET_KEY"='<string>', "AWS_ROLE"='<string>', "AWS_TOKEN"='<string>', "AWS_REGION"='<string>', "COMPRESSION"='<string>', 'PROVIDER'='<string>', 'ENDPOINT'='<string>'}

StageParams (for File System) :
URL= 'file://[/path/]'

StageParams (for sub-stage):
URL= "stage://<stagename>[/path/]"
```

## **语法解释**

- `IF NOT EXISTS`：可选参数，用于在创建 Stage 时检查是否已存在同名的 Stage，避免重复创建。

- `stage_name`：要创建的 Stage 的名称。

- `StageParams (for MinIO/Amazon S3)`：用于指定对象存储为 MinIO 或 S3 的 Stage 的配置参数。

    - `URL`：指定 S3 存储中的文件路径或目录
    - `CREDENTIALS`：这是一个 JSON 对象，包含连接到对象存储服务所需的凭证信息。

         + `access_key_id`：用于身份验证的访问密钥 ID。
         + `secret_access_key`：与访问密钥 ID 相关联的密钥。
         + `aws_role`：非必填，如果使用了 IAM 角色，用于指定角色名称。可以在 AWS 上配置角色来分配不同的权限。
         + `aws_token`：非必填，用于临时访问 AWS 服务的安全令牌。
         + `aws_region`：指定 Amazon S3 存储所在的 AWS 区域。
         + `compression`：非必填，指定文件的压缩类型。
         + `provider`：指定云存储提供商。
         + `endpint`：指定连接自定义或第三方兼容 S3 API 的服务。

- `StageParams (for File System)`：用于指定文件系统存储的 Stage 的配置参数。

    - `URL`：指定文件存储中的文件路径或目录。

- `StageParams (for sub-stage)`：用于子 Stage 的配置参数。
  
    - `URL`：指定文件存储中的文件路径或目录。

- `COMMENT`：注释。
  
## **示例**

```sql
#文件系统
mysql> create stage stage_fs url = 'file:///Users/admin/test';

#子stage
mysql> create stage sub_stage url = 'stage://fs_stage/test1/';

#s3
mysql>create stage stage01 url = 's3://bucket1/test' credentials = {"aws_key_id"='AKIAYOFAMAB7FM7Axxxx',"aws_secret_key"='UjuSDmekK6uXK6CrUs9YhZzY27VOk9W3qMwYxxxx',"AWS_REGION"='us-west-2','PROVIDER'='Amazon', 'ENDPOINT'='s3.us-west-2.amazonaws.com'};
```
