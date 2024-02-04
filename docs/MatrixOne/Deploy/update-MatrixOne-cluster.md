# 版本升级

本篇文档将介绍如何**滚动升级**或者**重装升级** MatrixOne 集群。

本篇文档所介绍到的升级环境将基于 [MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)的环境。

## 滚动升级

滚动升级，是一种在线升级方式，即 MatrixOne 集群在保证部分或全部服务可用的情况下完成软件的升级。

[MatrixOne 分布式集群部署](deploy-MatrixOne-cluster.md)中介绍，安装 MatrixOne 分布式集群基于 Kubernetes 和 MatrixOne Operator，因此滚动升级 MatrixOne 就是通过动态修改 MatrixOne Operator 中的 MatrixOne 镜像版本号来实现自动的版本更新。

### 操作步骤

1. 在 master0 节点的终端上执行以下命令，进入动态修改 operator 使用的 `yaml` 配置文件的界面。

    ```
    mo_ns="mo-hn" #matrixone 集群的 namespace
    mo_cluster_name="mo" # matrixone 的集群名称，一般为 mo，根据部署时 matrixonecluster 对象的 yaml 文件中的 name 指定，也可以通过 kubectl get matrixonecluster -n${mo_ns}来确认
    #mo-hn 及 mo 已在安装部署的 mo.yaml 文件中设置
    kubectl edit matrixonecluster ${mo_cluster_name} -n${mo_ns}
    ```

2. 进入编辑模式后，修改 `spec.version` 的值，其中：

    - ${TAG}：为对应 dockerhub 上 Matrixone 的镜像 tag，例如：nightly-f0d52530

    - ${REPO_URL}：是 Matrixone 公开镜像仓库，默认为 matrixorigin/matrixone。假如目标版本在 MatrixOne 的公开镜像仓库不存在，则需要同时修改镜像仓库的 URL 为实际的仓库：

    ![image-20230407094237806](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/image-20230407094237806.png)

    ![image-20230407094251938](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/image-20230407094251938.png)

3. 修改完成后，按 `:wq` 保存即可，MatrixOne Operator 会自动拉取新版本的镜像，并重启组件服务，包括 Log Service，TN 和 CN，你也可以通过以下命令观察其运行状态。

    ```
    watch -e "kubectl get pod -n${mo_ns}"
    ```

    ```
    NAME                                 READY   STATUS    RESTARTS      AGE
    matrixone-operator-f8496ff5c-fp6zm   1/1     Running   0             24h
    mo-tn-0                              1/1     Running   1 (51s ago)   18h
    mo-log-0                             1/1     Running   0             18h
    mo-log-1                             1/1     Running   1 (5s ago)    18h
    mo-log-2                             1/1     Running   1 (53s ago)   18h
    mo-tp-cn-0                           1/1     Running   1 (53s ago)   18h
    ```

    如果发生 error、crashbackoff 等情况，可以通过查看组件的日志来进一步排查问题。

    ```
    # pod_name 是 pod 的名称，如 mo-tn-0,mo-tp-cn-0
    pod_name=mo-tn-0
    kubectl logs ${pod_name} -nmo-hn > /tmp/tn.log
    vim /tmp/tn.log
    ```

4. 当 MatrixOne 集群中的组件均 `Restart` 完成后，可以用 MySQL Client 连接集群，如果连接成功且用户数据均完整，则说明升级成功。

    ```
    # 使用 'mysql' 命令行工具连接到 MySQL 服务
    # 使用 'kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}' ' 获取 Kubernetes 集群中服务的集群 IP 地址
    # '-h' 参数指定了 MySQL 服务的主机名或 IP 地址
    # '-P' 参数指定了 MySQL 服务的端口号，这里是 6001
    # '-uroot' 表示用 root 用户登录
    # '-p111' 表示初始密码是 111
    root@master0 ~]# mysql -h $(kubectl get svc/mo-tp-cn -n mo-hn -o jsonpath='{.spec.clusterIP}') -P 6001 -uroot -p111
    Welcome to the MariaDB monitor.  Commands end with ; or \g.
    Your MySQL connection id is 1005
    Server version: 8.0.30-MatrixOne-v1.1.1 MatrixOne

    Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    MySQL [(none)]> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | mo_task            |
    | information_schema |
    | mysql              |
    | system_metrics     |
    | system             |
    | test               |
    | mo_catalog         |
    +--------------------+
    7 rows in set (0.01 sec)
    ```

    !!! note
        上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](../Security/password-mgmt.md)。

5. 滚动更新可能因为错误的配置而暂停（比如在升级时指定了不存在的版本）。此时，需重新修改 operator 动态配置，重置 version 号，回滚变更，已经失败的 Pod 将被重新更新。

