# mo_ctl 分布式版工具指南

`mo_ctl` 分布式版是一款面向企业用户，协助用户部署 MatrixOne 分布式集群、安装相关组件并最终向用户提供 MatrixOne 服务的命令行工具

!!! note
    mo_ctl 分布式版是一款专为企业级用户设计的高效数据库集群管理工具。如需获取该工具的下载路径，请与您的 MatrixOne 客户经理取得联系。

## 功能概览

`mo_ctl` 目前已经适配过操作系统如下表所示：

|   操作系统     |     版本 |
| ------------- | ----------|
| Debian        | 11 及以上    |
| Ubuntu        | 20.04 及以上 |
| UOS           | 20.0.0     |
| Open  EulerOS | 20.3.0     |

`mo_ctl` 目前的功能列表如下表所示：

|       命令        |                           功能                         |
| --------------- | ------------------------------------------------------ |
| `mo_ctl help`   | 查看`mo_ctl`工具本身的语句和功能列表。          |
| `mo_ctl precheck` | 检查安装集群所需要的依赖项，例如：CPU，内存等。   |
| `mo_ctl install` | 创建集群，安装相应插件，并按照配置文件初始化 matrixone 集群。 |
| `mo_ctl registry` | 操作集群中创建的高可用镜像仓库，例如：增删改查镜像。 |
| `mo_ctl node` | 对集群中的节点进行管理，增加节点，删除节点等。 |
| `mo_ctl matrixone` | 对集群中 matrixone 集群进行管理，可创建，启动，停止，删除等操作。 |
| `mo_ctl s3` | 对集群中分布式 minio 进行管理，查看状态，扩展容量等操作。 |
| `mo_ctl backup` | 对集群中 matrixone cluster 进行备份，恢复等操作。 |
| `mo_ctl destroy` | 销毁 matrixone 服务并抹除集群。 |

## 快速上手

1. 使用命令 `mo_ctl help` 查看工具指南。

2. 使用命令 `mo_ctl precheck` 查看前置依赖条件是否满足。

    ```
    mo_ctl precheck --config xxx.yaml
    ```

3. 使用命令 `mo_ctl install` 部署 MatrixOne 集群：

    ```
    mo_ctl install --config xxx.yaml
    ```

4. 使用命令 `mo_ctl  matrixone list` 检查 MatrixOne 的状态。

    ```
    mo_ctl matrixone list --type cluster
    ```

## 参考命令指南

### help

使用 `mo_ctl help` 打印参考指南。

```
./mo_ctl help
Install, destroy, and operation matrixone cluster

Usage:
  mo_ctl [command]

Available Commands:
  backup      backup matrixone cluster
  completion  Generate the autocompletion script for the specified shell
  destroy     destroy k8s cluster and apps on it
  help        Help about any command
  install     Install k8s, matrixone, minio, and other apps
  matrixone   matrixone operation cmd
  precheck    precheck cluster machine environment before install
  registry    registry operations

Flags:
      --config string       Specify the mo_ctl config file
  -d, --debug               turn on debug mode
  -h, --help                help for mo_ctl
      --kubeconfig string   Path to the kubeconfig file to use (default "/root/.kube/config")
      --logfile string      Specify the log file

Use "mo_ctl [command] --help" for more information about a command.
```

### precheck

使用 `mo_ctl precheck` 预检查硬件和软件的环境是否适合安装 MatrixOne。

```
./mo_ctl precheck --help
precheck cluster machine environment before install

Usage:
  mo_ctl precheck [flags]

Flags:
  -h, --help   help for precheck
```

### install

使用 `mo_ctl install` 在计算机（机器或虚拟机）上安装 k8s、matrixone、minio 和其他应用程序，执行此命令前需要联系您的客户经理获取镜像包的下载路径。

- clusterimage.tar：面向需要使用 `mo_ctl` 创建集群并安装相关组件，其中包含基础 k8s 组件以及 matrixone 相应的 app 组件
- moappdistro.tar：面向已有 k8s 集群，需要使用 `mo_ctl` 进行组件管理，其中包含 matrixone 以及相应的组件

```
./mo_ctl install --help
Install k8s, matrixone, minio, and other apps

Usage:
  mo_ctl install [flags]

Flags:
      --app       only install k8s app
      --dry-run   dry run
  -h, --help      help for install
```

### destory

使用 `mo_ctl destroy` 销毁 k8s 集群及其上的应用程序。

```
./mo_ctl destroy --help
destroy k8s cluster and apps on it

Usage:
  mo_ctl destroy [flags]

Flags:
      --configmap   get clusterfile from k8s configmap
      --dry-run     dry run
      --force       force destroy, no notice
  -h, --help        help for destroy
```

### register

