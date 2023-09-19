# 通过永洪 BI 实现 MatrixOne 的可视化报表

## 概述

永洪 BI 是一款全面的大数据平台，它整合了自服务数据准备、探索性自助分析、深度分析、企业级管理和高性能计算功能，提供了一站式的大数据解决方案。永洪 BI 的目标是为各种规模的企业提供灵活易用的全业务链大数据分析工具，使用户能够轻松发掘大数据的价值并获得深刻的洞察力。

MatrixOne 支持连接到智能数据分析工具永洪 BI。本文将指导您如何通过永洪 BI 连接到单机版 MatrixOne，并创建各种可视化数据报表。

## 开始前准备

- 已完成[安装和启动 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)。
- 已完成[安装永洪 BI](https://www.yonghongtech.com/cp/desktop/)。永洪 BI 是一款免费智能数据分析工具，基于本机安装，省去繁琐的部署环节，即装即用。

## 通过永洪 BI 连接 MatrixOne 服务

### 添加数据源

打开永洪 BI，选择左侧的**添加数据源 > +（新建数据源）**，在弹出的数据库选项中选择 **MySQL**。

![添加数据源](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/yonghong/yonghong_add_connect.png)

填写完成 MatrixOne 数据库相关的连接信息后，您可以选择右上角的**测试连接**按钮，以确保连接成功。

连接成功后，点击**保存**以保存我们刚刚填写的数据源信息。

![连接到 MatrixOne](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/yonghong/yonghong_connect.png)

### 创建数据集

在永洪 BI 中，选择左侧的**创建数据集**菜单，然后选择刚刚添加的数据源。您将看到 MatrixOne 数据库中的表格和视图信息。根据您的业务需求，添加**自定义 SQL**，然后点击**刷新数据**。查询结果将显示在右侧，确认查询结果是否符合预期后，点击**保存**以保存数据集。

![创建数据集](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/yonghong/yonghong_dataset.png)

### 制作报告

首先，在永洪 BI 中选择左侧的**制作报告**菜单，然后从右侧选择合适的**图表组件**并拖动到左侧。

![制作报告](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/yonghong/yonghong_panel_add.png)

选择刚刚创建的数据集，将时间维度设置为 X 轴，将日订单数和活跃用户数设置为 Y 轴。您可以将度量和维度**字段根据需要拖动到相应的位置**。编辑完成后，点击**保存**以保存刚刚制作的报告。

![制作报告](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/yonghong/yonghong_report.png)

### 查看报告

最后，在永洪 BI 中选择**查看报告**，然后点击左侧的树状菜单中我们刚刚创建的报告名称，您将能够查看我们上面制作的报告效果。

![查看报告](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/bi-connection/yonghong/yonghong_result.png)

您已经成功地使用永洪 BI 连接到 MatrixOne 数据库，并创建了一个简单的报告，用于可视化展示 MatrixOne 数据。
