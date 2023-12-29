# 使用 Kafka 连接 MatrixOne

## 概述

Apache Kafka 是一个开源的分布式事件流平台，被数千家公司用于高性能数据管道、流分析、数据集成和关键任务应用。

MatrixOne 支持与 Apache Kafka 进行连接，本文将指导您如何通过 Apache Kafka 连接到 MatrixOne 并实现高效数据流集成与持久化。

## 开始前准备

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。

- 已完成[下载 Apache Kafka 二进制包](https://downloads.apache.org/kafka/3.6.1/kafka_2.13-3.6.1.tgz)。

## 操作步骤

### 第一步：启动 Kafka 并生产数据

1. 解压二进制包 (注意对应版本)

    ```bash
    tar -xzf kafka_2.13-3.6.1.tgz
    cd kafka_2.13-3.6.1
    ```

2. 启动 ZooKeeper

    ```bash
    bin/zookeeper-server-start.sh config/zookeeper.properties
    ```

3. 开启一个新的终端，启动 Kafka

    ```bash
    bin/kafka-server-start.sh config/server.properties
    ```

4. 开启一个新的终端，创建一个 topic

    ```bash
    bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic test
    ```

5. 开启一个生产者往 topic 中写入 json 数据

    ```bash
    bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic test
    {"c1": -2147483648,"c2":20,"c3": -3,"c4":8,"c5":425,"c6":55}
    {"c1": 21474,"c2":-20,"c3": 3,"c4":9090,"c5":42,"c6":53}
    ```

    开启一个消费者查看是否成功写入 topic：

    ```bash
    bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test
    {"c1": -2147483648,"c2":20,"c3": -3,"c4":8,"c5":425,"c6":55}
    {"c1": 21474,"c2":-20,"c3": 3,"c4":9090,"c5":42,"c6":53}
    ```

### 第二步：创建 Source 表连接 Kafka

1. 创建 Source 表

    ```sql
    create source stream_test(c1 int,c2 tinyint,c3 smallint,c4 bigint,c5 int unsigned ,c6 tinyint unsigned)
    with(
    "type"='kafka',
    "topic"= 'test',
    "partition" = '0',
    "value"= 'json',
    "bootstrap.servers"='127.0.0.1:9092'   
    )    
    ```

    查看是否接受了数据：

    ```sql
    select * from stream_test;
    +-------------+------+------+------+------+------+
    | c1          | c2   | c3   | c4   | c5   | c6   |
    +-------------+------+------+------+------+------+
    | -2147483648 |   20 |   -3 |    8 |  425 |   55 |
    |       21474 |  -20 |    3 | 9090 |   42 |   53 |
    +-------------+------+------+------+------+------+
    2 rows in set (0.37 sec)    
    ```

2. 往 topic 中持续写入 json 数据，并检查是否继续接受了数据：

    ```bash
    {"c1": -3421474,"c2":92,"c3": 333,"c4":9,"c5":42233,"c6":87}
    ```

    查看是否接受了数据：

    ```sql
    select * from stream_test;
    +-------------+------+------+------+-------+------+
    | c1          | c2   | c3   | c4   | c5    | c6   |
    +-------------+------+------+------+-------+------+
    | -2147483648 |   20 |   -3 |    8 |   425 |   55 |
    |       21474 |  -20 |    3 | 9090 |    42 |   53 |
    |    -3421474 |   92 |  333 |    9 | 42233 |   87 |
    +-------------+------+------+------+-------+------+
    3 rows in set (0.44 sec)
    ```

### 第三步：创建动态表消费 Source 表中数据

1. 创建动态表以消费 Source 表：

    ```sql
    create dynamic table dt_test as select c1, c2+c3, c3*c4,c5/c3,c6/10 from stream_test;
    ```

    查看动态表：

    ```sql
    select * from dt_test;
    +-------------+---------+---------+---------------------+---------+
    | c1          | c2 + c3 | c3 * c4 | c5 / c3             | c6 / 10 |
    +-------------+---------+---------+---------------------+---------+
    | -2147483648 |      17 |     -24 | -141.66666666666666 |     5.5 |
    |       21474 |     -17 |   27270 |                  14 |     5.3 |
    |    -3421474 |     425 |    2997 |  126.82582582582583 |     8.7 |
    +-------------+---------+---------+---------------------+---------+
    3 rows in set (0.00 sec)
    ```

2. 往 topic 中持续写入 json 数据，并检查动态表是否更新：

    ```bash
    {"c1": 1474,"c2":2,"c3": 453,"c4":1,"c5":56233,"c6":7}
    ```

    查看动态表发现成功更新：

    ```sql
    select * from dt_test;
    +-------------+---------+---------+---------------------+---------+
    | c1          | c2 + c3 | c3 * c4 | c5 / c3             | c6 / 10 |
    +-------------+---------+---------+---------------------+---------+
    | -2147483648 |      17 |     -24 | -141.66666666666666 |     5.5 |
    |       21474 |     -17 |   27270 |                  14 |     5.3 |
    |    -3421474 |     425 |    2997 |  126.82582582582583 |     8.7 |
    |        1474 |     455 |     453 |  124.13465783664459 |     0.7 |
    +-------------+---------+---------+---------------------+---------+
    4 rows in set (0.00 sec)
    ```
