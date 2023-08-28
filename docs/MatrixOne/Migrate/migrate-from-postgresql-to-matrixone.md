# 将数据从 PostgreSQL 迁移至 MatrixOne

本篇文档将指导你如何将数据从 PostgreSQL 迁移至 MatrixOne。

PostgreSQL 是目前全世界最先进的开源关系型数据库之一，拥有者极其完备的数据类型、对象类型、SQL 模型以及其他功能，在企业、教育科研等诸多领域有着重要的地位。根据 PostgreSQL 的数据量大小，本文依然推荐使用在线与离线两种模式进行迁移。

## 数据类型差异

MatrixOne 与 PostgreSQL 自带的数据类型存在着较多的差异，这些差异有些可以通过其他类型来替换，有些则暂时无法支持。同时，PostgreSQL 支持三层逻辑结构：Database（数据库） - Schema（模式） - Table（表），即你可以在一个数据库内创建多个模式，每个模式内可以包含多个表，这样的层级结构允许更好地组织和管理数据；而 MatrixOne 仅支持两层逻辑结构：Database（数据库） - Table（表）。在 MatrixOne 中，直接在数据库中创建表，所以数据在迁移过程中也会存在些许不同。

数据类型差异具体列表如下：

|PostgreSQL |	MatrixOne |
|---|---|
|serial 	|通过自增列替换|
|money	|使用 decimal 替换|
|bytea	|使用 binary 或 varbinary 替换|
|geometric	|暂不支持|
|network adress	|使用 char 或 varchar 替换|
|bit string	|暂不支持|
|text search	|暂不支持|
|xml	|暂不支持|
|array	|暂不支持|
|composite	|暂不支持|
|range	|暂不支持|
|domain	|暂不支持|
|object identifier	|暂不支持|
|pg_lsn	|暂不支持|
|pseudo	|暂不支持|

## 在线迁移

本章节将指导你使用第三方工具 DBeaver，将数据从 PostgreSQL 迁移至 MatrixOne。

通过 DBeaver，将源端的数据按批次获取，再将数据以 `INSERT` 的方式，插入到目标库。如果在迁移过程中报错 heap 空间不足，请尝试调整每个批次获取并插入数据的规模。

- 适用场景：数据量较小（建议小于 1GB），对迁移的速度不敏感的场景。
- 安装 DBeaver 的跳板机推荐配置：内存 16GB 以上。

### 准备工作

