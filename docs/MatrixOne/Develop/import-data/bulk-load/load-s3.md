# 从对象存储导入文件

## 概述

S3（Simple Storage Service）对象存储是指亚马逊的简单存储服务。你还可以使用与 S3 兼容的对象存储来存储几乎任何类型和大小的数据，包括数据湖、云原生应用程序和移动应用程序。如果你不熟悉 S3 对象服务，你可以在 [AWS](https://docs.aws.amazon.com/s3/index.html) 中查找一些基本介绍。

AWS S3 十多年来一直非常成功，因此它成为了对象存储的标准。因此几乎所有主流公有云厂商都提供了兼容 S3 的对象存储服务。

MatrixOne 支持将文件从 S3 兼容的对象存储服务加载到数据库中。MatrixOne 支持 AWS 和国内主流云厂商（阿里云、腾讯云）。

在 MatrixOne 中，有两种方法可以从 S3 兼容的对象存储中导入数据：

* 使用带有 s3option 的 `Load data` 将文件加载到 MatrixOne 中。此方法会将数据加载到 MatrixOne 中，所有接下来的查询都将在 MatrixOne 中进行。
* 创建一个带有 s3option 映射到 S3 文件的 “外部表”，并直接查询这个外部表。该方法允许通过 S3 兼容的对象存储服务进行数据访问；每个查询的网络延迟都将被计算在内。

## 方式 1: `LOAD DATA`

### 语法结构

```sql
LOAD DATA
    | URL s3options {"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "role_arn"='xxxx', "external_id"='yyy', "filepath"='<string>', "region"='<string>', "compression"='<string>'}
    INTO TABLE tbl_name
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
        [ESCAPED BY 'char']
    ]
    [IGNORE number {LINES | ROWS}]
    [PARALLEL {'TRUE' | 'FALSE'}]
```

**参数说明**

|参数 | 描述|
|---|---|
|endpoint|可以连接到对象存储服务的 URL。例如：s3.us-west-2.amazonaws.com|
|access_key_id| Access key ID |
|secret_access_key| Secret access key |
|bucket| S3 需要访问的桶 |
|role_arn| |
|external_id| |
|filepath| 相对文件路径。 /files/*.csv 支持正则表达式。 |
|region| 对象存储服务区域|
|compression| S3 文件的压缩格式。如果为空或 "none"，，则表示未压缩的文件。支持的字段或压缩格式为“auto”、“none”、“gzip”、“bz2”和“lz4”。|

其他参数与通用 `LOAD DATA` 参数相同，更多信息，参见 [LOAD DATA](../../../Reference/SQL-Reference/Data-Manipulation-Language/load-data.md)。

**语法示例**：

```sql
# LOAD a csv file from AWS S3 us-east-1 region, test-load-mo bucket, without compression
LOAD DATA URL s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-load-mo', "filepath"='test.csv', "region"='us-east-1', "compression"='none'} INTO TABLE t1 FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

# LOAD all csv files from Alibaba Cloud OSS Shanghai region, test-load-data bucket, without compression
LOAD DATA URL s3option{"endpoint"='oss-cn-shanghai.aliyuncs.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-load-data', "filepath"='/test/*.csv', "region"='oss-cn-shanghai', "compression"='none'} INTO TABLE t1 FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';

# LOAD a csv file from Tencent Cloud COS Shanghai region, test-1252279971 bucket, without bz2 compression
LOAD DATA URL s3option{"endpoint"='cos.ap-shanghai.myqcloud.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-1252279971', "filepath"='test.csv.bz2', "region"='ap-shanghai', "compression"='bz2'} INTO TABLE t1 FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\n';
```

!!! note
    MatrixOne 提供了 S3 验证信息的安全保证，例如 `access_key_id` 和 `secret_access_key` 敏感信息在系统表（statement_info）记录里将被隐藏，保证你的账户安全。

### 教程：从 AWS S3 加载文件

本教程中将指导你完成从 AWS S3 加载**. csv** 文件的过程。

如果你已经拥有一个 AWS 账户并且已经在你的 S3 服务中准备好数据文件，那么请继续阅读本教程章节。

如果你还没有准备好数据文件，请先注册并上传你的数据文件；你也可以查看 AWS S3 [官方教程](https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html)。如果你的数据文件想要上传到阿里云 OSS 或者腾讯云 COS 上，那么操作流程与 AWS S3 类似。

!!! note
    由于帐户隐私，此代码示例不会显示帐户信息，例如 `access_key_id` 和 `secret_access_key`。
    你可以阅读本文档以了解主要步骤；具体数据和账户信息将不会显示。

1. 下载[数据文件](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/char_varchar_1.csv)。进入 **AWS S3 > buckets**，创建一个具有公共访问权限的存储桶 **test-loading** 并上传文件 *char_varchar_1.csv*。

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket.png?raw=true"  style="zoom: 60%;" />

    ![public block](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket_public_block.png?raw=true)

2. 获取或创建你的 AWS Access key。输入 **Your Account Name > Security Credentials**，获取你现有的访问密钥或创建一个新的访问密钥。

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/security_credential.png?raw=true"  style="zoom: 60%;" />

    ![Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/access_key.png?raw=true)

    你可以从下载的凭据或此网页中获取 `Access key` 和 `Secret access key`。

    ![Retrieve Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/retrieve_access_key.png?raw=true)

3. 启动 MySQL 客户端，在 MatrixOne 中创建表，SQL 示例如下：

    ```sql
    create database db;
    use db;
    drop table if exists t1;
    create table t1(col1 char(225), col2 varchar(225), col3 text, col4 varchar(225));
    ```

4. 将文件导入 MatrixOne：

    ```
    LOAD DATA URL s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-loading', "filepath"='char_varchar_1.csv', "region"='us-east-1', "compression"='none'} INTO TABLE t1;
    ```

5. 导入完成后，你可以运行 SQL 语句检查文件导入是否成功：

    ```sql
    mysql> select * from t1;
    +-----------+-----------+-----------+-----------+
    | col1      | col2      | col3      | col4      |
    +-----------+-----------+-----------+-----------+
    | a         | b         | c         | d         |
    | a         | b         | c         | d         |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | aa,aa     | bb,bb     | cc,cc     | dd,dd     |
    | aa,       | bb,       | cc,       | dd,       |
    | aa,,,aa   | bb,,,bb   | cc,,,cc   | dd,,,dd   |
    | aa',',,aa | bb',',,bb | cc',',,cc | dd',',,dd |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa",aa    | bb",bb    | cc",cc    | dd",dd    |
    | aa"",aa   | bb"",bb   | cc"",cc   | dd"",dd   |
    |           |           |           |           |
    |           |           |           |           |
    | NULL      | NULL      | NULL      | NULL      |
    |           |           |           |           |
    | "         | "         | "         | "         |
    | ""        | ""        | ""        | ""        |
    +-----------+-----------+-----------+-----------+
    21 rows in set (0.03 sec)
    ```

## 方式 2：指定 S3 文件到外部表

### 语法结构

```sql
create external table t(...) URL s3option{"endpoint"='<string>', "access_key_id"='<string>', "secret_access_key"='<string>', "bucket"='<string>', "filepath"='<string>', "region"='<string>', "compression"='<string>'}     
[{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
        [ESCAPED BY 'char']
]
[IGNORE number {LINES | ROWS}];
```

!!! note
    MatrixOne 当前仅支持对外部表进行 `select`，暂不支持 `Delete`，`insert`，`update`。

**参数说明**

|参数 | 描述|
|:-:|:-:|
|endpoint|可以连接到对象存储服务的 URL。例如：s3.us-west-2.amazonaws.com|
|access_key_id| Access key ID |
|secret_access_key| Secret access key |
|bucket| S3 需要访问的桶 |
|filepath| 相对文件路径。 /files/*.csv 支持正则表达式。 |
|region| 对象存储服务区域|
|compression| S3 文件的压缩格式。如果为空或 "none"，，则表示未压缩的文件。支持的字段或压缩格式为“auto”、“none”、“gzip”、“bz2”和“lz4”。|

其他参数与通用 `LOAD DATA` 参数相同，更多信息，参见 [LOAD DATA](../../../Reference/SQL-Reference/Data-Manipulation-Language/load-data.md)。

有关外部表的更多信息，参见[创建外部表](../../../Reference/SQL-Reference/Data-Definition-Language/create-external-table.md)。

**语法示例**：

```sql
## Create a external table for a .csv file from AWS S3
create external table t1(col1 char(225)) url s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-loading', "filepath"='test.csv', "region"='us-east-1', "compression"='none'} fields terminated by ',' enclosed by '\"' lines terminated by '\n';

## Create a external table for a .csv file compressed with BZIP2 from Tencent Cloud
create external table t1(col1 char(225)) url s3option{"endpoint"='cos.ap-shanghai.myqcloud.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-1252279971', "filepath"='test.csv.bz2', "region"='ap-shanghai', "compression"='bz2'} fields terminated by ',' enclosed by '\"' lines terminated by '\n' ignore 1 lines;
```

### 教程：使用 S3 文件创建外部表

本教程将指导你完成使用来自 AWS S3 的**. csv** 文件创建外部表的整个过程。

!!! note
    由于帐户隐私，此代码示例不会显示帐户信息，例如 `access_key_id` 和 `secret_access_key`。
    你可以阅读本文档以了解主要步骤；具体数据和账户信息将不会显示。

1. 下载[数据文件](https://github.com/matrixorigin/matrixone/blob/main/test/distributed/resources/load_data/char_varchar_1.csv)。进入 **AWS S3 > buckets**，创建一个具有公共访问权限的存储桶 **test-loading** 并上传文件 *char_varchar_1.csv*。

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket.png?raw=true"  style="zoom: 60%;" />

    ![public block](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/create_bucket_public_block.png?raw=true)

2. 获取或创建你的 AWS Access key。输入 **Your Account Name > Security Credentials**，获取你现有的访问密钥或创建一个新的访问密钥。

    <img src="https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/security_credential.png?raw=true"  style="zoom: 60%;" />

    ![Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/access_key.png?raw=true)

    你可以从下载的凭据或此网页中获取 `Access key` 和 `Secret access key`。

    ![Retrieve Access Key](https://github.com/matrixorigin/artwork/blob/main/docs/develop/load_S3/retrieve_access_key.png?raw=true)

3. 启动 MySQL 客户端，指定 S3 文件到外部表：

    ```sql
    create database db;
    use db;
    drop table if exists t1;
    create external table t1(col1 char(225), col2 varchar(225), col3 text, col4 varchar(225)) url s3option{"endpoint"='s3.us-east-1.amazonaws.com', "access_key_id"='XXXXXX', "secret_access_key"='XXXXXX', "bucket"='test-loading', "filepath"='char_varchar_1.csv', "region"='us-east-1', "compression"='none'} fields terminated by ',' enclosed by '\"' lines terminated by '\n';
    ```

4. 导入成功后，你可以运行如下 SQL 语句查看导入数据的结果。你将可以看到查询速度明显慢于从本地表查询。

    ```sql
    select * from t1;
    +-----------+-----------+-----------+-----------+
    | col1      | col2      | col3      | col4      |
    +-----------+-----------+-----------+-----------+
    | a         | b         | c         | d         |
    | a         | b         | c         | d         |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | 'a'       | 'b'       | 'c'       | 'd'       |
    | aa,aa     | bb,bb     | cc,cc     | dd,dd     |
    | aa,       | bb,       | cc,       | dd,       |
    | aa,,,aa   | bb,,,bb   | cc,,,cc   | dd,,,dd   |
    | aa',',,aa | bb',',,bb | cc',',,cc | dd',',,dd |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa"aa     | bb"bb     | cc"cc     | dd"dd     |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa""aa    | bb""bb    | cc""cc    | dd""dd    |
    | aa",aa    | bb",bb    | cc",cc    | dd",dd    |
    | aa"",aa   | bb"",bb   | cc"",cc   | dd"",dd   |
    |           |           |           |           |
    |           |           |           |           |
    | NULL      | NULL      | NULL      | NULL      |
    |           |           |           |           |
    | "         | "         | "         | "         |
    | ""        | ""        | ""        | ""        |
    +-----------+-----------+-----------+-----------+
    21 rows in set (1.32 sec)
    ```

5. （选做）如果需要将外部表数据导入到 MatrixOne 中的数据表，使用如下 SQL 语句：

    在 MatrixOne 中新建一个表 *t2*：

    ```sql
    create table t2(col1 char(225), col2 varchar(225), col3 text, col4 varchar(225));
    ```

    将外部表 *t1* 导入到 *t2*：

    ```sql
    insert into t2 select * from t1;
    ```
