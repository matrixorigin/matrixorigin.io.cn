# 为 MatrixOne 集群配置共享存储

在 MatrixOne 集群中，为了确保分布式环境下各个节点都能使用同一份存储进行数据库操作，需要为其配置外部的共享存储。本篇文档将介绍如何为 Kubernetes 上的 MatrixOne 集群配置不同类型的共享存储。MatrixOne 当前可以支持配置的存储服务为 AWS S3, MinIO 和 NFS。

## 开始前准备

- 参见文档 [使用 MatrixOne Operator 部署 MatrixOne 集群](get-started.md) 完成 Kubernetes 集群的部署。
- 根据你的业务需求和部署安装环境，申请对象存储所需要的存储空间。

## 配置共享存储

### 概览

集群使用的共享存储通过 `MatrixOneCluster` 对象的 [`.spec.logset.sharedStorage`](https://github.com/matrixorigin/matrixone-operator/blob/main/docs/reference/api-reference.md#sharedstorageprovider) 字段进行配置。该字段在集群创建后不可修改。

### 配置步骤

你可根据自身环境的现有情况，选择 AWS S3，MinIO 或 NFS 中的一种来配置 MatrixOne的共享存储。

#### 选项一：配置 AWS S3

如果你是用的是 AWS 公有云，那么推荐配置 AWS S3 作为 MatrixOne 集群的共享存储，其配置步骤如下：

1. 使用现有的 S3 桶或参考[创建存储桶](https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/create-bucket-overview.html)官方文档，创建一个新的 S3 桶。
2. 参考[管理 IAM 用户的访问密钥](https://docs.aws.amazon.com/zh_cn/IAM/latest/UserGuide/id_credentials_access-keys.html)官方文档，创建一组访问密钥。
3. 在目标 `Namespace` 创建一个 k8s `Secret`，包含其中第二步中生成的访问密钥，用于授权 MatrixOne 集群访问对应的 S3 桶，代码示例如下：

    ```
    kubectl -n <YOUR_NAMESPACE> create secret generic aws --from-literal=AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID> --from-literal=AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
    ```

4. 修改集群的 *YAML* 定义，以下面的方式配置 `sharedStorage` 字段，你可以通过 `path` 指定集群将数据存储目标 S3 桶的特定路径下。假如仅配置一级目录（即 `${bucketName}`），则数据会存储在目标桶的根目录下：

    ```
    pec:
      logService:
        sharedStorage:
          s3:
            path: ${bucketName}/${path}
            # bucket 所在的 region
            region: us-west-2
            secretRef:
              name: aws
    ```

5. 创建 MatrixOne 集群，验证集群是否正确启动。创建 MatrixOne 集群步骤可以参考[使用 MatrixOne Operator 部署 MatrixOne 集群](get-started.md)。

**配置其它认证**

上面的例子使用静态的访问密钥来授予 MatrixOne 集群访问目标 S3 桶的权限。在 Kubernetes 上，还可以基于 AWS 提供的[服务账户的 IAM 角色](https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/iam-roles-for-service-accounts.html)机制对 MatrixOne 集群进行授权，这种方式能够避免在系统中存储静态的密钥文件，增强安全性。配置过程如下：

1. 参考 [AWS 官方文档](https://docs.aws.amazon.com/zh_cn/eks/latest/userguide/associate-service-account-role.html)，创建一个关联到 AWS Role 的 k8s `ServiceAccount`，并授予对应的 AWS Role 访问目标 S3 桶的权限。
2. 通过 `.spec.serviceAccountName` 字段配置 MatrixOne 集群使用第一步中创建的 `ServiceAccount`, 并删除 s3 的 `secretRef` 配置。代码示例如下：

    ```
    pec:
    ogService:
        sharedStorage:
          s3:
            path: ${bucketName}/${path}
      serviceAccountName: ${serviceAccountName}
    ```

#### 选项二：使用 MinIO

1. 参考 MinIO 官方文档，在 Linux 环境下[安装 MinIO 存储](https://min.io/docs/minio/linux/index.html)。
2. 登录进入 [MinIO 控制台](https://min.io/docs/minio/linux/administration/minio-console.html) 在 MinIO 上创建一个新的存储桶。
3. 参考 [MinIO User Manager](https://min.io/docs/minio/linux/administration/identity-access-management/minio-user-management.html)官方文档，创建一个具有足够权限的访问密钥。

4. 在目标 `Namespace` 创建一个 k8s `Secret`，包含其中第二步中生成的访问密钥，用于授权 MatrixOne 集群访问对应的 MinIO 存储桶：

    ```
    kubectl -n <YOUR_NAMESPACE> create secret generic minio --from-literal=AWS_ACCESS_KEY_ID=<YOUR_MINIO_ACCESS_KEY_ID> --from-literal=AWS_SECRET_ACCESS_KEY=<YOUR_MINIO_SECRET_ACCESS_KEY>
    ```

5. 修改集群的 *YAML* 定义，以下面的方式配置 `sharedStorage` 字段，你可以通过 `path` 指定集群将数据存储目标桶的特定路径下。假如仅配置一级目录（即 `${bucketName}`），则数据会存储在目标桶的根目录下：

    ```
    pec:
      logSere:
        sharedStorage:
          s3:
            type: minio
            path: ${bucketName}/${path}
            endpoint: ${minioURL}
            secretRef:
              name: minio
    ```

#### 选项三：使用 NFS

开发中...

## 配置共享存储的 Cache

为了提升性能 `matrixone-operator` 会自动为 MatrixOne 配置共享存储的 `cache`. 规则如下：

- 假如组件没有内存资源申请 (`.esources.requests.memory`), 那么默认不会启用 cache。
- 假如组件配置了内存资源申请, 那默认会启动基于内存的共享存储 cache, cache 大小是 memory 资源申请的 50%。
- 你总是可以通过设置 `.spec.cn.shreStorageCache.memoryCacheSize` 和 `.spec.dn.sharedStorageCache.memoryCacheSize` 来显式开启 memory cache 并直接指定 cache 大小，设置示例如下：

```
pec:
  dn:
    replic 1
+   sharedStorageCache:
+     emoryCacheSize: 1Gi
```

!!! note
    过大的 memory cache 将会导致 Pod 内存溢出(Out Of Memory，OOM)。
