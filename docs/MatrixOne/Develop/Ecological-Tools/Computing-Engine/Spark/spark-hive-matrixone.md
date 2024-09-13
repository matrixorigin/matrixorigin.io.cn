# 使用 Spark 将 Hive 数据导入到 MatrixOne

在本章节，我们将介绍使用 Spark 计算引擎实现 Hive 批量数据写入 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 已完成[安装和启动 MatrixOne](https://docs.matrixorigin.cn/1.2.3/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 下载并安装 [IntelliJ IDEA version 2022.2.1 及以上](https://www.jetbrains.com/idea/download/)。
- 下载并安装 [JDK 8+](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 从 Hive 导入数据，需要安装 [Hadoop](http://archive.apache.org/dist/hadoop/core/hadoop-3.1.4/) 和 [Hive](https://dlcdn.apache.org/hive/hive-3.1.3/)。
- 下载并安装 [MySQL Client 8.0.33](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)。

## 操作步骤

### 步骤一：初始化项目

1. 启动 IDEA，点击 **File > New > Project**，选择 **Spring Initializer**，并填写以下配置参数：

    - **Name**：mo-spark-demo
    - **Location**：~\Desktop
    - **Language**：Java
    - **Type**：Maven
    - **Group**：com.example
    - **Artiface**：matrixone-spark-demo
    - **Package name**：com.matrixone.demo
    - **JDK** 1.8

    <div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/spark/matrixone-spark-demo.png width=50% heigth=50%/>
    </div>

2. 添加项目依赖，在项目根目录下的 `pom.xml` 内容编辑如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example.mo</groupId>
    <artifactId>mo-spark-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <spark.version>3.2.1</spark.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-sql_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>

        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-hive_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-catalyst_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.spark</groupId>
            <artifactId>spark-core_2.12</artifactId>
            <version>${spark.version}</version>
        </dependency>
        <dependency>
            <groupId>org.codehaus.jackson</groupId>
            <artifactId>jackson-core-asl</artifactId>
            <version>1.9.13</version>
        </dependency>
        <dependency>
            <groupId>org.codehaus.jackson</groupId>
            <artifactId>jackson-mapper-asl</artifactId>
            <version>1.9.13</version>
        </dependency>


        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.16</version>
        </dependency>

    </dependencies>

</project>
```

### 步骤二：准备 Hive 数据

在终端窗口中执行以下命令，创建 Hive 数据库、数据表，并插入数据：

```sql
hive
hive> create database motest;
hive> CREATE TABLE `users`(
  `id` int,
  `name` varchar(255),
  `age` int);
hive> INSERT INTO motest.users (id, name, age) VALUES(1, 'zhangsan', 12),(2, 'lisi', 17),(3, 'wangwu', 19);
```

### 步骤三：创建 MatrixOne 数据表

在 node3 上，使用 MySQL 客户端连接到 node1 的 MatrixOne。然后继续使用之前创建的 "test" 数据库，并创建新的数据表 "users"。

```sql
CREATE TABLE `users` (
`id` INT DEFAULT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`age` INT DEFAULT NULL
)
```

### 步骤四：拷贝配置文件

将 Hadoop 根目录下的 "etc/hadoop/core-site.xml" 和 "hdfs-site.xml" 以及 Hive 根目录下的 "conf/hive-site.xml" 这三个配置文件复制到项目的 "resource" 目录中。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/spark/config-files.png width=40% heigth=40%/>
</div>

### 步骤五：编写代码

在 IntelliJ IDEA 中创建名为 "Hive2Mo.java" 的类，用于使用 Spark 从 Hive 中读取数据并将数据写入 MatrixOne。

```java
package com.matrixone.spark;

import org.apache.spark.sql.*;

import java.sql.SQLException;
import java.util.Properties;

/**
 * @auther MatrixOne
 * @date 2022/2/9 10:02
 * @desc
 *
 * 1.在 hive 和 matrixone 中分别创建相应的表
 * 2.将 core-site.xml hdfs-site.xml 和 hive-site.xml 拷贝到 resources 目录下
 * 3.需要设置域名映射
 */
public class Hive2Mo {

    // parameters
    private static String master = "local[2]";
    private static String appName = "app_spark_demo";

    private static String destHost = "xx.xx.xx.xx";
    private static Integer destPort = 6001;
    private static String destUserName = "root";
    private static String destPassword = "111";
    private static String destDataBase = "test";
    private static String destTable = "users";


    public static void main(String[] args) throws SQLException {
        SparkSession sparkSession = SparkSession.builder()
                .appName(appName)
                .master(master)
                .enableHiveSupport()
                .getOrCreate();

        //SparkJdbc 读取表内容
        System.out.println("读取 hive 中 person 的表内容");
        // 读取表中所有数据
        Dataset<Row> rowDataset = sparkSession.sql("select * from motest.users");
        //显示数据
        //rowDataset.show();
        Properties properties = new Properties();
        properties.put("user", destUserName);
        properties.put("password", destPassword);;
        rowDataset.write()
                .mode(SaveMode.Append)
                .jdbc("jdbc:mysql://" + destHost + ":" + destPort + "/" + destDataBase,destTable, properties);
    }

}
```

### 步骤六：查看执行结果

在 MatrixOne 中执行如下 SQL 查看执行结果：

```sql
mysql> select * from test.users;
+------+----------+------+
| id   | name     | age  |
+------+----------+------+
|    1 | zhangsan |   12 |
|    2 | lisi     |   17 |
|    3 | wangwu   |   19 |
+------+----------+------+
3 rows in set (0.00 sec)
```
