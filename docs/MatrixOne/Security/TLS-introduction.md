# 数据传输加密

本篇文档将介绍 MatrixOne 对数据传输加密的支持情况以及如何开始加密传输。

## 概述

MatrixOne 默认采用非加密传输，也支持启用基于 TLS 协议的加密传输。使用加密传输可以减少数据库中敏感信息的泄露风险。加密传输是采用密钥对信息进行加密和解密的过程，可以有效的保护数据的安全。

传输层安全性 (Transport Layer Security, TLS) 是一种广泛采用的安全性协议，MatrixOne 支持的协议版本有 TLS 1.0, TLS 1.1, TLS 1.2。

- 不开启 TLS 加密传输（默认）：直接使用用户名密码连接 MatrixOne 即可。
- 使用加密传输：需要在 MatrixOne 服务端开启加密传输支持，并在客户端指定使用加密传输。你可以通过本文指导，开启 TLS 安全连接。

## 如何使用

**TLS 安全连接配置主要步骤概述**：

1. 首先在 MatrixOne 中开启 TLS。

2. 然后配置 MySQL 客户端安全连接参数。

完成这两个主要步骤的配置后，即可建立 TLS 安全连接。

### 步骤一：开启 MatrixOne 的 TLS 支持

1. 生成证书及密钥：MatrixOne 尚不支持加载有密码保护的私钥，因此必须提供一个没有密码的私钥文件。证书和密钥可以使用 OpenSSL 签发和生成，推荐使用 MySQL 自带的工具 `mysql_ssl_rsa_setup` 快捷生成：

    ```
    #检查你本地 MySQL 客户端的安装目录
    ps -ef|grep mysql
    #进入到你本地 MySQL 客户端的安装目录
    cd /usr/local/mysql/bin
    #生成证书和密钥
    ./mysql_ssl_rsa_setup --datadir=<yourpath>
    #检查你生成的 pem 文件
    ls <yourpath>
    ├── ca-key.pem
    ├── ca.pem
    ├── client-cert.pem
    ├── client-key.pem
    ├── private_key.pem
    ├── public_key.pem
    ├── server-cert.pem
    └── server-key.pem
    ```

    __Note__: 上述代码中的 `<yourpath>` 是你需要存放生成的证书及密钥文件的本地目录路径。

