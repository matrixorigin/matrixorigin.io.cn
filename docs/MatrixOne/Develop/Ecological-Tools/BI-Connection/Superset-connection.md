# 通过 Superset 实现 MatrixOne 的可视化监控

## 概述

Superset 是一个开源的、现代的、轻量级 BI 分析工具，能够连接多种数据源、提供丰富的可视化图表，支持自定义仪表盘，帮助用户轻松探索和呈现数据。

MatrixOne 1.0 版本现在支持与数据可视化工具 Superset 集成。本指南将引导您快速部署 MatrixOne 和 Superset 环境，通过将 MatrixOne 与 Superset 的可视化功能相结合，创建一个简单的监控面板，用于监测 MatrixOne 数据库，使用其中的 'system_metric' 数据。

如果您希望进一步扩展功能，您还可以探索其他配置选项，以监控整个 MatrixOne 数据库的各个方面。

## 前期准备

### 硬件环境

本次实践对于机器的硬件要求不高，2C 4G 的小型虚拟机即可完成这个流程的功能体验。

- 推荐硬件资源为：8C 32G 虚拟机。

### 软件环境

本次实践需要安装部署以下软件环境：

- Docker，版本要求为 23.0.1 及以上。
- MatrixOne
- Superset，推荐版本为 2.1.0。

你可以参照下面的章节进行安装。

#### 安装 Docker

