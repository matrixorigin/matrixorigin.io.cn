# 集群部署指南

本篇文档将主要讲述如何在已存在 **Kubernetes** 和 **S3** 环境的基础上部署一个 **MatrixOne 集群**。

## 资源需求

### 体验环境

MatrixOne 集群体验环境可用于简单体验测试、学习或开发，但不适合进行业务生产。以下为体验环境的资源规划：

容器资源：

|组件        |作用     | 服务副本  | 副本分布策略建议     |cpu(C) |内存 (G) | 存储资源类型 | 存储卷格式 |存储大小 (G) | 访问模式  |
| :-------- | :------ | :------ | :---------------- | :---|:----- | :------ | :------- |:-------- |:------------ |
|logservice | 日志管理  | 3      | 3 个节点，每节点 1 副本 | 2   | 4    | PVC     | 文件系统   | 100      | ReadWriteOnce|
|tn         | 远数据管理 | 1     | 单节点单副本        | 4  | 8    | PVC     | 文件系统   | 100      | ReadWriteOnce|
|cn         | 数据计算  | 1      | 单节点单副本 | 2  | 4    | PVC     | 文件系统   | 100     | ReadWriteOnce|

对象存储资源 (S3)：

| 组件                | 接口协议 | 存储大小 (G)|
| :----------------- | :------ | :------  |
|业务、监控、日志等数据  | s3v4    | >=50    |

### 推荐环境

MatrixOne 集群推荐环境具备高可用性、可靠性和强大的性能，可用于实际业务生产。以下为推荐环境的资源规划：

容器资源：

|组件        |作用     | 服务副本  | 副本分布策略建议     |cpu(C) |内存 (G) | 存储资源类型 | 存储卷格式 |存储大小 (G) | 访问模式  |
| :-------- | :------ | :------ | :---------------- | :---|:----- | :------ | :------- |:-------- |:------------ |
|logservice | 日志管理  | 3      | 3 个节点，每节点 1 副本 | 4   | 8    | PVC     | 文件系统   | 100      | ReadWriteOnce|
|tn         | 远数据管理 | 1     | 单节点单副本        | 16  | 64    | PVC     | 文件系统   | 100      | ReadWriteOnce|
|cn         | 数据计算  | N      | N 根据业务需求定，高可用建议 2+ | 16  | 32    | PVC     | 文件系统   | 100      | ReadWriteOnce|

对象存储资源 (S3)：

| 组件                | 接口协议 | 存储大小 (G)     | IOPS                              | 带宽      |
| :----------------- | :------ | :------  | :--------------------------------- | :------ |
|业务、监控、日志等数据  | s3v4    | 根据业务定，建议>=500    | 顺序读写：>=2000，非顺序读写：>=10000  | >=10GB  |

如需了解资源需求的更多信息请参考集群拓扑规划章节中的[体验环境](../deployment-topology/experience-deployment-topology.md)和[推荐生产环境](../deployment-topology/recommended-prd-deployment-topology.md)。

## 前置条件

在开始之前，请确保已经准备好以下环境：

- 符合资源需求的 Kubernetes 集群环境和 s3 环境

- 一台能连接 Kubernetes 集群的客户端机器。

- 客户端机器需安装好 helm、kubectl 客户端，并配置访问集群的 kubeconfig 文件，权限是能够部署 helm chart 包和安装 CRD 资源对象。

- 具备外网访问条件，如 github.io、hub.docker.com 等；如果无法访问外网，需要提供一个私有镜像仓库用于上传相关镜像，并在 mo 集群 yaml 定义中，修改镜像仓库地址为私有仓库地址。

- 集群节点能访问到对象存储，比如能解析对象存储所在域名。

__Note__: 以下操作如无说明，均在客户端机器执行。

## 部署 MatrixOne Operator

