# 使用 JDBC 连接

在 Java 中，我们可以通过 Java 代码使用 JDBC 连接器（Java Database Connectivity）连接到 MatrixOne。JDBC 是用于数据库连接的标准 API 之一，使用它我们可以轻松地运行 SQL 语句并且从数据库中获取数据。

## 开始前准备

使用 JDBC 连接 MatrixOne 前，需要完成以下下载安装任务：

1. 已完成[安装并启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。
2. 下载安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
3. 下载安装 MySQL 客户端。
4. 下载安装 JAVA IDE，本篇文档以 [IntelliJ IDEA](https://www.jetbrains.com/idea/) 为例，你也可以下载其他 IDE 工具。

## 步骤

1. 使用 MySQL 客户端连接 MatrixOne。在 MatrixOne 新建一个名为 *test* 数据库和一个新的表 *t1*：

    ```sql
    create database test;
    use test;
    create table t1
    (
        code int primary key,
        title char(35)
    );
    ```

2. 在 IDEA 中新建 Java 名称为 **testJDBC** 的项目并选择在 **Build System** 中选择 **Maven** 作为构建系统，点击 **Create**。

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/JDBC_connect/JDBC-create-project.png width=50% heigth=50%/>
    </div>

3. 点击 **File > Project Structure**，进入到 **Project Setting**，点选 **Library**，并点击 **+** 按钮，添加 **From Maven**。

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/JDBC_connect/JDBC-project-structure.png width=40% heigth=40%/>
    </div>

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/JDBC_connect/JDBC-from-maven.png width=50% heigth=50%/>
    </div>

4. 输入框中输入 **mysql-connector-java** 搜索整个库，选择 **mysql:mysql-connector-java:8.0.30**，应用到本项目中。

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/JDBC_connect/JDBC-add-driver.png width=70% heigth=70%/>
    </div>

5. 修改 **src/main/java/org/example/Main.java** 中的默认 Java 源代码。如下面的代码示例中所示，这段代码使用连接地址和凭据创建连接。连接到 MatrixOne 后，你可以使用 Java 语言对 MatrixOne 数据库和表进行操作。

    有关如何使用 JDBC 在 MatrixOne 中开发 CRUD（创建、读取、更新、删除）应用程序的完整示例，参考 [Java CRUD 示例](../../../Tutorial/develop-java-crud-demo.md)。

    ```
    package org.example;

    import java.sql.Connection;
    import java.sql.DriverManager;
    import java.sql.SQLException;



    public class Main {


        private static String jdbcURL = "jdbc:mysql://127.0.0.1:6001/test";
        private static String jdbcUsername = "root";
        private static String jdbcPassword = "111";

        public static void main(String[] args) {


            try {
                Connection connection = DriverManager.getConnection(jdbcURL, jdbcUsername, jdbcPassword);
                // Do something with the Connection

            } catch (SQLException ex) {
                // handle any errors
                System.out.println("SQLException: " + ex.getMessage());
                System.out.println("SQLState: " + ex.getSQLState());
                System.out.println("VendorError: " + ex.getErrorCode());
            }
        }
    }

    ```

## 参考文档

有关 MatrixOne 对 JDBC 特性支持的完整列表，参见 [MatrixOne 的 JDBC 功能支持列表](../../../Reference/Limitations/mo-jdbc-feature-list.md)。