使用 `mo_ctl register` 操作集群中创建的高可用镜像仓库，例如：增删改查镜像。

```
 mo_ctl registry --help
Usage:
  mo_ctl registry [flags]
  mo_ctl registry [command]

Aliases:
  registry, reg

Available Commands:
  delete      delete (image)
  list        list (image | chart)
  push        push (image | chart)

Flags:
  -h, --help          help for registry
      --type string   registry type (image | chart) (default "image")
```

### backup

 使用 `mo_ctl backup` 对集群中 matrixone cluster 进行备份，恢复等操作

```
 ./mo_ctl backup --help
backup matrixone cluster

Usage:
  mo_ctl backup [flags]
  mo_ctl backup [command]

Available Commands:
  list        list matrixone cluster backup revison
  restore     restore backup matrixone cluster
  start       start backup matrixone cluster

Flags:
  -h, --help   help for backup
```

- **start**
  
    1. 首先需要准备描述 backup job 的 yaml 文件，此处预设生成的 yaml 名称为 backup.yaml。

        ```
        apiVersion: core.matrixorigin.io/v1alpha1
        kind: BackupJob
        metadata:
        # 此处指定 job 的名称
        name: backupjob
        # 此处指定 job 所属的 namespace
        # 注意：此处要与需要备份的 mo 集群处于同一个 namespace
        namespace: mocluster1
        spec:
        source:
            # mo 集群的名称，可通过 mo_ctl matrixone list 命令获取
            clusterRef: mocluster-mocluster1
        # 配置备份存储位置，可选择对象存储或者本地路径存储。具体的可参考 https://github.com/matrixorigin/matrixone-operator/blob/main/docs/reference/api-reference.md#backupjob
        target:
            s3:
            type: minio
            endpoint: http://minio.s3-minio-tenant-test1
            path: mo-test/backup-01
            secretRef:
                name: minio
        ```

    2. 通过以下命令创建一个 backup job 来进行备份操作

        ```
        # 退出码为 0 则证明备份 job 创建成功
        sudo ./mo_ctl backup start --values backup.yaml
        ```

    3. 创建成功后可通过以下命令等待备份完成

        ```
        # 此处的 backupjob 即为在步骤一中定义的 name
        sudo kubectl wait --for=condition=ended backupjob --all -A --timeout=5m
        ```

- **restore**
  
    1. 获取 backup job 的名称 (ID)，可通过以下命令获取

        ```
        sudo ./mo_ctl backup list
        ```

    2. 首先需要准备描述 restore job 的 yaml 文件，此处预设生成的 yaml 名称为 restore.yaml。

        ```
        # 除了 restoreFrom，其他字段可参考 https://github.com/matrixorigin/matrixone-operator/blob/main/docs/reference/api-reference.md#matrixonecluster
        apiVersion: core.matrixorigin.io/v1alpha1
        kind: MatrixOneCluster
        metadata:
        name: morestore
        namespace: mocluster1
        spec:
        # 此处需要填写步骤一中获取的 backup job 的 name
        restoreFrom: #BackupName
        # 此处需要填写实际的镜像仓库信息
        imageRepository: sea.hub:5000/matrixorigin/matrixone
        version: 1.1.0
        logService:
        replicas: 1
        sharedStorage:
            # 此处需要填写实际的对象存储信息
            s3:
            type: minio
            path: mo-test/backup-01
            endpoint: http://minio.s3-minio-tenant-test1
            secretRef:
                name: minio
        volume:
            size: 10Gi
        tn:
        replicas: 1
        cacheVolume:
            size: 10Gi
        cnGroups:
        - name: tp
        replicas: 1
        cacheVolume:
        size: 10Gi
        ```

    3. 执行备份恢复命令  

        ```
        sudo ./mo_ctl backup restore --values restore.yaml
        ```

### matrixone

使用 `mo_ctl matrixone` 对集群中 matrixone 集群进行管理，可创建，启动，停止，删除等操作

```
./mo_ctl matrixone --help
Used for matrixone operation cmd

Usage:
  mo_ctl matrixone [flags]
  mo_ctl matrixone [command]

Aliases:
  matrixone, mo

Available Commands:
  history     history all matrixone (cluster | operator)
  list        list matrixone (cluster | operator)
  remove      remove matrixone (cluster)
  rollback    rollback depoly of matrixone (cluster | operator)
  setup       setup matrixone (cluster)
  start       start matrixone (cluster)
  stop        stop matrixone (cluster)
  upgrade     upgrade matrixone (cluster | operator)

Flags:
      --dry-run       dry run
  -h, --help          help for matrixone
      --name string   Specify matrixorigin cluster name
      --type string   Specify a type (cluster | operator) (default "cluster")
```
