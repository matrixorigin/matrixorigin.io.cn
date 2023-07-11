# 负载与租户隔离

Proxy 是 MatrixOne 在 0.8 版本中引进的新系统组件，它可以通过流量代理和转发的方式实现租户、负载隔离等功能。关于 Proxy 的技术设计，可以参考 [Proxy 架构详解](../Overview/architecture/architecture-proxy.md)。

本篇文档主要介绍如何使用 Proxy 来建立不同的 CN 组，以实现租户和负载的独立资源管理。

## 系统架构

如下图所示，用户首先连接到 Proxy 模块。Proxy 组件根据用户连接串中的身份和标签信息，将用户的数据库连接（connection）分发到相应的 CN 组。其他 CN 组不会接收到此用户连接，也不会参与该连接的计算过程。

CN 组是由一组具有相同属性和大小的 CN 节点组成的逻辑 CN 组，它是 MatrixOne 集群中用于隔离不同资源组的单位。每个 CN 组可包含 1 个到无限个 CN 节点，并可使用一系列标签定义其属性，例如定义某租户对应的 Account 标签，将连接转发至带有相应标签的 CN 组，便可实现租户资源隔离和业务负载隔离功能。结合 CN 组中 CN 节点可无限水平扩展的特性，可实现针对租户或指定负载的独立扩展。

为确保 Proxy 的高可用性，需要在集群中设置至少 2 个副本。

![proxy-cn-group](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/proxy-cn-group.png)

## 操作步骤

本篇文档所介绍到的使用 Proxy 管理 CN 组的环境将基于 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)的环境。

为了方便你了解资源隔离与分配情况，可以在下面表格中参考 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)环境中各个硬件节点情况分布，具体如下所示：

| **Host**     | **内网 IP**        | **外网 IP**      | **内存** | **CPU** | **Disk** | **Role**    |
| ------------ | ------------- | --------------- | ------- | ------- | -------- | ----------- |
| kuboardspray | 10.206.0.6    | 1.13.2.100      | 2G      | 2C      | 50G      | 跳板机      |
| master0      | 10.206.134.8  | 118.195.255.252 | 8G      | 2C      | 50G      | master etcd |
| node0        | 10.206.134.14 | 1.13.13.199     | 8G      | 2C      | 50G      | worker      |

### 第一步：启用 Proxy

在 MatrixOne 分布式集群中启用 Proxy 组件，你需要在创建集群时指定所需的 Proxy 拓扑，或者在现有集群中添加 Proxy 拓扑后，执行 `kubectl apply` 以启用 Proxy 组件。详细步骤如下：

1. 修改 MatrixOne 集群的 `mo.yaml` 文件：

    ```
    metadata:
      name: mo
      namespace: mo-hn
    spec:
    + proxy:
    +   replicas: 2 #为了高可用，proxy的replicas需要至少2个
    ```

2. 修改完成后，使用下面的命令行运行 `mo.yaml` 文件：

    ```
    kubectl apply -f mo.yaml
    ```

3. 运行 `kubectl get pod -nmo-hn` 检查 Proxy 状态是否正常启动：

    ```
    root@HOST-10-206-134-16:~# kubectl get pod -nmo-hn
    NAME             READY   STATUS    RESTARTS   AGE
    mo-dn-0          1/1     Running   0          2m51s
    mo-log-0         1/1     Running   0          3m25s
    mo-log-1         1/1     Running   0          3m25s
    mo-log-2         1/1     Running   0          3m25s
    mo-proxy-69zjf   1/1     Running   0          2m51s
    mo-proxy-fpn2g   1/1     Running   0          2m51s
    mo-tp-cn-0       1/1     Running   0          2m25s
    ```

4. 正常启动后的代码示例如上述所示。这样最小化的 Proxy 组件就启动完成了。你可以使用 `kubectl get svc -nmo-hn` 通过 Proxy 的 SVC 地址即可以连接到该集群：

    ```
    root@HOST-10-206-134-16:~# kubectl get svc -nmo-hn
    NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
    mo-dn-headless      ClusterIP   None          <none>        <none>           70m
    mo-log-discovery    ClusterIP   10.96.3.186   <none>        32001/TCP        71m
    mo-log-headless     ClusterIP   None          <none>        <none>           71m
    mo-proxy            NodePort    10.96.1.153   <none>        6001:31429/TCP   70m
    mo-tp-cn            ClusterIP   10.96.1.43    <none>        6001/TCP         70m
    mo-tp-cn-headless   ClusterIP   None          <none>        <none>           70m
    root@HOST-10-206-134-16:~# mysql -h 10.96.1.153 -P6001 -udump -p111
    mysql: [Warning] Using a password on the command line interface can be insecure.
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 2064
    Server version: 8.0.30-MatrixOne-v0.5.0 MatrixOne

    Copyright (c) 2000, 2023, Oracle and/or its affiliates.

    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective owners.

    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

    mysql>
    ```

