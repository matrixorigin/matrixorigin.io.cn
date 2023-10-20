# 集群部署指南

本篇文档将主要讲述如何从 0 开始部署一个基于**私有化 Kubernetes 集群的云原生存算分离的分布式数据库 MatrixOne**。

## **主要步骤**

1. 部署 Kubernetes 集群
2. 部署对象存储 MinIO  
3. 创建并连接 MatrixOne 集群

## **名词解释**

由于该文档会涉及到众多 Kubernetes 相关的名词，为了让大家能够理解搭建流程，这里对涉及到的重要名词进行简单解释，如果需要详细了解 Kubernetes 相关的内容，可以直接参考 [Kubernetes 中文社区 | 中文文档](http://docs.kubernetes.org.cn/)

- Pod

   Pod 是 Kubernetes 中最小的资源管理组件，Pod 也是最小化运行容器化应用的资源对象。一个 Pod 代表着集群中运行的一个进程。简单理解，我们可以把一组提供特定功能的应用称为一个 pod，它会包含一个或者多个容器对象，共同对外提供服务。

- Storage Class

   Storage Class，简称 **SC**，用于标记存储资源的特性和性能，管理员可以将存储资源定义为某种类别，正如存储设备对于自身的配置描述（Profile）。根据 SC 的描述可以直观的得知各种存储资源的特性，就可以根据应用对存储资源的需求去申请存储资源了。

- CSI

   Kubernetes 提供了 **CSI** 接口（Container Storage Interface，容器存储接口），基于 CSI 这套接口，可以开发定制出 CSI 插件，从而支持特定的存储，达到解耦的目的。

- PersistentVolume

   PersistentVolume，简称 **PV**，PV 作为存储资源，主要包括存储能力、访问模式、存储类型、回收策略、后端存储类型等关键信息的设置。

- PersistentVolumeClaim

   PersistentVolumeClaim，简称 **PVC**，作为用户对存储资源的需求申请, 主要包括存储空间请求、访问模式、PV 选择条件和存储类别等信息的设置。

- Service

   也叫做 **SVC**，通过标签选择的方式匹配一组 Pod 对外访问服务的一种机制, 每一个 svc 可以理解为一个微服务。

- Operator

   Kubernetes Operator 是一种封装、部署和管理 Kubernetes 应用的方法。我们使用 Kubernetes API（应用编程接口）和 kubectl 工具在 Kubernetes 上部署并管理 Kubernetes 应用。

## 部署架构

### 依赖组件

MatrixOne 分布式系统依赖于以下组件：

- Kubernetes：作为整个 MatrixOne 集群的资源管理平台，包括 Logservice、CN、TN 等组件，都在由 Kubernetes 管理的 Pod 中运行。如果发生故障，Kubernetes 将负责剔除故障的 Pod 并启动新的 Pod 进行替换。

- Minio：为整个 MatrixOne 集群提供对象存储服务，MatrixOne 的所有数据存储在由 Minio 提供的对象存储中。

此外，为了在 Kubernetes 上进行容器管理和编排，我们需要以下插件：

- Helm：Helm 是一个用于管理 Kubernetes 应用程序的包管理工具，类似于 Ubuntu 的 APT 和 CentOS 的 YUM。它用于管理预先配置的安装包资源，称为 Chart。

- local-path-provisioner：作为 Kubernetes 中实现了 CSI（Container Storage Interface）接口的插件，local-path-provisioner 负责为 MatrixOne 各组件的 Pod 和 Minio 创建持久化卷（PV），以便实现数据的持久化存储。

### 整体架构

整体的部署架构如下图所示：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-arch-overall.png)

整体架构由以下组件组成：

- 底层是三个服务器节点：第一台作为安装 Kubernetes 跳板机的 host1，第二台是 Kubernetes 的主节点（master），第三台是 Kubernetes 的工作节点（node）。

- 上层是已安装的 Kubernetes 和 Docker 环境，构成云原生平台层。

- 基于 Helm 进行管理的 Kubernetes 插件层，包括实现 CSI 接口的 local-path-storage 插件、Minio 和 MatrixOne Operator。

- 最顶层是由这些组件配置生成的多个 Pod 和 Service。

### MatrixOne 的 Pod 及存储架构

