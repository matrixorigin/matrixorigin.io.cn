# 多表连接查询

一些使用数据库的场景中，需要一个查询当中使用到多张表的数据，你可以通过 `JOIN` 语句将两张或多张表的数据组合在一起。

## 开始前准备

你需要确认在开始之前，已经完成了以下任务：

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

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

## Join 类型

### 内连接

内连接的连接结果只返回匹配连接条件的行。

|语法 | 图示 |
|---|---|
|SELECT <select_list> FROM TableA A INNER JOIN TableB B ON A.Key=B.Key|![innerjoin](https://github.com/matrixorigin/artwork/blob/main/docs/reference/inner_join.png?raw=true)|

内连接有两种书写方式，在结果上是完全等价的：

```sql
mysql> SELECT   
    l_orderkey,
    SUM(l_extendedprice * (1 - l_discount)) AS revenue,
    o_orderdate,
    o_shippriority
FROM
    CUSTOMER,
    ORDERS,
    LINEITEM
WHERE
    c_mktsegment = 'BUILDING'
        AND c_custkey = o_custkey
        AND l_orderkey = o_orderkey
        AND o_orderdate < DATE '1995-03-15'
        AND l_shipdate > DATE '1995-03-15'
GROUP BY l_orderkey , o_orderdate , o_shippriority
ORDER BY revenue DESC , o_orderdate
LIMIT 10;
+------------+---------------------+-------------+----------------+
| l_orderkey | revenue             | o_orderdate | o_shippriority |
+------------+---------------------+-------------+----------------+
|    2456423 | 406181.011100000000 | 1995-03-05  |              0 |
|    3459808 | 405838.698900000000 | 1995-03-04  |              0 |
|     492164 | 390324.061000000000 | 1995-02-19  |              0 |
|    1188320 | 384537.935900000000 | 1995-03-09  |              0 |
|    2435712 | 378673.055800000000 | 1995-02-26  |              0 |
|    4878020 | 378376.795200000000 | 1995-03-12  |              0 |
|    5521732 | 375153.921500000000 | 1995-03-13  |              0 |
|    2628192 | 373133.309400000000 | 1995-02-22  |              0 |
|     993600 | 371407.459500000000 | 1995-03-05  |              0 |
|    2300070 | 367371.145200000000 | 1995-03-13  |              0 |
+------------+---------------------+-------------+----------------+
10 rows in set (0.20 sec)
```

写成 `Join` 的形式，语法如下：

```sql
mysql> SELECT   
    l_orderkey,
    SUM(l_extendedprice * (1 - l_discount)) AS revenue,
    o_orderdate,
    o_shippriority
FROM
    CUSTOMER
    join ORDERS on c_custkey = o_custkey
    join LINEITEM on l_orderkey = o_orderkey
WHERE
    c_mktsegment = 'BUILDING'
        AND o_orderdate < DATE '1995-03-15'
        AND l_shipdate > DATE '1995-03-15'
GROUP BY l_orderkey , o_orderdate , o_shippriority
ORDER BY revenue DESC , o_orderdate
LIMIT 10;
+------------+---------------------+-------------+----------------+
| l_orderkey | revenue             | o_orderdate | o_shippriority |
+------------+---------------------+-------------+----------------+
|    2456423 | 406181.011100000000 | 1995-03-05  |              0 |
|    3459808 | 405838.698900000000 | 1995-03-04  |              0 |
|     492164 | 390324.061000000000 | 1995-02-19  |              0 |
|    1188320 | 384537.935900000000 | 1995-03-09  |              0 |
|    2435712 | 378673.055800000000 | 1995-02-26  |              0 |
|    4878020 | 378376.795200000000 | 1995-03-12  |              0 |
|    5521732 | 375153.921500000000 | 1995-03-13  |              0 |
|    2628192 | 373133.309400000000 | 1995-02-22  |              0 |
|     993600 | 371407.459500000000 | 1995-03-05  |              0 |
|    2300070 | 367371.145200000000 | 1995-03-13  |              0 |
+------------+---------------------+-------------+----------------+
10 rows in set (0.20 sec)
```

### 外连接

外连接又分为**左连接**、**右连接**，两者之间是可以实现等价语义的：

- `LEFT JOIN`

左外连接会返回左表中的所有数据行，以及右表当中能够匹配连接条件的值，如果在右表当中没有找到能够匹配的行，则使用 NULL 填充。

|语法 | 图示 |
|---|---|
|SELECT <select_list> FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key|![leftjoin](https://github.com/matrixorigin/artwork/blob/main/docs/reference/left_join.png?raw=true)|
|SELECT <select_list> FROM TableA A LEFT JOIN TableB B ON A.Key=B.Key WHERE B.Key IS NULL|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/left_join_where.png?raw=true)|

- `RIGHT JOIN`

右外连接返回右表中的所有记录，以及左表当中能够匹配连接条件的值，没有匹配的值则使用 NULL 填充。

|语法 | 图示 |
|---|---|
|SELECT <select_list> FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/right_join.png?raw=true)|
|SELECT <select_list> FROM TableA A RIGHT JOIN TableB B ON A.Key=B.Key WHERE A.Key IS NULL|![leftjoinwhere](https://github.com/matrixorigin/artwork/blob/main/docs/reference/right_join_where.png?raw=true)|

语句示例如下：

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    LEFT OUTER JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|    147457 |      16 |
|    147458 |       7 |
|    147459 |       0 |
|    147460 |      16 |
|    147461 |       7 |
|    147462 |       0 |
|    147463 |      14 |
|    147464 |      11 |
|    147465 |       0 |
|    147466 |      17 |
+-----------+---------+
10 rows in set (0.93 sec)
```

或者：

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        ORDERS
    RIGHT OUTER JOIN CUSTOMER ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|    147457 |      16 |
|    147458 |       7 |
|    147459 |       0 |
|    147460 |      16 |
|    147461 |       7 |
|    147462 |       0 |
|    147463 |      14 |
|    147464 |      11 |
|    147465 |       0 |
|    147466 |      17 |
+-----------+---------+
10 rows in set (0.93 sec)
```

### 全连接

全连接是左右外连接的并集。连接表包含被连接的表的所有记录，如果缺少匹配的记录，即以 NULL 填充。

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    FULL JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|         1 |       6 |
|         2 |       7 |
|         4 |      20 |
|         5 |       4 |
|         7 |      16 |
|         8 |      13 |
|        10 |      20 |
|        11 |      13 |
|        13 |      18 |
|        14 |       9 |
+-----------+---------+
10 rows in set (0.77 sec)
```

全连接同样可以通过改写的方式获得相同的语义：

```sql
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    LEFT OUTER JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    GROUP BY c_custkey
UNION
SELECT
        c_custkey, COUNT(o_orderkey) AS c_count
    FROM
        CUSTOMER
    LEFT OUTER JOIN ORDERS ON (c_custkey = o_custkey
        AND o_comment NOT LIKE '%special%requests%')
    WHERE c_custkey IS NULL
    GROUP BY c_custkey
limit 10;

+-----------+---------+
| c_custkey | c_count |
+-----------+---------+
|    147457 |      16 |
|    147458 |       7 |
|    147459 |       0 |
|    147460 |      16 |
|    147461 |       7 |
|    147462 |       0 |
|    147463 |      14 |
|    147464 |      11 |
|    147465 |       0 |
|    147466 |      17 |
+-----------+---------+
10 rows in set (1.09 sec)
```

## 隐式连接

在 SQL 语句当中，除了使用 `JOIN`，也可以通过 `FROM t1, t2` 子句来连接两张或多张表，通过 `WHERE t1.id = t2.id` 子句来指定连接的条件。
