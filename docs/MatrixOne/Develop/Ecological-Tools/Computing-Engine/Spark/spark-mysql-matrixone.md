# 使用 Spark 从 MySQL 迁移数据至 MatrixOne

在本章节，我们将介绍使用 Spark 计算引擎实现 MySQL 批量数据写入 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 已完成[安装和启动 MatrixOne](https://docs.matrixorigin.cn/1.2.2/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 下载并安装 [IntelliJ IDEA version 2022.2.1 及以上](https://www.jetbrains.com/idea/download/)。
- 下载并安装 [JDK 8+](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 下载并安装 [MySQL](https://downloads.mysql.com/archives/get/p/23/file/mysql-server_8.0.33-1ubuntu23.04_amd64.deb-bundle.tar)。

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

### 步骤二：读取 MatrixOne 数据

使用 MySQL 客户端连接 MatrixOne 后，创建演示所需的数据库以及数据表。

1. 在 MatrixOne 中创建数据库、数据表，并导入数据：

    ```sql
    CREATE DATABASE test;
    USE test;
    CREATE TABLE `person` (`id` INT DEFAULT NULL, `name` VARCHAR(255) DEFAULT NULL, `birthday` DATE DEFAULT NULL);
    INSERT INTO test.person (id, name, birthday) VALUES(1, 'zhangsan', '2023-07-09'),(2, 'lisi', '2023-07-08'),(3, 'wangwu', '2023-07-12');
    ```

2. 在 IDEA 中创建 `MoRead.java` 类，以使用 Spark 读取 MatrixOne 数据：

    ```java
    package com.matrixone.spark;

    import org.apache.spark.sql.Dataset;
    import org.apache.spark.sql.Row;
    import org.apache.spark.sql.SQLContext;
    import org.apache.spark.sql.SparkSession;

    import java.util.Properties;

    /**
     * @auther MatrixOne
     * @desc 读取 MatrixOne 数据
     */
    public class MoRead {

        // parameters
        private static String master = "local[2]";
        private static String appName = "mo_spark_demo";

        private static String srcHost = "xx.xx.xx.xx";
        private static Integer srcPort = 6001;
        private static String srcUserName = "root";
        private static String srcPassword = "111";
        private static String srcDataBase = "test";
        private static String srcTable = "person";

        public static void main(String[] args) {
            SparkSession sparkSession = SparkSession.builder().appName(appName).master(master).getOrCreate();
            SQLContext sqlContext = new SQLContext(sparkSession);
            Properties properties = new Properties();
            properties.put("user", srcUserName);
            properties.put("password", srcPassword);
            Dataset<Row> dataset = sqlContext.read()
                    .jdbc("jdbc:mysql://" + srcHost + ":" + srcPort + "/" + srcDataBase,srcTable, properties);
            dataset.show();
        }

    }
    ```

3. 在 IDEA 中运行 `MoRead.Main()`，执行结果如下：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/spark/moread.png)

### 步骤三：将 MySQL 数据写入 MatrixOne

现在可以开始使用 Spark 将 MySQL 数据迁移到 MatrixOne。

1. 准备 MySQL 数据：在 node3 上，使用 Mysql 客户端连接本地 Mysql，创建所需数据库、数据表、并插入数据：

    ```sql
    mysql -h127.0.0.1 -P3306 -uroot -proot
    mysql> CREATE DATABASE motest;
    mysql> USE motest;
    mysql> CREATE TABLE `person` (`id` int DEFAULT NULL, `name` varchar(255) DEFAULT NULL, `birthday` date DEFAULT NULL);
    mysql> INSERT INTO motest.person (id, name, birthday) VALUES(2, 'lisi', '2023-07-09'),(3, 'wangwu', '2023-07-13'),(4, 'zhaoliu', '2023-08-08');
    ```

2. 清空 MatrixOne 表数据：

    在 node3 上，使用 MySQL 客户端连接本地 MatrixOne。由于本示例继续使用前面读取 MatrixOne 数据的示例中的 `test` 数据库，因此我们需要首先清空 `person` 表的数据。

    ```sql
    -- 在 node3 上，使用 Mysql 客户端连接 node1 的 MatrixOne
    mysql -hxx.xx.xx.xx -P6001 -uroot -p111
    mysql> TRUNCATE TABLE test.person;
    ```

3. 在 IDEA 中编写代码：

    创建 `Person.java` 和 `Mysql2Mo.java` 类，使用 Spark 读取 MySQL 数据。`Mysql2Mo.java` 类代码可参考如下示例：

```java
package com.matrixone.spark;

import org.apache.spark.api.java.function.MapFunction;
import org.apache.spark.sql.*;

import java.sql.SQLException;
import java.util.Properties;

/**
 * @auther MatrixOne
 * @desc
 */
public class Mysql2Mo {

    // parameters
    private static String master = "local[2]";
    private static String appName = "app_spark_demo";

    private static String srcHost = "127.0.0.1";
    private static Integer srcPort = 3306;
    private static String srcUserName = "root";
    private static String srcPassword = "root";
    private static String srcDataBase = "motest";
    private static String srcTable = "person";

    private static String destHost = "xx.xx.xx.xx";
    private static Integer destPort = 6001;
    private static String destUserName = "root";
    private static String destPassword = "111";
    private static String destDataBase = "test";
    private static String destTable = "person";


    public static void main(String[] args) throws SQLException {
        SparkSession sparkSession = SparkSession.builder().appName(appName).master(master).getOrCreate();
        SQLContext sqlContext = new SQLContext(sparkSession);
        Properties connectionProperties = new Properties();
        connectionProperties.put("user", srcUserName);
        connectionProperties.put("password", srcPassword);
        connectionProperties.put("driver","com.mysql.cj.jdbc.Driver");

        //jdbc.url=jdbc:mysql://127.0.0.1:3306/database
        String url = "jdbc:mysql://" + srcHost + ":" + srcPort + "/" + srcDataBase + "?characterEncoding=utf-8&autoReconnect=true&zeroDateTimeBehavior=convertToNull&useSSL=false&serverTimezone=Asia/Shanghai";

        //SparkJdbc 读取表内容
        System.out.println("读取数据库中 person 的表内容");
        // 读取表中所有数据
        Dataset<Row> rowDataset = sqlContext.read().jdbc(url,srcTable,connectionProperties).select("*");
        //显示数据
        //rowDataset.show();
       //筛选 id > 2 的数据，并将 name 字段添加 spark_ 前缀
        Dataset<Row> dataset = rowDataset.filter("id > 2")
                .map((MapFunction<Row, Row>) row -> RowFactory.create(row.getInt(0), "spark_" + row.getString(1), row.getDate(2)), RowEncoder.apply(rowDataset.schema()));
        //显示数据
        //dataset.show();
        Properties properties = new Properties();
        properties.put("user", destUserName);
        properties.put("password", destPassword);;
        dataset.write()
                .mode(SaveMode.Append)
                .jdbc("jdbc:mysql://" + destHost + ":" + destPort + "/" + destDataBase,destTable, properties);
    }

}
```

在上述代码中，执行了简单的 ETL 操作（筛选 id > 2 的数据，并在 name 字段前添加前缀 "spark_"），并将处理后的数据写入到 MatrixOne 数据库中。

### 步骤四：查看执行结果

在 MatrixOne 中执行如下 SQL 查看执行结果：

```sql
select * from test.person;
+------+---------------+------------+
| id   | name          | birthday   |
+------+---------------+------------+
|    3 | spark_wangwu  | 2023-07-12 |
|    4 | spark_zhaoliu | 2023-08-07 |
+------+---------------+------------+
2 rows in set (0.01 sec)
```