MatrixOne 根据 Operator 的规则创建一系列的 Kubernetes 对象，这些对象根据组件分类并归类到资源组中，分别为 CNSet、TNSet 和 LogSet。

- Service：每个资源组中的服务需要通过 Service 进行对外提供。Service 承载了对外连接的功能，确保在 Pod 崩溃或被替换时仍能提供服务。外部应用程序通过 Service 的公开端口连接，而 Service 则通过内部转发规则将连接转发到相应的 Pod。

- Pod：MatrixOne 组件的容器化实例，其中运行着 MatrixOne 的核心内核代码。

- PVC：每个 Pod 都通过 PVC（Persistent Volume Claim）声明自己所需的存储资源。在我们的架构中，CN 和 TN 需要申请一块存储资源作为缓存，而 LogService 则需要相应的 S3 资源。这些需求通过 PVC 进行声明。

- PV：PV（Persistent Volume）是存储介质的抽象表示，可以看作是存储单元。在 PVC 的申请后，通过实现 CSI 接口的软件创建 PV，并将其与申请资源的 PVC 进行绑定。

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-arch-pod.png)

## **1. 部署 Kubernetes 集群**

由于 MatrixOne 的分布式部署依赖于 Kubernetes 集群，因此我们需要一个 Kubernetes 集群。本篇文章将指导你通过使用 **Kuboard-Spray** 的方式搭建一个 Kubernetes 集群。

### **准备集群环境**

对于集群环境，需要做如下准备：

- 3 台虚拟机
- 操作系统使用 CentOS 7.9 (需要允许 root 远程登入)：其中两台作为部署 Kubernetes 以及 MatrixOne 相关依赖环境的机器，另外一台作为跳板机，来搭建 Kubernetes 集群。
- 外网访问条件。3 台服务器都需要进行外网镜像拉取。

各个机器情况分布具体如下所示：

| **Host**     | **内网 IP**        | **外网 IP**      | **mem** | **CPU** | **Disk** | **Role**    |
| ------------ | ------------- | --------------- | ------- | ------- | -------- | ----------- |
| kuboardspray | 10.206.0.6    | 1.13.2.100      | 2G      | 2C      | 50G      | 跳板机      |
| master0      | 10.206.134.8  | 118.195.255.252 | 8G      | 2C      | 50G      | master etcd |
| node0        | 10.206.134.14 | 1.13.13.199     | 8G      | 2C      | 50G      | worker      |

#### **跳板机部署 Kuboard Spray**

Kuboard-Spray 是用来可视化部署 Kubernetes 集群的一个工具。它会使用 Docker 快速拉起一个能够可视化部署 Kubernetes 集群的 Web 应用。Kubernetes 集群环境部署完成后，可以将该 Docker 应用停掉。

##### **跳板机环境准备**

1. 安装 Docker：由于会使用到 Docker，因此需要具备 Docker 的环境。使用以下命令在跳板机安装并启动 Docker：

    ```
    curl -sSL https://get.docker.io/ | sh
    #如果在国内的网络受限环境下，可以换以下国内镜像地址
    curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
    ```

2. 启动 Docker：

    ```
    [root@VM-0-6-centos ~]# systemctl start docker
    [root@VM-0-6-centos ~]# systemctl status docker
    ● docker.service - Docker Application Container Engine
       Loaded: loaded (/usr/lib/systemd/system/docker.service; disabled; vendor preset: disabled)
       Active: active (running) since Sun 2023-05-07 11:48:06 CST; 15s ago
         Docs: https://docs.docker.com
     Main PID: 5845 (dockerd)
        Tasks: 8
       Memory: 27.8M
       CGroup: /system.slice/docker.service
               └─5845 /usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock

    May 07 11:48:06 VM-0-6-centos systemd[1]: Starting Docker Application Container Engine...
    May 07 11:48:06 VM-0-6-centos dockerd[5845]: time="2023-05-07T11:48:06.391166236+08:00" level=info msg="Starting up"
    May 07 11:48:06 VM-0-6-centos dockerd[5845]: time="2023-05-07T11:48:06.421736631+08:00" level=info msg="Loading containers: start."
    May 07 11:48:06 VM-0-6-centos dockerd[5845]: time="2023-05-07T11:48:06.531022702+08:00" level=info msg="Loading containers: done."
    May 07 11:48:06 VM-0-6-centos dockerd[5845]: time="2023-05-07T11:48:06.544715135+08:00" level=info msg="Docker daemon" commit=94d3ad6 graphdriver=overlay2 version=23.0.5
    May 07 11:48:06 VM-0-6-centos dockerd[5845]: time="2023-05-07T11:48:06.544798391+08:00" level=info msg="Daemon has completed initialization"
    May 07 11:48:06 VM-0-6-centos systemd[1]: Started Docker Application Container Engine.
    May 07 11:48:06 VM-0-6-centos dockerd[5845]: time="2023-05-07T11:48:06.569274215+08:00" level=info msg="API listen on /run/docker.sock"
    ```

