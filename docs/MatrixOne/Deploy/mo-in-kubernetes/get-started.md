# 使用 MatrixOne Operator 部署 MatrixOne 集群

本篇文档将讲述如何使用 [MatrixOne Operator](whats-mo-operator.md) 部署一个简单的 MatrixOne 集群。

**主要步骤**：

<p><a href="#create_k8s">1. 创建 Kubernetes 集群</a></p>
<p><a href="#deploy_mo_operator">2. 部署 MatrixOne Operator</a></p>
<p><a href="#create_mo_cluster">3. 创建 MatrixOne 集群</a></p>
<p><a href="#connect_mo_cluster">4. 连接 MatrixOne 集群</a></p>

**其他步骤**：

<p><a href="#delete_mo_cluster">删除 MatrixOne 集群</a></p>

## <h2><a name="create_k8s">1. 创建 Kubernetes 集群</a></h2>

### 开始前准备

开始步骤一之前，为保证 MatrixOne 集群能够正常部署与使用，请阅读本章节，了解创建 Kubernetes 集群的工具和配置要求。

- Kubernetes

   **版本要求**：1.18 或以上版本

   **作用**：安装 Kubernetes，协助 MatrixOne 集群进行自动部署、扩展和管理容器化应用程序。

- kubectl

   **版本要求**：1.18 或以上版本

   **作用**：安装命令行工具 kubectl，它是使用 Kubernetes API 与 Kubernetes 集群的控制面进行通信的命令行工具，协助 MatrixOne 集群使用进行自动部署。

- Helm

   **版本要求**：3.0 或以上版本

   **作用**：Helm 是 Kubernetes 的应用程序包管理器，你可使用 Helm Charts 描述应用程序的结构。 使用 Helm 命令行界面，您可以回滚部署、监控应用程序的状态并跟踪 MatrxiOne 集群部署的历史记录。

### 创建和启动 Kubernetes 集群步骤

本章节介绍了三种创建 Kubernetes 集群的方法，可用于测试使用 MatrixOne Operator 管理的 MatrixOne 集群。你可以选择使用 **EKS**、**GKE** 或 **Kind**安装并启动一套 Kubernetes 集群。

**简要说明**

- 使用你本地的设备或 AWS Cloud Shell 上 `eksctl` 命令行工具部署 Amazon EKS 集群
- 使用 Google Cloud Shell 在 Google Cloud Platform 的 Google Kubernetes Engine 中部署 Kubernetes 集群
- 使用 Kind 创建在 Docker 中运行的 Kubernetes

#### 方法一：创建并启动 Amazon EKS 集群

1. 参考[创建 Amazon EKS 集群](https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/create-cluster.html) 官方文档，完成 `eksctl` 命令行工具的安装与配置。