若整个集群中有多个 CN 的话，Proxy 会自动实现连接级别的负载均衡，将用户的连接均匀分配到不同的 CN 上。你可以查询系统表 `system_metrics.server_connections` 来查看每个 CN 上的用户连接个数。

### 第二步：设置 CN 组

在 MatrixOne 集群的 `mo.yaml` 文件中，你需要通过设置 `cnGroups` 字段来配置 CN 组，并在每个 `cnGroups` 中配置 `cnLabels` 字段，以设定该 CN 组中所有 CN 的标签。Proxy 会根据连接标签进行路由转发。例如，在以下示例中，你设置了名为 `cnSet1` 和 `cnSet2` 的两个 CN 组。每个 CN 组可以具有自己的独立副本数、不同的日志级别、CN 参数配置以及 CN 标签。

CN 组的标签采用一到多组 Key/value 格式，其中每组 Key 与 value 之间存在一对多的关系，即每个 Key 可拥有多个 value。

详细步骤如下：

1. 参照下面的配置参数示例，配置 CN 组的标签：

    ```
    metadata:
      name: mo
      namespace: mo-hn
    spec:
    + cnGroups:
    + - name: cn-set1
    +  	replicas: 1
    +  	cnLabels:
    +  	- key: "cn-set1"
    +  	  values: ["1", "high"]
    +   - key: "account"
    +     values: ["acc1"]
    +
    + - name: cn-set2
    +  	replicas: 1
    +  	cnLabels:
    +   - key: "cn-set2"
    +			values: ["2", "medium"]
    +   - key: "account"
    +     values: ["acc2"]  
    ```

2. 修改完成后，使用下面的命令行运行 `mo.yaml` 文件：

    ```
    kubectl apply -f mo.yaml
    ```

3. 运行 `kubectl get pod -nmo-hn` 检查 Proxy 状态是否正常启动：

```
root@HOST-10-206-134-16:~# kubectl get pod -nmo-hn
NAME              READY   STATUS    RESTARTS   AGE
mo-cn-set1-cn-0   1/1     Running   0          6s
mo-cn-set2-cn-0   1/1     Running   0          6s
mo-dn-0           1/1     Running   0          97m
mo-log-0          1/1     Running   0          97m
mo-log-1          1/1     Running   0          97m
mo-log-2          1/1     Running   0          97m
mo-proxy-69zjf    1/1     Running   0          97m
mo-proxy-fpn2g    1/1     Running   0          97m
```

正常启动后的代码示例如上述所示。

CN 组的标签设置非常灵活，但是一般最常见的还是用在租户和负载的隔离上。

关于如何实现租户隔离和负载隔离，请继续参加下面的章节。

#### 实现租户隔离

MatrixOne 0.7 版本已实现对[多租户](../Security/role-priviledge-management/about-privilege-management.md)数据隔离的支持。若要实现租户负载隔离，则需通过配置 Proxy 和 CN 组来完成。

##### 普通租户

在 CN 组的标签设置中，`account` 标签是保留字段，用作匹配租户。

在本章中，假设需要为 `acc1` 和 `acc2` 这两个租户实现租户负载隔离，你可以参见下面的详细步骤：

!!! note
    仅支持拥有系统租户权限的用户才能为普通租户配置负载隔离。

1. 使用系统租户登录到 MatrixOne 集群，用户名和密码请咨询你所在公司的*数据库管理员*。登录到 MatrixOne 集群后，分别创建两个新租户 `acc1` 和 `acc2`：

    ```sql
    -- 创建新租户 acc1，密码为 123456（在这里设置简单密码，仅做为示例讲解使用）
    mysql> create account acc1 admin_name 'admin' identified by '123456';
    -- 创建新租户 acc2，密码为 123456（在这里设置简单密码，仅做为示例讲解使用）
    mysql> create account acc2 admin_name 'admin' identified by '123456';
    ```

2. 修改 MatrixOne 集群的 `mo.yaml` 文件，将两个 CN 组分别打上了 `account:acc1` 及 `account:acc2` 的标签，分别对应名为 `acc1` 和 `acc2` 的租户：

    ```
    metadata:
      name: mo
      namespace: mo-hn
    spec:
    + cnGroups:
    + - name: cn-set1
    +  	replicas: 1
    +  	cnLabels:
    +   - key: "account"
    +     values: ["acc1"]
    +
    + - name: cn-set2
    +  	replicas: 1
    +  	cnLabels:
    +   - key: "account"
    +     values: ["acc2"]  
    ```

