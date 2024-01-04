# 部署常见问题

## 环境相关

**部署 MatrixOne 所需的操作系统版本是什么？**

- MatrixOne 当前支持下表中操作系统。

| Linux OS                 | 版本                   |
| :----------------------- | :------------------------ |
| Debian                   | 11.0 or later            |
| Ubuntu LTS               | 20.04 or later            |
| Red Hat Enterprise Linux | 9.0 or later releases |
| Oracle Enterprise Linux  | 9.0 or later releases |

- MatrixOne 也支持 macOS 操作系统，当前仅建议在测试和开发环境运行。

| macOS | 版本                |
| :---- | :--------------------- |
| macOS | Monterey 12.3 or later |

**可以在红帽系，比如 CentOS 7 下正常使用 MatrixOne 吗？**

MatrixOne 对操作系统的要求不严格，支持在 CentOS 7 下使用，但 CentOS 7 在 24 年 6 月底就停止维护了，推荐大家使用更新版本的操作系统。

**MatrixOne 是否支持在国产环境下部署？**

对于国产的操作系统和芯片，芯片我们已经适配过鲲鹏和海光，操作系统已经适配过银河麒麟，欧拉，麒麟信安。

**我可以在哪里部署 MatrixOne？**

MatrixOne 可以本地部署、公共云、私有云或 kubernetes 上。

**MatrixOne 是否支持在阿里云 ecs 服务器上分布式部署吗？**

目前需要基于 ECS 搭建 K8S 或者使用阿里云 ACK 才能进行分布式部署。

**集群部署只支持 K8s 吗？能不能物理分布式本地部署？**

如果提前没有 k8s 和 minio 环境的话。我们的安装工具会自带 k8s 和 minio，也可以在物理机一键部署。

* **当前非 k8s 版本是否支持主从配置？**

MatrixOne 目前还不支持非 k8s 版本主从配置，后续会支持。

**生产环境只能用 k8s 模式部署吗？**

是的，为了得到分布式的稳定性和可扩展性，我们推荐生产系统是用 k8s 部署，假如没有现成的 k8s，可以使用托管 k8s 进行部署，降低复杂度。

## 硬件相关

**MatrixOne 对部署硬件的配置要求如何？**

单机安装情况下，MatrixOne 当前可以运行在 Intel x86-64 和 ARM 架构的 64 位通用硬件服务器平台上。

对于开发、测试和生产环境的服务器硬件配置要求和建议如下：

- 开发和测试环境要求

| CPU     | 内存 | 本地存储   |
| :------ | :----- | :-------------- |
| 4 core+ | 16 GB+ | SSD/HDD 200 GB+ |

ARM 架构的 Macbook M1/M2 也适合开发环境。

- 生产环境要求

| CPU      | 内存 | 本地存储   |
| :------- | :----- | :-------------- |
| 16 core+ | 64 GB+ | SSD/HDD 500 GB+ |

分布式安装情况下，MatrixOne 对于开发、测试和生产环境的服务器硬件配置要求和建议可以参考[集群拓扑规划概述](../Deploy/deployment-topology/topology-overview.md)。

## 配置相关

**安装时需要更改什么设置吗？**