环境准备完成后，即可部署 Kuboard-Spray。

#### **部署 Kuboard-Spray**

执行以下命令安装 Kuboard-Spray：

```
docker run -d \
  --privileged \
  --restart=unless-stopped \
  --name=kuboard-spray \
  -p 80:80/tcp \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/kuboard-spray-data:/data \
  eipwork/kuboard-spray:latest-amd64
```

如果由于网络问题导致镜像拉取失败，可以使用下面的备用地址：

```
docker run -d \
  --privileged \
  --restart=unless-stopped \
  --name=kuboard-spray \
  -p 80:80/tcp \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v ~/kuboard-spray-data:/data \
  swr.cn-east-2.myhuaweicloud.com/kuboard/kuboard-spray:latest-amd64
```

执行完成后，即可在浏览器输入 `http://1.13.2.100`（跳板机 IP 地址）打开 Kuboard-Spray 的 Web 界面，输入用户名 `admin`，默认密码 `Kuboard123`，即可登录 Kuboard-Spray 界面，如下所示：

![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-1.png)

登录之后，即可开始部署 Kubernetes 集群。

### **可视化部署 Kubernetes 集群**

登录 Kuboard-Spray 界面之后，即可开始可视化部署 Kubernetes 集群。

#### **导入 Kubernetes 相关资源包**

安装界面会通过在线下载的方式，下载 Kubernetes 集群所对应的资源包，以实现离线安装 Kubernetes 集群。

1. 点击**资源包管理**，选择对应版本的 Kubernetes 资源包下载：

    下载 `spray-v2.18.0b-2_k8s-v1.23.17_v1.24-amd64` 版本

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-2.png)

2. 点击**导入**后，选择**加载资源包**，选择合适的下载源，等待资源包下载完成。

    !!! note
        推荐您选择 Docker 作为用于 K8s 集群的容器引擎。选择 Docker 作为 K8s 的容器引擎后，Kuboard-Spray 会自动使用 Docker 来运行 K8s 集群的各个组件，包括 Master 节点和 Worker 节点上的容器。

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-3.png)

3. 此时会 `pull` 相关的镜像依赖：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-4.png)

4. 镜像资源包拉取成功后，返回 Kuboard-Spray 的 Web 界面，可以看到对应版本的资源包已经导入完成。

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-5.png)

#### **安装 Kubernetes 集群**

本章节将指导你进行 Kubernetes 集群的安装。

1. 选择**集群管理**，选择**添加集群安装计划**：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-6.png)

2. 在弹出的对话框中，定义集群的名称，选择刚刚导入的资源包的版本，再点击**确定**。如下图所示：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-7.png)

##### **集群规划**

按照事先定义好的角色分类，Kubernetes 集群采用 `1 master + 1 worker +1 etcd` 的模式进行部署。

在上一步定义完成集群名称，并选择完成资源包版本，点击**确定**之后，接下来可以直接进入到集群规划阶段。

1. 选择对应节点的角色和名称：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-8.png)

    - master 节点：选择 ETCD 和控制节点，并将其命名为 master0。（如果希望主节点也参与工作，可以同时选中工作节点。这种方式可以提高资源利用率，但会降低 Kubernetes 的高可用性。）
    - worker 节点：仅选择工作节点，并将其命名为 node0。

2. 在每一个节点填写完角色和节点名称后，请在右侧填写对应节点的连接信息，如下图所示：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-9.png)

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-9-1.png)

3. 填写完所有的角色之后，点击**保存**。接下来就可以准备安装 Kubernetes 集群了。

#### **开始安装 Kubernetes 集群**

在上一步填写完成所有角色，并**保存**后，点击**执行**，即可开始 Kubernetes 集群的安装。

