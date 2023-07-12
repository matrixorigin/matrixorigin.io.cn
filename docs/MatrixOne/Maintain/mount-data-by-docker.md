# 挂载目录到 Docker 容器

本篇文档将指导你在使用 Docker 启动 MatrixOne 的情况下，如何挂载*数据目录*或*自定义配置文件*到 Docker 容器。

## 挂载数据目录

为了保证数据目录安全不丢失，参考以下详细步骤，挂载本地数据目录到 Docker 容器：

1. 检查 Docker 内是否已经启动 MatrixOne：

    ```
    docker ps -a
    ```

2. 如果 Docker 内有正在运行的 MatrixOne，需要先停止：

    ```
    docker stop <containerID>
    docker rm <containerID>
    ```

    如果没有正在运行的 MatrxiOne，请忽略这一步。

3. 把本地**空目录**挂载到 Docker 容器目录 */mo-data* 下，命令示例如下：

    ```
    sudo docker run --name <name> --privileged -d -p 6001:6001 -v ${local_data_path}/mo-data:/mo-data:rw matrixorigin/matrixone:0.8.0
    ```

     |参数 | 描述|
     |---|---|
     |${local_data_path}/mo-data:/mo-data|挂载本地数据目录 *${local_data_path}/mo-data* 到容器 */mo-data* 文件夹 <br> __Tips__: 需要挂载的本地数据目录必须为**空目录**。 |

## 挂载自定义配置文件

如果你需要修改启动配置文件，建议你先将 Docker 内的启动配置文件拷贝到你本地目录，然后将存放配置文件的本地目录挂载到 Docker 容器目录下，参考以下详细步骤，挂载配置文件到 Docker 容器：

1. 检查 Docker 内是否已经启动 MatrixOne：

    ```
    docker ps -a
    ```

2. 如果 Docker 内还没有正在运行的 MatrixOne，请先启动：

    ```
    docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:0.8.0
    ```

3. 查看 Docker 已经启动 MatrixOne 的 containerID，并将配置文件目录拷贝到本地目录内：

    ```
    docker ps -a
    docker cp <containerID>:/etc .
    ```

4. 拷贝完成后，关停当前的 MatrixOne：

    ```
    docker stop <containerID>
    docker rm <containerID>
    ```

5. （选做）修改本地配置文件并保存。

6. 挂载配置文件到 Docker 容器目录，同时启动 MatrixOne，挂载命令示例如下：

     ```shell
     sudo docker run --name <name> --privileged -d -p 6001:6001 -v ${local_config_path}/etc:/etc:rw  --entrypoint "/mo-service" matrixorigin/matrixone:0.8.0 -launch /etc/quickstart/launch.toml
     ```

     |参数 | 描述|
     |---|---|
     |${local_config_path}/etc:/etc|挂载本地配置文件目录 *${local_config_path}/etc* 到容器 */etc* 文件夹 |
     |--entrypoint "/mo-service"|指定容器启动 MatrixOne 服务 |
     |-launch /etc/quickstart/launch.toml| 启动 */etc/* 中的 MatrixOne 启动配置文件|

更多关于 *Docker run* 的指令释义，运行命令 `docker run --help` 进行查看。