通常情况下，安装时，你无需更改任何设置。`launch.toml` 默认设置完全可以直接运行 MatrixOne。但是如果你需要自定义监听端口、IP 地址、存储数据文件路径，你可以修改相应的 [`cn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/cn.toml)、[`tn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/tn.toml) 或 [`log.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-with-proxy/log.toml)，这些文件内参数配置详情可参考[通用参数配置](../Reference/System-Parameters/system-parameter.md)

**当我想将 MatrixOne 的数据目录保存到我指定的文件目录中，我应该如何操作？**

当你使用 Docker 启动 MatrixOne，你可以将你指定的数据目录挂载至 Docker 容器，参见[挂载目录到 Docker 容器](../Maintain/mount-data-by-docker.md)。

当你使用源码或二进制包编译并启动 MatrixOne，你可以通过修改配置文件中的默认数据目录路径：打开 MatrixOne 配置文件目录 `matrixone/etc/launch-with-proxy`，修改 `cn.toml`、`tn.toml` 和 `log.toml` 三个文件内的配置参数 `data-dir = "./mo-data"` 为 `data-dir = "your_local_path"`，保存后重启 MatrixOne 即可生效。

## 工具相关

**二进制包安装可以通过 mo_ctl 管理吗？**

通过设置 MO_PATH 配置二进制包的路径，就可以使用 mo_ctl 进行管理了。

**mo_ctl 工具是否支持源码部署升级**

通过 upgrade 命令可以指定对应的版本或者 commitid 进行细粒度升级，需要注意的设置当前版本 MO_PATH，以及编译环境。

**mo_ctl 工具是否支持部署 matrixOne 集群**

当前还不支持，后续考虑加入集群部署和管理。

**helm 安装 operator，怎么样看是否安装成功了？**

使用 helm list -A 就可以查看。

**helm 方式部署的 operator 如何进行卸载？**

通过 helm uninstall 命令指定名称和命名空间进行卸载。

**operator 的版本在部署的是否有要求？**

operator 是用来管理 matrixOne 集群的，所以 operator 版本尽量与集群的版本保持一致，比如我们安装了 1.0.0-rc2 这个版本的集群，对应提前安装的 operator 版本也应该为 1.0.0-rc2。如未找到版本一致的 operator，建议使用相近版本的 operator。

## 报错相关

**当我安装完成 MySQL 客户端后，打开终端运行 `mysql` 产生报错 `command not found: mysql`，我该如何解决？**

产生这个报错是环境变量未设置的原因，打开一个新的终端，执行以下命令：

=== "**Linux 环境**"

    ```bash
    echo 'export PATH="/path/to/mysql/bin:$PATH"' >> ~/.bash_profile
    source ~/.bash_profile
    ```

    将上述代码中的`/path/to/mysql/bin`替换为你系统中 MySQL 的安装路径。一般是 `/usr/local/mysql/bin`, 如果你不确定 MySQL 的安装路径，可以使用以下命令找到：

    ```bash
    whereis mysql
    ```

=== "**MacOS 环境**"

    macOS 10 之后将 `zsh` 作为默认 `shell`，此处使用zsh做示例，若使用其他 `shell` 可自行转换。

    ```zsh
    echo export PATH=/path/to/mysql/bin:$PATH >> ~/.zshrc
    source ~/.zshrc
    ```

    将上述代码中的`/path/to/mysql/bin`替换为你系统中 MySQL 的安装路径。一般是 `/usr/local/mysql/bin`, 如果你不确定 MySQL 的安装路径，可以使用以下命令找到：

    ```bash
    whereis mysql
    ```

**当我安装选择从源代码安装构建 MatrixOne 时，产生了以下错误或构建失败提示，我该如何继续？**

报错：`Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout`

由于 MatrixOne 需要许多 GO 库作为依赖项，所以它在构建时，会同时下载 GO 库。上述所示的报错是下载超时的错误，主要原因是网络问题。

- 如果你使用的是中国大陆的网络，你需要设置你的 GO 环境到一个中国的镜像网站，以加快 GO 库的下载。

- 如果你通过 `go env` 检查你的 GO 环境，你可能会看到 `GOPROXY="https://proxy.golang.org,direct"`，那么你需要进行下面设置：

```
go env -w GOPROXY=https://goproxy.cn,direct
```

设置完成后，`make build` 应该很快就能完成。

**当我通过 MO-Tester 对 MatrixOne 进行测试时，我如何解决产生的 `too many open files` 错误？**

为了对 MatrixOne 进行测试，MO-Tester 会快速地打开和关闭许多 SQL 文件，于是很快就达到 Linux 和 MacOS 系统的最大打开文件限制，这就是导致 `too many open files` 错误的原因。

* 对于 MacOS 系统，你可以通过一个简单的命令设置打开文件的限制：

```
ulimit -n 65536
```

* 对于 Linux 系统，请参考详细的[指南](https://www.linuxtechi.com/set-ulimit-file-descriptors-limit-linux-servers/)，将 *ulimit* 设置为 100000。

设置完成后，将不会出现 `too many open files` 错误。

**我的 PC 是 M1 芯片，当我进行 SSB 测试时，发现无法编译成功 ssb-dbgen**

硬件配置为 M1 芯片的 PC 在编译 `ssb-dbgen` 之前，还需要进行如下配置：

1. 下载并安装 [GCC11](https://gcc.gnu.org/install/)。

2. 输入命令，确认 gcc-11 是否成功：

    ```
    gcc-11 -v
    ```

    如下结果，表示成功：

    ```
    Using built-in specs.
    COLLECT_GCC=gcc-11
    COLLECT_LTO_WRAPPER=/opt/homebrew/Cellar/gcc@11/11.3.0/bin/../libexec/gcc/aarch64-apple-darwin21/11/lto-wrapper
    Target: aarch64-apple-darwin21
    Configured with: ../configure --prefix=/opt/homebrew/opt/gcc@11 --libdir=/opt/homebrew/opt/gcc@11/lib/gcc/11 --disable-nls --enable-checking=release --with-gcc-major-version-only --enable-languages=c,c++,objc,obj-c++,fortran --program-suffix=-11 --with-gmp=/opt/homebrew/opt/gmp --with-mpfr=/opt/homebrew/opt/mpfr --with-mpc=/opt/homebrew/opt/libmpc --with-isl=/opt/homebrew/opt/isl --with-zstd=/opt/homebrew/opt/zstd --with-pkgversion='Homebrew GCC 11.3.0' --with-bugurl=https://github.com/Homebrew/homebrew-core/issues --build=aarch64-apple-darwin21 --with-system-zlib --with-sysroot=/Library/Developer/CommandLineTools/SDKs/MacOSX12.sdk
    Thread model: posix
    Supported LTO compression algorithms: zlib zstd
    gcc version 11.3.0 (Homebrew GCC 11.3.0)
    ```

3. 手动修改 *ssb-dbgen* 目录下的 *bm_utils.c* 配置文件：

    - 将第 41 行的 `#include <malloc.h>` 修改为 `#include <sys/malloc.h>`

    - 将第 398 行的 `open(fullpath, ((*mode == 'r')?O_RDONLY:O_WRONLY)|O_CREAT|O_LARGEFILE,0644);` 修改为 `open(fullpath, ((*mode == 'r')?O_RDONLY:O_WRONLY)|O_CREAT,0644);`

4. 手动修改 *ssb-dbgen* 目录下的 *varsub.c* 配置文件：

    - 将第 5 行的 `#include <malloc.h>` 修改为 `#include <sys/malloc.h>`

5. 手动修改 *ssb-dbgen* 目录下的 *makefile* 配置文件：

    - 将第 5 行的 `CC      = gcc` 修改为 `CC      = gcc-11`

6. 再次进入 *ssb-dbgen* 目录，进行编译：

    ```
    cd ssb-dbgen
    make
    ```

7. 查看 *ssb-dbgen* 目录，生成 *dbgen* 可执行文件，表示编译成功。

**我先在 main 分支构建了 MatrixOne，现在切换到其他版本再进行构建出现 panic**

当 MatrixOne 版本切换涉及到 0.8.0 之前的版本并且使用 `make build` 命令的时候可能会出现这个问题，这是 MatrixOne 数据存储格式升级造成的不兼容问题，但自 0.8.0 的版本开始会持续兼容。

!!! note
    在这种情况下，我们强烈建议你重新[安装最新稳定版的 MatrixOne 版本](../../MatrixOne/Get-Started/install-standalone-matrixone.md)以实现后续的数据兼容，同时推荐使用 mo_ctl 工具进行快速构建和启动。

具体来说，在 MatrixOne 版本 0.8.0 之前时，执行 `make build` 后，系统会自动生成一个名为 *mo-data* 的数据目录文件，用于存放数据。如果你再切换到其他分支上并重新进行 `make build` 的时候，系统并不会自动删除 *mo-data* 数据目录，此时由于数据格式不兼容，可能会导致 panic 情况发生。

为了解决这个问题，你需要先清理 *mo-data* 数据目录（即执行 `rm -rf mo-data` 命令），然后再重新构建 MatrixOne。

以下参考代码示例使用较早的构建流程：

```
[root ~]# cd matrixone  // 进入 matrixone 文件目录
[root ~]# git branch // 查看当前分支
* 0.8.0
[root ~]# make build // 构建 matrixone
...    // 此处省略构建过程代码。如果你此时想要切换到其他版本，例如 0.7.0 版本
[root ~]# git checkout 0.7.0 // 切换到 0.7.0 版本
[root ~]# rm -rf mo-data // 清理数据目录
[root ~]# make build // 构建 matrixone
...    // 此处省略构建过程代码
```

**我使用带 CN 标签的方式连 proxy，登录 MatrixOne 集群出现密码验证错误的提示**

- **问题原因**：连接字符串书写有误。通过 MySQL 客户端连接 MatrixOne 集群，支持扩展用户名（username）字段，在用户名（username）后添加 `?`，`?` 后可以跟随 CN 组标签，CN 组标签的 key 和 value 之间用 `=` 间隔，多个 key-value 之间用逗号 `,` 间隔。

- **解决方法**：请参考以下示例。

假设在你的 MatrixOne 的 `mo.yaml` 配置文件中，CN 组的配置如下所示：

```yaml
## 仅展示部分代码
...
- cacheVolume:
    size: 100Gi
  cnLabels:
  - key: workload
    values:
    - bk
...
```

通过 MySQL 客户端连接 MatrixOne 集群，你可以使用以下命令示例：`mysql -u root?workload=bk -p111 -h 10.206.16.10 -P 31429`。其中，`workload=bk` 为 CN 标签，使用 `=` 连接。

**安装最新的 operator，一直有一个叫 job-bucket 的 pod 起不来，请问应该怎么排查？**

可以看看是否没有 secret。可能是没有配置 minio 连接信息导致没办法连接 minio。

同理，使用 `mo-dump` 工具导出数据的命令，你可以参考使用以下命令示例：`mo-dump -u "dump?workload=bk" -h 10.206.16.10 -P 31429 -db tpch_10g > /tmp/mo/tpch_10g.sql`。