6. 你可以通过以下命令查看当前 MatrixOne 部署的版本号：

    ```
    [root@master0 matrixone-operator]# kubectl get matrixoneclusters -n mo-hn -o yaml | grep version
            {"apiVersion":"core.matrixorigin.io/v1alpha1","kind":"MatrixOneCluster","metadata":{"annotations":{},"name":"mo","namespace":"mo-hn"},"spec":{"tn":{"cacheVolume":{"size":"5Gi","storageClassName":"local-path"},"config":"[dn.Txn.Storage]\nbackend = \"TAE\"\nlog-backend = \"logservice\"\n[dn.Ckp]\nflush-interval = \"60s\"\nmin-count = 100\nscan-interval = \"5s\"\nincremental-interval = \"60s\"\nglobal-interval = \"100000s\"\n[log]\nlevel = \"error\"\nformat = \"json\"\nmax-size = 512\n","replicas":1,"resources":{"limits":{"cpu":"200m","memory":"1Gi"},"requests":{"cpu":"100m","memory":"500Mi"}}},"imagePullPolicy":"IfNotPresent","imageRepository":"matrixorigin/matrixone","logService":{"config":"[log]\nlevel = \"error\"\nformat = \"json\"\nmax-size = 512\n","pvcRetentionPolicy":"Retain","replicas":3,"resources":{"limits":{"cpu":"200m","memory":"1Gi"},"requests":{"cpu":"100m","memory":"500Mi"}},"sharedStorage":{"s3":{"endpoint":"http://minio.mostorage:9000","path":"minio-mo","secretRef":{"name":"minio"},"type":"minio"}},"volume":{"size":"1Gi"}},"tp":{"cacheVolume":{"size":"5Gi","storageClassName":"local-path"},"config":"[cn.Engine]\ntype = \"distributed-tae\"\n[log]\nlevel = \"debug\"\nformat = \"json\"\nmax-size = 512\n","nodePort":31429,"replicas":1,"resources":{"limits":{"cpu":"200m","memory":"2Gi"},"requests":{"cpu":"100m","memory":"500Mi"}},"serviceType":"NodePort"},"version":"nightly-54b5e8c"}}
        version: nightly-54b5e8c
    ```

## 重装升级

重装升级，意味着 MatrixOne 集群被全部删除，数据会被舍弃，即重新进行安装。

**适用场景**：

- 不需要旧的数据
- 升级前后的版本由于特殊原因无法互相兼容

!!! note
    操作前，请务必确保数据已备份（参见 mo-dump 备份工具），且业务已知晓数据库已停止。

### 操作步骤

#### 1. 删除旧版本集群

在 master0 中，可以通过以下任意一种方式删除旧版本集群：

```
# 方式1：通过部署时mo集群的yaml文件删除，例如：
kubectl delete -f /root/deploy/mo.yaml
# 方式2：通过删除matrixonecluster对象，其中mo是名字
kubectl delete matrixonecluster.core.matrixorigin.io mo -nmo-hn
```

通过查看 pod 状态确认 mo 相关资源是否已删除：

```
kubectl get pod -nmo-hn
```

另外，如果还有 mo 使用的 pvc 没有删除，使用下面的命令进行手动删除：

```
kubectl get pvc -nmo-hn
# 例如，还有log service使用的pvc未删除，手动删除
kubectl delete pvc mo-data-mo-log-0 -nmo-hn
kubectl delete pvc mo-data-mo-log-1 -nmo-hn
kubectl delete pvc mo-data-mo-log-2 -nmo-hn
```

#### 2. 清空桶数据

在 MinIO 管控页面，删除 MO 使用的 MinIO 使用的桶里面的数据，包括 mo-data、etl 等子目录。

![image-minio-delete-bucket](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/image-minio-delete-bucket.png)

或者通过 MinIO 客户端 mc 来操作：

```
mc rb --force  minio/minio-mo/data/
mc rb --force  minio/minio-mo/etl
```

另外，如果不想删除旧数据，也可以新建一个 MinIO 的桶，然后在部署 MatrixOne 集群的 yaml 文件指定新的桶名即可。

![image-minio-new-bucket](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/deploy/image-minio-new-bucket.png)

#### 3. 部署新版本集群

编辑定义 MO 集群的 yaml 文件，参考**滚动升级**章节，修改 `.spec.version` 字段为最新版本，重新部署 MatrixOne 集群：

```
vi mo.yaml
# 内容省略
kubectl apply -f mo.yaml
```

#### 4. 检查升级是否成功

可以通过以下命令检查 MatrixOne 是否成功启动。

如下面代码示例所示，当 Log Service, TN, CN 都正常运行，则 MatrixOne 集群成功启动。你也可以通过 MySQL Client 连接检查数据库功能是否正常。

```
[root@master0 ~]# kubectl get pods -n mo-hn      
NAME                                  READY   STATUS    RESTARTS     AGE
matrixone-operator-6c9c49fbd7-lw2h2   1/1     Running   2 (8h ago)   9h
mo-tn-0                               1/1     Running   0            2m13s
mo-log-0                              1/1     Running   0            2m47s
mo-log-1                              1/1     Running   0            2m47s
mo-log-2                              1/1     Running   0            2m47s
mo-tp-cn-0                            1/1     Running   0            111s
```
