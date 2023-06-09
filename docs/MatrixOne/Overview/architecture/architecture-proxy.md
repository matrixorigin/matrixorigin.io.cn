# Proxy 架构详解

Proxy 作为 MatrixOne 中承担负载均衡与 SQL 请求分发的唯一组件，通过将 CN 分组标签的方式，搭配 Proxy 的 SQL 分发，实现会话级别的 SQL 路由功能，从而适配多种场景。

它的 SQL 请求分发架构图示如下：

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/proxy/proxy-arch.png?raw=true)

- Kubernetes Library 层利用 Kubernetes 自带的功能，确保了 Proxy 层的高可用性和负载均衡。
- SQL Proxy 实现长连接、白名单、SQL 请求分发，可完成对 CN 的负载均衡和请求转发。
- CN 不存在只读副本概念，仅通过分组手动进行划分。

## 技术实现

依据 MatrixOne 存储计算分离的多 CN 架构以及 Proxy 的职责，在 HAKeeper 与 Proxy 中引入 CN 标签组的概念，即固定名称和数量的 CN 集合。

![](https://github.com/matrixorigin/artwork/blob/main/docs/overview/proxy/proxy-arch-2.png?raw=true)

由上图所示，技术实现流程解析如下：

1. 通过 `yaml` 文件中的配置选项（包括配置、副本数和租户）创建不同的 CN 标签。
2. MatrixOne 集群启动时，MatrixOne 会根据 CN 各标签的副本数，启动相同数量的 Pod，由 HAKeeper 统一打上相应标签。
3. MatrixOne Operator（即 MatrixOne 集群在 Kubernetes 的资源管理器）负责动态维持 CN 标签组内的 CN 数量，在 CN 宕机后，立即启动相同数量的 CN。
4. Proxy 组件通过连接会话参数判断，将某个会话转发给相应的 CN 组，实现 SQL 路由。

    - 如果一个会话请求没有匹配的 CN 标签，会寻找是否有空标签的 CN，如有则连接至空标签的 CN 组，否则连接失败。
    - 在扩容时，Proxy 会根据当前已存在的 CN 节点会话数对现有连接进行迁移，将已有会话迁移至新的 CN 中，迁移后的节点会话数接近均衡，实现负载均衡。
    - 在缩容时，Proxy 会将即将下线的 CN 节点的已有会话迁移至其他节点，迁移后的节点会话数接近均衡，从而实现负载均衡。

5. 在同一个 CN 标签组内，Proxy 负责组内负载均衡。

Proxy 通过分析会话请求中的参数来判断请求是否匹配 CN 标签。在实现 SQL 路由时，会话参数会被用于查找与请求匹配的 CN 标签组。具体来说，Proxy 可能会检查 CN 标签中的特定字段，例如租户信息、副本数等，以便将请求路由到适当的 CN 标签组。通过这种方式，Proxy 可以实现会话请求与 CN 标签的匹配，并确保将请求路由到正确的 CN 节点。

## 参考文档

想要了解更多关于如何通过 Proxy 实现负载均衡，参见[使用 Proxy 实现租户和负载独立资源管理](../../Deploy/mgmt-cn-group-using-proxy.md)
