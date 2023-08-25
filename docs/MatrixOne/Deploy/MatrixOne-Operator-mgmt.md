# Operator 管理

## MatrixOne Operator 概述

[MatrixOne Operator](https://github.com/matrixorigin/matrixone-operator) 用来定义和管理 MatrixOne 集群在 Kubernetes 的资源需求，由一组 Kubernetes 自定义资源（CustomResourceDefinitions, CRD），一组 Kubernetes 控制器和一组 WebHook 服务组成：

- **CRD**：在 Kubernetes 中，CRD 是一个对象，用于注册新的自定义资源类型到 Kubernetes APIServer 中。MatrixOne Operator 中包含的 CRDs 注册了多种自定义资源，包括用于描述 MatrixOne 集群的 MatrixOneCluster 资源、以及描述集群内组件的 CNSet、TNSet、LogSet 等资源。注册完成后，客户端就能够在 Kubernetes APIServer 上读写这些资源。

- **控制器**：控制器是一个长期运行的自动化程序，负责监控 Kubernetes 中资源的期望状态和收集这些资源的实际状态，并自动运维，驱动实际状态向期望状态转移。matrixone-operator 中的控制器会监视 MatrixOneCluster、CNSet、TNSet、LogSet 等资源，并负责实现用户通过这些资源声明的期望状态。

- **Webhook 服务**：Webhook 服务是一个长期运行的 HTTP 服务。当 Kubernetes APIServer 收到用户读写 MatrixOneCluster、CNSet、TNSet、LogSet 等资源的请求时，会将请求转发给 Webhook 服务，由 Webhook 服务执行请求校验、默认值填充等逻辑。

在使用 Helm chart 安装 Matrixone-Operator 时，会自动提交所需的 CRDs 到 Kubernetes APIServer，完成自定义资源的注册，并部署一个长期运行的 Matrixone-Operator 应用。该应用中打包了上述的控制器和 Webhook 服务。

### 集群管理

MatrixOne Operator 通过 MatrixOneCluster 资源为用户提供了声明式的集群管理能力。具体而言，在 Kubernetes 上部署 MatrixOne 集群时，用户可以使用 YAML 格式声明一个 MatrixOneCluster 对象来描述集群，该 operator 的控制器会根据该描述实现集群的编排，并将集群状态更新到 MatrixOneCluster 对象的 `.status` 字段中。

MatrixOneCluster 集群由多个组件（如 Compute Node（CN）、Transaction Node（TN）和 Log Service）构成，这些组件对应于 CNSet、TNSet 和 LogSet 等子资源。因此，MatrixOneCluster 资源的控制器会编排这些子资源，并依赖这些子资源的控制器来完成它们的编排。

![image-operator](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/image-operator.png)

## 部署与运维

本章节所介绍到的部署与运维环境将基于 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)的环境。

以下操作均在 master0 节点进行。

### 部署

可以参考 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)的 MatrixOne-Operator 部署章节。

### 检查状态

