# 使用 Flink 将 Kafka 数据写入 MatrixOne

本章节将介绍如何使用 Flink 将 Kafka 数据写入到 MatrixOne。

## 前期准备

本次实践需要安装部署以下软件环境：

- 完成[单机部署 MatrixOne](https://docs.matrixorigin.cn/1.2.2/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 下载安装 [lntelliJ IDEA(2022.2.1 or later version)](https://www.jetbrains.com/idea/download/)。
- 根据你的系统环境选择 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html) 版本进行下载安装。
- 下载并安装 [Kafka](https://archive.apache.org/dist/kafka/3.5.0/kafka_2.13-3.5.0.tgz)。
- 下载并安装 [Flink](https://archive.apache.org/dist/flink/flink-1.17.0/flink-1.17.0-bin-scala_2.12.tgz)，最低支持版本为 1.11。
- 下载并安装 [MySQL Client](https://dev.mysql.com/downloads/mysql)。

## 操作步骤

### 步骤一：启动 Kafka 服务

Kafka 集群协调和元数据管理可以通过 KRaft 或 ZooKeeper 来实现。在这里，我们将使用 Kafka 3.5.0 版本，无需依赖独立的 ZooKeeper 软件，而是使用 Kafka 自带的 **KRaft** 来进行元数据管理。请按照以下步骤配置配置文件，该文件位于 Kafka 软件根目录下的 `config/kraft/server.properties`。

配置文件内容如下：

```properties
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

#
# This configuration file is intended for use in KRaft mode, where
# Apache ZooKeeper is not present.  See config/kraft/README.md for details.
#

############################# Server Basics #############################

# The role of this server. Setting this puts us in KRaft mode
process.roles=broker,controller

# The node id associated with this instance's roles
node.id=1

# The connect string for the controller quorum
controller.quorum.voters=1@xx.xx.xx.xx:9093

############################# Socket Server Settings #############################

# The address the socket server listens on.
# Combined nodes (i.e. those with `process.roles=broker,controller`) must list the controller listener here at a minimum.
# If the broker listener is not defined, the default listener will use a host name that is equal to the value of java.net.InetAddress.getCanonicalHostName(),
# with PLAINTEXT listener name, and port 9092.
#   FORMAT:
#     listeners = listener_name://host_name:port
#   EXAMPLE:
#     listeners = PLAINTEXT://your.host.name:9092
#listeners=PLAINTEXT://:9092,CONTROLLER://:9093
listeners=PLAINTEXT://xx.xx.xx.xx:9092,CONTROLLER://xx.xx.xx.xx:9093

# Name of listener used for communication between brokers.
inter.broker.listener.name=PLAINTEXT

# Listener name, hostname and port the broker will advertise to clients.
# If not set, it uses the value for "listeners".
#advertised.listeners=PLAINTEXT://localhost:9092

# A comma-separated list of the names of the listeners used by the controller.
# If no explicit mapping set in `listener.security.protocol.map`, default will be using PLAINTEXT protocol
# This is required if running in KRaft mode.
controller.listener.names=CONTROLLER

# Maps listener names to security protocols, the default is for them to be the same. See the config documentation for more details
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,SSL:SSL,SASL_PLAINTEXT:SASL_PLAINTEXT,SASL_SSL:SASL_SSL

# The number of threads that the server uses for receiving requests from the network and sending responses to the network
num.network.threads=3

# The number of threads that the server uses for processing requests, which may include disk I/O
num.io.threads=8

# The send buffer (SO_SNDBUF) used by the socket server
socket.send.buffer.bytes=102400

# The receive buffer (SO_RCVBUF) used by the socket server
socket.receive.buffer.bytes=102400

# The maximum size of a request that the socket server will accept (protection against OOM)
socket.request.max.bytes=104857600


############################# Log Basics #############################

# A comma separated list of directories under which to store log files
log.dirs=/home/software/kafka_2.13-3.5.0/kraft-combined-logs

# The default number of log partitions per topic. More partitions allow greater
# parallelism for consumption, but this will also result in more files across
# the brokers.
num.partitions=1

# The number of threads per data directory to be used for log recovery at startup and flushing at shutdown.
# This value is recommended to be increased for installations with data dirs located in RAID array.
num.recovery.threads.per.data.dir=1

############################# Internal Topic Settings  #############################
# The replication factor for the group metadata internal topics "__consumer_offsets" and "__transaction_state"
# For anything other than development testing, a value greater than 1 is recommended to ensure availability such as 3.
offsets.topic.replication.factor=1
transaction.state.log.replication.factor=1
transaction.state.log.min.isr=1

############################# Log Flush Policy #############################

# Messages are immediately written to the filesystem but by default we only fsync() to sync
# the OS cache lazily. The following configurations control the flush of data to disk.
# There are a few important trade-offs here:
#    1. Durability: Unflushed data may be lost if you are not using replication.
#    2. Latency: Very large flush intervals may lead to latency spikes when the flush does occur as there will be a lot of data to flush.
#    3. Throughput: The flush is generally the most expensive operation, and a small flush interval may lead to excessive seeks.
# The settings below allow one to configure the flush policy to flush data after a period of time or
# every N messages (or both). This can be done globally and overridden on a per-topic basis.

# The number of messages to accept before forcing a flush of data to disk
#log.flush.interval.messages=10000

# The maximum amount of time a message can sit in a log before we force a flush
#log.flush.interval.ms=1000

############################# Log Retention Policy #############################

# The following configurations control the disposal of log segments. The policy can
# be set to delete segments after a period of time, or after a given size has accumulated.
# A segment will be deleted whenever *either* of these criteria are met. Deletion always happens
# from the end of the log.

# The minimum age of a log file to be eligible for deletion due to age
log.retention.hours=72

# A size-based retention policy for logs. Segments are pruned from the log unless the remaining
# segments drop below log.retention.bytes. Functions independently of log.retention.hours.
#log.retention.bytes=1073741824

# The maximum size of a log segment file. When this size is reached a new log segment will be created.
log.segment.bytes=1073741824

# The interval at which log segments are checked to see if they can be deleted according
# to the retention policies
log.retention.check.interval.ms=300000
```

文件配置完成后，执行如下命令，启动 Kafka 服务：

```shell
#生成集群ID
$ KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)"
#设置日志目录格式
$ bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c config/kraft/server.properties
#启动Kafka服务
$ bin/kafka-server-start.sh config/kraft/server.properties
```

### 步骤二：创建 Kafka 主题

为了使 Flink 能够从中读取数据并写入到 MatrixOne，我们需要首先创建一个名为 "matrixone" 的 Kafka 主题。在下面的命令中，使用 `--bootstrap-server` 参数指定 Kafka 服务的监听地址为 `xx.xx.xx.xx:9092`：

```shell
$ bin/kafka-topics.sh --create --topic matrixone --bootstrap-server xx.xx.xx.xx:9092
```

### 步骤三：读取 MatrixOne 数据

在连接到 MatrixOne 数据库之后，需要执行以下操作以创建所需的数据库和数据表：

1. 在 MatrixOne 中创建数据库和数据表，并导入数据：

    ```sql
    CREATE TABLE `users` (
    `id` INT DEFAULT NULL,
    `name` VARCHAR(255) DEFAULT NULL,
    `age` INT DEFAULT NULL
    )
    ```

2. 在 IDEA 集成开发环境中编写代码：

    在 IDEA 中，创建两个类：`User.java` 和 `Kafka2Mo.java`。这些类用于使用 Flink 从 Kafka 读取数据，并将数据写入 MatrixOne 数据库中。

```java
package com.matrixone.flink.demo.entity;

public class User {

    private int id;
    private String name;
    private int age;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }
}
```

```java
package com.matrixone.flink.demo;

import com.alibaba.fastjson2.JSON;
import com.matrixone.flink.demo.entity.User;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.AbstractDeserializationSchema;
import org.apache.flink.connector.jdbc.JdbcExecutionOptions;
import org.apache.flink.connector.jdbc.JdbcSink;
import org.apache.flink.connector.jdbc.JdbcStatementBuilder;
import org.apache.flink.connector.jdbc.internal.options.JdbcConnectorOptions;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.kafka.clients.consumer.OffsetResetStrategy;

import java.nio.charset.StandardCharsets;

/**
 * @author MatrixOne
 * @desc
 */
public class Kafka2Mo {

    private static String srcServer = "xx.xx.xx.xx:9092";
    private static String srcTopic = "matrixone";
    private static String consumerGroup = "matrixone_group";

    private static String destHost = "xx.xx.xx.xx";
    private static Integer destPort = 6001;
    private static String destUserName = "root";
    private static String destPassword = "111";
    private static String destDataBase = "test";
    private static String destTable = "person";

    public static void main(String[] args) throws Exception {

        //初始化环境
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        //设置并行度
        env.setParallelism(1);

        //设置 kafka source 信息
        KafkaSource<User> source = KafkaSource.<User>builder()
                //Kafka 服务
                .setBootstrapServers(srcServer)
                //消息主题
                .setTopics(srcTopic)
                //消费组
                .setGroupId(consumerGroup)
                //偏移量 当没有提交偏移量则从最开始开始消费
                .setStartingOffsets(OffsetsInitializer.committedOffsets(OffsetResetStrategy.LATEST))
                //自定义解析消息内容
                .setValueOnlyDeserializer(new AbstractDeserializationSchema<User>() {
                    @Override
                    public User deserialize(byte[] message) {
                        return JSON.parseObject(new String(message, StandardCharsets.UTF_8), User.class);
                    }
                })
                .build();
        DataStreamSource<User> kafkaSource = env.fromSource(source, WatermarkStrategy.noWatermarks(), "kafka_maxtixone");
        //kafkaSource.print();

        //设置 matrixone sink 信息
        kafkaSource.addSink(JdbcSink.sink(
                "insert into users (id,name,age) values(?,?,?)",
                (JdbcStatementBuilder<User>) (preparedStatement, user) -> {
                    preparedStatement.setInt(1, user.getId());
                    preparedStatement.setString(2, user.getName());
                    preparedStatement.setInt(3, user.getAge());
                },
                JdbcExecutionOptions.builder()
                        //默认值 5000
                        .withBatchSize(1000)
                        //默认值为 0
                        .withBatchIntervalMs(200)
                        //最大尝试次数
                        .withMaxRetries(5)
                        .build(),
                JdbcConnectorOptions.builder()
                        .setDBUrl("jdbc:mysql://"+destHost+":"+destPort+"/"+destDataBase)
                        .setUsername(destUserName)
                        .setPassword(destPassword)
                        .setDriverName("com.mysql.cj.jdbc.Driver")
                        .setTableName(destTable)
                        .build()
        ));
        env.execute();
    }
}
```

代码编写完成后，你可以运行 Flink 任务，即在 IDEA 中选择 `Kafka2Mo.java` 文件，然后执行 `Kafka2Mo.Main()`。

### 步骤四：生成数据

使用 Kafka 提供的命令行生产者工具，您可以向 Kafka 的 "matrixone" 主题中添加数据。在下面的命令中，使用 `--topic` 参数指定要添加到的主题，而 `--bootstrap-server` 参数指定了 Kafka 服务的监听地址。

```shell
bin/kafka-console-producer.sh --topic matrixone --bootstrap-server xx.xx.xx.xx:9092
```

执行上述命令后，您将在控制台上等待输入消息内容。只需直接输入消息值 (value)，每行表示一条消息（以换行符分隔），如下所示：

```shell
{"id": 10, "name": "xiaowang", "age": 22}
{"id": 20, "name": "xiaozhang", "age": 24}
{"id": 30, "name": "xiaogao", "age": 18}
{"id": 40, "name": "xiaowu", "age": 20}
{"id": 50, "name": "xiaoli", "age": 42}
```

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/flink/message.png)

### 步骤五：查看执行结果

在 MatrixOne 中执行如下 SQL 查询结果：

```sql
mysql> select * from test.users;
+------+-----------+------+
| id   | name      | age  |
+------+-----------+------+
|   10 | xiaowang  |   22 |
|   20 | xiaozhang |   24 |
|   30 | xiaogao   |   18 |
|   40 | xiaowu    |   20 |
|   50 | xiaoli    |   42 |
+------+-----------+------+
5 rows in set (0.01 sec)
```
