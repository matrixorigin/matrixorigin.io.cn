# MatrixOne 集群的扩缩容

本篇文档将介绍 MatrixOne 集群如何进行扩缩容，并包括 Kubernetes 集群本身的扩缩容与 MatrixOne 的各个服务的扩缩容。

本篇文档所介绍到的升级环境将基于 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)的环境。

## Kubernetes 扩缩容

由于 MatrixOne 分布式版本的基础硬件资源都是通过 Kubernetes 来进行管理和分配的，因此整个集群的硬件节点扩缩容均是由 Kubernetes 完成的。

Kubernetes 可以通过 kuboard spray 图形化管理页面来完成节点的扩缩容，详细教程可参见 [kuboard spray 的官方文档](https://kuboard-spray.cn/guide/maintain/add-replace-node.html#%E5%B7%A5%E4%BD%9C%E8%8A%82%E7%82%B9)。

## MatrixOne 各服务的扩缩容

服务的扩缩容，指的是 MatrixOne 集群中核心的组件服务，例如，对 Log Service、DN、CN 等进行扩缩容。

根据 MatrixOne 的架构特点，这些服务节点情况如下：

- Log Service 仅有 3 个节点。
- DN 仅有 1 个节点。
- CN 节点数目灵活。

因此，Log Service、DN 的节点只能垂直扩缩容，CN 节点可同时水平扩缩容和垂直扩缩容。

### 水平扩缩容

水平扩缩容，指的是服务的副本数增加或减少。可通过修改 MatrixOne Operator 启动 yaml 文件中的 `.spec.[component].replicas` 字段的值，完成服务副本数的更改。

1. 使用如下命令启动 yaml 文件中的 `.spec.[component].replicas` 字段的值：

    ```
    kubectl edit matrixonecluster ${mo_cluster_name} -n${mo_ns}
    ```

2. 进入编辑模式：

    ```
    tp:
        replicas: 2 #1个CN-->2CN
    #其他内容忽略    
    ```

3. 编辑完成 `replicas` 个数保存退出后，MatrixOne Operator 将会自动启动一个新的 CN。你可以通过以下命令观察新的 CN 状态：

    ```
    [root@master0 ~]# kubectl get pods -n mo-hn      
    NAME                                  READY   STATUS    RESTARTS     AGE
    matrixone-operator-6c9c49fbd7-lw2h2   1/1     Running   2 (8h ago)   9h
    mo-dn-0                               1/1     Running   0            11m
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

## MatrixOne 各服务的资源监控

为了确定 MatrixOne 服务是否需要扩缩容，用户往往需要针对 MatrixOne 集群所在 Node 和组件对应 Pod 所使用的资进行监控。

你可以使用 `kubectl top` 命令完成，详细的命令可以参考对应版本的 [Kubernetes 官网文档](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#top)。

### Node 监控

1. 使用如下命令查看 MatrixOne 集群节点详情：

    ```
    kubectl get node
    ```

2. 根据上面的命令运行的返回结果，查看某个节点的资源使用情况。

    __Note:__ Node 监控到的 CPU 的单位是 1000m，表示 1 Core。

    ```
    NODE="[待监控节点]" # 根据上述结果，有可能是ip、也可能是主机名、或者别名，例如10.0.0.1、host-10-0-0-1、node01
    kubectl top node ${NODE}
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_26882_o0_zGd-Bas_79VSn_1681273662?w=1136&h=424)

3. 查看 MatrixOne 集群所有节点的资源使用情况：

    ```
    kubectl top node
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_262920_-FbamlYNvfA3MZ_Q_1681274050?w=1222&h=176)

### Pod 监控

1. 使用如下命令查看 MatrixOne 集群 Pod：

    ```
    NS="mo-hn"
    kubectl get pod -n${NS}
    ```

2. 根据上面的命令运行的返回结果，查看某个 Pod 的资源使用情况：

    ```
    POD="[待监控pod名称]" # 根据上述结果，例如：dn为mo-dn-0，cn为mo-tp-cn-0、mo-tp-cn-1、...，logservice为mo-log-0、mo-log-1、...
    kubectl top pod ${POD} -n${NS}
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_868871_vHRDl2Xto4ZMN6S4_1681273933?w=1372&h=594)

3. 使用如下命令查看 MatrixOne 所有组件的资源使用情况：

    ```
    kubectl top pod -n${NS}
    ```

    ![img](https://wdcdn.qpic.cn/MTY4ODg1NzQyNDQ2MjA3NQ_855850_Otf-sCx5KPZhaprO_1681274035?w=1274&h=384)
