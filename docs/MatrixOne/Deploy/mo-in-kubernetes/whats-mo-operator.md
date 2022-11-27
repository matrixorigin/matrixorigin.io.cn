# 什么是 MatrixOne Operator

MatrixOne Operator 是 Kubernetes 上的 MatrixOne 集群自动化运维系统，由一组 Kubernetes 自定义资源（CustomResourceDefinitions, CRD），一组 Kubernetes 控制器和一组 Webhook 服务组成。其中：

- CRD 是 Kubernetes 中的一个对象，用于在 Kubernetes APIServer 中注册新的自定义资源类型。MatrixOne Operator 中包含的 CRDs 注册了多种自定义资源，包括用于描述 MatrixOne 集群的 MatrixOneCluster 资源、用于描述集群内组件的 CNSet, DNSet, LogSet 资源等等。注册完成之后，客户端就能在 Kubernetes APIServer 上读写这些资源。

- 控制器是一个长期运行的自动化程序，负责监视 Kubernetes 中资源的期望状态和收集这些资源的实际状态，并自动进行运维操作，驱动实际状态向期望状态转移。MatrixOne Operator 中的控制器会监视 MatrixOneCluster, CNSet, DNSet, LogSet 等资源，并负责实现用户通过这些资源声明的期望状态。

- Webhook 服务是一个长期运行的 HTTP 服务。当 Kubernetes API Server 收到用户读写 MatrixOneCluster, CNSet, DNSet, LogSet 等资源的请求时，会将请求转发给 Webhook 服务，由 Webhook 服务执行请求校验、默认值填充等逻辑。

   Webhook 服务逻辑流程图如下所示：

![MatrixOne webhook](https://github.com/matrixorigin/artwork/blob/main/docs/deploy/mo-operator.png?raw=true)

当通过 Helm chart 安装 MatrixOne Operator 时，就会将所需的 CRDs 提交到 Kubernetes APIServer 完成自定义资源的注册，并部署一个长期运行的 MatrixOne Operator 应用，应用中打包了上述的控制器和 Webhook 服务。
