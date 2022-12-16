# 对 MatrixOne 集群进行扩缩容

本文档将指导你如何对集群进行扩缩容，手动或自动处理应用对资源需求量的变化。

## 前提条件

已按照[部署 MatrixOne 集群](../get-started.md)文档，完成了 MatrixOne 集群的部署和连接。

## 对 MatrixOne 集群进行扩缩容

有两种方式可以对 MatrixOne 集群对象进行扩缩容，默认在 `default` 命名空间下进行操作。

!!! note
    为保证集群的状态，建议将 `logService` 副本数（replicas）保持在`3`以上。

详细步骤如下所示：

### 方式一：通过修改配置文件的方式扩缩容

1. 修改配置文件, 例如 `demo.yaml`：<!--配置文件在哪里？-->

    - 原配置文件代码段示例如下：

    ```yaml
    apiVersion: core.matrixorigin.io/v1alpha1
    kind: MatrixOneCluster
    metadata:
      name: mo
    spec:
      imageRepository: matrixorigin/matrixone
      version: nightly-43446ad2
      logService:
        replicas: 3
        initialConfig:
          logShards: 1
          dnShards: 1
          logShardReplicas: 3
        # local file system
        sharedStorage:
          fileSystem:
            path: "/test"
        volume:
          size: 10Gi
      dn:
        replicas: 1
        cacheVolume:
          size: 10Gi
      tp:
        replicas: 1
        cacheVolume:
          size: 10Gi
    ```

    - 修改配置中 `replicas` ：

      例如:

      + `cn` 副本数由`1`变为`2`<!--没有找到cn，上面的代码段中只有dn和tp-->

      + `dn` 副本数由`1`变为`2`

      修改示例如下：

      ```yaml
      apiVersion: core.matrixorigin.io/v1alpha1
      kind: MatrixOneCluster
      metadata:
        name: mo
      spec:
        imageRepository: matrixorigin/matrixone
        version:  nightly-63835b83
        logService:
          replicas: 3
          initialConfig:
            logShards: 1
            dnShards: 1
            logShardReplicas: 3
          sharedStorage:
            fileSystem:
              path: "/test"
          volume:
            size: 10Gi
        dn:
          replicas: 2
          cacheVolume:
            size: 10Gi
        tp:
          replicas: 2
          cacheVolume:
            size: 10Gi
      ```

2. 提交配置使配置生效：

    ```shell
    kubectl apply -f demo.yaml
    ```

    - 修改前状态：

```shell
(base) → ~ kubectl get mo
NAME    LOG DN  TP  AP  VERSION             PHASE   AGE
mo      3   1   1       nightly-63835b83    Ready   8m5s

(base) → ~ kubectl get po
NAME        READY   STATUS  RESTARTS        AGE
mo-dn-0     1/1     Running 0               7m35s
mo-log-0    1/1     Running 0               8m9s
mo-log-1    1/1     Running 0               8m9s
mo-log-2    1/1     Running 1(7m29s ago)    8m9s
mo-tp-cn-0  1/1     Running 0               6m55s
```

    - 修改后状态:

```shell
(base) → ~ kubectl get mo
NAME    LOG DN  TP  AP  VERSION             PHASE   AGE
mo      2   3   2       nightly-63835b83    Ready   9m48s

(base) → kubectl get po
NAME        READY   STATUS  RESTARTS        AGE
mo-dn-0     1/1     Running 0               9m18s
mo-dn-1     1/1     Running 0               49s
mo-log-0    1/1     Running 0               9m52s
mo-log-1    1/1     Running 0               9m52s
mo-log-2    1/1     Running 1(9m12s ago)    9m52s
mo-tp-cn-0  1/1     Running 0               8m38s
mo-tp-cn-1  1/1     Running 0               27s
```

### 方式二：编辑 MatrixOne 对象

对集群中的 MatrixOne 对象进行操作：

```
kubectl edit mo
```

修改 MatrixOne 组建的副本数：

```yaml
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: core.matrixorigin.io/v1alpha1
kind: MatrixOneCluster
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"core.matrixorigin.io/v1alpha1","kind":"MatrixOneCluster","metadata":{"annotations":{},"name":"mo","namespace":"default"},"spec":{"dn":{"cacheVolume":{"size":"10Gi"},"replicas":2},"imageRepository":"matrixorigin/matrixone","logService":{"initialConfig":{"dnShards":1,"logShardReplicas":3,"logShards":1},"replicas":3,"sharedStorage":{"fileSystem":{"path":"/test"}},"volume":{"size":"10Gi"}},"tp":{"cacheVolume":{"size":"10Gi"},"replicas":2},"version":"nightly-63835b83"}}
  creationTimestamp: "2022-11-07T07:15:35Z"
  finalizers:
  - matrixorigin.io/matrixonecluster
  generation: 3
  name: mo
  namespace: default
  resourceVersion: "99427"
  uid: 187dad8b-f7b9-47f1-8dc9-e5d6af235a1d
spec:
  dn:
    cacheVolume:
      size: 10Gi
#    replicas: 2
    replicas: 3
    resources: {}
  imageRepository: matrixorigin/matrixone
  logService:
    initialConfig:
      dnShards: 1
      logShardReplicas: 3
      logShards: 1
    replicas: 3
    resources: {}
    sharedStorage:
      fileSystem:
        path: /test
    volume:
      size: 10Gi
  tp:
    cacheVolume:
      size: 10Gi
#    replicas: 2
    replicas: 3
    resources: {}
    serviceType: ClusterIP
  version: nightly-63835b83
...
```

修改后状态：<!--是不是还需要执行什么才能看到状态？-->

```shell
(base) → ~ kubectl get mo
NAME    LOG DN  TP AP   VERSION             PHASE       AGE
mo      3   3   3       nightly-63835b83    NotReady    22m

(base) → ~ kubectl get po
NAME        READY   STATUS  RESTARTS    AGE
mo-dn-0     1/1     Running 0           21m
mo-dn-1     1/1     Running 0           13m
mo-dn-2     1/1     Running 0           48s  
mo-log-0    1/1     Running 0           22m
mo-log-1    1/1     Running 0           22m
mo-log-2    1/1     Running 1(21m ago)  22m
mo-tp-cn-0  1/1     Running 0           21m
mo-tp-cn-1  1/1     Running 0           13m
mo-tp-cn-2  1/1     Running 0           22s
```
