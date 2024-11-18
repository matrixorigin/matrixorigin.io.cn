# MatrixOne 主备容灾功能

MatrixOne 支持基于日志复制的主备集群冷备功能，通过实时同步主数据库的事务日志到备库，保障主备数据的一致性和高可用性。在主库出现故障时，备库可以快速接管业务，确保不中断；故障恢复后，系统可将备库的数据同步回主库，实现无缝回切。此方案显著减少停机时间，提升数据可靠性和服务连续性，适用于金融、电商等对高可用性要求较高的场景。

## 操作步骤

### 主集群配置

#### 修改配置文件

进入到 /your_matrixone_path/etc/launch 目录下，新增 fileservice 的 standby 配置，normal 副本和 non-voting 副本都需要配置。

- 新增 log1.toml，normal 副本所在的 log 节点

```shell
service-type = "LOG"
data-dir = "./mo-data"
  
[log]
level = "info"
  
[malloc]
check-fraction = 65536
enable-metrics = true
  
[[fileservice]]
name = "STANDBY"
backend = "DISK"
data-dir = "mo-data/standby"
  
#对于正常的 logservice 副本，bootstrap 配置组中增加一个配置项，启动备集群的同步。
[logservice.BootstrapConfig]
standby-enabled = true
```

- 新增 log2.toml，non-voting 副本所在的 log 节点

```shell
#需要再启动至少一个 logservice 实例，作为 non-voting 副本运行的节点，并且给该实例配置locality: (配置中的 127.0.0.1 都需要换成实际的 IP 地址)
service-type = "LOG"
data-dir = "./mo-data"
  
[log]
level = "info"
  
[malloc]
check-fraction = 65536
enable-metrics = true
  
[[fileservice]]
name = "STANDBY"
backend = "DISK"
data-dir = "mo-data/standby"
  
[logservice]
deployment-id = 1
uuid = "4c4dccb4-4d3c-41f8-b482-5251dc7a41bd" #新节点的UUID
raft-address = "127.0.0.1:32010" # raft 服务的地址
logservice-address = "127.0.0.1:32011" # logservice 服务的地址
logservice-listen-address = "0.0.0.0:32011"
gossip-address = "127.0.0.1:32012" # gossip 服务的地址
gossip-seed-addresses = [ # 正常副本的 gossip seed 地址
"127.0.0.1:32002",
"127.0.0.1:32012"
]
locality = "region:west" # 配置 locality 运行 non-voting 副本
  
[logservice.BootstrapConfig]
bootstrap-cluster = false # 关闭 bootstrap 操作
standby-enabled = true # 启动 standy 功能
  
[hakeeper-client]
discovery-address="127.0.0.1:32001" # 32001 为默认的 HAKeeper 的地址
```

- 修改 launch.toml

```shell
logservices = [
      "./etc/launch/log1.toml",
      "./etc/launch/log2.toml"
  ]
  
  tnservices = [
      "./etc/launch/tn.toml"
  ]
  
  cnservices = [
      "./etc/launch/cn.toml"
  ]
```

#### 启动 non-voting 副本

MO 集群启动后，执行 SQL 命令，对 non-voting 副本实现动态增减：

- 设置 non-voting locality，该 locality 需要与配置文件中的相同：

    ```bash
    mysql> set logservice settings non_voting_locality="region:west";
    Query OK, 0 rows affected (0.01 sec)
    ```

- 设置 non-voting replica num，如下的命令就是设置 non-voting 副本个数为 1:

   ```
   mysql> set logservice settings non_voting_replica_num=1;
   Query OK, 0 rows affected (0.02 sec)
   ```

执行完命令之后，等待片刻，通过两个 SQL 命令查询副本状态：  

- show logservice stores;

   ```sql
   mysql> show logservice stores;
   +--------------------------------------+------+-------------+----------------------------+-------------+-----------------+-----------------+-----------------+
   | store_id                             | tick | replica_num | replicas                   | locality    | raft_address    | service_address | gossip_address  |
   +--------------------------------------+------+-------------+----------------------------+-------------+-----------------+-----------------+-----------------+
   | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd |  975 |           3 | 0:262148;1:262149;3:262150 | region:west | 127.0.0.1:32010 | 127.0.0.1:32011 | 127.0.0.1:32012 |
   | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf |  974 |           3 | 0:131072;1:262145;3:262146 |             | 0.0.0.0:32000   | 0.0.0.0:32001   | 0.0.0.0:32002   |
   +--------------------------------------+------+-------------+----------------------------+-------------+-----------------+-----------------+-----------------+
   2 rows in set (0.02 sec)
   ```

- show logservice replicas;

   ```sql
   mysql> show logservice replicas;
   +----------+------------+--------------+-----------------------+------+-------+--------------------------------------+
   | shard_id | replica_id | replica_role | replica_is_non_voting | term | epoch | store_info                           |
   +----------+------------+--------------+-----------------------+------+-------+--------------------------------------+
   |        0 |     131072 | Leader       | false                 |    2 |  1059 | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf |
   |        0 |     262148 | Follower     | true                  |    2 |  1059 | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd |
   |        1 |     262145 | Leader       | false                 |    2 |   120 | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf |
   |        1 |     262149 | Follower     | true                  |    2 |   120 | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd |
   |        3 |     262146 | Leader       | false                 |    2 |    12 | 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf |
   |        3 |     262150 | Follower     | true                  |    2 |    12 | 4c4dccb4-4d3c-41f8-b482-5251dc7a41bd |
   +----------+------------+--------------+-----------------------+------+-------+--------------------------------------+
   6 rows in set (0.01 sec)
   ```

### 复制数据文件至备集群

1. 将主集群停掉，包括主集群的 non-voting logservice 服务

2. 将 standby 的文件复制到备机的 mo-data/shared 目录下

    ``` shell
    scp -r /your_matrixone_path/mo-data/standby/* <username>@<ip>:/your_matrixone_path/mo-data/shared/
    ```
  
3. 将主集群 non-voting 副本中的数据复制到备机的 logservice-data/ 目录下

    ``` shell
    scp -r /your_matrixone_path/mo-data/logservice-data/<uuid>/ <username>@<ip>:/your_matrixone_path/mo-data/logservice-data/
    ```

    其中<uuid>是 non-voting logservice 实例的配置文件中配置的 uuid。

### 启动备集群

#### 数据同步

在备集群启动的情况下，利用 logtail 数据同步工具 `mo_ctl` 将主集群 non-voting 副本中的数据同步到备集群的 logservice 中，命令如下：

```shell
mo_ctl data-sync start --logservice-address=127.0.0.1:32001 --log-data-dir=/your_matrixone_path/mo-data/logservice-data/<uuid>/<主集群主机名>/00000000000000000001/tandb
```

其中<uuid>是 non-voting logservice 实例的配置文件中配置的 uuid。

!!! note
    mo_ctl 是 MatrixOne 分布式企业级管理的工具，需联系您的客户经理获取。

#### 停止 logservice 服务

```shell
kill `ps -ef | grep mo-service | grep -v grep | awk '{print $2}'`
```

#### 启动 TN、CN 和 Log 服务

```
nohup ./mo-service -launch etc/launch/launch.toml >mo.log 2>&1 &
```