本次实践所有软件环境的安装都是基于 Docker 进行，你可以参照 [Docker 官方文档](https://docs.docker.com/get-docker/)进行安装并启动 Docker。

#### 安装 MatrixOne

你可以参照 [macOS 环境下使用 Docker 部署 MatrixOne](../../../Get-Started/install-on-macos/install-on-macos-method3.md) 或 [Linux 环境下使用 Docker 部署 MatrixOne](../../../Get-Started/install-on-linux/install-on-linux-method3.md) 进行安装并启动 MatrixOne.

#### 安装 Superset

使用 Docker 部署单节点的 Superset 步骤如下：

1. 完成安装并启动 Docker 以后，使用以下命令从 Docker Hub 中拉取 Superset 的镜像：

    ```
    docker pull amancevice/superset
    ```

2. 启动 Superset 镜像：

    ```
    docker run -e "SUPERSET_SECRET_KEY=your_secret_key_here" --name superset -u 0 -d -p 8088:8088 amancevice/superset
    ```

    !!! note
        安全密钥可通过 `openssl rand -base64 $num` 来生成，例如生成密钥 `openssl rand -base64 49`。
        参数可参考官网说明：Your App secret key will be used for securely signing the session cookie and encrypting sensitive information on the database. Make sure you are changing this key for your deployment with a strong key. You can generate a strong key using `openssl rand -base64 42`. Alternatively you can set it with `SUPERSET_SECRET_KEY` environment variable.

3. 使用以下命令初始化 Superset 数据库：

    ```
    docker exec -it superset superset db upgrade
    ```

4. 使用以下命令创建 Superset 管理员用户，根据提示输入相关注册信息：

    ```
    docker exec -it superset superset fab create-admin
    ```

5. 使用以下命令创建默认账户：

    ```
    docker exec -it superset superset init
    ```

6. 使用以下命令启动服务，同时开启线程、自动重新加载和调试模式：

    ```
    docker exec -it superset superset run --with-threads --reload --debugger
    ```

## 通过 Superset 连接 MatrixOne

1. 访问 Superset 的登录页面，通常是 `http://ip:8080`，然后输入您的用户名和密码，登录 Superset。

    ![Superset 登录页面](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-login.png)

    __Note:__ Superset 的端口可能是 8080 或 8088，具体取决于您的配置；用户名和密码是您在部署 Superset 时设置的。

    登录后，您将看到 Superset 的主界面。

    ![Superset 主界面](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-dashboard.png)

2. 创建数据库连接：

    在 Superset 中，首先需要创建与 MatrixOne 的数据库连接。在右上角点击 **Settings**，然后选择 **Database Connections**。

    在 Database Connections 页面，点击 **+ DATABASE** 按钮，并选择 **MySQL** 作为数据库类型。

    填写 MatrixOne 数据库的连接信息，包括主机、端口、用户名和密码。

    ![创建数据库连接](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-create-db-connection.png)

    填写完毕后，点击 **CONNECT** 按钮，然后再点击 **FINISH**。

    ![创建查询](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-create-query.png)

## 创建可视化监控仪表板

现在，您可以使用 MatrixOne 数据库创建一个监控仪表板。

1. 点击页面上的 **SQL > SQL Lab**，选择刚刚创建的 MatrixOne 数据库连接，并编写 SQL 查询以选择要监控的数据表。

    ![image-20230807201143069](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/sql-lab.png)

    您可以编写多个查询来监控不同的指标。以下是示例查询的 SQL 语句：

    - CPU 利用率：

     ```sql
     SELECT metric_name, collecttime, value
     FROM metric
     WHERE metric_name = 'sys_cpu_combined_percent' or metric_name = 'sys_cpu_seconds_total'
     ORDER BY collecttime DESC;
     ```

    - 存储使用情况：

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'server_storage_usage'
     ORDER BY collecttime DESC;
     ```

    - 连接数：

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'server_connections'
     ORDER BY collecttime DESC;
     ```

    - 磁盘读写：

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sys_disk_read_bytes' OR metric_name = 'sys_disk_write_bytes'
     ORDER BY collecttime DESC;
     ```

    - 网络接收与发送：

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sys_net_sent_bytes' OR metric_name = 'sys_net_recv_bytes'
     ORDER BY collecttime DESC;
     ```

    - 内存使用情况：

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sys_memory_available' OR metric_name = 'sys_memory_used'
     ORDER BY collecttime DESC;
     ```

   - 事务错误总数：

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sql_transaction_errors' OR metric_name = 'sql_transaction_total'
     ORDER BY collecttime DESC;
     ```

   - SQL 错误总数：

     ```sql
     SELECT metric_name, value, collecttime
     FROM metric
     WHERE metric_name = 'sql_statement_errors' OR metric_name = 'sql_statement_total'
     ORDER BY collecttime DESC;
     ```

2. 点击 **SAVE > Save dataset > SAVE & EXPLORE** 保存上面的每个查询并将其用作后续图表的数据源。

3. 编辑图表：

	  这里我们用其中一个查询为例，来演示如何编辑一个可视化的图表。首先，我们选择 `disk_read_write` 的查询作为图表的制作数据源，在 SQL Lab 中对应查询的下面点击 **CREATE CHART** 或者在上一步保存完 Query 之后，页面将跳转至编辑 Chart 页面：

    ![创建仪表板](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-create-dashboard.png)

4. 进入到图表编辑的页面，依次选择图表类型、时间字段、查询的指标列、查询的分组列等选项，配置完成后，选择**运行**：

    ![查看仪表板](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-view-dashboard.png)

5. 点击 **UPDATE CHART > SAVE**，将编辑好的 Chart 保存。

## 组织仪表板

1. 创建了多个图表后，您可以在 Superset 中组装它们以创建一个监控仪表板：

    点击 **Dashboards**，然后点击 **+ DASHBOARD** 来创建新的仪表板，或者编辑现有的仪表板。

    ![image-20230808101636134](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-add-dashboard.png)

2. 在仪表板编辑页面，你可以从右侧的 CHARTS 列表中拖拽已创建的图表到仪表板上进行组装。你也可以自由调整图表的位置，添加标题等。

    ![image-20230808102033250](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/superset/superset-edit-dashboard.png)

您已经成功地连接了 MatrixOne 数据库与 Superset，创建了一个简单的监控仪表板，以可视化展示 MatrixOne 数据库的重要指标。
