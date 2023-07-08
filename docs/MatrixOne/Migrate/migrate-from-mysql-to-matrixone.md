# 将数据从 MySQL 迁移至 MatrixOne

本篇文档将指导你如何将数据从 MySQL 迁移至 MatrixOne。

MatrixOne 保持了对 MySQL 语法的高度兼容，因此在迁移过程中，需要做的语法调整也是最少的。尽管如此，MatrixOne 与 MySQL 在数据类型以及数据对象方面，仍然存在着些许差异使得迁移过程需要做出一些调整。

## 数据类型差异

MatrixOne 中，数据类型在保持与 MySQL 命名一致的情况下，在精度与范围上，与 MySQL 存在有着细微的差异，具体可参见[数据类型](../Reference/Data-Types/data-types.md)。

## 在线迁移

本章节将指导你使用第三方工具，将数据从 MySQL 迁移至 MatrixOne。

- 适用场景：数据量较小（建议小于 1GB），对迁移的速度不敏感的场景。

### 准备工作

- 带图形界面的跳板机：可连接 MySQL 源端，也可连接 MatrixOne 目标端。
- 数据迁移工具：在跳板机上[下载 DBeaver](https://dbeaver.io/download/)。

### 第一步：迁移表结构

在这里以 TPCH 数据集为例，将 TPCH 数据集的 8 张表从 MySQL 迁移至 MatrixOne。

1. 打开 DBeaver，从 MySQL 中选择待迁移的表，鼠标右键点击后选择**生成 SQL > DDL** 点击**复制**，先将这段 SQL 复制到一个文本编辑器内，给文本编辑器命名为 *tpch_ddl.sql*，保存到跳板机本地。

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/mysql-1.png)

2. 使用下面的命令替换 *tpch_ddl.sql* 文件内 MatrixOne 不支持的关键字：

    ```
    # Linux 系统执行的命令如下：
    sed -i 's/ ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci//g' /YOUR_PATH/tpch_ddl.sql

    #MacOS 系统使用的命令如下：
    sed -i '' 's/ ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci//g' /YOUR_PATH/tpch_ddl.sql
    ```

