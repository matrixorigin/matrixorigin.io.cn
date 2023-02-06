# 子查询

本篇文档向你介绍 MatrixOne 的子查询功能。

## 概述

子查询是嵌套在另一个查询中的 SQL 表达式，借助子查询，可以在一个查询当中使用另外一个查询的查询结果。

通常情况下，从 SQL 语句结构上，子查询语句一般有以下几种形式：

- 标量子查询（Scalar Subquery），如 `SELECT (SELECT s1 FROM t2) FROM t1`。
- 派生表（Derived Tables），如 `SELECT t1.s1 FROM (SELECT s1 FROM t2) t1`。
- 存在性测试（Existential Test），如 `WHERE NOT EXISTS(SELECT ... FROM t2)`，`WHERE t1.a IN (SELECT ... FROM t2)`。
- 集合比较（Quantified Comparison），如 `WHERE t1.a = ANY(SELECT ... FROM t2)`。
- 作为比较运算符操作数的子查询，如 `WHERE t1.a > (SELECT ... FROM t2)`。

关于子查询 SQL 语句，参见 [SUBQUERY](../../Reference/SQL-Reference/Data-Manipulation-Statements/subquery.md)。

另外，从 SQL 语句执行情况上，子查询语句一般有以下两种形式：

- 关联子查询（Correlated Subquery）：数据库嵌套查询中内层查询和外层查询不相互独立，内层查询也依赖于外层查询。

   执行顺序为：

     + 先从外层查询中查询中一条记录。

     + 再将查询到的记录放到内层查询中符合条件的记录，再放到外层中查询。

     + 重复以上步骤

    例如：``select * from tableA where tableA.cloumn < (select column from tableB where tableA.id = tableB.id))``

- 无关联子查询 (Self-contained Subquery)：数据库嵌套查询中内层查询是完全独立于外层查询的。

   执行顺序为：

    + 先执行内层查询。

    + 得到内层查询的结果后带入外层，再执行外层查询。

    例如：``select * from tableA where tableA.column  = (select tableB.column from tableB )``

**子查询的作用**：

- 子查询允许结构化的查询，这样就可以把一个查询语句的每个部分隔开。
- 子查询提供了另一种方法来执行有些需要复杂的 `JOIN` 和 `UNION` 来实现的操作。

我们将举一个简单的例子帮助你理解**关联子查询**和**无关联子查询**。

## 示例

### 开始前准备

你需要确认在开始之前，已经完成了以下任务：

- 已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

### 数据准备

1. 下载数据集：

    ```
    https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/tpch/tpch-1g.zip
    ```

2. 创建数据库和数据表：

    ```sql
    create database d1;
    use d1;
    CREATE TABLE NATION  ( N_NATIONKEY  INTEGER NOT NULL,
                       N_NAME       CHAR(25) NOT NULL,
                       N_REGIONKEY  INTEGER NOT NULL,
                       N_COMMENT    VARCHAR(152),
                       PRIMARY KEY (N_NATIONKEY));

    CREATE TABLE REGION  ( R_REGIONKEY  INTEGER NOT NULL,
                       R_NAME       CHAR(25) NOT NULL,
                       R_COMMENT    VARCHAR(152),
                       PRIMARY KEY (R_REGIONKEY));

    CREATE TABLE PART  ( P_PARTKEY     INTEGER NOT NULL,
                     P_NAME        VARCHAR(55) NOT NULL,
                     P_MFGR        CHAR(25) NOT NULL,
                     P_BRAND       CHAR(10) NOT NULL,
                     P_TYPE        VARCHAR(25) NOT NULL,
                     P_SIZE        INTEGER NOT NULL,
                     P_CONTAINER   CHAR(10) NOT NULL,
                     P_RETAILPRICE DECIMAL(15,2) NOT NULL,
                     P_COMMENT     VARCHAR(23) NOT NULL,
                     PRIMARY KEY (P_PARTKEY));

    CREATE TABLE SUPPLIER ( S_SUPPKEY     INTEGER NOT NULL,
                        S_NAME        CHAR(25) NOT NULL,
                        S_ADDRESS     VARCHAR(40) NOT NULL,
                        S_NATIONKEY   INTEGER NOT NULL,
                        S_PHONE       CHAR(15) NOT NULL,
                        S_ACCTBAL     DECIMAL(15,2) NOT NULL,
                        S_COMMENT     VARCHAR(101) NOT NULL,
                        PRIMARY KEY (S_SUPPKEY));

    CREATE TABLE PARTSUPP ( PS_PARTKEY     INTEGER NOT NULL,
                        PS_SUPPKEY     INTEGER NOT NULL,
                        PS_AVAILQTY    INTEGER NOT NULL,
                        PS_SUPPLYCOST  DECIMAL(15,2)  NOT NULL,
                        PS_COMMENT     VARCHAR(199) NOT NULL,
                        PRIMARY KEY (PS_PARTKEY, PS_SUPPKEY));

    CREATE TABLE CUSTOMER ( C_CUSTKEY     INTEGER NOT NULL,
                        C_NAME        VARCHAR(25) NOT NULL,
                        C_ADDRESS     VARCHAR(40) NOT NULL,
                        C_NATIONKEY   INTEGER NOT NULL,
                        C_PHONE       CHAR(15) NOT NULL,
                        C_ACCTBAL     DECIMAL(15,2)   NOT NULL,
                        C_MKTSEGMENT  CHAR(10) NOT NULL,
                        C_COMMENT     VARCHAR(117) NOT NULL,
                        PRIMARY KEY (C_CUSTKEY));

    CREATE TABLE ORDERS  ( O_ORDERKEY       BIGINT NOT NULL,
                       O_CUSTKEY        INTEGER NOT NULL,
                       O_ORDERSTATUS    CHAR(1) NOT NULL,
                       O_TOTALPRICE     DECIMAL(15,2) NOT NULL,
                       O_ORDERDATE      DATE NOT NULL,
                       O_ORDERPRIORITY  CHAR(15) NOT NULL,
                       O_CLERK          CHAR(15) NOT NULL,
                       O_SHIPPRIORITY   INTEGER NOT NULL,
                       O_COMMENT        VARCHAR(79) NOT NULL,
                       PRIMARY KEY (O_ORDERKEY));

    CREATE TABLE LINEITEM ( L_ORDERKEY    BIGINT NOT NULL,
                        L_PARTKEY     INTEGER NOT NULL,
                        L_SUPPKEY     INTEGER NOT NULL,
                        L_LINENUMBER  INTEGER NOT NULL,
                        L_QUANTITY    DECIMAL(15,2) NOT NULL,
                        L_EXTENDEDPRICE  DECIMAL(15,2) NOT NULL,
                        L_DISCOUNT    DECIMAL(15,2) NOT NULL,
                        L_TAX         DECIMAL(15,2) NOT NULL,
                        L_RETURNFLAG  CHAR(1) NOT NULL,
                        L_LINESTATUS  CHAR(1) NOT NULL,
                        L_SHIPDATE    DATE NOT NULL,
                        L_COMMITDATE  DATE NOT NULL,
                        L_RECEIPTDATE DATE NOT NULL,
                        L_SHIPINSTRUCT CHAR(25) NOT NULL,
                        L_SHIPMODE     CHAR(10) NOT NULL,
                        L_COMMENT      VARCHAR(44) NOT NULL,
                        PRIMARY KEY (L_ORDERKEY, L_LINENUMBER));
    ```

