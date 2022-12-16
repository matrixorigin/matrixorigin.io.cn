# 清理 Kubernetes 上的 MatrixOne 集群

这篇文档将指导你如何清理 Kubernetes 上的 MatrixOne 集群。

## 前置要求

已按照[部署 MatrixOne 集群](../get-started.md)文档，完成了 MatrixOne 集群的部署和连接。

## 删除集群

删除集群对应的 `matrixonecluster` 对象就可以完成集群删除操作，示例如下：

```kubectl
$ kubectl -n ${NS} delete matrixonecluster ${NAME}
```

默认配置下，删除一个集群将：

- 删除集群的所有 Pod 和 Service；
- 删除集群的所有持久卷；
- 保留集群在外部共享存储中保存的数据；

要彻底删除集群数据，还需要额外手动删除集群在外部共享存储中保存的数据。

## 集群数据保留策略

你可以通过 [`.spec.logservice.pvcRetentionPolicy`](https://github.com/matrixorigin/matrixone-operator/blob/main/docs/reference/api-reference.md#logsetbasic) 字段来配置集群的数据保留策略。

该字段的默认值是 `Delete`，即在删除集群和缩容时删除不再需要的持久卷。你可以修改为 `Retain` 来在这类情况下保留持久卷。

在持久卷和共享存储中的数据都保留的情况下，可以重建被删除的集群，使用之前保留的数据继续工作。
