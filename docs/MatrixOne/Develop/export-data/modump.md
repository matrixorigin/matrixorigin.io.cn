# 使用 `modump` 导出数据

MatrixOne 支持以下两种方式导入数据：

- `SELECT INTO...OUTFILE`
- `modump`

本篇文档主要介绍如何使用 `modump` 导出数据。

## 什么是 `modump`

`modump` 是 MatrixOne 的一个客户端实用工具，与 `mysqldump` 一样，它可以被用于通过导出*。sql* 类型的文件来对 MatrixOne 数据库进行备份，该文件类型包含可执行以重新创建原始数据库的 SQL 语句。

使用 `modump` 工具，你必须能够访问运行 MatrixOne 实例的服务器。你还必须拥有导出的数据库的用户权限。

### 语法结构

```
./mo-dump -u ${user} -p ${password} -h ${host} -P ${port} -db ${database} [-tbl ${table}...] > {dumpfilename.sql}
```

**参数释义**

- **-u [user]**：连接 MatrixOne 服务器的用户名。只有具有数据库和表读取权限的用户才能使用 `modump` 实用程序，默认值 dump。

- **-p [password]**：MatrixOne 用户的有效密码。默认值：111。

- **-h [host]**：MatrixOne 服务器的主机 IP 地址。默认值：127.0.0.1

- **-P [port]**：MatrixOne 服务器的端口。默认值：6001

- **-db [数据库名称]**：必需参数。要备份的数据库的名称。

- **-tbl [表名]**：可选参数。如果参数为空，则导出整个数据库。如果要备份指定表，则可以在命令中指定多个 `-tbl` 和表名。

## 构建 modump 二进制文件

`modump` 命令程序嵌入在 MatrixOne 源代码中，你首先需要从 MatrixOne 源代码构建二进制文件

__Tips：__由于 `modump` 是基于 Go 语言进行开发，所以你同时需要安装部署 <a href="https://go.dev/doc/install" target="_blank">Go</a> 语言。

1. 执行下面的代码即可从 MatrixOne 源代码构建 `modump` 二进制文件：

    ```
    git clone https://github.com/matrixorigin/matrixone.git
    cd matrixone
    make build modump
    ```

2. 你可以在 MatrixOne 文件夹中找到 `modump` 可执行文件。

!!! note
    构建好的 `modump` 文件也可以在相同的硬件平台上工作。但是需要注意在 x86 平台中构建的 `modump` 二进制文件在 Darwin ARM 平台中则无法正常工作。你可以在同一套操作系统和硬件平台内构建并使用 `modump` 二进制文件。`modump` 目前只支持 Linux 和 macOS。

## 如何使用 `modump` 导出 MatrixOne 数据库

`modump` 在命令行中非常易用。参见以下步骤，以 SQL 命令的形式导出完整数据库：

1. 在你本地计算机上打开命令行或终端窗口。

2. 从此终端窗口连接到 MatrixOne 实例。

3. 输入以下命令：

```
./modump -u username -p password -h host_ip_address -P port -db database > exporteddb.sql
```

例如，如果你在与 MatrixOne 实例相同的服务器中启动终端，并且你想要生成单个数据库的备份，请运行以下命令。该命令将在 `t.sql` 文件中生成 **t** 数据库的结构和数据的备份。`t.sql` 文件将与您的 `modump` 可执行文件位于同一目录中。

```
./modump -u dump -p 111 -h 127.0.0.1 -P 6001 -db t > t.sql
```

如果要在数据库中生成单个表的备份，可以运行以下命令。该命令将生成命名为 *t* 的数据库的 *t1* 表的备份，其中包含 `t.sql` 文件中的结构和数据。

```
./modump -u dump -p 111 -db t -tbl t1 > t1.sql
```

## 限制

* `modump` 仅支持导出单个数据库的备份，如果你有多个数据库需要备份，需要手动运行 `modump` 多次。

* `modump` 暂不支持只导出数据库的结构或数据。如果你想在没有数据库结构的情况下生成数据的备份，或者仅想导出数据库结构，那么，你需要手动拆分 `.sql` 文件。