3. 把数据导入到数据表中：

    ```sql
    load data infile '/YOUR_TPCH_DATA_PATH/nation.tbl' into table NATION FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/region.tbl' into table REGION FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/part.tbl' into table PART FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/supplier.tbl' into table SUPPLIER FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/partsupp.tbl' into table PARTSUPP FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/orders.tbl' into table ORDERS FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/customer.tbl' into table CUSTOMER FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';

    load data infile '/YOUR_TPCH_DATA_PATH/lineitem.tbl' into table LINEITEM FIELDS TERMINATED BY '|' OPTIONALLY ENCLOSED BY '"' LINES TERMINATED BY '\n';
    ```

现在你可以使用这些数据进行查询。

#### 无关联子查询

对于将子查询作为比较运算符 (`>`/ `>=`/ `<` / `<=` / `=` / `!=`) 操作数的这类无关联子查询而言，内层子查询只需要进行一次查询，MatrixOne 在生成执行计划阶段会将内层子查询改写为常量。

```sql
mysql> select p.p_name from (select * from part where p_brand='Brand#21' and p_retailprice between 1100 and 1200)  p, partsupp ps where p.p_partkey=ps.ps_partkey and p.p_name like '%pink%' limit 10;
```

在 MatrixOne 执行上述查询的时候会先执行一次内层子查询：

```sql
mysql> select * from part where p_brand='Brand#21' and p_retailprice between 1100 and 1200
```

运行结果为：

```sql
+-----------------------------------+
| p_name                            |
+-----------------------------------+
| olive chartreuse smoke pink tan   |
| olive chartreuse smoke pink tan   |
| olive chartreuse smoke pink tan   |
| olive chartreuse smoke pink tan   |
| pink sienna dark bisque turquoise |
| pink sienna dark bisque turquoise |
| pink sienna dark bisque turquoise |
| pink sienna dark bisque turquoise |
| honeydew orchid cyan magenta pink |
| honeydew orchid cyan magenta pink |
+-----------------------------------+
10 rows in set (0.06 sec)
```

对于存在性测试和集合比较两种情况下的无关联列子查询，MatrixOne 会将其进行改写和等价替换以获得更好的执行性能。

#### 关联子查询

对于关联子查询而言，由于内层的子查询引用外层查询的列，子查询需要对外层查询得到的每一行都执行一遍，也就是说假设外层查询得到一千万的结果，那么子查询也会被执行一千万次，这会导致查询需要消耗更多的时间和资源。

因此在处理过程中，MatrixOne 会尝试对关联子查询去关联，以从执行计划层面上提高查询效率。

```sql
mysql> select p_name from part where P_PARTKEY in (select PS_PARTKEY from PARTSUPP where PS_SUPPLYCOST>=500) and p_name like '%pink%' limit 10;
```

MatrixOne 在处理该 SQL 语句是会将其改写为等价的 `JOIN` 查询：

```
select p_name from part join partsupp on P_PARTKEY=PS_PARTKEY where PS_SUPPLYCOST>=500 and p_name like '%pink%' limit 10;
```

运行结果为：

```sql
+------------------------------------+
| p_name                             |
+------------------------------------+
| papaya red almond hot pink         |
| turquoise hot smoke green pink     |
| purple cornsilk red pink floral    |
| pink cyan purple white burnished   |
| sandy dark pink indian cream       |
| powder cornsilk chiffon slate pink |
| rosy light black pink orange       |
| pink white goldenrod ivory steel   |
| cornsilk dim pink tan sienna       |
| lavender navajo steel sandy pink   |
+------------------------------------+
10 rows in set (0.23 sec)
```

作为最佳实践，在实际开发当中，为提高计算效率，尽量选择等价计算方法进行查询，避免使用关联子查询的方式进行查询。