1. 如下图所示，点击**确定**，开始安装 Kubernetes 集群：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-10.png)

2. 安装 Kubernetes 集群时，会在对应节点上执行 `ansible` 脚本，安装 Kubernetes 集群。整体事件会根据机器配置和网络不同，需要等待的时间不同，一般情况下需要 5 ~ 10 分钟。

    __Note:__ 如果出现错误，你可以看日志的内容，确认是否是 Kuboard-Spray 的版本不匹配，如果版本不匹配，请更换合适的版本。

3. 安装完成后，到 Kubernetes 集群的 master 节点上执行 `kubectl get node`：

    ```
    [root@master0 ~]# kubectl get node
    NAME      STATUS   ROLES                  AGE   VERSION
    master0   Ready    control-plane,master   52m   v1.23.17
    node0     Ready    <none>                 52m   v1.23.17
    ```

4. 命令结果如上图所示，即表示 Kubernetes 集群安装完成。

5. 在 Kubernetes 的每个节点上调整 DNS 路由表。请在每台机器上执行以下命令，查找包含 `169.254.25.10` 的 nameserver，并删除该记录。（该记录可能影响各个 Pod 之间的通信效率，如果不存在这条记录则无需更改）

    ```
    vim /etc/resolve.conf
    ```

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-10-1.png)

## **2. 部署 helm**

Helm 是一个用于管理 Kubernetes 应用程序的包管理工具。它通过使用 chart（预先配置的安装包资源）来简化应用程序的部署和管理过程。类似于 Ubuntu 的 APT 和 CentOS 的 YUM，Helm 提供了一种便捷的方式来安装、升级和管理 Kubernetes 应用程序。

在安装 Minio 之前，我们需要先安装 Helm，因为 Minio 的安装过程依赖于 Helm。以下是安装 Helm 的步骤：

__Note:__ 本章节均是在 master0 节点操作。

1. 下载 helm 安装包：

    ```
    wget https://get.helm.sh/helm-v3.10.2-linux-amd64.tar.gz
    #如果在国内的网络受限环境下，可以换以下国内镜像地址
    wget https://mirrors.huaweicloud.com/helm/v3.10.2/helm-v3.10.2-linux-amd64.tar.gz
    ```

2. 解压并安装：

    ```
    tar -zxf helm-v3.10.2-linux-amd64.tar.gz
    mv linux-amd64/helm /usr/local/bin/helm
    ```

3. 验证版本，查看是否安装完成：

    ```
    [root@k8s01 home]# helm version
    version.BuildInfo{Version:"v3.10.2", GitCommit:"50f003e5ee8704ec937a756c646870227d7c8b58", GitTreeState:"clean", GoVersion:"go1.18.8"}
    ```

    出现上面所示版本信息即表示安装完成。

## **3. CSI 部署**

CSI 为 Kubernetes 的存储插件，为 MinIO 和 MarixOne 提供存储服务。本章节将指导你使用 `local-path-provisioner` 插件。

__Note:__ 本章节均是在 master0 节点操作。

1. 使用下面的命令行，安装 CSI：

    ```
    wget https://github.com/rancher/local-path-provisioner/archive/refs/tags/v0.0.23.zip
    unzip v0.0.23.zip
    cd local-path-provisioner-0.0.23/deploy/chart/local-path-provisioner
    helm install --set nodePathMap[0].paths[0]="/opt/local-path-provisioner",nodePathMap[0].node=DEFAULT_PATH_FOR_NON_LISTED_NODES  --create-namespace --namespace local-path-storage local-path-storage ./
    ```

2. 安装成功后，命令行显示如下所示：

    ```
    root@master0:~# kubectl get pod -n local-path-storage
    NAME                                                        READY   STATUS    RESTARTS   AGE
    local-path-storage-local-path-provisioner-57bf67f7c-lcb88   1/1     Running   0          89s
    ```

    __Note:__ 安装完成后，该 storageClass 会在 worker 节点的 "/opt/local-path-provisioner" 目录提供存储服务。你可以修改为其它路径。

3. 设置缺省 `storageClass`：

    ```
    kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
    ```

4. 设置缺省成功后，命令行显示如下：

    ```
    root@master0:~# kubectl get storageclass
    NAME                   PROVISIONER                                               RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
    local-path (default)   cluster.local/local-path-storage-local-path-provisioner   Delete          WaitForFirstConsumer   true                   115s
    ```