2. 选择合适的[区域](https://docs.aws.amazon.com/zh_cn/AWSEC2/latest/UserGuide/using-regions-availability-zones.html)（如 ap-southeast-1），执行下面的命令，启动一套 EKS 集群：

```
$ eksctl create cluster --name matrixone --nodegroup-name db --node-type m5.xlarge --node3 3 --node-ami auto
```

#### 方法二：创建并启动 Google GKE 集群

1. 参考[将应用部署到 GKE 集群](https://cloud.google.com/kubernetes-engine/docs/deploy-app-cluster)官方文档，完成 `gcloud` 命令行工具的安装与配置。

2. 选择合适的[区域](https://cloud.google.com/compute/docs/regions-zones#available)（如 asia-east2），执行下面的命令，启动一套 GKE 集群：

```
$ gcloud container clusters create matrixone --machine n2-standard-4 --region ${region} --num-nodes 3
```

#### 方法三：创建并启动 Kind

!!! note
    在 Kind 部署的集群上部署的 MatrixOne 数据库没有多节点高可用的能力，不建议在生产环境使用。

1. 参考 [Docker 官方文档](https://docs.docker.com/get-docker/) 在本地环境配置和启动 Docker 进程。

2. 参考 [Kind 官方文档](https://kind.sigs.k8s.io/docs/user/quick-start/)， 完成 `kind` 命令行工具的安装与配置。

3. 执行下面的命令，在本地使用 Kind 部署一套 kubernetes 集群：

```
$ cat <<EOF > kind.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker
- role: worker
- role: worker
EOF
$ kind create cluster --name matrixone --config kind.yaml
```

## <h2><a name="deploy_mo_operator">2. 部署 MatrixOne Operator</a></h2>

1. 执行下面的命令，在 Kubernetes 集群为 matrixone-operator 创建一个 Namespace：

    ```
    kubectl create namespace mo-system
    ```

2. 执行下面的命令，使用 `helm` 安装 matrixone-operator：

    ```
    helm -n mo-system install mo ./charts/matrixone-operator --dependency-update
    ```

3. 执行下面的命令，验证 matrixone-operator 安装完成：

    ```
    helm -n mo-system ls
    kubectl -n mo-system get pod
    ```

4. 若 matrixone-operator 安装成功，上面的命令中即可看到已经安装的 `helm chart` 和运行中的 `matrixone-operator Pod`。

## <h2><a name="create_mo_cluster">3. 创建 MatrixOne 集群</a></h2>

1. 执行下面的命令，使用现有的 Namespace 或新建一个 Namespace 开始集群部署：

    ```
    NS=${NAMESPACE_NAME}
    kubectl create namespace ${NS}
    ```

    在进行分布式部署时，MatrixOne 数据库需要外部的共享存储，MatrixOne 目前可以使用支持 S3 协议的对象存储（如 AWS S3、MinIO）或网络文件系统（如 NFS）作为共享存储。配置AWS S3或MinIO的步骤，请参考[为MatrixOne 集群配置共享存储](configure-shared-memory.md)的相关内容。

2. 执行下面的命令，将在目标 Kubernetes 集群中部署一套 MinIO 作为共享存储，相信信息，参考[为MatrixOne 集群配置共享存储](configure-shared-memory.md)。

    ```
    kubectl -n mo-system apply -f https://raw.githubusercontent.com/matrixorigin/matrixone-operator/main/examples/minio.yaml
    # 在 MatrixOne 集群将使用的 NS 中准备好 MinIO 的 credential
    $ kubectl -n ${NS} create secret generic minio --from-literal=AWS_ACCESS_KEY_ID=minio --from-literal=AWS_SECRET_ACCESS_KEY=minio123
    ```

3. 执行下面的命令，下载示例的 MatrixOne 集群定义文件：

    ```
    $ curl -O https://raw.githubusercontent.com/matrixorigin/matrixone-operator/main/examples/mo-cluster.yaml
    ```

4. 默认的集群定义中所有的组件均未配置资源申请，只适用于演示。你可以编辑 *mo-cluster.yaml*，为各组件指定 CPU 与内存的请求和限制。

    ```
    apiVersion: core.matrixorigin.io/v1alpha1
    kind: MatrixOneCluster
    metadata:
      name: mo
    spec:
      logService:
        replicas: 3
    +   resources:
    +     requests:
    +       cpu: 3
    +       memory: 14Gi
    +       cpu: 3
    +       memory: 14Gi
      dn:
        replicas: 2
    +   resources:
    +     requests:
    +       cpu: 3
    +       memory: 14Gi
    +     limits:
    +       cpu: 3
    +       memory: 14Gi
      tp:
        replicas: 2
    +   resources:
    +     requests:
    +       cpu: 3
    +       memory: 14Gi
    +     limits:
    +       cpu: 3
    +       memory: 14Gi
    ```

5. 执行下面的命令，创建 MatrixOne 集群：

    ```
    kubectl -n ${NS} apply -f mo-cluster.yaml
    ```

6. 执行下面的命令，验证 MatrixOne 集群创建是否成功：

    ```
    kubectl -n ${NS} get matrixonecluster --watch
    ```

7. 等待集群对象的 `Phase` 达到 `Ready` 状态则创建成功，代码示例如下所示：

    ```
    NAME   LOG   DN    TP    AP    VERSION            PHASE      AGE
    mo     3     2     2           nightly-63835b83   Ready          2m6s
    ```

## <h2><a name="connect_mo_cluster">4. 连接 MatrixOne 集群</a></h2>

1. 执行下面的命令，获取 MatrixOne 集群的初始用户名和密码：

    ```
    SECRET_NAME=$(kubectl -n ${NS} get matrixonecluster mo --template='{{.status.credentialRef.name}}')
    MO_USR=$(kubectl -n ${NS} get secret ${SECRET_NAME} --template='{{.data.username}}' | base64 -d)
    MO_PWD=$(kubectl -n ${NS} get secret ${SECRET_NAME} --template='{{.data.password}}' | base64 -d)
    ```

2. 默认配置的 MatrixOne 集群只允许所在 k8s 集群内的客户端进行访问。你可以通过下面列举的两种方法之一连接到 MatrixOne 集群上：

    - 在 k8s 集群内的启动一个临时 Pod，在 Pod 内连接 MatrixOne 集群：

    ```
    kubectl -n ${NS} run --rm mysql-shell -it --image=mysql -- mysql -h mo-tp-cn -P6001 -u${MO_USR} -p${MO_PWD}
    ```

    - 通过 kubectl port-forward 将目标服务映射到本地端口上进行访问：

    ```
    nohup kubectl -n mo port-forward svc/mo-tp-cn 6001:6001 &
    mysql -h 127.0.0.1 -P6001 -u${MO_USR} -p${MO_PWD}
    ```

## <h2><a name="delete_mo_cluster">删除 MatrixOne 集群</a></h2>

如果需要删除集群，只需要删除<a href="#create_mo_cluster">步骤 3</a>中创建的 MatrixOne 对象，可以执行下面的命令进行删除：

```
kubectl -n ${NS} delete -f mo-cluster.yaml
```

假如 MinIO 中的数据已经不再需要，执行下面的命令，可以删除<a href="#create_mo_cluster">步骤 3</a>创建的 MinIO：

```
kubectl -n mo-system delete -f https://raw.githubusercontent.com/matrixorigin/matrixone-operator/main/examples/minio.yaml
```