2. 进入到你本地的 MatrixOne 文件目录路径 *matrixone/etc/launch-tae-CN-tae-TN/* 中的 *cn.toml* 配置文件：

    你也可以使用 vim 命令直接在终端中打开 cn.toml 文件

    ```
    vim $matrixone/etc/launch-tae-CN-tae-TN/cn.toml
    ```

    将下面的代码段复制粘贴到配置文件中：

    ```
    [cn.frontend]
    #default is false. With true. Server will support tls
    enableTls = true

    #default is ''. Path of file that contains X509 certificate in PEM format for client
    tlsCertFile = "<yourpath>/server-cert.pem"

    #default is ''. Path of file that contains X509 key in PEM format for client
    tlsKeyFile = "<yourpath>/server-key.pem"

    #default is ''. Path of file that contains list of trusted SSL CAs for client
    tlsCaFile = "<yourpath>/ca.pem"
    ```

    __Note__: 上述代码中的 `<yourpath>` 是你需要存放生成的证书及密钥文件的本地目录路径

    上述代码中，配置参数解释如下：

    | 参数        | 描述                                               |
    | ----------- | -------------------------------------------------- |
    | enableTls   | 布尔类型，是否在 MatrixOne 服务端打开 TLS 的支持。 |
    | tlsCertFile | 指定 SSL 证书文件路径                              |
    | tlsKeyFile  | 指定证书文件对应的私钥                             |
    | tlsCaFile   | 可选，指定受信任的 CA 证书文件路径                 |

    __Note__: 如果你是使用 Docker 安装部署的 MatrixOne，修改配置文件之前，你需要先挂载配置文件再进行修改，操作具体参见[挂载目录到 Docker 容器](../Maintain/mount-data-by-docker.md)。

3. 验证 MatrixOne 的 SSL 是否启用。

    ① 使用 MySQL 客户端连接 MatrixOne，此处以初始账号和密码为例：

    ```
    mysql -h 127.0.0.1 -P 6001 -uroot -p111

    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    ```

    ② 使用 `Status` 命令查看 SSL 是否启用。

    成功启用，代码示例如下，可以看到 SSL 状态为 `Cipher in use is TLS_AES_128_GCM_SHA256`：

    ```
    mysql> status
    mysql  Ver 8.0.28 for macos11 on arm64 (MySQL Community Server - GPL)

    Connection id:          1001
    Current database:
    Current user:           root@0.0.0.0
    SSL:                    Cipher in use is TLS_AES_128_GCM_SHA256
    Current pager:          stdout
    Using outfile:          ''
    Using delimiter:        ;
    Server version:         8.0.30-MatrixOne-v1.0.0 MatrixOne
    Protocol version:       10
    Connection:             127.0.0.1 via TCP/IP
    Server characterset:    utf8mb4
    DB     characterset:    utf8mb4
    Client characterset:    utf8mb4
    Conn.  characterset:    utf8mb4
    TCP port:               6001
    Binary data as:         Hexadecimal
    --------------
    ```

    未启用成功，则返回结果如下，可以看到 SSL 状态为 `Not in use`，你需要重新检查一下上述步骤中你所配置证书及密钥文件的本地目录路径（即 <yourpath>）是否正确：

    ```
    mysql> status;
    /usr/local/mysql/bin/mysql  Ver 8.0.30 for macos12 on arm64 (MySQL Community Server - GPL)

    Connection id:		1009
    Current database:	test
    Current user:		root@0.0.0.0
    SSL:			Not in use
    Current pager:		stdout
    Using outfile:		''
    Using delimiter:	;
    Server version:		8.0.30-MatrixOne-v1.0.0 MatrixOne 
    Protocol version:	10
    Connection:		127.0.0.1 via TCP/IP
    Server characterset:	utf8mb4
    Db     characterset:	utf8mb4
    Client characterset:	utf8mb4
    Conn.  characterset:	utf8mb4
    TCP port:		6001
    Binary data as:		Hexadecimal
    --------------
    ```

完成上述步骤后，即开启了 MatrixOne 的 TLS。

## 步骤二：配置 MySQL 客户端参数

MySQL 客户端连接 MatrixOne Server 时，需要通过 `--ssl-mode` 参数指定加密连接行为，如：

```sql
mysql -h 127.0.0.1 -P 6001 -uroot -p111 --ssl-mode=PREFERRED
```

!!! info
    上述代码段中的登录账号为初始账号，请在登录 MatrixOne 后及时修改初始密码，参见[密码管理](password-mgmt.md)。

ssl mode 取值类型如下：

| ssl-mode 取值   | 含义                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------- |
| DISABLED        | 不使用 SSL/TLS 建立加密连接，与 skip-ssl 同义。                                                   |
| PREFERRED       | 默认行为，优先尝试使用 SSL/TLS 建立加密连接，如果无法建则尝试建立非 SSL/TLS 连接。                |
| REQUIRED        | 只会尝试使用 SSL/TLS 建立加密连接，如果无法建立连接，则会连接失败。                               |
| VERIFY_CA       | 与 REQUIRED 行为一样，并且还会验证 Server 端的 CA 证书是否有效。                                  |
| VERIFY_IDENTITY | 与 VERIFY_CA 行为一样，并且还验证 Server 端 CA 证书中的 host 是否与实际连接的 hostname 是否一致。 |

!!! note
    客户端在指定了 `--ssl-mode=VERIFY_CA` 时，需要使用 `--ssl-ca` 来指定 CA 证书。
    客户端在指定了 `--ssl-mode=VERIFY_IDENTITY` 时，需要指定 CA 证书，且需要使用 `--ssl-key` 指定客户端的私钥和使用 `--ssl-cert` 指定客户端的证书。