## **4. MinIO 部署**

 MinIO 的作用是为 MatrixOne 提供对象存储。本章节将指导你部署一个单节点的 MinIO。

__Note:__ 本章节均是在 master0 节点操作。

### **安装启动**

1. 安装并启动 MinIO 的命令行如下：

    ```
    helm repo add minio https://charts.min.io/
    mkdir minio_ins && cd minio_ins
    helm fetch minio/minio
    ls -lth
    tar -zxvf minio-5.0.9.tgz # 这个版本可能会变，以实际下载到的为准
    cd ./minio/

    kubectl create ns mostorage

    helm install minio \
    --namespace mostorage \
    --set resources.requests.memory=512Mi \
    --set replicas=1 \
    --set persistence.size=10G \
    --set mode=standalone \
    --set rootUser=rootuser,rootPassword=rootpass123 \
    --set consoleService.type=NodePort \
    --set image.repository=minio/minio \
    --set image.tag=latest \
    --set mcImage.repository=minio/mc \
    --set mcImage.tag=latest \
    -f values.yaml minio/minio
    ```

    !!! note
         - `--set resources.requests.memory=512Mi` 设置了 MinIO 的内存最低消耗
              - `--set persistence.size=1G` 设置了 MinIO 的存储大小为 1G
              - `--set rootUser=rootuser,rootPassword=rootpass123` 这里的 rootUser 和 rootPassword 设置的参数，在后续创建 Kubernetes 集群的 scrects 文件时，需要用到，因此使用一个能记住的信息。
         - 如果由于网络或其他原因多次反复执行，需要先卸载：

             ```
             helm uninstall minio --namespace mostorage
             ```

2. 安装并启动 MinIO 成功后，命令行显示如下所示：

    ```
    NAME: minio
    LAST DEPLOYED: Sun May  7 14:17:18 2023
    NAMESPACE: mostorage
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    NOTES:
    MinIO can be accessed via port 9000 on the following DNS name from within your cluster:
    minio.mostorage.svc.cluster.local

    To access MinIO from localhost, run the below commands:

      1. export POD_NAME=$(kubectl get pods --namespace mostorage -l "release=minio" -o jsonpath="{.items[0].metadata.name}")

      2. kubectl port-forward $POD_NAME 9000 --namespace mostorage

    Read more about port forwarding here: http://kubernetes.io/docs/user-guide/kubectl/kubectl_port-forward/

    You can now access MinIO server on http://localhost:9000. Follow the below steps to connect to MinIO server with mc client:

      1. Download the MinIO mc client - https://min.io/docs/minio/linux/reference/minio-mc.html#quickstart

      2. export MC_HOST_minio-local=http://$(kubectl get secret --namespace mostorage minio -o jsonpath="{.data.rootUser}" | base64 --decode):$(kubectl get secret --namespace mostorage minio -o jsonpath="{.data.rootPassword}" | base64 --decode)@localhost:9000

      3. mc ls minio-local
    ```

    目前为止，Minio 已经成功安装完毕。在后续的 MatrixOne 安装过程中，MatrixOne 将直接通过 Kubernetes 的 Service（SVC）与 Minio 进行通信，无需进行额外的配置。

    然而，如果您希望从 `localhost` 连接到 Minio，可以执行以下命令行来设置 `POD_NAME` 变量，并将 `mostorage` 连接到 9000 端口：

    ```
    export POD_NAME=$(kubectl get pods --namespace mostorage -l "release=minio" -o jsonpath="{.items[0].metadata.name}")
    nohup kubectl port-forward --address 0.0.0.0 $POD_NAME -n mostorage 9000:9000 &
    ```

3. 启动后，使用 <http://118.195.255.252:32001/> 即可登录 MinIO 的页面，创建对象存储的信息。如下图所示，账户密码即上述步骤中 `--set rootUser=rootuser,rootPassword=rootpass123` 设置的 rootUser 和 rootPassword：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-13.png)

4. 登录完成后，你需要创建对象存储相关的信息：

    点击 **Bucket > Create Bucket**，在 **Bucket Name** 中填写 Bucket 的名称 **minio-mo**。填写完成后，点击右下方按钮 **Create Bucket**。

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/deploy-mo-cluster-14.png)

## **5. MatrixOne 集群部署**

