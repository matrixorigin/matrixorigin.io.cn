## Dify 平台接入 MatrixOne 指南

本文档介绍如何将 Dify 平台与 MatrixOne 数据库集成，使用 MatrixOne 作为 Dify 的向量存储后端。

## 开始前准备

### 安装 Git

通过[官方文档](https://git-scm.com/download/mac)安装 Git。

使用 `git version` 检查是否安装成功，安装成功代码示例如下：

```
> git version
git version 2.40.0
```

### 安装 docker

1. 点击 <a href="https://docs.docker.com/get-docker/" target="_blank">Get Docker</a>，进入 Docker 的官方文档页面，根据你的操作系统，下载安装对应的 Docker，Docker 版本推荐选择在 20.10.18 及以上，且尽量保持 Docker client 和 Docker server 的版本一致。

2. 安装完成后，通过下述代码行确认 Docker 版本，验证 Docker 安装是否成功：

    ```
    docker --version
    ```

    安装成功，代码示例如下：

    ```
    Docker version 20.10.18, build 100c701
    ```

3. 直接打开你本地 Docker 客户端，启动 Docker。

## 操作步骤

### 获取 Dify 代码

克隆 Dify 最新源代码至本地环境。

```bash
git clone https://github.com/langgenius/dify.git
```

### 构建 Docker 镜像

```bash
cd dify/api
docker build -t langgenius/dify-api:mo .
```

### 配置环境

```bash
cd ../docker
cp .env.example .env
```

编辑 `.env` 文件，配置 MatrixOne 连接参数：

```bash
VECTOR_STORE=matrixone # vector store 类型改为 matrixone，必须
MATRIXONE_HOST=matrixone # MO 实例的 IP/hostname，可选
MATRIXONE_PORT=6001 # 端口号，可选
MATRIXONE_USER=dump # 用户名，可选
MATRIXONE_PASSWORD=111 # 密码，可选
MATRIXONE_DATABASE=dify # 库名，可选
```

### 修改 Docker Compose 配置

修改 docker-compose.yaml 文件：将 dify-api 的镜像替换为 langgenius/dify-api:mo (注意有两处需要修改)

### 启动 Dify 服务

```bash
docker compose up -d
```

### 配置 Dify 平台

1. 访问 <http://localhost/install> 完成初始化设置

2. 进入设置界面配置 AI 模型

    - 选择模型供应商
    - 配置 API Key
    - 选择适当的模型

3. 创建知识库

    - 上传所需文件
    - 验证数据导入

![Alt text](../images/dify-mo-demo_4.png)

### 验证集成

```bash
> mysql -u root -p111 -h 127.0.0.1 -P 6001
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 287
Server version: 8.0.30-MatrixOne-v3.0.1 MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> use dify;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+--------------------------------------------------------+
| Tables_in_dify                                         |
+--------------------------------------------------------+
| vector_index_6418005e_dfdb_4add_a5f8_c676fe6731b5_node |
+--------------------------------------------------------+
1 row in set (0.12 sec)

mysql> desc vector_index_6418005e_dfdb_4add_a5f8_c676fe6731b5_node;
+-------------+--------------+------+------+---------------------+-------+---------+
| Field       | Type         | Null | Key  | Default             | Extra | Comment |
+-------------+--------------+------+------+---------------------+-------+---------+
| id          | VARCHAR(36)  | NO   | PRI  | NULL                |       |         |
| embedding   | VECF64(1024) | NO   | MUL  | NULL                |       |         |
| document    | TEXT(0)      | YES  | MUL  | NULL                |       |         |
| meta        | JSON(0)      | YES  | MUL  | NULL                |       |         |
| create_time | DATETIME(0)  | YES  |      | CURRENT_TIMESTAMP() |       |         |
| update_time | DATETIME(0)  | YES  |      | CURRENT_TIMESTAMP() |       |         |
+-------------+--------------+------+------+---------------------+-------+---------+
6 rows in set (0.02 sec)

mysql> select count(*) from vector_index_6418005e_dfdb_4add_a5f8_c676fe6731b5_node;
+----------+
| count(*) |
+----------+
|      140 |
+----------+
1 row in set (0.00 sec)

mysql> 
```