- 带图形界面的跳板机：可连接 PostgreSQL 源端，也可连接 MatrixOne 目标端。
- 数据迁移工具：在跳板机上[下载 DBeaver](https://dbeaver.io/download/)。
- DDL 转译工具：在跳板机上下载 [pg2mysql](https://github.com/dolthub/pg2mysql)，注意跳板机上需要拥有 python 环境。

### 第一步：迁移表结构

在这里以 TPCH 数据集为例，将 TPCH 数据集的 8 张表从 PostgreSQL 迁移至 MatrixOne。

1. 打开 DBeaver，从 PostgreSQL 中选择待迁移的表，鼠标右键点击后选择**生成 SQL > DDL** 点击**复制**，先将这段 SQL 复制到一个文本编辑器内，给文本编辑器命名为 *pg_ddl.sql*，保存到跳板机本地。

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/PostgreSQL-1.png)

2. 使用 `pg2mysql` 转译工具将 *pg_ddl.sql* 文件转换为 MySQL 格式的 DDL：**

    a. 首先，运行下面的命令，将 *pg_ddl.sql* 文件中的 `bpchar` 替换为 `char`：

        ```
        # Linux系统执行的命令如下：
        sed -i 's/bpchar/char/g' pg_ddl.sql

        # MacOS 系统则使用的命令如下：
        sed -i '' 's/bpchar/char/g' pg_ddl.sql
        ```

    b. 接下来，使用 `pg2mysql` 转译工具将 *pg_ddl.sql* 文件转换为 MySQL 格式，并将输出保存到 *mysql_ddl.sql* 文件中：

        ```
        # Linux 和 MacOS 系统执行的命令均如下：
        ./pg2mysql.pl < pg_ddl.sql > mysql_ddl.sql
        ```

    c. 转换后的 DDL 会保留原始的 Postgresql schema 名称。如果有必要，你可以执行以下命令，将 schema 名称替换为 MySQL 中的数据库名称：

        ```
        # Linux系统执行的命令如下：
        sed -i 's/{schema_name}/{database_name}/g' mysql_ddl.sql

        # MacOS 系统则使用的命令如下：
        sed -i '' 's/{schema_name}/{database_name}/g' mysql_ddl.sql
        ```

    d. 最后，你可能需要统一将 *mysql_ddl.sql* 文件中的 `numeric` 替换为 `decimal`，可以通过以下命令实现：

        ```
        # Linux系统执行的命令如下：
        sed -i 's/numeric/decimal/g' mysql_ddl.sql

        # MacOS 系统则使用的命令如下：
        sed -i '' 's/numeric/decimal/g' mysql_ddl.sql
        ```

3. 连接 MatrixOne，并在 MatrixOne 中创建新的数据库和表：

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/mysql_ddl.sql'
    ```

### 第二步：迁移数据

1. 打开 DBeaver，从 PostgreSQL 中选择待迁移的表，鼠标右键点击后选择**导出数据**：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/PostgreSQL-2.png)

2. 在**转化目标 > 导出目标**窗口选择**数据库**，点击**下一步**；在**表映射**窗口选择**目标容器**，目标容器选择 MatrixOne 的数据库 *tpch*：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/PostgreSQL-3.png)

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/PostgreSQL-4.png)

3. 在**抽取设置**和**数据加载设置**窗口，设置选择抽取和插入的数量，为了触发 MatrixOne 的直接写 S3 策略，建议填写 5000：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/PostgreSQL-5.png)

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/PostgreSQL-6.png)

4. 完成设置后，DBeaver 开始对数据进行迁移，在完成后 DBeaver 将会提示迁移成功。

### 第三步：检查数据

完成迁移之后，可以采用如下方式检查数据：

- 通过 `select count(*) from <table_name>` 来确认源库与目标库的数据量是否一致。

- 通过相关的查询对比结果，你也可以参见[完成 TPCH 测试](../Test/performance-testing/TPCH-test-with-matrixone.md)查询示例，进行结果对比。

## 离线迁移

本章节将指导你通过离线文件导入到 MatrixOne。

- 适用场景：数据量较大（大于 1GB），对迁移的速度较为敏感的场景。

### 准备工作

- 带图形界面的跳板机：可连接 PostgreSQL 源端，也可连接 MatrixOne 目标端的。
- 数据迁移工具：[下载 DBeaver](https://dbeaver.io/download/) 到跳板机。
- DDL 转译工具：在跳板机上下载 [pg2mysql](https://github.com/dolthub/pg2mysql)。

- 在 PostgreSQL 服务器端安装 `pgdump`。如果你不熟悉如何使用 `mysqldump`，可参见 [pgdump 教程](https://www.postgresql.org/docs/current/app-pgdump.html)

### 第一步：迁移表结构

1. 打开 DBeaver，从 PostgreSQL 中选择待迁移的表，鼠标右键点击后选择**生成 SQL > DDL** 点击**复制**，先将这段 SQL 复制到一个文本编辑器内，给文本编辑器命名为 *pg_ddl.sql*，保存到跳板机本地。

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/PostgreSQL-1.png)

2. 使用 `pg2mysql` 转译工具将 *pg_ddl.sql* 文件转换为 MySQL 格式的 DDL：**

    a. 首先，运行下面的命令，将 *pg_ddl.sql* 文件中的 `bpchar` 替换为 `char`：

        ```
        # Linux系统执行的命令如下：
        sed -i 's/bpchar/char/g' pg_ddl.sql

        # MacOS 系统则使用的命令如下：
        sed -i '' 's/bpchar/char/g' pg_ddl.sql
        ```

    b. 接下来，使用 `pg2mysql` 转译工具将 *pg_ddl.sql* 文件转换为 MySQL 格式，并将输出保存到 *mysql_ddl.sql* 文件中：

        ```
        # Linux 和 MacOS 系统执行的命令均如下：
        ./pg2mysql.pl < pg_ddl.sql > mysql_ddl.sql
        ```

    c. 转换后的 DDL 会保留原始的 Postgresql schema 名称。如果有必要，你可以执行以下命令，将 schema 名称替换为 MySQL 中的数据库名称：

        ```
        # Linux系统执行的命令如下：
        sed -i 's/{schema_name}/{database_name}/g' mysql_ddl.sql

        # MacOS 系统则使用的命令如下：
        sed -i '' 's/{schema_name}/{database_name}/g' mysql_ddl.sql
        ```

    d. 最后，你可能需要统一将 *mysql_ddl.sql* 文件中的 `numeric` 替换为 `decimal`，可以通过以下命令实现：

        ```
        # Linux系统执行的命令如下：
        sed -i 's/numeric/decimal/g' mysql_ddl.sql

        # MacOS 系统则使用的命令如下：
        sed -i '' 's/numeric/decimal/g' mysql_ddl.sql
        ```

3. 连接 MatrixOne，并在 MatrixOne 中创建新的数据库和表：

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/mysql_ddl.sql'
    ```

### 第二步：迁移数据

在 MatrixOne 中，有两种数据迁移方式可供选择：`INSERT` 和 `LOAD DATA`。当数据量大于 1GB 时，首先推荐使用 `LOAD DATA`，其次可以选择使用 `INSERT`。

#### LOAD DATA

1. 在 PostgreSQL 数据库命令行环境下将 PostgreSQL 的数据表导出为 CSV 格式：

    ```sql
    postgres=# \c tpch;
    postgres=# COPY tpch.nation TO '/{filepath}/nation.tbl' DELIMITER '|';
    postgres=# COPY tpch.region TO '/{filepath}/region.tbl' DELIMITER '|';
    postgres=# COPY tpch.customer TO '/{filepath}/customer.tbl' DELIMITER '|';
    postgres=# COPY tpch.part TO '/{filepath}/part.tbl' DELIMITER '|';
    postgres=# COPY tpch.supplier TO '/{filepath}/supplier.tbl' DELIMITER '|';
    postgres=# COPY tpch.partsupp TO '/{filepath}/partsupp.tbl' DELIMITER '|';
    postgres=# COPY tpch.lineitem TO '/{filepath}/lineitem.tbl' DELIMITER '|';
    postgres=# COPY tpch.orders TO '/{filepath}/orders.tbl' DELIMITER '|';
    ```

2. 连接到 MatrixOne，将导出的 CSV 数据导入至 MatrixOne：

    ```sql
    mysql> load data infile '/{filepath}/lineitem.tbl' INTO TABLE lineitem FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/nation.tbl' INTO TABLE nation FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/part.tbl' INTO TABLE part FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/customer.tbl' INTO TABLE customer FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/orders.tbl' INTO TABLE orders FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/supplier.tbl' INTO TABLE supplier FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/region.tbl' INTO TABLE region FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/partsupp.tbl' INTO TABLE partsupp FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    ```

更多关于 `LOAD DATA` 的操作示例，参见[批量导入](../Develop/import-data/bulk-load/bulk-load-overview.md)。

#### INSERT

`INSERT` 语句需要使用 `pgdump` 先将逻辑语句导出，再导入到 MatrixOne：

1. 使用 `pgdump` 导出数据，为了确保插入时触发 MatrixOne 的直接写 S3，建议批量插入尽量大，`net_buffer_length` 这个参数尽量在 10mb 起步：

    ```sql
    $ pg_dump -U postgres --no-acl --no-owner --inserts --rows-per-insert 5000  --format p --data-only --schema=tpch tpch -f pg_data.sql
    ```

2. 在 MatrixOne 端，执行该 SQL 文件，期间会有报错信息，但是不影响数据的插入：

    ```
    source '/YOUR_PATH/pg_data.sql'
    ```

更多关于 `INSERT` 的操作示例，参见[插入数据](../Develop/import-data/insert-data.md)。

### 第三步：检查数据

完成迁移之后，可以采用如下方式检查数据：

- 通过 `select count(*) from <table_name>` 来确认源库与目标库的数据量是否一致。

- 通过相关的查询对比结果，你也可以参见[完成 TPCH 测试](../Test/performance-testing/TPCH-test-with-matrixone.md)查询示例，进行结果对比。

#### 参考示例

如果你是新手，想尝试迁移小数据量的数据，可参见[使用 `source` 命令批量导入数据](../Develop/import-data/bulk-load/using-source.md)。
