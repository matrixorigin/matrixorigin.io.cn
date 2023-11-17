# 流式导入

本文档介绍如何使用 SQL 语句在 MatrixOne 中进行流式导入数据。具体来说，MatrixOne 支持使用 `LOAD DATA INLINE` 语法对以 *csv* 格式组织的字符串进行导入，导入速度较 `INSERT` 操作更快。


## 语法结构

```mysql
mysql> LOAD DATA INLINE 
FORMAT='csv' ,
DATA=$XXX$
csv_string $XXX$
INTO TABLE tbl_name;
```

!!! note
    `$XXX$` 为数据开始和结束的标识符，注意数据结束处的 `$XXX$` 需要和最后一行数据放在同一行，换行可能导致`ERROR 20101`


## 开始前准备

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## MySQL Client 中使用 `LOAD DATA INLINE` 命令导入数据

你可以使用 `LOAD DATA INLINE` 将流式数据导入MatrixOne，本章将介绍如何进行流式导入，并且给出导入 *csv* 数据的示例。

### 步骤

1. 启动 MySQL 客户端，连接 MatrixOne：

    ```
    mysql -h 127.0.0.1 -P 6001 -uroot -p111
    ```

    !!! note
        上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../../Security/password-mgmt.md)。

2. 在 MatrixOne 中执行 `LOAD DATA INLINE` 之前，需要提前在 MatrixOne 中创建完成数据表。

3. 在 MySQL 客户端执行 `LOAD DATA INLINE`，以 *csv* 格式导入数据:

    ```mysql
    mysql> LOAD DATA INLINE 
    FORMAT='csv',
    DATA=$XXX$
    csv_string  $XXX$
    INTO TABLE tbl_name;
    ```

### 示例：使用 `LOAD DATA INLINE` 导入数据

1. 启动 MySQL 客户端，连接 MatrixOne：

    ```mysql
    mysql -h 127.0.0.1 -P 6001 -uroot -p111
    ```

    !!! note
        上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../../Security/password-mgmt.md)。

2. 在 MatrixOne 中执行 `LOAD DATA INLINE` 之前，需要提前在 MatrixOne 中创建完成数据表 `user`:

    ```mysql

    CREATE TABLE `user` (
    `name` VARCHAR(255) DEFAULT null,
    `age` INT DEFAULT null,
    `city` VARCHAR(255) DEFAULT null
    )
    ```
3. 在 MySQL 客户端执行 `LOAD DATA INLINE`进行数据导入，以 *csv* 格式导入数据:

    ```mysql
    mysql> LOAD DATA INLINE 
    FORMAT='csv',
    DATA=$XXX$
    Lihua,23,Shanghai
    Bob,25,Beijing $XXX$ 
    INTO TABLE user;
    ```


<!-- 等支持json

mysql> LOAD DATA INLINE 
FORMAT=('csv'|'json') ,
DATA=$XXX$
(csv_string| json_string) $XXX$
INTO TABLE tbl_name;

-->