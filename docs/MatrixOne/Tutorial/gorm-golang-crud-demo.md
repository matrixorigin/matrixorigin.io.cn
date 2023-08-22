# gorm基础示例

本篇文档将指导你如何使用 **golang** 和 **gorm** 构建一个简单的应用程序，并实现 CRUD（创建、读取、更新、删除）功能。

**Gorm** 是 Python 语言中最流行的 ORM 工具之一。

## 开始前准备

相关软件的简单介绍：

* Gorm：基于golang的一个神奇的全功能ORM库，本次教程主要通过使用```gorm.io/gorm```和```gorm.io/driver/mysql```这两个库来让Go连接到MYSQL数据库并完成CRUD操作。

### 环境配置

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。通过 MySQL 客户端连接 MatrixOne 并创建一个命名为 *test* 的数据库：

  ```
  mysql> create database test;
  ```

- 确认你已完成安装 [Golang 1.18 版本及以上](https://go.dev/dl/)，可以使用下面的命令行确认你的 Golang 版本：

  ```
  #To check with Golang installation and its version
  go version
  ```

- 确认你已完成安装 MySQL 客户端。

- 确认你已经安装`gorm.io/gorm`以及`gorm.io/driver/mysql`，使用`go get`命令安装，代码如下：

  ```
  go get -u gorm.io/gorm
  go get -u gorm.io/driver/mysql
  ```

你可以参考 [Golang 连接 MatrixOne 服务](../Develop/connect-mo/connect-to-matrixone-with-go.md)了解如何通过 `Gorm` 连接到 MatrixOne，本篇文档将指导你如何实现 CRUD（创建、读取、更新、删除）。

## 新建表
作为对象关系映射器（ORM）工具， `Gorm` 允许开发人员创建 GO 类来映射关系数据库中的表。
在下面的代码示例中，将创建一个 `USER` 类，这里的类名和属性名称必须使用大写英文开头以保证`public`访问，否则不能创建。`USER` 类在`GORM`的作用下将转化为一条`SQL`语句，创建表名为`users` 的表。
新建一个 `gorm_create.go` 的文本文件，将以下代码拷贝粘贴到文件内：

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
    // Logger: logger.Default.LogMode(logger.Info), //print SQL
  })
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})
}

```

你可以取消注释```Logger: logger.Default.LogMode(logger.Info)```以把转化后的```SQL```输出出来。
打开终端，使用以下代码运行此 *go* 文件：

```
go run gorm_create.go
```

你可以使用 MySQL 客户端验证表是否创建成功：

```sql
mysql> show tables;
+----------------+
| Tables_in_test |
+----------------+
| users          |
+----------------+
1 row in set (0.01 sec)
```

## 插入数据

下面的演示中，将指导你在刚刚创建的`users`表中插入两条数据记录，这里的`ID`默认是自增的，也可以指定为固定的值。
新建一个 `gorm_insert.go` 的文本文件，将以下代码拷贝粘贴到文件内：

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Insert users**
	users := []USER{
		{
			// ID: 1, //autoincrement
			CNAME:    "lili",
			CADDRESS: "Shanghai"},
		{
			ID:       111,
			CNAME:    "zhang",
			CADDRESS: "Biejing",
		},
	}

	db.Create(users)
	
}

```

打开终端，使用以下代码运行此 *go* 文件：

```
go run gorm_insert.go
```

同样的，终端也会输出SQL语句，你可以使用 MySQL 客户端验证表是否成功插入数据：

```sql
mysql> select * from users;
+------+-------+----------+
| id   | cname | caddress |
+------+-------+----------+
|    1 | lili  | Shanghai |
|  111 | zhang | Biejing  |
+------+-------+----------+
2 rows in set (0.01 sec)
```

## 查询数据

下面的演示中，将指导你用条件查询部分数据，查询`CNAME=zhang`的数据。
新建一个 `gorm_query.go` 的文本文件，将以下代码拷贝粘贴到文件内：

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Query—— String condition** 
	res := USER{}
	tx := db.Where("CNAME = ? ", "zhang").Find(&USER{}).Scan(&res)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return
	}
	fmt.Println(res)

}

```

打开终端，使用以下代码运行此 *go* 文件：

```
go run gorm_query.go
```

终端的输出结果中将包含以下数据：

```
{111 zhang Biejing}
```

## 更新数据

下面的演示中，将指导你如何更新数据。
新建一个 `gorm_update.go` 的文本文件，将以下代码拷贝粘贴到文件内：

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Update** 
	aUser := USER{}
	tx := db.Where("CNAME = ? ", "zhang").Find(&USER{}).Scan(&aUser)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return
	}
	res:=db.Model(&aUser).Update("CADDRESS", "HongKong")
  if res.Error != nil {
		fmt.Println(tx.Error)
		return
	}

}

```

打开终端，使用以下代码运行此 *go* 文件：

```
go run gorm_update.go
```

你可以使用 MySQL 客户端验证表是否更新成功：

```sql
mysql> select * from users;
+------+-------+----------+
| id   | cname | caddress |
+------+-------+----------+
|  111 | zhang | HongKong |
|    1 | lili  | Shanghai |
+------+-------+----------+
2 rows in set (0.00 sec)
```

## 删除数据

下面的演示中，将指导你如何进行单条数据的删除。需要注意的是，在删除单条记录时，需要指定主键，否则可能会触发批量删除。
新建一个 `gorm_delete.go` 的文本文件，将以下代码拷贝粘贴到文件内：

```go
package main
import (
	"fmt"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)
// user model
type USER struct {
	ID       uint `gorm:"primaryKey"`
	CNAME    string
	CADDRESS string
}

func getDBConn() *gorm.DB {
	dsn := "root:111@tcp(127.0.0.1:6001)/test?charset=utf8mb4&parseTime=True&loc=Local" //MO
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	// get connection
	if err != nil {
		fmt.Println("Database Connection Failed") //Connection failed
	} else {
		fmt.Println("Database Connection Succeed") //Connection succeed
	}
	return db
}

func main() {
	//get *gorm.DB
	db := getDBConn()

	// auto create table
	db.AutoMigrate(&USER{})

  // **Delete** 
	aUser := USER{}
	tx := db.Where("CNAME = ? ", "zhang").Find(&USER{}).Scan(&aUser)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return
	}
	res := db.Delete(&aUser)
	if res.Error != nil {
		fmt.Println(tx.Error)
		return
	}

}

```

打开终端，使用以下代码运行此 *go* 文件：

```
go run gorm_delete.go
```

你可以使用 MySQL 客户端验证表是否删除成功：

```sql
mysql> select * from users;
+------+-------+----------+
| id   | cname | caddress |
+------+-------+----------+
|    1 | lili  | Shanghai |
+------+-------+----------+
1 row in set (0.00 sec)
```

以上仅是GORM中CRUD操作的部分演示，更多的用法和案例可以参考[GORM官方指南](https://gorm.io/zh_CN/docs/index.html)
