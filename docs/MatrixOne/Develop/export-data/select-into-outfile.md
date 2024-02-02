# SELECT INTO 写出

MatrixOne 支持以下两种方式导出数据：

- `SELECT INTO...OUTFILE`
- `mo-dump`

本篇文档主要介绍如何使用 `SELECT INTO...OUTFILE` 导出数据。

使用 `SELECT...INTO OUTFILE` 语法可以将表数据导出到主机上的文本文件中。

## 语法结构

`SELECT...INTO OUTFILE` 语法是 `SELECT` 语法和 `INTO OUTFILE filename` 的结合。默认输出格式与 `LOAD DATA` 命令相同。因此，以下语句是将名称为 **test** 的表导出到目录路径为 **/root/test** 的*. csv* 文件中。

```
mysql> SELECT * FROM TEST
    -> INTO OUTFILE '/root/test.csv';
```

你可以采用多种形式和选项更改输出格式，用于表示如何引用、分隔列和记录。

使用以下代码以*. csv* 格式导出 *TEST* 表，下面的代码行是用回车换行进行展示的：

```
mysql> SELECT * FROM TEST INTO OUTFILE '/root/test.csv'
   -> FIELDS TERMINATED BY ',' ENCLOSED BY '"'
   -> LINES TERMINATED BY '\r\n';
```

**`SELECT ... INTO OUTFILE` 特性如下**：

- 导出的文件是由 MatrixOne 服务直接创建的，因此命令行中的 `filename` 应该指向你需要文件存入的服务器主机的位置。MatrixOne 暂不支持将文件导出到客户端文件系统。

- `SELECT ... INTO OUTFILE` 是用于将检索出来的数据按格式导出到文件中，即需要导出的文件是由 MatrixOne 服务直接创建，导出的文件只能位于 MatrixOne 所在的服务器主机上，所以你必须得有登录 MatrixOne 所在的服务器主机的用户名密码，并且你有权限可以从 MatrixOne 检索文件。

- 你必须有执行 `SELECT` 的权限。

- 检查文件需要导出到的目录里不要有重名的文件，否则会被新导出的文件覆盖。

## 示例

### 开始前准备

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

!!! note
    如果你是通过 `docker` 安装的 MatrixOne，那么导出目录默认位于 docker 镜像中。如果你要需要挂载本地目录，参见下面的代码示例：本地文件系统路径 *${local_data_path}/mo-data* 挂载到 MatrixOne Docker 镜像中，并映射到 */mo-data* 路径下。更多信息，参见 [Docker Mount Volume tutorial](https://www.freecodecamp.org/news/docker-mount-volume-guide-how-to-mount-a-local-directory/)。

```
sudo docker run --name <name> --privileged -d -p 6001:6001 -v ${local_data_path}/mo-data:/mo-data:rw matrixorigin/matrixone:0.8.0
```

### 步骤

1. 在 MatrixOne 中新建一个数据表：

    ```sql
    create database aaa;
    use aaa;
    CREATE TABLE `user` (`id` int(11) ,`user_name` varchar(255) ,`sex` varchar(255));
    insert into user(id,user_name,sex) values('1', 'weder', 'man'), ('2', 'tom', 'man'), ('3', 'wederTom', 'man');
    select * from user;
    +------+-----------+------+
    | id   | user_name | sex  |
    +------+-----------+------+
    |    1 | weder     | man  |
    |    2 | tom       | man  |
    |    3 | wederTom  | man  |
    +------+-----------+------+
    ```

2. 对于使用源代码或二进制文件的方式安装构建 MatrixOne，将表导出到本地目录，例如 *~/tmp/export_demo/export_datatable.txt*，命令示例如下：

    ```
    select * from user into outfile '~/tmp/export_demo/export_datatable.txt'
    ```

    使用 Docker 安装启动 MatrixOne，导出到你挂载的容器目录路径，如下例所示。其中目录 *mo-data* 指的是本地路径 *~/tmp/docker_export_demo/mo-data*。

    ```
    select * from user into outfile 'mo-data/export_datatable.txt';
    ```

3. 到你本地 *export_datatable.txt* 文件下查看导出情况：

    ```
    id,user_name,sex
    1,"weder","man"
    2,"tom","man"
    3,"wederTom","man"
    ```
