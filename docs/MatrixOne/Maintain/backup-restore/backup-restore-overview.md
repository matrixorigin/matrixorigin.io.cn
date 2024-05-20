# MatrixOne 备份与恢复概述

数据库备份与恢复是任何数据库管理系统的核心操作之一，也是数据安全与可用性的重要保障。MatrixOne 也提供了灵活且强大的数据库备份与恢复功能，以确保用户数据的完整性和持续性。本文将介绍 MatrixOne 数据库备份与恢复的重要性、备份策略、备份方法。

## 备份和恢复策略

在不同灾难恢复情况下，可使用数据库备份恢复运行状态。

以下是针对不同情况的备份恢复方法：

1. **操作系统崩溃**：

    - 若有物理备份：崩溃后，通过物理备份还原整个数据库状态，还原备份至正常硬件环境，应用重做日志以保证数据一致性。
    - 若有逻辑备份：通过逻辑备份，在新服务器上重建数据库架构和数据。先安装数据库软件，执行逻辑备份中的 SQL 语句创建表、索引等，再导入数据。

2. **电源（检测）失败**：

    - 若有物理备份：失败后，可通过物理备份恢复数据库，还原备份至正常硬件环境，应用重做日志保证数据一致性。
    - 若有逻辑备份：同样，通过逻辑备份在新服务器上重建数据库。

3. **文件系统崩溃**：

    - 若有物理备份：使用物理备份恢复数据库，还原备份至正常硬件环境，应用重做日志以确保数据一致性。
    - 若有逻辑备份：崩溃后，在新服务器上重建数据库架构和数据。

4. **硬件问题（硬盘、主板等）**：

    - 若有物理备份：通过物理备份恢复数据库，还原备份至新硬件环境，应用重做日志保证数据一致性。
    - 若有逻辑备份：使用逻辑备份在新硬件环境中重建数据库。

针对备份恢复可以遵循以下策略：

1. **备份频率**: 确定备份的频率，通常分为全量备份和增量备份。全量备份会占用更多存储空间和时间，但恢复速度较快，而增量备份则更加经济。

2. **备份存储**: 选择安全的备份存储位置，确保备份数据不易受到破坏或丢失。通常使用离线存储介质或云存储来存放备份。

3. **备份保留期**: 确定备份数据的保留期，以便在需要时进行历史数据的检索和恢复。根据法规和业务需求，制定相应的数据保留政策。

无论何种恢复情况，应遵循以下原则：

1. 考虑停止数据库运行，防止数据变更。
2. 根据备份类型选择合适备份进行恢复。
3. 还原备份文件。
4. 考虑应用相应重做日志，以保证数据一致性。
5. 启动数据库并进行必要测试。

## 数据库备份方法

MatrixOne 提供多种备份方式，可根据数据库需求、性能、资源和恢复时间等因素，综合考虑选择适当备份方法。

MatrixOne 数据库提供了多种备份工具，以满足不同场景和需求：

1. **mo-dump**: 用于导出数据库中的数据和模式。它生成可恢复的 SQL 脚本，用于逻辑备份。

2. **mo-backup**: 用于物理备份和恢复。`mo-backup` 是 MatrixOne 企业级服务的物理备份与恢复工具，帮助你保护其 MatrixOne 数据库，并在需要时进行可靠的恢复操作。

   !!! note
       **mo-backup** 企业级服务的物理备份与恢复工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

### 逻辑备份与恢复

#### 使用 `SELECT INTO OUTFILE` 备份

使用 `SELECT ... INTO OUTFILE` 命令将检索的数据按格式导出到文件，导出的文件由 MatrixOne 服务创建，仅在 MatrixOne 服务器主机上。不支持导出至客户端文件系统，导出目录勿重名文件，避免新文件覆盖。

操作步骤及示例，参见 [`SELECT INTO...OUTFILE`](../../Develop/export-data/select-into-outfile.md)

#### 使用 `mo-dump` 备份

MatrixOne 支持使用 `mo-dump` 工具进行逻辑备份，生成可用于重新创建数据库对象和数据的 SQL 语句。

操作步骤及示例，参见 [`mo-dump 工具写出`](../../Develop/export-data/modump.md)

#### 使用命令行批量导入恢复

MatrixOne 支持使用 `LOAD DATA` 命令将大量行插入数据库表，也支持使用 `SOURCE` 命令导入表结构和数据至整个数据库。

更多信息，参考[批量导入](../../Develop/import-data/bulk-load/bulk-load-overview.md)

### 物理备份与恢复

#### 使用 `mo_br` 备份与恢复

MatrixOne 支持使用 `mo_br` 工具进行常规物理备份和快照备份。

操作步骤及示例，参见 [`mo-br 使用指南`](../backup-restore/mobr-backup-restore/mobr.md)

#### 使用 SQL 备份与恢复

MatrixOne 支持使用 SQL 进行快照备份与恢复。

有关使用 SQL 进行快照备份与恢复的方法，请参考文档：

- [CREATE SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [DROP SNAPSHOT](../../Reference/SQL-Reference/Data-Definition-Language/drop-snapshot.md)
- [SHOW SNAPSHOTS](../../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [RESTORE ACCOUNT](../../Reference/SQL-Reference/Data-Definition-Language/restore-account.md)
