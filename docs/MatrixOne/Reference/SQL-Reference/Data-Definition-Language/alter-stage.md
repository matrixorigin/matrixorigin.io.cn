# **ALTER STAGE**

## **语法说明**

`ALTER STAGE` 用于修改用于修改一个已有的 stage 的属性。

!!! note
    `ALTER STAGE` 只能一次修改一个参数。因此，如果你需要同时更新多个参数，例如 `URL` 和 `COMMENT`，需要分别执行多次 `ALTER STAGE` 语句，每次修改一个参数。

## **语法结构**

```
> ALTER STAGE [ IF EXISTS ] { stage_name } SET
   { StageParams }
   [ COMMENT = '<string_literal>' ]
   
StageParams (for Amazon S3) :
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
create stage stage_fs url = 'file:///Users/admin/test' comment='this is a stage';

mysql> select * from mo_catalog.mo_stages where stage_name='stage_fs';
+----------+------------+--------------------------+-------------------+--------------+---------------------+-----------------+
| stage_id | stage_name | url                      | stage_credentials | stage_status | created_time        | comment         |
+----------+------------+--------------------------+-------------------+--------------+---------------------+-----------------+
|        1 | stage_fs   | file:///Users/admin/test |                   | disabled     | 2024-10-09 03:46:00 | this is a stage |
+----------+------------+--------------------------+-------------------+--------------+---------------------+-----------------+
1 row in set (0.00 sec)

alter stage stage_fs set url = 'file:///Users/admin/test1';
alter stage stage_fs set comment='stage_fs has been changed';

mysql> select * from mo_catalog.mo_stages where stage_name='stage_fs';
+----------+------------+---------------------------+-------------------+--------------+---------------------+---------------------------+
| stage_id | stage_name | url                       | stage_credentials | stage_status | created_time        | comment                   |
+----------+------------+---------------------------+-------------------+--------------+---------------------+---------------------------+
|        1 | stage_fs   | file:///Users/admin/test1 |                   | disabled     | 2024-10-09 03:46:00 | stage_fs has been changed |
+----------+------------+---------------------------+-------------------+--------------+---------------------+---------------------------+
1 row in set (0.00 sec)
```
