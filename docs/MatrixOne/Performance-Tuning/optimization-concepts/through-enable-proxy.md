# 通过配置 Proxy 提升性能

本篇文档将指导你完成如何快速配置 MatrixOne 分布式集群场景下的 Proxy 以实现 SQL 分发。

配置 Proxy 以后，你无需关心集群架构、节点个数，Proxy 作为 MatrixOne 的组件，在计算大数据量时，承担负载均衡与 SQL 请求分发，从而实现会话级别的 SQL 路由功能，从而适配多种场景。

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
