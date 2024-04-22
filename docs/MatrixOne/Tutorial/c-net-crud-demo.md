# C# 基础示例

本篇文档将指导你如何使用 C# 构建一个简单的应用程序，并实现 CRUD（创建、读取、更新、删除）功能。

## 开始前准备

- 已完成[安装并启动 MatrixOne](../Get-Started/install-standalone-matrixone.md)

- 已安装[. NET Core SDK](https://dotnet.microsoft.com/zh-cn/download)

- 已安装 [MySQL Client](https://dev.mysql.com/downloads/installer/)

## 步骤

### 步骤一：创建 C# 应用

使用 dotnet 命令创建一个应用。例如，创建一个名为 myapp 的新应用：

```
dotnet new console -o myapp
```

随后切换到 myapp 目录下

### 步骤二：添加 MySQL Connector/NET NuGet 包

使用 NuGet 包管理器安装 MySql.Data 包：

```
dotnet add package MySql.Data
```

### 步骤三：连接 Matrixone 进行操作

编写代码连接 Matrixone，建立一个学生表并进行增删改查操作。在 Program.cs 文件中写入以下代码：

```
using System;
using MySql.Data.MySqlClient;
 
class Program
{

    static void ExecuteSQL(MySqlConnection connection, string query)
    {
        using (MySqlCommand command = new MySqlCommand(query, connection))
        {
            command.ExecuteNonQuery();
        }
    }
    static void Main(string[] args)
    {
        Program n =new Program();
        string connectionString = "server=127.0.0.1;user=root;database=test;port=6001;password=111";
        using (MySqlConnection connection = new MySqlConnection(connectionString))
        {
            try{
            connection.Open();
            Console.WriteLine("已经建立连接");
            // 建表
            ExecuteSQL(connection,"CREATE TABLE IF NOT EXISTS Student (id INT auto_increment PRIMARY KEY, name VARCHAR(255),age int,remark VARCHAR(255) )");
            Console.WriteLine("建表成功！");
            //插入数据
            ExecuteSQL(connection,"INSERT INTO Student(name,age) VALUES ('张三',22),('李四',25),('赵五',30)");
            Console.WriteLine("成功插入数据！");
            //更新数据
            ExecuteSQL(connection,"UPDATE Student SET remark = 'Updated' WHERE id = 1");
            Console.WriteLine("成功更新数据！");
            //删除数据
            ExecuteSQL(connection,"DELETE FROM Student WHERE id = 2");
            Console.WriteLine("成功删除数据！");
            //查询数据
            MySqlCommand command = new MySqlCommand("SELECT * FROM Student", connection);
            using (MySqlDataReader reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    Console.WriteLine($"姓名: {reader["name"]}, 年龄: {reader["age"]},备注: {reader["remark"]}");
                }
            }
            Console.WriteLine("数据查询成功！");
            }
            catch (MySqlException ex)
            {
                Console.WriteLine(ex.Message);

            }
            finally
            {
                Console.WriteLine("准备断开连接");
                connection.Close();
                Console.WriteLine("断开连接成功！");
            }
 
            //connection.Close();
        }
    }
}
```

### 步骤四：运行程序

在终端执行命令 `dotnet run`：

```
(base) admin@admindeMacBook-Pro myapp % dotnet run    
已经建立连接
建表成功！
成功插入数据！
成功更新数据！
成功删除数据！
姓名: 赵五, 年龄: 30,备注: 
姓名: 张三, 年龄: 22,备注: Updated
数据查询成功！
准备断开连接
断开连接成功！
```

### 步骤五：检查数据

使用 Mysql 客户端连接 Matrixone 对 Student 表进行查询：

```
mysql> select * from student;
+------+--------+------+---------+
| id   | name   | age  | remark  |
+------+--------+------+---------+
|    3 | 赵五   |   30 | NULL    |
|    1 | 张三   |   22 | Updated |
+------+--------+------+---------+
2 rows in set (0.00 sec)
```

可以看到，数据返回正确。