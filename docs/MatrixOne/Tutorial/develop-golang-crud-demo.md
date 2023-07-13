# Golang 基础示例

## 配置环境

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。
- 确认你已完成安装 [Golang 1.18 版本及以上](https://go.dev/dl/)，可以使用下面的命令行确认你的 Golang 版本：

    ```
    #To check with Golang installation and its version
    go version
    ```

- 确认你已完成安装 MySQL 客户端。
- 下载并安装 [`Go-MySQL-Driver`](https://github.com/go-sql-driver/mysql) 工具。

## 步骤

1. 通过 MySQL 客户端连接到 MatrixOne。创建一个名为 *test* 的新数据库。

    ```
    mysql> create database test;
    ```

2. 创建一个命名为 `golang_crud_matrixone.go` 的纯文本文件，将下面的代码拷贝至文件内：

    ```python
    package main

    import (
        "database/sql"
        "fmt"
        "log"
        _ "github.com/go-sql-driver/mysql"
    )

    func main() {
      	//Open a new connection to MatrixOne
        db, err := sql.Open("mysql", "dump:111@tcp(127.0.0.1:6001)/test")
        checkErr(err)

        //Create a table
        _, err2 := db.Exec("CREATE TABLE `userinfo` (`uid` INT(10) NOT NULL AUTO_INCREMENT,`username` VARCHAR(64) NULL DEFAULT NULL,`department` VARCHAR(64) NULL DEFAULT NULL,`created` DATETIME NULL DEFAULT NULL, PRIMARY KEY (`uid`));")
        if err2 != nil {
            log.Fatal(err2)
        }
        fmt.Print("Successfully Created\n")

        // Insert a record
        stmt, err := db.Prepare("INSERT userinfo SET username=?,department=?,created=?")
        checkErr(err)

        res, err := stmt.Exec("Alex", "r&d", "2023-01-01 12:00:00")
        checkErr(err)

        id, err := res.LastInsertId()
        checkErr(err)

        fmt.Println(id)
        //Update a record
        stmt, err = db.Prepare("update userinfo set username=? where uid=?")
        checkErr(err)

        res, err = stmt.Exec("Mark", id)
        checkErr(err)

        affect, err := res.RowsAffected()
        checkErr(err)

        fmt.Println(affect)

        // Query all records
        rows, err := db.Query("SELECT * FROM userinfo")
        checkErr(err)

        for rows.Next() {
            var uid int
            var username string
            var department string
            var created string
            err = rows.Scan(&uid, &username, &department, &created)
            checkErr(err)
            fmt.Println(uid)
            fmt.Println(username)
            fmt.Println(department)
            fmt.Println(created)
        }

        // Delete a record
        stmt, err = db.Prepare("delete from userinfo where uid=?")
        checkErr(err)

        res, err = stmt.Exec(id)
        checkErr(err)

        affect, err = res.RowsAffected()
        checkErr(err)

        fmt.Println(affect)

        db.Close()

    }

    func checkErr(err error) {
        if err != nil {
            panic(err)
        }
    }

    ```

3. 打开一个新的终端，使用如下命令行，执行此 Golang 文件。

    ```
    > go run golang_crud_matrixone.go
    Successfully Created
    1
    1
    1
    Mark
    r&d
    2023-01-01
    1
    ```
