# Golang 连接 MatrixOne 服务

MatrixOne 支持 Golang 连接，并且支持 [`Go-MySQL-Driver`](https://github.com/go-sql-driver/mysql)。

本篇文档将指导你了解如何使用 Golang 连接 MatrixOne。

## 开始前准备

- 已完成[安装并启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

- 已安装 [Golang 1.18 版本及以上](https://go.dev/dl/)，如果你没有安装，可以点击 [Golang 1.18 版本及以上](https://go.dev/dl/) 至官方网站进行下载安装；如果你已安装，可以使用下面的命令行检查版本：

```
#检查 Golang 版本号，确认是否安装
go version
```

- 已安装 [MySQL 客户端](https://dev.mysql.com/downloads/mysql)，如果你没有安装，可以点击 [MySQL 客户端](https://dev.mysql.com/downloads/mysql) 至官方网站进行下载安装。。

- 已安装 [Git](https://git-scm.com/downloads) 工具，如果你没有安装，可以点击 [Git](https://git-scm.com/downloads) 至官方网站进行下载安装。

## 使用 Golang 连接 MatrixOne 服务

`Go-MySQL-Driver` 是一个用于 Go 语言的 MySQL 驱动程序，它实现了 Go 标准库中 database/sql 接口的方法，使得 Go 语言程序可以通过这个驱动程序连接和操作 MySQL 数据库。

1. 安装 `Go-MySQL-Driver` 工具：

    使用 [Go Tool](https://golang.org/cmd/go/) 将 `Go-MySQL-Driver` 包安装到你的 [$GOPATH](https://github.com/golang/go/wiki/GOPATH)。

    你也可以使用下面的命令行安装 `Go-MySQL-Driver` 工具：

    ```
    > go get -u github.com/go-sql-driver/mysql
    ```

2. 使用 MySQL 客户端连接 MatrixOne。新建一个名称为 *test* 数据库：

    ```sql
    mysql> create database test;
    ```

3. 创建一个纯文本文件 *golang_connect_matrixone.go* 并将代码写入文件：

    ```python
    package main

    import (
        "database/sql"
        "fmt"
        _ "github.com/go-sql-driver/mysql"
    )

    func main() {
        //"username:password@[protocol](address:port)/database"
        db, _ := sql.Open("mysql", "dump:111@tcp(127.0.0.1:6001)/test") // Set database connection
        defer db.Close()                                            //Close DB
        err := db.Ping()                                            //Connect to DB
        if err != nil {
            fmt.Println("Database Connection Failed")               //Connection failed
            return
        } else {
            fmt.Println("Database Connection Succeed")              //Connection succeed
        }
    }
    ```

4. 打开一个终端，在终端内执行下面的命令：

    ```
    > go run golang_connect_matrixone.go
    Database Connection Succeed
    ```

## 参考文档

关于使用 Golang 通过 MatrixOne 构建一个简单的 CRUD 的示例，参见 [构建一个 Golang CRUD 示例](../../Tutorial/develop-golang-crud-demo.md)。