3. Log in with `acc1` and `acc2`, respectively, and after logging in, you can use `show backend servers` to check which CN groups are used for the actual login. The following logs show that different accounts have logged in and used their corresponding CN groups.

```sql
-- acc1 租户登录 MatrixOne
root@HOST-10-206-134-7:~# mysql -h 10.96.1.153 -uacc1:admin -P6001 -p123456
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 32309
Server version: 8.0.30-MatrixOne-v0.5.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
-- acc1 查看实际登录使用的 CN 组是哪些
mysql> show backend servers;
+--------------------------------------+-------------------------------------------------------+------------------------------+
| UUID                                 | Address                                               | Labels                       |
+--------------------------------------+-------------------------------------------------------+------------------------------+
| 32333337-3966-3137-3032-613035306561 | mo-cn-set1-cn-0.mo-cn-set1-cn-headless.mo-hn.svc:6001 | account:acc1;cn-set1:1,high; |
+--------------------------------------+-------------------------------------------------------+------------------------------+
1 row in set (0.00 sec)
```

```sql
-- acc2 租户登录 MatrixOne
root@HOST-10-206-134-7:~# mysql -h 10.96.1.153 -uacc2:admin -P6001 -p123456
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 32640
Server version: 8.0.30-MatrixOne-v0.5.0 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
-- acc2 查看实际登录使用的 CN 组是哪些
mysql> show backend servers;
+--------------------------------------+-------------------------------------------------------+--------------------------------+
| UUID                                 | Address                                               | Labels                         |
+--------------------------------------+-------------------------------------------------------+--------------------------------+
| 33663265-3234-3365-3737-333030613535 | mo-cn-set2-cn-0.mo-cn-set2-cn-headless.mo-hn.svc:6001 | account:acc2;cn-set2:2,medium; |
+--------------------------------------+-------------------------------------------------------+--------------------------------+
1 row in set (0.00 sec)
```

如果一个普通租户没有对应的 CN 组，那么租户无法登录成功。例如，你如果创建一个没有 CN 组标签对应的租户 `acc3`，并尝试登录，会出现 `no available CN server` 错误。

```
mysql> create account acc3 admin_name 'admin' identified by '123456';
root@HOST-10-206-134-7:~# mysql -h 10.96.1.153 -uacc3:admin -P6001 -p123456
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (28000): internal error: no available CN server
```

##### 系统租户

对于系统租户，MatrixOne 将按照以下顺序自动选择合适的 CN 组进行连接：

* 最高优先级：选择配置了 `account` 标签为 `sys` 的 CN 组。
* 次高优先级：选择配置了其他标签，但未配置 `account` 标签的 CN 组。
* 中优先级：选择未配置任何标签的 CN 组。
* 低优先级：若以上 CN 组均不存在，则从现有 CN 组中随机选择。

根据这一原则，系统租户会优先选择专为自己保留或未被其他租户预留的 CN 组。然而，如果以上条件均不满足，系统租户可能会与其他租户共享 CN 组，从而无法确保系统租户与普通租户之间的负载隔离。

#### 实现负载隔离

Proxy 代理使用场景是负载隔离。在许多标准业务环境中，如高并发写入、报表生成、备份和大数据导出等，传统数据库方案通常需求部署特定的实例以实现负载隔离。这种方式同时还会导致额外的数据同步负担。

MatrixOne 利用 Proxy 来实现资源组的划分，它能够灵活地将 CN 组与用户指定的负载标签结合。在负载变动的情况下，MatrixOne 能够通过软件配置调整资源组的规模，从而更好地适应变化。

以上述为例，你可以尝试将两个 CN 的负载标签分别设置为 `olap` 和 `oltp`。然后，使用 SSB 模拟 OLTP 负载，并使用 TPCH 模拟 OLAP 负载。

!!! note
    在进行性能测试时，你首先需要对整个集群进行扩展。

```
metadata:
  name: mo
  namespace: mo-hn
spec:
+ cnGroups:
+ - name: cn-set1
+  	replicas: 1
+  	cnLabels:
+  	- key: "workload"
# 负载标签设置为 olap
+  	  values: ["olap"]
+
+ - name: cn-set2
+  	replicas: 1
+  	cnLabels:
+   - key: "workload"
# 负载标签设置为 oltp
+			values: ["oltp"]
```

负载隔离的连接设计待更新...
