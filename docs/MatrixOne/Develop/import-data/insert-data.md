# 插入数据

本文档介绍如何使用 SQL 语句在 MatrixOne 中插入数据。

## 开始前准备

- 已通过[源代码或二进制包](../../Get-Started/install-standalone-matrixone.md)完成安装 MatrixOne。
- 已完成[连接 MatrixOne 服务](../../Get-Started/connect-to-matrixone-server.md)。

## INSERT INTO 语句

`INSERT INTO` 语句有以下写法：

1. 指定要插入的列名和值：

    ```
    INSERT INTO tbl_name (a,b,c) VALUES (1,2,3);
    ```

2. 如果要为表的所有列添加值，则不需要在 SQL 查询中指定列名。必须确保值的顺序与表中列的顺序相同。`INSERT INTO` 语法如下：

    ```
    INSERT INTO tbl_name VALUES (1,2,3);
    ```

3. 使用 `INSERT...VALUES...` 语句可以插入多行。语句中必须包含多个用逗号分隔的值列表，值列表用圆括号括起来，并用逗号分隔。示例如下：
    
    ```
    INSERT INTO tbl_name (a,b,c) VALUES(1,2,3), (4,5,6), (7,8,9);
    ```

## 数据库示例

以下是从 Northwind 示例数据库中的 **Customers** 表中选择的表示例：

```
CREATE TABLE Customer (
  CustomerID INT AUTO_INCREMENT NOT NULL
  ,CustomerName VARCHAR(40) NOT NULL
  ,ContactName VARCHAR(30) NULL
  ,Address VARCHAR(60) NULL
  ,City VARCHAR(15) NULL
  ,PostalCode VARCHAR(10) NULL
  ,Country VARCHAR(15) NULL
  ,PRIMARY KEY (CustomerID)
  );
```

| CustomerID | CustomerName         | ContactName     | Address                     | City     | PostalCode | Country |
| :--------- | :------------------- | :-------------- | :-------------------------- | :------- | :--------- | :------ |
| 89         | White Clover Markets | Karl Jablonski  | 305 - 14th Ave. S. Suite 3B | Seattle  | 98128      | USA     |
| 90         | Wilman Kala          | Matti Karttunen | Keskuskatu 45               | Helsinki | 21240      | Finland |
| 91         | Wolski               | Zbyszek         | ul. Filtrowa 68             | Walla    | 01-012     | Poland  |

## INSERT INTO 示例

下面的SQL语句在 **Customers** 表中插入了一条新记录：

### Example

```
INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');
```

**Customers** 表展示出来如下所示：

| CustomerID | CustomerName         | ContactName     | Address                     | City      | PostalCode | Country |
| :--------- | :------------------- | :-------------- | :-------------------------- | :-------- | :--------- | :------ |
| 89         | White Clover Markets | Karl Jablonski  | 305 - 14th Ave. S. Suite 3B | Seattle   | 98128      | USA     |
| 90         | Wilman Kala          | Matti Karttunen | Keskuskatu 45               | Helsinki  | 21240      | Finland |
| 91         | Wolski               | Zbyszek         | ul. Filtrowa 68             | Walla     | 01-012     | Poland  |
| 92         | Cardinal             | Tom B. Erichsen | Skagen 21                   | Stavanger | 4006       | Norway  |

## 仅在指定列中插入数据

MatrixOne 也支持使用 SQL 语句仅在特定列中插入数据。

### 示例

使用下面的 SQL 语句将插入一条新记录，但只插入 *CustomerName*、*City* 和 *Country* 列中的数据，同时 *CustomerID* 将自动更新：

```
INSERT INTO Customers (CustomerName, City, Country)
VALUES ('Cardinal', 'Stavanger', 'Norway');
```

**Customers** 表展示出来如下所示：

| CustomerID | CustomerName         | ContactName     | Address                     | City      | PostalCode | Country |
| :--------- | :------------------- | :-------------- | :-------------------------- | :-------- | :--------- | :------ |
| 89         | White Clover Markets | Karl Jablonski  | 305 - 14th Ave. S. Suite 3B | Seattle   | 98128      | USA     |
| 90         | Wilman Kala          | Matti Karttunen | Keskuskatu 45               | Helsinki  | 21240      | Finland |
| 91         | Wolski               | Zbyszek         | ul. Filtrowa 68             | Walla     | 01-012     | Poland  |
| 92         | Cardinal             | null            | null                        | Stavanger | null       | Norway  |

## INSERT INTO...SELECT

