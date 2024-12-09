# 连接白名单

MatrixOne 支持以下变量，用于限制仅特定 IP 地址的客户端可以连接到数据库：  

1. **`validnode_checking`**：控制是否启用 IP 白名单功能。该变量的取值范围为 `ON` 或 `OFF`，默认值为 `OFF`。  

2. **`invited_nodes`**：定义允许连接到 MO 数据库的 IP 地址列表。支持以下格式：  
      - **单个 IP 地址**：例如 `(192.168.1.100, 192.168.1.101)`  
      - **通配符**：`(*)` 表示允许所有 IP 地址连接  
      - **CIDR 格式**：例如 `(192.168.1.100, 192.168.1.0/8, 192.168.0.0/32)`  

      该变量的默认值为 `*`，表示默认情况下所有客户端均可连接。  

上述配置为数据库提供了灵活的访问控制机制，可满足多种网络安全需求。

## 查看

```sql
select @@global.validnode_checking;
select @@global.invited_nodes;
```

## 设置

```sql
set global validnode_checking=xx;--默认为 0
set global invited_nodes=xx; --默认为*
```

## 示例

```sql
mysql> select @@global.validnode_checking;
+----------------------+
| @@validnode_checking |
+----------------------+
| 0                    |
+----------------------+
1 row in set (0.00 sec)

mysql> select @@global.invited_nodes;
+-----------------+
| @@invited_nodes |
+-----------------+
| *               |
+-----------------+
1 row in set (0.00 sec)

mysql> set global validnode_checking=1;
Query OK, 0 rows affected (0.02 sec)
set global invited_nodes='10.222.2.36';

--查看 ip
root@host-10-222-4-5:~# hostname -I
10.222.4.5 

--在 ip 为 10.222.4.5 的机器连接 10.222.2.36
root@host-10-222-4-5:~# mysql -uroot -P 6001 -h10.222.2.36 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 62
Server version: 8.0.30-MatrixOne-v MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 


--查看 ip
root@host-10-222-4-8:~# hostname -I
10.222.4.8 

--在 ip 为 10.222.4.8 的机器连接 10.222.2.36，因为不在白名单内，连接失败
root@host-10-222-4-8:~# mysql -uroot -P 6001 -h10.222.2.36 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 20301 (HY000): invalid input: IP 10.222.4.8 is not in the invited nodes
```
