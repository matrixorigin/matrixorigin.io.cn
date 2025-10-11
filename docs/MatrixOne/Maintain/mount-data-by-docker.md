# 挂载目录到 Docker 容器

本篇文档将指导你在使用 Docker 启动 MatrixOne 的情况下，如何挂载*数据目录*或*自定义配置文件*到 Docker 容器。

需要注意的是，Docker 不能对已经启动过的容器进行挂载，若想要挂载数据目录则需要重新创建一个 Docker 容器。

## 挂载数据目录

参考以下详细步骤，挂载本地数据目录到 Docker 容器：

1. 在本地创建一个**空目录** *${local_data_path}/mo-data*，其中 *${local_data_path}* 为你的本地文件夹路径。命令示例如下：

    ```bash
    mkdir ${local_data_path}/mo-data
    ```

2. 把本地**空目录** *${local_data_path}/mo-data* 挂载到 Docker 容器目录 */mo-data* 下，命令示例如下：

    ```bash
    sudo docker run --name <name> -d -p 6001:6001 -v ${local_data_path}/mo-data:/mo-data:rw matrixorigin/matrixone:3.0.2
    ```

     | 参数                                | 描述                                                   |
     | ----------------------------------- | ------------------------------------------------------ |
     | ${local_data_path}/mo-data:/mo-data | 挂载本地数据目录 *${local_data_path}/mo-data* 到容器 */mo-data* 文件夹 <br> __Tips__: 需要挂载的本地数据目录必须为**空目录**。 |

## 挂载自定义配置文件

如果你需要修改启动配置文件，建议你先将 Docker 内的启动配置文件拷贝到你本地目录，然后将存放配置文件的本地目录挂载到 Docker 容器目录下，参考以下详细步骤，挂载配置文件到 Docker 容器：

1. 首先启动一个 MatrixOne 的容器实例，这个容器实例将提供一套标准的启动配置文件：

    ```bash
    docker run -d -p 6001:6001 --name matrixone  matrixorigin/matrixone:3.0.2
    ```

2. 查看 Docker 已经启动的 MatrixOne 的 containerID，并将配置文件目录拷贝到本地目录的 *${local_config_path}* 目录下：

    ```bash
    docker ps
    docker cp <containerID>:/etc/launch ${local_config_path}
    ```

3. 拷贝完成后，关停并销毁当前的 MatrixOne：

    ```bash
    docker stop <containerID>
    docker rm <containerID>
    ```

4. （选做）若需要修改启动配置文件，则修改本地目录 *${local_config_path}/launch* 下的配置文件并保存。

6. 挂载配置文件到 Docker 容器目录，同时创建并启动 MatrixOne，挂载命令示例如下：

     ```bash
     sudo docker run --name <name> -d -p 6001:6001 -v ${local_config_path}/launch:/etc/launch:rw  --entrypoint "/mo-service" matrixorigin/matrixone:3.0.2 -launch /etc/launch/launch.toml
     ```

     | 参数                                    | 描述                                                                                               |
     | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
     | ${local_config_path}/launch:/etc/launch | 挂载本地配置文件目录 *${local_config_path}/launch* 到容器 */etc/launch* 文件夹                     |
     | --entrypoint "/mo-service"              | 容器入口命令，即让容器启动 MatrixOne 服务                                                          |
     | -launch /etc/launch/launch.toml         | 容器入口命令对应的命令参数，即使用容器内 */etc/launch/launch.toml* 启动配置文件启动 MatrixOne 服务 |

!!! note
        若 Docker 版本低于 20.10.18 或者 Docker client 和 Docker server 的版本不一致，推荐同时升级到 Docker 最新稳定版本后再尝试。若坚持使用，需要在 ```docker run``` 命令中加上参数 ```--privileged=true```，如：

        ```bash
        docker run -d -p 6001:6001 --name matrixone --privileged=true matrixorigin/matrixone:3.0.2
        ```

更多关于 *Docker run* 的指令释义，运行命令 `docker run --help` 进行查看。