我们采用了 Helm 工具对 MatrixOne Operator 进行部署。[Helm](https://helm.sh/zh/docs/intro/using_helm/) 是 Kubernetes 应用包管理的工具，用于管理 chart，预先配置好的安装包资源，类似于 Ubuntu 的 APT 和 CentOS 中的 YUM。使用 `helm list` 命令可以查看 Operator 的部署状态。

```
[root@master0 ~]# NS="matrixone-operator"
[root@master0 ~]# helm list -n${NS}
NAME                    NAMESPACE               REVISION        UPDATED                                 STATUS          CHART                                   APP VERSION
matrixone-operator      matrixone-operator      1               2023-05-09 15:19:38.363683192 +0800 CST deployed        matrixone-operator-0.8.0-alpha.2        0.1.0
```

### 升级

MatrixOne-Operator 项目是长期维护更新的项目，请更新至最新版本。你可以在 [Github](https://github.com/matrixorigin/matrixone-operator/releases) 上下载新版本的 Operator，例如：`matrixone-operator-0.8.0-alpha.2`

使用如下命令解压文件：

```
tar xvf ./matrixone-operator-0.8.0-alpha.2.tgz
cd matrixone-operator
```

你可以使用 `helm upgrade` 命令来升级 Matrixone-Operator。你可以使用以下命令获取镜像版本：

```
cd matrixone-operator
NS="matrixone-operator"
helm upgrade -n "${NS}" matrixone-operator ./ --dependency-update
```

升级成功后，代码展示如下所示：

```
Release "matrixone-operator" has been upgraded. Happy Helming!
NAME: matrixone-operator
LAST DEPLOYED: Tue May  9 17:59:06 2023
NAMESPACE: matrixone-operator
STATUS: deployed
REVISION: 2
TEST SUITE: None
```

升级完成，可以通过以下命令查看当前版本：

```
#获取镜像版本
NS="matrixone-operator"
kubectl get pod -n${NS} `kubectl get pod -n${NS}  | grep operator | head -1 | awk '{print $1}'` -ojsonpath='{.spec.containers[0].image}'
matrixorigin/matrixone-operator:0.8.0-alpha.2
```

在升级 Matrixone-Operator 之后，会在 `matrixone-operator` 命名空间下先重新生成一个新的 `matrixone-operator-xxxx-xxx` 的 Pod，之后会把旧的 Pod 删除。

!!! note
    升级完成后，假如 Matrixone-Operator 升级所带来的变更也会更新默认 `.spec`，那么有可能会滚动更新 MatrixOne 集群相关服务或配置，因此 MatrixOne 服务可能会被重启。你可以通过命令监控升级过程：`watch -e "kubectl get pod -nmo-hn -owide"`。

    ```
    NS="matrixone-operator"
    watch -e "kubectl get pod -n${NS} -owide"
    ```

    ```
    NAME                                 READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
    matrixone-operator-f8496ff5c-s2lr6   1/1     Running   0          164m   10.234.168.43   node1   <none>           <none>
    ```

### 扩缩容

由于 Operator 经常使用有限的资源，因此垂直扩缩容的场景相对较少。一般而言，我们只需要考虑水平扩缩容，也就是增加或减少副本的数量。通常情况下，Operator 是单副本的，如果我们需要增强 Operator 的高可用性，可以考虑将其扩容，例如扩容为两个副本。这样，即使第一个副本出现异常（例如，在所在节点上拉取映像失败），另一个副本仍然可以正常运行。这对于 MO 集群的部署和运维管理操作非常重要。我们可以通过在当前 Operator 版本的部署目录下，使用 Helm Upgrade 命令并指定 replicaCount 的数量来完成 Operator 副本数的扩缩容。

在进行扩容之前，我们可以使用以下命令查看 Operator 的数量：

```
NS="matrixone-operator"
watch -e "kubectl get pod -n${NS} -owide"
```

```
NAME                                 READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
matrixone-operator-f8496ff5c-s2lr6   1/1     Running   0          164m   10.234.168.43   node1   <none>           <none>
```

- **扩容**：使用下面的命令行进行扩容：

```
# 副本数
cd matrixone-operator
NUM=2
NS="matrixone-operator"
helm upgrade -n${NS} matrixone-operator ./ --dependency-update --set replicaCount=${NUM}
```

扩容成功，打印代码示例如下：

```
Release "matrixone-operator" has been upgraded. Happy Helming!
NAME: matrixone-operator
LAST DEPLOYED: Tue May  9 18:07:03 2023
NAMESPACE: matrixone-operator
STATUS: deployed
REVISION: 3
TEST SUITE: None
```

你可以继续通过以下命令可以观察 operator 个数：

```
watch -e "kubectl get pod -nmo-hn -owide"
NAME                                 READY   STATUS    RESTARTS   AGE    IP              NODE    NOMINATED NODE   READINESS GATES
matrixone-operator-f8496ff5c-nt8qs   1/1     Running   0          9s     10.234.60.126   node0   <none>           <none>
matrixone-operator-f8496ff5c-s2lr6   1/1     Running   0          167m   10.234.168.43   node1   <none>           <none>
```

如果需要水平缩容，可以通过 `helm upgrade` 降低 `replicaCount` 数量来完成 operator 副本数的缩容。

### 卸载

!!! warning
    在卸载 Matrixone-Operator 之前，务必确认清楚，因为卸载操作会直接卸载 Matrixone 集群相关的资源，包括 SVC、Pod 等（但不包括 log service 使用的 pvc 资源）。

使用如下指令卸载 Matrixone-Operator：

```
helm uninstall matrixone-operator -n mo-hn
```
