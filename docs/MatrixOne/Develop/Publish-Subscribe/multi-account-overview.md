# 多租户概述

与 MySQL 不同，MatrixOne 是一个具备多租户能力的数据库。在一个 MatrixOne 集群中，可以通过使用 `CREATE ACCOUNT` 命令创建租户。这些租户在逻辑上是完全独立的数据空间，所有的数据和操作都与其他租户完全隔离。当用户通过租户的用户名和密码登录时，相当于进入了一个独立的 MySQL 实例，可以进行各种数据库和数据表的创建操作，而不会对其他租户的数据产生任何影响。

## 租户概念介绍

在 MatrixOne 中，`租户（Account）` 是权限管理体系的一部分。可以参考[权限管理概述](../../Security/role-priviledge-management/about-privilege-management.md)章节以了解更详细的权限管理体系信息。

多租户的使用场景多种多样，包括在 SaaS 应用中的多租户设计、集团公司中不同子公司账号的隔离、微服务架构下各服务数据库的使用等。有关详细的应用场景，请参考 MatrixOne 功能概述中的[多租户](../../Overview/feature/key-feature-multi-accounts.md)章节。

## 创建和使用租户

1. 对于开发人员而言，在 MatrixOne 中仅需使用 SQL 语句即可创建和使用租户。可参考[创建租户，验证资源隔离](../../Security/how-tos/quick-start-create-account.md)章节中的详细案例。
2. 对于运维人员而言，在分布式版本的 MatrixOne 中，需要对租户进行资源隔离和扩展配置。请参考[负载与租户隔离](../../Deploy/mgmt-cn-group-using-proxy.md)以及[集群库的扩容和缩容](../../Deploy/MatrixOne-cluster-Scale.md)章节中的实操指南。

## 租户间的发布和订阅

除了确保租户之间的数据和负载隔离外，MatrixOne 还提供了一种允许租户间数据互通的机制，即发布和订阅能力。这一机制可用于解决数据同步和大量数据分发等场景中的互通问题。详细信息请参考[发布订阅](pub-sub-overview.md)章节。
