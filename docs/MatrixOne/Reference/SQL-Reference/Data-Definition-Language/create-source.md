# **CREATE SOURCE**

## **语法说明**

`CREATE SOURCE` 将一个新的 SOURCE 添加到当前数据库中。

## **语法结构**

```sql
CREATE [OR REPLACE] SOURCE [IF NOT EXISTS] stream_name 
( { column_name data_type [KEY | HEADERS | HEADER(key)] } [, ...] )
WITH ( property_name = expression [, ...]);
```

## 语法解释

- stream_name: SOURCE 名称。SOURCE 名称必须与当前数据库中任何现有的 SOURCE 名称不同。
- column_name: 流式数据映射到 SOURCE 表中的列名。
- data_type: column_name 对应字段在数据表中的类型。
- property_name = expression: 有关流式数据映射的具体配置项名以及对应的值，可配置项如下：

|    property_name    |                                  expression 描述                                  |
| :-----------------: | :------------------------------------------------------------------------------: |
|       "type"        |                     仅支持'kafka':目前仅支持接受的源为 kafka                     |
|       "topic"       |                            kafka 数据源中对应的 topic                            |
|      "partion"      |                           kafka 数据源中对应的 partion                           |
|       "value"       |                  仅支持'json':  目前仅支持接受的数据格式为 json                  |
| "bootstrap.servers" |                            kafka 服务器对应的 IP:PORT                             |
|   "sasl.username"   | 指定连接到 Kafka 时使用的 SASL（Simple Authentication and Security Layer）用户名 |
|   "sasl.password"   |               与 sasl.username 配对使用，这个参数提供了相应的密码                |
|  "sasl.mechanisms"  |                        客户端和服务器之间认证的 SASL 机制                        |
| "security.protocol" |                    指定了与 Kafka 服务器通信时使用的安全协议                     |

## **示例**

```sql
create source stream_test(c1 char(25),c2 varchar(500),c3 text,c4 tinytext,c5 mediumtext,c6 longtext )with(
    "type"='kafka',
    "topic"= 'test',
    "partition" = '0',
    "value"= 'json',
    "bootstrap.servers"='127.0.0.1:9092'   
)
Query OK, 0 rows affected (0.01 sec)
```

## 限制

SOURCE 表目前不支持 drop 和 alter。

创建 SOURCE 表时目前仅支持连接 kafka，且仅支持传输数据格式为 json。