3. 连接到 MatrixOne，在 MatrixOne 中创建新的数据库和表：

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/tpch_ddl.sql'
    ```

### 第二步：迁移数据

1. 打开 DBeaver，从 MySQL 中选择待迁移的表，鼠标右键点击后选择**导出数据**：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/mysql-2.png)

2. 在**转化目标 > 导出目标**窗口选择**数据库**，点击**下一步**；在**表映射**窗口选择**目标容器**，目标容器选择 MatrixOne 的数据库 *tpch*：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/mysql-3.png)

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/mysql-4.png)

3. 在**抽取设置**和**数据加载设置**窗口，设置选择抽取和插入的数量，为了触发 MatrixOne 的直接写 S3 策略，建议填写 5000：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/mysql-5.png)

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/mysql-6.png)

4. 完成设置后，DBeaver 开始对数据进行迁移，在完成后 DBeaver 将会提示迁移成功。

### 第三步：检查数据

完成迁移之后，可以采用如下方式检查数据：

- 通过 `select count(*) from <table_name>` 来确认源库与目标库的数据量是否一致。

- 通过相关的查询对比结果，你也可以参见[完成 TPCH 测试](../Test/performance-testing/TPCH-test-with-matrixone.md)查询示例，进行结果对比。

## 离线迁移

本章节将指导你通过离线文件导入到 MatrixOne。

- 适用场景：数据量较大（大于 1GB），对迁移的速度较为敏感的场景。

### 准备工作

- 带图形界面的跳板机：可连接 MySQL 源端，也可连接 MatrixOne 目标端的。
- 数据迁移工具：[下载 DBeaver](https://dbeaver.io/download/) 到跳板机。
- 安装 `mysqldump`。如果你不熟悉如何使用 `mysqldump`，可参见 [mysqldump 教程](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/)

### 第一步：迁移表结构

在这里以 TPCH 数据集为例，将 TPCH 数据集的 8 张表从 MySQL 迁移至 MatrixOne。

1. 打开 DBeaver，从 MySQL 中选择待迁移的表，鼠标右键点击后选择**生成 SQL > DDL > 复制**，先将这段 SQL 复制到一个文本编辑器内，给文本编辑器命名为 *tpch_ddl.sql*，保存到跳板机本地。

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/migrate/mysql-1.png)

2. 使用下面的命令替换 *tpch_ddl.sql* 文件内 MatrixOne 不支持的关键字：

    ```
    # Linux系统执行的命令如下：
    $ sed -i 's/ ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci//g' /YOUR_PATH/tpch_ddl.sql

    #MacOS 系统则使用的命令如下：
    sed -i '' 's/ ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci//g' /YOUR_PATH/tpch_ddl.sql
    ```

3. 连接到 MatrixOne，在 MatrixOne 中创建新的数据库和表：

    ```sql
    create database tpch;
    use tpch;
    source '/YOUR_PATH/tpch_ddl.sql'
    ```

### 第二步：迁移数据

在 MatrixOne 中，有两种数据迁移方式可供选择：`INSERT` 和 `LOAD DATA`。当数据量大于 1GB 时，首先推荐使用 `LOAD DATA`，其次可以选择使用 `INSERT`。

#### LOAD DATA

使用 `LOAD DATA` 先将 MySQL 的数据表导出为 CSV 格式，并使用 MatrixOne 的并行 LOAD 功能将数据迁移至 MatrixOne：

1. 使用 `mysqldump` 将 MySQL 数据表导出为 CSV 格式文件。请确保你对 filepath 路径具有写权限，并检查 `secure_file_priv` 配置：

    ```sql
    mysqldump -u root -p -t -T /{filepath} tpch --fields-terminated-by='|'
    ```

2. 连接到 MatrixOne，将导出的 CSV 数据导入至 MatrixOne：

    ```sql
    mysql> load data infile '/{filepath}/lineitem.txt' INTO TABLE lineitem FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/nation.txt' INTO TABLE nation FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/part.txt' INTO TABLE part FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/customer.txt' INTO TABLE customer FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/orders.txt' INTO TABLE orders FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/supplier.txt' INTO TABLE supplier FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/region.txt' INTO TABLE region FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    mysql> load data infile '/{filepath}/partsupp.txt' INTO TABLE partsupp FIELDS TERMINATED BY '|' lines TERMINATED BY '\n' parallel 'true';
    ```

更多关于 `LOAD DATA` 的操作示例，参见[批量导入](../Develop/import-data/bulk-load/bulk-load-overview.md)。

#### INSERT

`INSERT` 语句需要使用 `mysqldump` 先将逻辑语句导出，再导入到 MatrixOne：

1. 使用 `mysqldump` 导出数据，为了确保插入时触发 MatrixOne 的直接写 S3，建议批量插入尽量大，`net_buffer_length` 这个参数尽量在 10mb 起步：

    ```sql
    mysqldump -t tpch -uroot -p --net_buffer_length=10m > tpch_data.sql
    ```

2. 在 MatrixOne 端，执行该 SQL 文件，期间会有报错信息，但是不影响数据的插入：

    ```
    source '/YOUR_PATH/tpch_data.sql'
    ```

更多关于 `INSERT` 的操作示例，参见[插入数据](../Develop/import-data/insert-data.md)。

### 第三步：检查数据

完成迁移之后，可以采用如下方式检查数据：

- 通过 `select count(*) from <table_name>` 来确认源库与目标库的数据量是否一致。

- 通过相关的查询对比结果，你也可以参见[完成 TPCH 测试](../Test/performance-testing/TPCH-test-with-matrixone.md)查询示例，进行结果对比。

#### 参考示例

如果你是新手，想尝试迁移小数据量的数据，可参见[使用 `source` 命令批量导入数据](../Develop/import-data/bulk-load/using-source.md)。
