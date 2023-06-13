# 部署常见问题

## 操作系统要求

* **部署 MatrixOne 所需的操作系统版本是什么？**

- 单机推荐配置：MatrixOne 当前支持下表中操作系统。

| Linux OS                 | 版本                   |
| :----------------------- | :------------------------ |
| Red Hat Enterprise Linux | 7.3 or later 7.x releases |
| CentOS                   | 7.3 or later 7.x releases |
| Oracle Enterprise Linux  | 7.3 or later 7.x releases |
| Ubuntu LTS               | 22.04 or later            |

- MatrixOne 也支持 macOS 操作系统，当前仅建议在测试和开发环境运行。

| macOS | 版本                |
| :---- | :--------------------- |
| macOS | Monterey 12.3 or later |

## 硬件要求

MatrixOne 对部署硬件的配置要求如何？**

单机安装情况下，MatrixOne 当前可以运行在 Intel x86-64 架构的 64 位通用硬件服务器平台上。

对于开发、测试和生产环境的服务器硬件配置要求和建议如下：

### 开发和测试环境要求

| CPU     | 内存 | 本地存储   |
| :------ | :----- | :-------------- |
| 4 core+ | 16 GB+ | SSD/HDD 200 GB+ |

ARM 架构的 Macbook M1/M2 也适合开发环境。

### 生产环境要求

| CPU      | 内存 | 本地存储   |
| :------- | :----- | :-------------- |
| 16 core+ | 64 GB+ | SSD/HDD 500 GB+ |

## 安装和部署

### **安装时需要更改什么设置吗？**

通常情况下，安装时，你无需更改任何设置。`launch.toml` 默认设置完全可以直接运行 MatrixOne。但是如果你需要自定义监听端口、IP 地址、存储数据文件路径，你可以修改相应的 [`cn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-tae-CN-tae-DN/cn.toml)、[`dn.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-tae-CN-tae-DN/dn.toml) 或 [`log.toml`](https://github.com/matrixorigin/matrixone/blob/main/etc/launch-tae-CN-tae-DN/log.toml)，这些文件内参数配置详情可参考[通用参数配置](../Reference/System-Parameters/configuration-settings.md)

### **当我安装完成 MySQL 客户端后，打开终端运行 `mysql` 产生报错 `command not found: mysql`，我该如何解决？**

产生这个报错是环境变量未设置的原因，打开一个新的终端，执行以下命令：

=== "**Linux 环境**"

     ```
     cd ~
     sudo vim /etc/profile
     password:
     ```

     回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码；如果没有设置密码，则直接回车跳过即可。

     输入/跳过 root 密码后，即进入了 *profile* 文件，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

     ```
     export PATH=/software/mysql/bin:$PATH
     ```

     输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。继续输入 `source  /etc/profile`，回车执行，运行环境变量。

=== "**MacOS 环境**"

     ```
     cd ~
     sudo vim .bash_profile
     Password:
     ```

     回车执行上面的命令后，需要输入 root 用户密码，即你在安装 MySQL 客户端时，你在安装窗口设置的 root 密码；如果没有设置密码，则直接回车跳过即可。

     输入/跳过 root 密码后，即进入了 *profile* 文件，点击键盘上的 *i* 进入 insert 状态，即可在文件下方输入如下命令：

     ```
     export PATH=${PATH}:/usr/local/mysql/bin
     ```

     输入完成后，点击键盘上的 esc 退出 insert 状态，并在最下方输入 `:wq` 保存退出。继续输入 `source .bash_profile`，回车执行，运行环境变量。

### **当我安装选择从源代码安装构建 MatrixOne 时，产生了以下错误或构建失败提示，我该如何继续？**

报错：`Get "https://proxy.golang.org/........": dial tcp 142.251.43.17:443: i/o timeout`

由于 MatrixOne 需要许多 GO 库作为依赖项，所以它在构建时，会同时下载 GO 库。上述所示的报错是下载超时的错误，主要原因是网络问题。

- 如果你使用的是中国大陆的网络，你需要设置你的 GO 环境到一个中国的镜像网站，以加快 GO 库的下载。

- 如果你通过 `go env` 检查你的 GO 环境，你可能会看到 `GOPROXY="https://proxy.golang.org,direct"`，那么你需要进行下面设置：

```
go env -w GOPROXY=https://goproxy.cn,direct
```

设置完成后，`make build` 应该很快就能完成。

### **当我想将 MatrixOne 的数据目录保存到我指定的文件目录中，我应该如何操作？**

当你使用 Docker 启动 MatrixOne，你可以将你指定的数据目录挂载至 Docker 容器，参见[挂载目录到 Docker 容器](../Maintain/mount-data-by-docker.md)。

当你使用源码或二进制包编译并启动 MatrixOne，你可以通过修改配置文件中的默认数据目录路径：打开 MatrixOne 源码文件目录 `matrixone/etc/launch-tae-CN-tae-DN`，修改 `cn.toml`、`dn.toml` 和 `log.toml` 三个文件内的配置参数 `data-dir = "./mo-data"` 为 `data-dir = "your_local_path"`，保存后重启 MatrixOne 即可生效。

### **当我通过 MO-Tester 对 MatrixOne 进行测试时，我如何解决产生的 `too many open files` 错误？**

为了对 MatrixOne 进行测试，MO-Tester 会快速地打开和关闭许多 SQL 文件，于是很快就达到 Linux 和 MacOS 系统的最大打开文件限制，这就是导致 `too many open files` 错误的原因。

* 对于 MacOS 系统，你可以通过一个简单的命令设置打开文件的限制：

```
ulimit -n 65536
```

* 对于 Linux 系统，请参考详细的[指南](https://www.linuxtechi.com/set-ulimit-file-descriptors-limit-linux-servers/)，将 *ulimit* 设置为 100000。

设置完成后，将不会出现 `too many open files` 错误。

### **我的 PC 是 M1 芯片，当我进行 SSB 测试时，发现无法编译成功 ssb-dbgen**

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

### **我先在 main 分支构建了 MatrixOne，现在切换到其他版本再进行构建出现 panic**

如果你选择某个版本的代码并 `make build` 编译构建了 MatrixOne，则会产生 *mo-data* 的数据文件目录，此时如果你需要切换版本（即 `git checkout version-name`)，由于版本不兼容，你需要先清理 *mo-data*（即 `rm -rf mo-data`），再构建 MatrixOne。代码示例：

```
[root ~]# cd matrixone  // 进入 matrixone 文件目录
[root ~]# git branch // 查看当前分支
* main
[root ~]# make build // 构建 matrixone
...    // 此处省略构建过程代码。如果你此时想要切换到其他版本，例如 0.7.0 版本
[root ~]# git checkout 0.7.0 // 切换到 0.7.0 版本
[root ~]# rm -rf mo-data // 清理数据目录
[root ~]# make build // 构建 matrixone
...    // 此处省略构建过程代码
[root ~]# ./mo-service --daemon --launch ./etc/quickstart/launch.toml &> test.log &   // 在终端的后台启动 MatrixOne 服务
```

!!! note
    MatrixOne 0.8.0 版本兼容旧版本存储格式。如果你使用的是 0.8.0 版本或更高版本，执行切换至其他分支并构建时，则无需再清理数据文件目录。