本章节将指导你部署 MatrixOne 集群。

__Note:__ 本章节均是在 master0 节点操作。

#### **安装 MatrixOne-Operator**

[MatrixOne Operator](https://github.com/matrixorigin/matrixone-operator) 是一个在 Kubernetes 上部署和管理 MatrixOne 集群的独立软件工具。你可以从项目的 [Release 列表](https://github.com/matrixorigin/matrixone-operator/releases)中选择最新的 Operator Release 安装包进行安装。

按照以下步骤在 master0 上安装 MatrixOne Operator。我们将为 Operator 创建一个独立的命名空间 `matrixone-operator`。

1. 添加 matrixone-operator 地址到 helm 仓库：

    ```
    helm repo add matrixone-operator https://matrixorigin.github.io/matrixone-operator
    ```

2. 更新仓库：

    ```
    helm repo update
    ```

3. 查看 MatrixOne Operator 版本：

    ```
    helm search repo matrixone-operator/matrixone-operator --versions --devel
    ```

4. 指定发布版本安装 MatrixOne Operator：

    ```
    helm install matrixone-operator matrixone-operator/matrixone-operator --version <VERSION> --create-namespace --namespace matrixone-operator
    ```

    !!! note
        参数 VERSION 为要部署的 MatrixOne Operator 的版本号，如 1.0.0-alpha.2。
        安装最新版本的话，命名为:
        helm install mo matrixone-operator/matrixone-operator

6. 安装成功后，使用以下命令确认安装状态：

    ```
    kubectl get pod -n matrixone-operator
    ```

    确保上述命令输出中的所有 Pod 状态都为 Running。

    ```
    [root@master0 matrixone-operator]# kubectl get pod -n matrixone-operator
    NAME                                 READY   STATUS    RESTARTS   AGE
    matrixone-operator-f8496ff5c-fp6zm   1/1     Running   0          3m26s
    ```

如上代码行所示，对应 Pod 状态均正常。

### **创建 MatrixOne 集群**

1. 首先创建 MatrixOne 的命名空间：

    ```
    NS="mo-hn"
    kubectl create ns ${NS}
    ```

2. 自定义 MatrixOne 集群的 `yaml` 文件，编写如下 `mo.yaml` 的文件：

    ```
    apiVersion: core.matrixorigin.io/v1alpha1
    kind: MatrixOneCluster
    metadata:
      name: mo
      namespace: mo-hn
    spec:
      # 1. 配置 tn
      tn:
        cacheVolume: # tn的磁盘缓存
          size: 5Gi # 根据实际磁盘大小和需求修改
          storageClassName: local-path # 如果不写，会用系统默认的storage class
        resources:
          requests:
            cpu: 100m #1000m=1c
            memory: 500Mi # 1024Mi
          limits: # 注意limits不能低于requests，也不能超过单节点的能力，一般根据实际情况来分配，一般设置limits和requests一致即可
            cpu: 200m
            memory: 1Gi
        config: |  # tn的配置
          [dn.Txn.Storage]
          backend = "TAE"
          log-backend = "logservice"
          [dn.Ckp]
          flush-interval = "60s"
          min-count = 100
          scan-interval = "5s"
          incremental-interval = "60s"
          global-interval = "100000s"
          [log]
          level = "error"
          format = "json"
          max-size = 512
        replicas: 1 # tn的副本数，不可修改。当前版本仅支持设置为 1。
      # 2. 配置 logservice
      logService:
        replicas: 3 # logservice的副本数
        resources:
          requests:
            cpu: 100m #1000m=1c
            memory: 500Mi # 1024Mi
          limits: # 注意limits不能低于requests，也不能超过单节点的能力，一般根据实际情况来分配，一般设置limits和requests一致即可
            cpu: 200m
            memory: 1Gi
        sharedStorage: # 配置 logservice 对接的 s3 存储
          s3:
            type: minio # 所对接的 s3 存储类型为 minio
            path: minio-mo # 给 mo 用的 minio 桶的路径，此前通过控制台或 mc 命令创建
            endpoint: http://minio.mostorage:9000 # 此处为 minio 服务的 svc 地址和端口
            secretRef: # 配置访问 minio 的密钥即 secret，名称为 minio
              name: minio
        pvcRetentionPolicy: Retain # 配置集群销毁后，pvc 的周期策略，Retain 为保留，Delete 为删除
        volume:
          size: 1Gi # 配置 S3 对象存储的大小，根据实际磁盘大小和需求修改
        config: | # logservice 的配置
          [log]
          level = "error"
          format = "json"
          max-size = 512
      # 3. 配置 cn
      tp:
        cacheVolume: # cn 的磁盘缓存
          size: 5Gi # 根据实际磁盘大小和需求修改
          storageClassName: local-path # 如果不写，会用系统默认的 storage class
        resources:
          requests:
            cpu: 100m #1000m=1c
            memory: 500Mi # 1024Mi
          limits: # 注意limits不能低于requests，也不能超过单节点的能力，一般根据实际情况来分配，一般设置limits和requests一致即可
            cpu: 200m
            memory: 2Gi
        serviceType: NodePort # cn 需要对外提供访问入口，其 svc 设置为 NodePort
        nodePort: 31429 # nodePort 端口设置
        config: | # cn 的配置
          [cn.Engine]
          type = "distributed-tae"
          [log]
          level = "debug"
          format = "json"
          max-size = 512
        replicas: 1
      version: nightly-54b5e8c # 此处为 MO 镜像的版本，可通过 dockerhub 查阅，一般 cn、tn、logservice 为同一个镜像打包，所以用同一个字段指定即可，也支持单独在各自部分中指定，但无特殊情况请用统一的镜像版本
      # https://hub.docker.com/r/matrixorigin/matrixone/tags
      imageRepository: matrixorigin/matrixone # 镜像仓库地址，如果本地拉取后，有修改过 tag，那么可以调整这个配置项
      imagePullPolicy: IfNotPresent # 镜像拉取策略，与 k8s 官方可配置值一致
    ```

3. 执行以下命令，在命名空间 `mo-hn` 中创建用于访问 MinIO 的 Secret 服务：

    ```
    kubectl -n mo-hn create secret generic minio --from-literal=AWS_ACCESS_KEY_ID=rootuser --from-literal=AWS_SECRET_ACCESS_KEY=rootpass123
    ```

    其中，用户名和密码使用在创建 MinIO 集群时设置的 `rootUser` 和 `rootPassword`。

4. 执行以下命令，部署 MatrixOne 集群：

    ```
    kubectl apply -f mo.yaml
    ```

5. 请耐心等待大约 10 分钟，如果出现 Pod 重启，请继续等待。直到你看到以下信息表示部署成功：

    ```
    [root@master0 mo]# kubectl get pods -n mo-hn      
    NAME                                 READY   STATUS    RESTARTS      AGE
    mo-tn-0                              1/1     Running   0             74s
    mo-log-0                             1/1     Running   1 (25s ago)   2m2s
    mo-log-1                             1/1     Running   1 (24s ago)   2m2s
    mo-log-2                             1/1     Running   1 (22s ago)   2m2s
    mo-tp-cn-0                           1/1     Running   0             50s
    ```

## **6. 连接 MatrixOne 集群**

为了连接 MatrixOne 集群，您需要将对应服务的端口映射到 MatrixOne 节点上。以下是使用 `kubectl port-forward` 连接 MatrixOne 集群的指导：

- 只允许本地访问：

   ```
   nohup kubectl  port-forward -nmo-hn svc/mo-tp-cn 6001:6001 &
   ```

- 指定某台机器或者所有机器访问：

   ```
   nohup kubectl  port-forward -nmo-hn --address 0.0.0.0 svc/mo-tp-cn 6001:6001 &
   ```

在指定**允许本地访问**或**指定某台机器或者所有机器访问**后，你可以使用 MySQL 客户端连接 MatrixOne：

```
# 使用 'mysql' 命令行工具连接到MySQL服务
# 使用 'kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}' ' 获取Kubernetes集群中服务的集群IP地址
# '-h' 参数指定了MySQL服务的主机名或IP地址
# '-P' 参数指定了MySQL服务的端口号，这里是6001
# '-uroot' 表示用root用户登录
# '-p111' 表示初始密码是111
mysql -h $(kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}') -P 6001 -uroot -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 163
Server version: 8.0.30-MatrixOne-v1.0.0-rc1 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

显式 `mysql>` 后，分布式的 MatrixOne 集群搭建连接完成。

!!! info
    上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../Security/password-mgmt.md)。