使用 `INSERT INTO SELECT`，你可以从 `SELECT` 语句的结果中快速插入多行到表中，`SELECT` 语句可以从一个或多个表中进行选择。`INSERT INTO SELECT` 语句要求源表和目标表中的数据类型匹配。

### INSERT INTO SELECT 语法解释

从一个表复制所有列到另一个表:

```
INSERT INTO *table2*
SELECT * FROM *table1
*WHERE *condition*;
```

只从一个表复制一些列到另一个表:

```
INSERT INTO *table2* (*column1*, *column2*, *column3*, ...)
SELECT *column1*, *column2*, *column3*, ...
FROM *table1*
WHERE *condition*;
```

## Northwind 数据库示例

以下是从 Northwind 示例数据库中的表中选择的表示例：

```
CREATE TABLE Customer (
  CustomerID INT AUTO_INCREMENT NOT NULL
  ,CustomerName VARCHAR(40) NOT NULL
  ,ContactName VARCHAR(30) NULL
  ,Address VARCHAR(60) NULL
  ,City VARCHAR(15) NULL
  ,PostalCode VARCHAR(10) NULL
  ,Country VARCHAR(15) NULL
  ,PRIMARY KEY (CustomerID)
  );
CREATE TABLE Supplier (
  SupplierID INT AUTO_INCREMENT NOT NULL
  ,SupplierName VARCHAR(40) NOT NULL
  ,ContactName VARCHAR(30) NULL
  ,Address VARCHAR(60) NULL
  ,City VARCHAR(15) NULL
  ,PostalCode VARCHAR(10) NULL
  ,Country VARCHAR(15) NULL
  ,PRIMARY KEY (SupplierID)
  );
```

**Customers** 表展示出来如下所示：

| CustomerID | CustomerName                       | ContactName    | Address                       | City        | PostalCode | Country |
| :--------- | :--------------------------------- | :------------- | :---------------------------- | :---------- | :--------- | :------ |
| 1          | Alfreds Futterkiste                | Maria Anders   | Obere Str. 57                 | Berlin      | 12209      | Germany |
| 2          | Ana Trujillo Emparedados y helados | Ana Trujillo   | Avda. de la Constitución 2222 | México D.F. | 05021      | Mexico  |
| 3          | Antonio Moreno Taquería            | Antonio Moreno | Mataderos 2312                | México D.F. | 05023      | Mexico  |

**Suppliers** 表展示出来如下所示：

| SupplierID | SupplierName               | ContactName      | Address        | City        | PostalCode | Country |
| :--------- | :------------------------- | :--------------- | :------------- | :---------- | :--------- | :------ |
| 1          | Exotic Liquid              | Charlotte Cooper | 49 Gilbert St. | Londona     | EC1 4SD    | UK      |
| 2          | New Orleans Cajun Delights | Shelley Burke    | P.O. Box 78934 | New Orleans | 70117      | USA     |
| 3          | Grandma Kelly's Homestead  | Regina Murphy    | 707 Oxford Rd. | Ann Arbor   | 48104      | USA     |

### 示例

下面的SQL语句将 **Supplier** 复制到 **Customers** 中，同时未填充数据的列将填充为 `NULL`：

```
INSERT INTO Customers (CustomerName, City, Country)
SELECT SupplierName, City, Country FROM Suppliers;
```

**Customers** 表展示出来如下所示：

| CustomerID | CustomerName                       | ContactName    | Address                       | City        | PostalCode | Country |
| :--------- | :--------------------------------- | :------------- | :---------------------------- | :---------- | :--------- | :------ |
| 1          | Alfreds Futterkiste                | Maria Anders   | Obere Str. 57                 | Berlin      | 12209      | Germany |
| 2          | Ana Trujillo Emparedados y helados | Ana Trujillo   | Avda. de la Constitución 2222 | México D.F. | 05021      | Mexico  |
| 3          | Antonio Moreno Taquería            | Antonio Moreno | Mataderos 2312                | México D.F. | 05023      | Mexico  |
| 4          | Exotic Liquid                      | null           | null                          | Londona     | null       | UK      |
| 5          | New Orleans Cajun Delights         | null           | null                          | New Orleans | null       | USA     |
| 6          | Grandma Kelly's Homestead          | null           | null                          | Ann Arbor   | null       | USA     |

## 限制

MatrixOne 暂不支持 `INSERT ... ON DUPLICATE KEY UPDATE` 语句。你需要使用 `UPDATE` 执行此操作。
