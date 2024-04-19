# C# 连接

MatrixOne 支持 C# 连接，并且支持 MySQL Connector/NET 驱动。

本篇文档将指导你了解如何使用 C# 连接 MatrixOne。

## 开始前准备

- 已完成[安装并启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)

- 已安装[. NET Core SDK](https://dotnet.microsoft.com/zh-cn/download)

- 已安装 [MySQL Client](https://dev.mysql.com/downloads/installer/)

## 使用 C# 连接 MatrixOne 服务

### 步骤一：创建 C# 应用

使用 dotnet 命令创建一个新的控制台应用。例如，创建一个名为 myapp 的新应用：

```
dotnet new console -o myapp
```

随后切换到 myapp 目录下

### 步骤二：添加 MySQL Connector/NET NuGet 包

使用 NuGet 包管理器安装 MySql.Data 包：

```
dotnet add package MySql.Data
```

### 步骤三：连接 Matrixone

在 Program.cs 文件中写入以下代码：

```
using System;
using MySql.Data.MySqlClient;
 
class Program
{
    static void Main(string[] args)
    {
        Program n =new Program();
        string connectionString = "server=127.0.0.1;user=root;database=test;port=6001;password=111";
        using (MySqlConnection connection = new MySqlConnection(connectionString))
        {
            try{
            connection.Open();
            Console.WriteLine("成功建立连接");
            }
            catch (MySqlException ex)
            {
                Console.WriteLine(ex.Message);
            }
            finally
            {
                connection.Close();
            }
        }
    }
}
```

### 步骤四：运行程序

在终端执行命令 `dotnet run`：

```
(base) admin@admindeMacBook-Pro myapp % dotnet run    
成功建立连接
```

## 参考文档

关于使用 C# 通过 MatrixOne 构建一个简单的 CRUD 的示例，参见 [C# 基础示例](../../Tutorial/c-net-crud-demo.md)。
