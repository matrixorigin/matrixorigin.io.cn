# 系统参数概述

在 MatrixOne 中，涉及多种数据库系统参数，其中一部分以配置文件的方式进行设置，仅在启动时生效，这类参数被称为**静态参数**。

另一种类型是可以在客户端进行动态配置且立即生效的参数，被称为**动态参数**。这两种参数类型用于配置和控制 MatrixOne 服务器的行为。

动态参数的修改方式可以分为会话级别和全局级别的参数配置。

- **全局级别参数配置：**针对 MatrixOne 当前租户的参数配置。这些参数影响所有新连接到该租户的会话。全局参数在 MatrixOne 服务器启动时会持久化保存在元数据表 mo_catalog.mo_mysql_compatbility_mode 中，对全局参数的修改会在下次登录时生效。

- **会话级别参数配置：**针对单个 MatrixOne 连接的参数配置。这些参数仅影响该连接的行为。会话参数会在连接建立时从 mo_catalog.mo_mysql_compatbility_mode 中读取，可以通过客户端命令来配置当前连接。当连接关闭时，会话参数的配置将会被重置为默认值。

需要注意的是，MatrixOne 是一个多租户数据库，`set global` 只会影响当前租户。

## 参考文档

- 静态参数的相关文档，你可以参考：

    + [单机版通用参数配置](standalone-configuration-settings.md)
    + [分布式通用参数配置](distributed-configuration-settings.md)

- 动态参数的相关文档，你可以参考：

    + [系统变量](../Variable/system-variables/system-variables-overview.md)
    + [自定义变量](../Variable/custom-variable.md)
