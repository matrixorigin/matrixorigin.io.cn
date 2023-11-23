# MODUMP 工具写出

MatrixOne 支持以下两种方式导出数据：

- `SELECT INTO...OUTFILE`
- `mo-dump`

本篇文档主要介绍如何使用 `mo-dump` 导出数据。

## 什么是 mo-dump

`mo-dump` 是 MatrixOne 的一个客户端实用工具，与 `mysqldump` 一样，它可以被用于通过导出*.sql* 类型的文件来对 MatrixOne 数据库进行备份，该文件类型包含可执行以重新创建原始数据库的 SQL 语句。

使用 `mo-dump` 工具，你必须能够访问运行 MatrixOne 实例的服务器。你还必须拥有导出的数据库的用户权限。

### 语法结构

```bash
./mo-dump -u ${user} -p ${password} \
    -h ${host} -P ${port} -db ${database}\
    [--local-infile=true] [-csv] [-tbl ${table}...]\
    -net-buffer-length ${net-buffer-length} > {importStatement.sql}
```

**参数释义**

- **-u [user]**：连接 MatrixOne 服务器的用户名。只有具有数据库和表读取权限的用户才能使用 `mo-dump` 实用程序，默认值 `dump`。

- **-p [password]**：MatrixOne 用户的有效密码。默认值：`111`。

- **-h [host]**：MatrixOne 服务器的主机 IP 地址。默认值：`127.0.0.1`。

- **-P [port]**：MatrixOne 服务器的端口。默认值：`6001`。

- **-db [databaseName]**：必需参数。要备份的数据库的名称。

- **-net-buffer-length [数据包大小]**：数据包大小，即 SQL 语句字符的总大小。数据包是 SQL 导出数据的基本单位，如果不设置参数，则默认 1048576 Byte（1M），最大可设置 16777216 Byte（16M）。假如这里的参数设置为 16777216 Byte（16M），那么，当要导出大于 16M 的数据时，会把数据拆分成多个 16M 的数据包，除最后一个数据包之外，其它数据包大小都为 16M。

- **-csv**：可选参数。当设置此参数时，表示导出的数据为 *CSV* 格式，并将所有的数据表的数据导出为当前目录下 *${databaseName} _${tableName}. csv*，如果参数为空，则默认以 DML 方式（INSERT 语句）导出数据。

- **--local-infile**：默认值为 true，仅在 **-csv** 参数存在时产生影响，否则无作用。具体来说此参数仅影响 modump 输出的 *importStatement.sql* 脚本中 `LOAD DATA [LOCAL] INFILE` 语句是否含有 `LOCAL`。
    - **--local-infile=true**：脚本中使用 `LOAD DATA LOCAL INFILE`，既适用于于本地数据导入本地 MatrixOne，也适用于本地数据导入远程 MatrixOne。
    - **--local-infile=false**：脚本中使用 `LOAD DATA INFILE`，仅适用于本地数据导入本地 MatrixOne，导入效率高于 `LOAD DATA LOCAL INFILE`，更多可参考 [LOAD DATA INFILE](../../Reference/SQL-Reference/Data-Manipulation-Language/load-data.md)。

- **-tbl [tableName]**：可选参数。如果参数为空，则导出整个数据库。如果要备份指定表，则可以在命令中指定多个 `-tbl` 和 `tableName`。

- **> {importStatement.sql}**：将输出的 SQL 语句存储到文件 *importStatement.sql* 中，否则在屏幕上输出。

## 构建 mo-dump 二进制文件

`mo-dump` 命令程序嵌入在 MatrixOne 源代码中，你首先需要从 MatrixOne 源代码构建二进制文件。

__Tips:__ 由于 `mo-dump` 是基于 Go 语言进行开发，所以你同时需要安装部署 <a href="https://go.dev/doc/install" target="_blank">Go</a> 语言。

1. 执行下面的代码即可从 MatrixOne 源代码构建 `mo-dump` 二进制文件：

    ```
    git clone https://github.com/matrixorigin/matrixone.git
    cd matrixone
    make build modump
    ```

2. 你可以在 MatrixOne 文件夹中找到 `mo-dump` 可执行文件：*mo-dump*。

!!! note
    构建好的 `mo-dump` 文件也可以在相同的硬件平台上工作。但是需要注意在 x86 平台中构建的 `mo-dump` 二进制文件在 Darwin ARM 平台中则无法正常工作。你可以在同一套操作系统和硬件平台内构建并使用 `mo-dump` 二进制文件。`mo-dump` 目前只支持 Linux 和 macOS。

## 如何使用 `mo-dump` 导出 MatrixOne 数据库

`mo-dump` 在命令行中非常易用。参见以下步骤示例，导出*.sql* 文件格式完整数据库：

在你本地计算机上打开终端窗口，输入以下命令，连接到 MatrixOne，并且导出数据库：

```
./mo-dump -u username -p password -h host_ip_address -P port -db database > importStatement.sql
```

例如，如果你在与 MatrixOne 实例相同的服务器中启动终端，并且你想要生成单个数据库以及其中所有表的备份，请运行以下命令。该命令将在 *importMydb.sql* 文件中生成 **mydb** 数据库以及表的结构和数据的备份。*importMydb.sql* 文件会保存在当前目录下：

```
./mo-dump -u root -p 111 -h 127.0.0.1 -P 6001 -db mydb > importMydb.sql
```

如果你想将数据库 *mydb* 内的表的数据导出为 *CSV* 格式，数据库 *mydb* 中的所有表的数据将会以 `${databaseName}_${tableName}.csv` 的格式导出在当前目录下，生成数据库和表结构以及导入的 SQL 语句将会保存在 *importMydbWithCsv.sql* 文件中：

```
./mo-dump -u root -p 111 -h 127.0.0.1 -P 6001 -db mydb -csv > importMydbWithCsv.sql
```

如果要在数据库中指定生成某一个表或者某几个表的备份，可以运行以下命令。该命令将生成数据库 *mall* 中 *products* 表和 *orders* 表的结构和数据备份，保存在 *importMall.sql* 文件中。

```
./mo-dump -u root -p 111 -h 127.0.0.1 -P 6001 -db mall -tbl products -tbl orders > importTbles.sql
```

## 限制

* `mo-dump` 仅支持导出单个数据库的备份，如果你有多个数据库需要备份，需要手动运行 `mo-dump` 多次。

* `mo-dump` 暂不支持只导出数据库的结构或数据。如果你想在没有数据库结构的情况下生成数据的备份，或者仅想导出数据库结构，那么，你需要手动拆分 `.sql` 文件。
