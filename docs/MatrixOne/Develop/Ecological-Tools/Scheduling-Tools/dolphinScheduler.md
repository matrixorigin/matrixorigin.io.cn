# 使用 DolphinScheduler 连接 MatrixOne

## 概述

Apache DolphinScheduler 是一个分布式、易扩展的可视化 DAG 工作流任务调度开源系统。它提供了一种解决方案，可以通过可视化操作任务、工作流和全生命周期的数据处理过程。

Apache DolphinScheduler 的主要目标是解决复杂的大数据任务依赖关系。它使用 DAG（Directed Acyclic Graph，有向无环图）的流式方式来组装任务，允许您实时监控任务的执行状态，支持任务重试、指定节点恢复失败、暂停、恢复、终止等操作。

MatrixOne 支持与可视化 DAG 工作流任务调度系统 DolphinScheduler 进行连接。本文将指导您如何通过 DolphinScheduler 连接到 MatrixOne 并创建任务工作流。

## 开始前准备

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。

- 已完成[安装 DolphinScheduler](https://dolphinscheduler.apache.org/zh-cn/docs/3.1.8/guide/installation/standalone)。

## 操作步骤

### 第一步：配置 MySQL 驱动

1. 下载 MySQL 驱动并将其复制到 libs 目录：

    在安装完成后，您需要手动下载 [mysql-connector-java 驱动](https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.16/mysql-connector-java-8.0.16.jar)（版本 8.0.16），然后将它分别复制到 DolphinScheduler 安装目录下的四个目录中：`api-server/libs`、`alert-server/libs`、`master-server/libs` 和 `worker-server/libs`。

    !!! 注意
		    推荐使用 `mysql-connector-java-8.0.16.jar` 作为 MySQL 驱动包。

2. 重启 DolphinScheduler：

    复制驱动包完成后，需要重启 DolphinScheduler 服务。首先进入 DolphinScheduler 的安装目录，然后执行以下命令来重启 DolphinScheduler 服务：

    ```shell
    # 停止 Standalone Server 服务
    bash ./bin/dolphinscheduler-daemon.sh stop standalone-server
    # 启动 Standalone Server 服务
    bash ./bin/dolphinscheduler-daemon.sh start standalone-server
    ```

3. 登录 DolphinScheduler：

	  使用默认用户名 `admin` 和密码 `dolphinscheduler123`，通过访问 <http://ip:12345/dolphinscheduler/ui> 登录 DolphinScheduler 的 Web 用户界面，如下图所示：

    ![image-20230809145317885](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809145317885.png)

4. 创建数据源：

    点击**数据源中心 > 创建数据源**，填写 MatrixOne 数据连接信息。完成后，点击**测试连接**，如果连接成功，点击**确定**保存：

    ![image-20230809145935857](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809145935857.png)

### 第二步：创建项目工作流

1. 创建租户：

    在**安全中心**中，点击**创建租户**，填写租户名称，如下图所示：

    ![image-20230809160632965](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809160632965.png)

		!!! 注意
				在生产环境中，不建议使用 root 作为租户。

2. 创建项目：

    在**项目管理**中，点击**创建项目**，填写项目名称，如下图所示：

    ![image-20230809150528364](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809150528364.png)

3. 创建工作流并添加节点：

    点击上一步创建的**项目名称**，然后点击**创建工作流**。从左侧拖动 **SQL** 节点到右侧的画布上，填写**节点名称**、**数据源信息**、**SQL 类型**、**SQL 语句**，然后点击**确定**。如下图所示：

    此步骤创建的是一个建表节点，SQL 语句用于创建表格。

    ![image-20230809151554568](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809151554568.png)

    接下来，类似地创建**插入数据**和**查询数据**节点。这三个节点的依赖关系如下图，您可以手动连接它们：

 ![image-20230809153149428](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809153149428.png)		

    三个节点的 SQL 语句如下：

    ```sql
    #create_table

    CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, name

    VARCHAR(255) NOT NULL)

    #insert_data

    INSERT INTO test_table (name) VALUES ('John Doe')

    #select_data

    SELECT * FROM test_table
    ```

    根据依赖关系连接这三个节点，然后点击**保存**。填写**工作流名称**，选择之前创建的**租户**，选择执行策略为**并行**，然后点击**确定**。

    ![image-20230809161503945](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809161503945.png)

    创建好工作流后，您可以在**工作流关系**页面看到创建的工作流，其状态为**工作流下线**：

    ![image-20230809161909925](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809161909925.png)

    同样，您也可以在**工作流定义**页面看到定义的工作流，其状态为**下线**：

    ![image-20230809162411368](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809162411368.png)

4. 上线并运行工作流：

    工作流必须先上线才能运行。点击**上线**按钮，将之前创建的工作流上线：

    ![image-20230809162245088](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809162245088.png)

    上线后，工作流的状态如下图所示：

    ![image-20230809163722777](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809163722777.png)

    接下来，点击**运行**按钮，设置启动前的配置参数，然后点击**确定**：

    ![image-20230809162828049](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809162828049.png)

    最后，返回**项目概况**，查看工作流以及下面的三个任务是否成功运行，如下图所示：

    ![image-20230809163533339](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Scheduling-tool/image-20230809163533339.png)
