# 启动与停服下线

本篇文档将介绍如何启停分布式 MatrixOne 集群。

本篇文档所介绍到的升级环境将基于 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)的环境。

## 集群停止下线

要停止 MatrixOne 集群，只需停止业务的读写操作，然后直接关闭服务器即可。关闭的顺序为：首先关闭 node0 节点，接着关闭 master0 节点，最后关闭 Kuboard-Spray 节点。

## 集群重启上线

要重新启动 MatrixOne 集群，建议按照以下硬件启动顺序：首先启动 Kuboard-Spray 节点，接着启动 master0 节点，最后启动 node0 节点。

在硬件启动完成后，k8s 会自动进行恢复。同时，MatrixOne 和 minio 相关服务也会自动恢复，无需人工干预。但是，需要注意的是，Kuboard-Spray 节点的 Docker 不会自动恢复，需要手动启动 Kuboard-Spray 服务。

### 检查 K8s 状态

在操作 k8s 的 master0 节点上，可以检查 k8s 集群节点的状态。

正常情况下，所有节点的状态应该为 Ready。如果某些节点状态异常，就需要进一步排查原因。

```
kubectl get node
# 如非ready状态，则需要进一步排查节点的情况
# kubectl describe node ${NODE_NAME}
```

以下是状态代码图示示例：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-1.png)

### 检查 MinIO 状态

在操作 k8s 的 master0 节点上，可以检查 MinIO 的状态。

硬件启动后，MinIO 也会自动恢复，可以使用以下命令检查 MinIO 状态：

```
NS="mostorage"
kubectl get pod -n${NS}
```

以下是状态代码图示示例：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-2.png)

### 检查 MatrixOne 集群及组件状态

#### 检查 MatrixOneCluster 状态

首先，要检查 MatrixOne 集群是否正常。MatrixOne 集群对应自定义资源类型 MatrixOneCluster。可以使用以下命令来检查 MatrixOneCluster 的状态：

```
MO_NAME="mo"
NS="mo-hn"
kubectl get matrixonecluster -n${NS} ${MO_NAME}
```

正常情况下，状态应该为 Ready。如果状态为 NotReady，则需要进一步排查问题。以下是状态图示例：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-3.png)

##### 查看 MatrixOne 集群状态详细信息

如果 MatrixOne 集群状态不正常，可以使用以下命令来查看详细信息：

```
kubectl describe matrixonecluster -n${NS} ${MO_NAME}
```

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-4.png width=50% heigth=50%/>
</div>

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-5.png width=50% heigth=50%/>
</div>

#### 检查 TNSet/CNSet/LogSet 状态

当前 MatrixOne 集群的组件主要有：TN、CN、Log Service，分别对应的自定义资源类型 TNSet、CNSet、LogSet。这些对象均由 MatrixOneCluster 控制器生成。

可以使用以下命令来检查各组件的状态，以 TN 为例：

```
SET_TYPE="tnset"
NS="mo-hn"
kubectl get ${SET_TYPE} -n${NS}
```

以下是状态代码图示示例：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-6.png)

#### 检查 Pod 状态

可以直接检查 MO 集群中生成的原生 k8s 对象，来确认集群的健康程度。一般情况下，通过对 Pod 的状态确认即可：

```
NS="mo-hn"
kubectl get pod -n${NS}
```

以下是状态代码图示示例：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-7.png)

一般来说，Running 状态即为正常状态。但也有少数例外的情况，例如状态为 Running，但 MO 集群实际上不正常，例如无法通过 MySQL Client 连接 MO 集群。此时，可以进一步排查 Pod 的日志是否有异常信息输出：

```
NS="mo-hn"
POD_NAME="[上述返回pod的名称]" # 例如mo-tp-cn-3
kubectl logs ${POD_NAME} -n${NS}
```

如果状态为非 Running，例如 Pending，可以通过查看 Pod 状态中的事件（event）来确认异常原因。例如，由于集群资源无法满足 mo-tp-cn-3 的申请，这个 Pod 无法被调度，处于 Pending 状态。在这个例子中，可以通过扩容节点资源来解决。

```
kubectl describe pod ${POD_NAME} -n${NS}
```

以下是状态代码图示示例：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/start-stop-8.png)