[MatrixOne Operator](https://github.com/matrixorigin/matrixone-operator) 是一个在 Kubernetes 上部署和管理 MatrixOne 集群的独立软件工具，安装步骤如下：

1. 为 Operator 创建一个独立的命名空间 mo-op

    ```
    NS="mo-op"
    kubectl create ns "${NS}"
    kubectl get ns  # 返回有 mo-op
    ```

2. 下载并解压 matrixone-operator 安装包

    ```
    wget https://github.com/matrixorigin/matrixone-operator/releases/download/chart-1.1.0-alpha2/matrixone-operator-1.1.0-alpha2.tgz
    tar xvf matrixone-operator-1.1.0-alpha2.tgz
    ```

    如 github 原地址下载过慢，您可尝试从以下地址下载镜像包：

    ```
    wget https://githubfast.com/matrixorigin/matrixone-operator/releases/download/chart-1.1.0-alpha2/matrixone-operator-1.1.0-alpha2.tgz
    ```
  
    解压后会在当前目录生产文件夹 `matrixone-operator`。

3. 部署 matrixone-operator

    ```
    NS="mo-op"
    cd matrixone-operator/
    helm install -n ${NS} mo-op ./ --dependency-update # 成功应返回 deployed 的状态
    ```

    上述依赖的 docker 镜像清单为：

    - matrixorigin/matrixone-operator:1.1.0-alpha.2
    - matrixorigin/mobr:1.0.0-rc1
    - openkruise/kruise-manager

    详情可查看 matrixone-operator/values.yaml。

4. 检查 operator 部署状态

    ```
    NS="mo-op"
    helm list -n "${NS}"  # 返回有对应的 helm chart 包，部署状态为 deployed
    kubectl get pod -n "${NS}" -owide # 返回有一个 pod 副本，状态为 Running
    ```

如需了解有关 Matrixone Operator 的更多信息，请查看 [Operator 管理](../../Deploy/MatrixOne-Operator-mgmt.md)。

## 部署 MatrixOne

本节介绍了 YAML 和 Chart 两种部署 MatrixOne 的方式。

### 开始前准备

1. 创建 MatrixOne 的命名空间 `mo`：

    ```
    NS="mo"
    kubectl create ns "${NS}"
    kubectl get ns  # 返回有 mo
    ```

    !!! note
        建议这个命名空间与 MatrixOne Operator 的命名空间分开，不要使用同一个。

2. 执行以下命令，在命名空间 mo 中创建用于访问 s3 的 Secret 服务：

    S3 如果通过 HTTP 协议访问，不需要提供 CA 证书

    ```
    NS="mo"
    name="s3mo"

    kubectl -n "${NS}" create secret generic "${name}" --from-literal=AWS_ACCESS_KEY_ID=51e1bHqcbfKla0fuakAtoJ2LMEvKThg4NiMjxxxx --from-literal=AWS_SECRET_ACCESS_KEY=aDMWw1hO2rqxltyIcBN6sy8qE_leIgzo6Satxxxx
    #根据实际修改
    kubectl get secret -n "${NS}" "${name}" -oyaml # 正常输出密钥信息
    ```

    S3 通过 HTTPS 协议访问则需要提供 CA 证书，并且在开始前要先执行相关操作和配置相关的文件，步骤如下：

    - 基于 ca 证书文件，创建一个 Kubernetes 的 secret（密钥）对象：

    ```
    NS=mo
    ca_file_path="/data/deploy/csp_cert/ca.crt" # 证书在密钥中定义的文件路径
    ca_file_name="csp.cert" # 证书在密钥中定义的文件名称
    ca_secret_name="csp.cert" # 证书密钥本身的名称
    # 创建密钥
    kubectl -n ${ns} create secret generic ${ca_secret_name} --from-file=${ca_file_name}=${ca_file_path}
    ```

    - 在  MatrixOne 集群对象的 yaml 文件（下述部署步骤中的 mo.yaml 和 values.yaml 文件）中配置 spec.logService.sharedStorage.s3.certificateRef 中配置相关的设置，如下：

    ```
    sharedStorage:
      s3:
        endpoint: xx.yy.com
        path: mypath
        # secretRef is required when there is no environment based auth available.
        secretRef:
          # secretRef.name 对应 ca_secret_name
          name: csp
        certificateRef:
          # certificateRef.name 对应${ca_file_name}
          name: csp.cert
          files:
          # certificateRef.files 数组下面的值对应${ca_file_path}
          - csp.cert
    ```

3. 给机器添加标签

    以下标签是部署前需要打到节点上的，否则会调度失败。下述标签原则上建议是找不同的节点打，且根据副本需要打多个节点，如无法满足也至少需要把下述标签打到 1 个节点上。（建议 7 个不同节点）

    ```
    matrixone/cn: true
    matrixone/tn: true
    matrixone/lg: true
    ```

    第一组：找三台不同的机器，分别打上 cn 的标签。

    ```
    NODE_1="10.0.0.1" # 更换为实际的 IP
    NODE_2="10.0.0.2" # 更换为实际的 IP
    NODE_3="10.0.0.3" # 更换为实际的 IP

    kubectl label node ${NODE_1} matrixone/cn: true
    kubectl label node ${NODE_2} matrixone/cn: true
    kubectl label node ${NODE_3} matrixone/cn: true
    ```

    第二组：找第 4 台不同的机器，分别打上 tn 的标签。

    ```
    NODE_4="10.0.0.4" # 更换为实际的 IP

    kubectl label node ${NODE_4} matrixone/tn: true
    ```

    第三组：找三台不同的机器，分别打上 log 的标签。

    ```
    NODE_5="10.0.0.5" # 更换为实际的 IP
    NODE_6="10.0.0.6" # 更换为实际的 IP
    NODE_7="10.0.0.7" # 更换为实际的 IP

    kubectl label node ${NODE_5} matrixone/lg: true
    kubectl label node ${NODE_6} matrixone/lg: true
    kubectl label node ${NODE_7} matrixone/lg: true
    ```

### yaml 方式部署

1. 自定义 MatrixOne 集群的 yaml 文件，编写如下 mo.yaml 的文件（按实际情况修改资源请求）：

    ```
    apiVersion: core.matrixorigin.io/v1alpha1
    kind: MatrixOneCluster
    metadata:
      name: mo
      namespace: mo

    spec:
      # 1. 配置 cn
      cnGroups:
      - cacheVolume:
          size: 800Gi
        config: |2
          [log]
          level = "info"
        name: cng1
        nodeSelector:# 添加标签，根据实际添加
          matrixone/cn: "true"
        serviceType: NodePort
        nodePort: 31429
        replicas: 3
        resources:
          requests:
            cpu: 16000m
            memory: 64000Mi
          limits:
            cpu: 16000m
            memory: 64000Mi
        overlay:
          env:
          - name: GOMEMLIMIT
            value: "57600MiB"  
      # 2. 配置 tn
      tn:
        cacheVolume:
          size: 100Gi
        config: |2

          [log]
          level = "info"
        nodeSelector:
          matrixone/tn: "true"
        replicas: 1
        resources:
          requests:
            cpu: 16000m
            memory: 64000Mi
          limits:
            cpu: 16000m
            memory: 64000Mi
      # 3. 配置 logservice
      logService:
        config: |2
          [log]
          level = "info"
        nodeSelector: 
          matrixone/lg: "true"
        pvcRetentionPolicy: Retain
        replicas: 3
        # 配置 logservice 对接的 s3 存储
        sharedStorage:
          s3:
            endpoint: s3-qos.iot.qiniuec-test.com 
            path: mo-test
            s3RetentionPolicy: Retain
            secretRef: #配置访问 s3 的密钥即 secret，名称为 s3mo
              name: s3mo
        volume:
          size: 100Gi 
        resources:
          requests:
            cpu: 4000m
            memory: 16000Mi
          limits:
            cpu: 4000m
            memory: 16000Mi
      topologySpread:
      - kubernetes.io/hostname
      imagePullPolicy: IfNotPresent
      imageRepository: registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone
      version: 1.1.1 #此处为 MO 镜像的版本
    ```

2. 执行以下命令，创建 MatrixOne 集群

    ```
    kubectl apply -f ./mo.yaml
    ```

### chart 方式部署

1. 向 helm 添加一个 matrixone-operator 仓库

    ```
    helm repo add matrixone-operator https://matrixorigin.github.io/matrixone-operator
    ```

2. 更新仓库

    ```
    helm repo update
    ```

3. 查看 MatrixOne Chart 版本

    ```
    helm search repo matrixone-operator/matrixone --devel
    ```

    示例返回

    ```
    > helm search repo matrixone-operator/matrixone --devel
    NAME                                 	CHART VERSION	APP VERSION	DESCRIPTION
    matrixone-operator/matrixone         	0.1.0        	1.16.0     	A Helm chart to deploy MatrixOne on K8S
    matrixone-operator/matrixone-operator	1.1.0-alpha2 	0.1.0      	Matrixone Kubernetes Operator
    helm search repo matrixone-operator/matrixone --devel
    ```

4. 部署 MatrixOne

    修改 values.yaml 文件，清空原文件，替换为以下内容（按实际情况修改资源请求）：

    ```
    # 1. 配置 cn
    cnGroups:
    - cacheVolume:
        size: 800Gi
    config: |2
        [log]
        level = "info"
    name: cng1
    nodeSelector:
        matrixone/cn: "true"
    serviceType: NodePort
    nodePort: 31429
    replicas: 3 # cn 的副本数
    resources:
        requests:
        cpu: 16000m
        memory: 64000Mi
        limits:
        cpu: 16000m
        memory: 64000Mi
    overlay:
        env:
        - name: GOMEMLIMIT
        value: "57600MiB"  
    # 2. 配置 tn
    tn:
    cacheVolume:
        size: 100Gi
    config: |2

        [log]
        level = "info"
    nodeSelector:
        matrixone/tn: "true"
    replicas: 1 # tn 的副本数，不可修改。当前版本仅支持设置为 1。
    resources:
        requests:
        cpu: 16000m
        memory: 64000Mi
        limits:
        cpu: 16000m
        memory: 64000Mi
    # 3. 配置 logService
    logService:
    config: |2
        [log]
        level = "info"
    nodeSelector: 
        matrixone/lg: "true"
    pvcRetentionPolicy: Retain
    replicas: 3 # logService 的副本数
    #配置 logService 对接的 s3 存储
    sharedStorage:
        s3:
        endpoint: s3-qos.iot.qiniuec-test.com  
        path: mo-test
        s3RetentionPolicy: Retain
        secretRef: #配置访问 s3 的密钥即 secret，名称为 s3mo
            name: s3mo
    volume:
        size: 100Gi
    resources:
        requests:
        cpu: 4000m
        memory: 16000Mi
        limits:
        cpu: 4000m
        memory: 16000Mi
    topologySpread:
    - kubernetes.io/hostname
    imagePullPolicy: IfNotPresent
    imageRepository: registry.cn-shanghai.aliyuncs.com/matrixorigin/matrixone
    version: 1.1.1 #此处为 MO 镜像的版本
    ```

    安装 MatrixOne Chart（这会部署一个 MatrixOneCluster 对象）
  
    ```
    NS="mo"
    RELEASE_NAME="mo_chart"
    VERSION=v1
    helm install -n ${NS} ${RELEASE_NAME} matrixone-operator/matrixone --version ${VERSION} -f values.yaml
    ```

### 检查集群状态

观察集群状态，直至 Ready

```
NS="mo"
kubectl get mo -n "${NS}" # 等待状态为 Ready
```

观察 pod 状态，直至所有为 Running

```
NS="mo"
kubectl get pod -n "${NS}" -owide # 等待状态为 Running
```

## 连接 MatrixOne 集群

为了连接 MatrixOne 集群，您需要将对应服务的端口映射到 MatrixOne 节点上。以下是使用 `kubectl port-forward` 连接 MatrixOne 集群的指导：

- 只允许本地访问：

   ```
   nohup kubectl  port-forward -nmo svc/svc_name 6001:6001 &
   ```

- 指定某台机器或者所有机器访问：

   ```
   nohup kubectl  port-forward -nmo --address 0.0.0.0 svc/svc_name 6001:6001 &
   ```

在指定**允许本地访问**或**指定某台机器或者所有机器访问**后，你可以使用 MySQL 客户端连接 MatrixOne：

```
# 使用 'mysql' 命令行工具连接到MySQL服务
# 使用 'kubectl get svc/svc_name  -n mo -o jsonpath='{.spec.clusterIP}' ' 获取Kubernetes集群中服务的集群IP地址
# '-h' 参数指定了MySQL服务的主机名或IP地址
# '-P' 参数指定了MySQL服务的端口号，这里是6001
# '-uroot' 表示用root用户登录
# '-p111' 表示初始密码是111
mysql -h $(kubectl get svc/svc_name  -n mo -o jsonpath='{.spec.clusterIP}') -P 6001 -uroot -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 163
Server version: 8.0.30-MatrixOne-v1.1.1 MatrixOne

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

显式 `mysql>` 后，分布式的 MatrixOne 集群搭建连接完成。

!!! info
    上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../../Security/password-mgmt.md)。
