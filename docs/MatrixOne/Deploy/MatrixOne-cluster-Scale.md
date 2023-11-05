# 集群扩缩容

本篇文档将介绍 MatrixOne 集群如何进行扩缩容，并包括 Kubernetes 集群本身的扩缩容与 MatrixOne 的各个服务的扩缩容。

本篇文档所介绍到的环境将基于 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)的环境。

### 何时需要进行扩容/缩容

为了确定是否需要对 MatrixOne 服务进行扩缩容，用户需要监控 MatrixOne 集群所在的节点和相关组件对应的 Pod 所使用的资源。你可以使用 `kubectl top` 命令来完成此操作。更详细的操作步骤可以参考[健康检查与资源监控](health-check-resource-monitoring.md)。

一般情况下，如果发现节点或者 Pod 的资源使用率超过了 60% 并且持续一段时间，可能需要考虑进行扩容以应对负载高峰。此外，如果根据业务指标观察到高的 TPS 请求量，也需要考虑进行扩容操作。

## Kubernetes 扩缩容

由于 MatrixOne 分布式版本的基础硬件资源都是通过 Kubernetes 来进行管理和分配的，因此整个集群的硬件节点扩缩容均是由 Kubernetes 完成的。

Kubernetes 可以通过 kuboard spray 图形化管理页面来完成节点的扩缩容，详细教程可参见 [kuboard spray 的官方文档](https://kuboard-spray.cn/guide/maintain/add-replace-node.html#%E5%B7%A5%E4%BD%9C%E8%8A%82%E7%82%B9)。

你需要在该集群中增加了一个工作节点，整体的硬件配置资源如下表所示：

| **Host**     | **内网 IP**        | **外网 IP**      | **mem** | **CPU** | **Disk** | **Role**    |
| ------------ | ------------- | --------------- | ------- | ------- | -------- | ----------- |
| kuboardspray | 10.206.0.6    | 1.13.2.100      | 2G      | 2C      | 50G      | 跳板机      |
| master0      | 10.206.134.8  | 118.195.255.252 | 8G      | 2C      | 50G      | master etcd |
| node0        | 10.206.134.14 | 1.13.13.199     | 8G      | 2C      | 50G      | worker      |
| node1        | 10.206.134.16 | 129.211.211.29  | 8G      | 2C      | 50G      | worker      |

![image-20230509113818093](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/scale-1.png)

## MatrixOne 各服务的扩缩容

服务的扩缩容，指的是 MatrixOne 集群中核心的组件服务，例如，对 Log Service、TN、CN 等进行扩缩容。

根据 MatrixOne 的架构特点，这些服务节点情况如下：

- Log Service 仅有 3 个节点。
- TN 仅有 1 个节点。
- CN 节点数目灵活。

因此，Log Service、TN 的节点只能垂直扩缩容，CN 节点可同时水平扩缩容和垂直扩缩容。

### 水平扩缩容

水平扩缩容，指的是服务的副本数增加或减少。可通过修改 MatrixOne Operator 启动 yaml 文件中的 `.spec.[component].replicas` 字段的值，完成服务副本数的更改。

1. 使用如下命令修改 yaml 文件中的 `.spec.[component].replicas` 字段的值：

    ```
    kubectl edit matrixonecluster ${mo_cluster_name} -n${mo_ns}
    ```

2. 进入编辑模式：

    ```
    tp:
        replicas: 2 #例如，扩容是由原来的 1 个 CN 更改为 2 个 CN
    #其他内容忽略    
    ```

    !!! note
        缩容也可参考上述步骤，更改 `replicas` 的字段值。

3. 编辑完成 `replicas` 个数保存退出后，MatrixOne Operator 将会自动启动一个新的 CN。你可以通过以下命令观察新的 CN 状态：

    ```
    [root@master0 ~]# kubectl get pods -n mo-hn      
    NAME                                  READY   STATUS    RESTARTS     AGE
    matrixone-operator-6c9c49fbd7-lw2h2   1/1     Running   2 (8h ago)   9h
    mo-tn-0                               1/1     Running   0            11m
    mo-log-0                              1/1     Running   0            12m
    mo-log-1                              1/1     Running   0            12m
    mo-log-2                              1/1     Running   0            12m
    mo-tp-cn-0                            1/1     Running   0            11m
    mo-tp-cn-1                            1/1     Running   0            63s
    ```

另外，Kubernetes 的 SVC 会自动保证 CN 的负载均衡，用户连接的 connection 会被均匀的分配到不同的 CN 上。你可以通过 MatrixOne 内置的 `system_metrics.server_connections` 表查看每个 CN 上的 connection 个数。

### 垂直扩缩容

垂直扩缩容，指的是对单个组件服务副本本身所需要的资源，例如，对 CPU 或内存进行调整。

1. 使用如下命令修改对应组件的 `.spec.[component].resources` 中的 `requests` 和 `limits` 配置，示例如下：

    ```
    kubectl edit matrixonecluster ${mo_cluster_name} -n${mo_ns}
    ```

2. 进入编辑模式：

    ```
    metadata:
      name: mo
      # 中间内容省略
    spec:
      tp:
    		resources:
          requests:
            cpu: 1
            memory: 2Gi
          limits:
            cpu: 1
            memory: 2Gi
    ...
    # 其他内容省略
    ```

### Node 调度

默认情况下，Matrixone-operator 不会为每个组件的 Pod 配置拓扑规则，而是使用 Kubernetes 默认的调度器根据每个 Pod 的资源请求进行调度。如果需要设置特定的调度规则，例如将 cn 组件调度到特定的两个节点 node0 和 node1 上，可以按照以下步骤进行操作：

1. 为 `node0` 和 `node1` 设置标签。

2. 在 MatrixOne 集群中设置 `nodeSelector`，使服务能够调度到对应的节点上。

3. （可选）在 MatrixOne 集群中设置 `TopologySpread` 字段，以实现服务在节点之间的均匀分布。

4. 在 MatrixOne 集群中设置副本数 `replicas`。

#### 设置节点标签

1. 执行以下命令，需要查看集群节点的情况：

    ```
    [root@master0 ~]# kubectl get node
    NAME      STATUS   ROLES                  AGE   VERSION
    master0   Ready    control-plane,master   47h   v1.23.17
    node0     Ready    <none>                 47h   v1.23.17
    node1     Ready    <none>                 65s   v1.23.17
    ```

2. 根据上述返回的结果和实际需求，你可以为节点打上标签，参见下面的代码示例：

    ```
    NODE="[待打上标签的节点]" # 根据上述结果，有可能是 ip、也可能是主机名、或者别名，例如 10.0.0.1、host-10-0-0-1、node01，那么设置 NODE="node0"
    LABEL_K="mo-role" # 标签的 key，可按需定义，也可以直接用示例
    LABEL_V="mo-cn" # 标签的 value，可按需定义，也可以直接用示例

    kubectl label node ${NODE} ${LABEL_K}=${LABEL_V}
    ```

3. 在本篇案例中，你也可以写成以下两条语句：

    ```
    kubectl label node node0 "mo-role"="mo-cn"
    kubectl label node node1 "mo-role"="mo-cn"
    ```

4. 使用下面的命令，确认节点标签是否已打上：

    ```
    [root@master0 ~]# kubectl get node node0 --show-labels | grep mo_role     
    node0   Ready    <none>   47h   v1.23.17   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=node0,kubernetes.io/os=linux,mo_role=mo_cn
    [root@master0 ~]# kubectl get node node1 --show-labels | grep mo_role
    node1   Ready    <none>   7m25s   v1.23.17   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=node1,kubernetes.io/os=linux,mo_role=mo_cn
    ```

5. 执行以下命令，可以按需删除标签：

    ```
    kubectl label node ${NODE} ${LABEL_K}-
    ```

#### 设置服务调度规则、均匀分布、副本数

1. 执行以下命令，查看目前的 Pod 在多个节点上的分配情况：

    ```
    [root@master0 mo]# kubectl get pod -nmo-hn -owide
    NAME         READY   STATUS    RESTARTS   AGE   IP              NODE    NOMINATED NODE   READINESS GATES
    mo-tn-0      1/1     Running   0          34m   10.234.60.120   node0   <none>           2/2
    mo-log-0     1/1     Running   0          34m   10.234.168.72   node1   <none>           2/2
    mo-log-1     1/1     Running   0          34m   10.234.60.118   node0   <none>           2/2
    mo-log-2     1/1     Running   0          34m   10.234.168.73   node1   <none>           2/2
    mo-tp-cn-0   1/1     Running   0          33m   10.234.168.75   node1   <none>           2/2
    ```

2. 根据上述输出和实际需求可以看出目前只有 1 个 CN，我们需要为 CN 组件进行调度规则的设置。我们将在 MatrixOne 集群对象的属性中进行修改。在调度范围内均匀分布的规则下新的 CN 会被调度到 node0 上。执行以下命令以进入编辑模式：

    ```
    mo_ns="mo-hn"
    mo_cluster_name="mo" # 一般名称为 mo，根据部署时 matrixonecluster 对象的 yaml 文件中的 name 指定，也可以通过 kubectl get matrixonecluster -n${mo_ns} 来确认
    kubectl edit matrixonecluster ${mo_cluster_name} -n${mo_ns}
    ```

3. 在编辑模式下，根据上述场景，我们将设置 CN 的副本数为 2，并且在标签为 `mo-role:mo-cn` 的节点上进行调度，实现在调度范围内的均匀分布。我们将使用 `spec.[component].nodeSelector` 来指定具体组件的标签选择器。以下是示例的编辑内容：

    ```
    metadata:
      name: mo
    # 中间内容省略
    spec:
    # 中间内容省略
      tp:
        # 设置副本数
        replicas: 2
        # 设置调度规则
        nodeSelector:
          mo-role: mo-cn
        # 设置在调度范围内均匀分布
        topologySpread:
          - topology.kubernetes.io/zone
          - kubernetes.io/hostname
    # 其他内容省略
    ```

4. 更改生效后，执行下面的命令，可以查看两个 CN 已经分别在两个节点上：

    ```
    [root@master0 ~]# kubectl get pod -nmo-hn -owide      
    NAME         READY   STATUS    RESTARTS        AGE     IP              NODE    NOMINATED NODE   READINESS GATES
    mo-tn-0      1/1     Running   1 (2m53s ago)   3m6s    10.234.168.80   node1   <none>           2/2
    mo-log-0     1/1     Running   0               3m40s   10.234.168.78   node1   <none>           2/2
    mo-log-1     1/1     Running   0               3m40s   10.234.60.122   node0   <none>           2/2
    mo-log-2     1/1     Running   0               3m40s   10.234.168.77   node1   <none>           2/2
    mo-tp-cn-0   1/1     Running   0               84s     10.234.60.125   node0   <none>           2/2
    mo-tp-cn-1   1/1     Running   0               86s     10.234.168.82   node1   <none>           2/2
    ```

需要注意的是，上述示例中的配置会使得集群中的 Pod 在 `topology.kubernetes.io/zone` 和 `kubernetes.io/hostname` 这两个维度上实现均匀分布。在 `topologySpread` 中指定的标签键是有顺序的。在上面的示例中，Pod 首先在可用区维度上均匀分布，然后在每个可用区内的 Pod 再均匀地分布到该区域内的节点上。

使用 `topologySpread` 功能可以提高集群的可用性，降低由于单点或区域性故障而破坏集群中的大多数副本的可能性。但这也增加了调度的要求，需要确保集群在每个区域内都有足够的资源可用。
