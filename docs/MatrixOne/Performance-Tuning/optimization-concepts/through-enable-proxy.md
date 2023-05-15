# 通过配置 Proxy 提升性能

本篇文档介绍了如何快速配置 Proxy 以实现 SQL 分发，适用于 MatrixOne 分布式集群场景下启动多个 CN 的情况。

配置 Proxy 后，你不需要关注集群架构和节点数量。Proxy 作为 MatrixOne 的组件，能够在处理大数据量时实现负载均衡和 SQL 请求分发，并提供会话级别的 SQL 路由功能，以适应各种场景需求。

## 步骤

### 本地配置

本地配置用于在本地环境上配置并启动 Proxy 服务。

MatrixOne 的本地文件目录 *etc/launch-with-proxy* 路径下所有 *cn.toml* 的配置文件已配置如下参数：

    ```
    [cn.frontend]
    proxy-enabled = true
    ```

__Note:__ MatrixOne 配置文件中默认已配置此参数，你只需要在启动 MatrixOne 集群时启动 Proxy 进程即可，操作如下：

- 如果所有的服务都在同一个进程中，启动 MatrixOne 时需要增加 `-with-proxy` 参数，启动指令如下：

   ```
   ./mo-service -launch ./etc/launch-with-proxy/launch.toml -with-proxy
   ```

- 如果单独启动集群中的各个服务，则直接指定配置文件启动 Proxy 进程：

   ```
   ./mo-service -config ./etc/launch-with-proxy/proxy.toml
   ```
