# 错误码

本页说明如何识别客户端报错，并列出部分常见错误及内部错误码。编号、名称和消息模板已按 MatrixOne **v4.2.5** 核对；其他版本请结合实际版本的文档和完整错误消息排查。本页不是全部内部错误码的清单。

## 如何读取错误消息

MySQL 命令行客户端的典型报错如下，具体格式可能因驱动而不同：

```text
ERROR 1062 (23000): Duplicate entry '1' for key 'PRIMARY'
```

| 字段 | 示例 | 含义 |
| --- | --- | --- |
| 客户端错误号 | `1062` | 客户端或驱动收到的数字错误号，用于查询下方的常见错误表。 |
| SQLSTATE | `23000` | 五字符状态值，表示错误类别；它不是 MatrixOne 内部错误码。 |
| 错误消息 | `Duplicate entry '1' for key 'PRIMARY'` | 描述本次错误，包含键名、对象名等排查信息。 |
| MatrixOne 内部码 | `20307` | 对应 `ErrDuplicateEntry`，用于内部分类；客户端消息不一定包含此编号。 |

对于下表所列错误，有具体 MySQL 错误号映射时，客户端收到该 MySQL 错误号；映射为通用未知错误（`ER_UNKNOWN_ERROR`）时，客户端收到 MatrixOne 内部码。例如，数据库不存在对应内部码 `20402`，客户端错误号是 `1049`。因此，不能假设所有客户端错误号都是五位数字，也不能将 SQLSTATE 当作内部码。认证等路径还可能转换错误，应同时记录完整消息。

## 常见客户端错误

同一客户端错误号可能对应多个内部错误。请结合完整消息和 SQLSTATE 判断；下面的处理建议是排查起点，不表示可以自动重试。

| 客户端错误号 | SQLSTATE | 内部码 | 含义与建议操作 |
| --- | --- | --- | --- |
| 20102 | `HY000` | 20102 | 功能尚未实现；检查所用版本的功能限制。 |
| 3015 | `HY000` | 20103 | 内存不足；检查查询计划、数据规模、并发及 CN 资源。 |
| 1317 | `70100` | 20104 | 查询被中断；检查是否取消了请求或执行了 KILL QUERY。 |
| 20105 | `HY000` | 20105 | 当前操作不受支持；根据完整消息检查语法或功能限制。 |
| 20106 | `HY000` | 20106 | 远端执行接收方尚未注册；若持续发生，联系管理员检查 CN 日志和节点状态。 |
| 3015 | `HY000` | 20107 | 内存池容量超限；检查查询内存开销、并发及 CN 资源。 |
| 1062 | `23000` | 20307 | 键值重复；按消息中的键名检查主键或唯一约束及输入数据。 |
| 1136 | `21S01` | 20308 | 列数与值数量不匹配；检查 INSERT 的列清单和对应行。 |
| 1054 | `42S22` | 20309 | 列不存在；检查列名、表别名和实际表结构。 |
| 1049 | `42000` | 20402 | 数据库不存在；检查数据库名称和当前租户。 |
| 1146 | `42S02` | 20403 | 表不存在；检查当前数据库、表名和实际表结构。 |
| 1046 | `3D000` | 20415 | 未选择数据库；先选择数据库，或在对象名称中指定数据库。 |
| 20508 | `HY000` | 20508 | 所有计算节点（CN）繁忙；检查活跃事务和连接并发，再由管理员检查容量。 |
| 20628 | `HY000` | 20628 | 事务在读已提交（RC）模式下需要重试；参见下文的事务重试说明。 |
| 20630 | `HY000` | 20630 | 该事务的 S3 写入不能在当前 RC 重试路径中重试；先核实事务结果和写入状态。 |
| 20638 | `HY000` | 20638 | 事务提交状态未知；先核实提交结果，不要直接重放写入。 |
| 20701 | `HY000` | 20701 | 检测到死锁；确认失败事务已回滚，再决定是否重试整个事务。 |
| 20709 | `HY000` | 20709 | 远端锁等待超时；检查阻塞事务及锁服务、节点状态。 |
| 1205 | `HY000` | 20710 | 锁等待超时；检查阻塞事务和等待时长，并确认当前事务状态。 |

## 事务失败与重试

- **提交状态未知（20638）**：出错不等于事务未提交。保留事务标识，并通过业务唯一键、查询结果及管理员日志核实提交结果；确认结果或具备幂等保障后，再决定是否重新提交。
- **需要重试（20628）**：先确认失败事务的状态。应用层重试应在失败事务结束后启动新事务，重做整个事务，并设置退避和次数上限；不要只在原事务中重复最后一条语句。
- **不能使用当前重试路径（20630）**：消息指向 RC 模式下的 S3 写入限制。不要按“需要重试”处理；先检查事务和写入状态，再决定恢复方式。
- **死锁或锁等待超时（20701、20709、1205）**：检查长事务和阻塞方。SQL 返回错误并不统一表示整个事务已经回滚，重试前需要确认事务状态及操作的幂等性。这里的 `1205` 是内部码 `20710` 对应的客户端错误号。

更多事务用法参见[事务使用指南](../Develop/Transactions/matrixone-transaction-overview/how-to-use.md)。

## 提交问题时保留的信息

记录 MatrixOne 版本、客户端错误号、SQLSTATE、完整错误消息、发生时间，以及相关查询或事务标识。提供脱敏后的 SQL、显式或隐式事务方式、是否已经重试及结果，便于管理员关联节点日志。

## 内部错误码参考

下表中的“代码名称”是源码符号，“消息模板”中的 `%s`、`%d`、`%v` 等是运行时参数占位符，实际报错会包含具体值。TAE 指存储引擎；TN 指事务节点；RPC 指节点间的远程调用；HAKeeper 负责集群协调。分类沿用源码分组，不直接表示问题责任方。

内部码 `20100 / ErrStart` 是错误范围的起始标记；`20626 / ErrTAEDebug` 在 v4.2.5 中只有常量定义，没有消息映射。这两项不作为用户排障条目列出。

| 内部码 | 代码名称 | 消息模板 | 分类 |
| --- | --- | --- | --- |
| 20101 | `ErrInternal` | `internal error: %s` | 内部错误 |
| 20102 | `ErrNYI` | `%s is not yet implemented` | 内部错误 |
| 20103 | `ErrOOM` | `error: out of memory` | 内部错误 |
| 20104 | `ErrQueryInterrupted` | `query interrupted` | 内部错误 |
| 20105 | `ErrNotSupported` | `not supported: %s` | 内部错误 |
| 20106 | `ErrRemoteDispatchNotRegistered` | `remote dispatch receiver %s is not registered yet` | 内部错误 |
| 20107 | `ErrMPoolCapacity` | `mpool physical capacity exceeded: %s` | 内部错误 |
| 20200 | `ErrDivByZero` | `division by zero` | 数字与函数 |
| 20201 | `ErrOutOfRange` | `data out of range: data type %s, %s` | 数字与函数 |
| 20202 | `ErrDataTruncated` | `data truncated: data type %s, %s` | 数字与函数 |
| 20203 | `ErrInvalidArg` | `invalid argument %s, bad value %s` | 数字与函数 |
| 20204 | `ErrTruncatedWrongValueForField` | `truncated type %s value %s for column %s, %d` | 数字与函数 |
| 20300 | `ErrBadConfig` | `invalid configuration: %s` | 无效操作 |
| 20301 | `ErrInvalidInput` | `invalid input: %s` | 无效操作 |
| 20302 | `ErrSyntaxError` | `SQL syntax error: %s` | 无效操作 |
| 20303 | `ErrParseError` | `SQL parser error: %s` | 无效操作 |
| 20304 | `ErrConstraintViolation` | `constraint violation: %s` | 无效操作 |
| 20305 | `ErrDuplicate` | `tae data: duplicate` | 无效操作 |
| 20306 | `ErrRoleGrantedToSelf` | `cannot grant role %s to %s` | 无效操作 |
| 20307 | `ErrDuplicateEntry` | `Duplicate entry '%s' for key '%s'` | 无效操作 |
| 20308 | `ErrWrongValueCountOnRow` | `Column count doesn't match value count at row %d` | 无效操作 |
| 20309 | `ErrBadFieldError` | `Unknown column '%s' in '%s'` | 无效操作 |
| 20400 | `ErrInvalidState` | `invalid state %s` | 未知状态或 I/O 错误 |
| 20401 | `ErrLogServiceNotReady` | `log service not ready` | 未知状态或 I/O 错误 |
| 20402 | `ErrBadDB` | `Unknown database %s` | 未知状态或 I/O 错误 |
| 20403 | `ErrNoSuchTable` | `no such table %s.%s` | 未知状态或 I/O 错误 |
| 20404 | `ErrEmptyVector` | `empty vector` | 未知状态或 I/O 错误 |
| 20405 | `ErrFileNotFound` | `file %s is not found` | 未知状态或 I/O 错误 |
| 20406 | `ErrFileAlreadyExists` | `file %s already exists` | 未知状态或 I/O 错误 |
| 20407 | `ErrUnexpectedEOF` | `unexpected end of file %s` | 未知状态或 I/O 错误 |
| 20408 | `ErrEmptyRange` | `empty range of file %s` | 未知状态或 I/O 错误 |
| 20409 | `ErrSizeNotMatch` | `file %s size does not match` | 未知状态或 I/O 错误 |
| 20410 | `ErrNoProgress` | `file %s has no io progress` | 未知状态或 I/O 错误 |
| 20411 | `ErrInvalidPath` | `invalid file path %s` | 未知状态或 I/O 错误 |
| 20412 | `ErrShortWrite` | `file %s io short write` | 未知状态或 I/O 错误 |
| 20413 | `ErrInvalidWrite` | `file %s io invalid write` | 未知状态或 I/O 错误 |
| 20414 | `ErrShortBuffer` | `file %s io short buffer` | 未知状态或 I/O 错误 |
| 20415 | `ErrNoDB` | `No database selected` | 未知状态或 I/O 错误 |
| 20416 | `ErrNoWorkingStore` | `no working store` | 未知状态或 I/O 错误 |
| 20417 | `ErrNoHAKeeper` | `cannot locate ha keeper` | 未知状态或 I/O 错误 |
| 20418 | `ErrInvalidTruncateLsn` | `invalid truncate lsn, shard %d already truncated to %d` | 未知状态或 I/O 错误 |
| 20419 | `ErrNotLeaseHolder` | `not lease holder, current lease holder ID %d` | 未知状态或 I/O 错误 |
| 20420 | `ErrDBAlreadyExists` | `database %s already exists` | 未知状态或 I/O 错误 |
| 20421 | `ErrTableAlreadyExists` | `table %s already exists` | 未知状态或 I/O 错误 |
| 20422 | `ErrNoService` | `service %s not found` | 未知状态或 I/O 错误 |
| 20423 | `ErrDupServiceName` | `duplicate service name %s` | 未知状态或 I/O 错误 |
| 20424 | `ErrWrongService` | `wrong service, expecting %s, got %s` | 未知状态或 I/O 错误 |
| 20425 | `ErrBadS3Config` | `bad s3 config: %s` | 未知状态或 I/O 错误 |
| 20426 | `ErrBadView` | `invalid view '%s.%s'` | 未知状态或 I/O 错误 |
| 20427 | `ErrInvalidTask` | `invalid task, task runner %s, id %d` | 未知状态或 I/O 错误 |
| 20428 | `ErrInvalidServiceIndex` | `invalid service idx %d` | 未知状态或 I/O 错误 |
| 20429 | `ErrDragonboatTimeout` | `%s` | 未知状态或 I/O 错误 |
| 20430 | `ErrDragonboatTimeoutTooSmall` | `%s` | 未知状态或 I/O 错误 |
| 20431 | `ErrDragonboatInvalidDeadline` | `%s` | 未知状态或 I/O 错误 |
| 20432 | `ErrDragonboatRejected` | `%s` | 未知状态或 I/O 错误 |
| 20433 | `ErrDragonboatInvalidPayloadSize` | `%s` | 未知状态或 I/O 错误 |
| 20434 | `ErrDragonboatShardNotReady` | `%s` | 未知状态或 I/O 错误 |
| 20435 | `ErrDragonboatSystemClosed` | `%s` | 未知状态或 I/O 错误 |
| 20436 | `ErrDragonboatInvalidRange` | `%s` | 未知状态或 I/O 错误 |
| 20437 | `ErrDragonboatShardNotFound` | `%s` | 未知状态或 I/O 错误 |
| 20438 | `ErrDragonboatOtherSystemError` | `%s` | 未知状态或 I/O 错误 |
| 20439 | `ErrDropNonExistsDB` | `Can't drop database '%s'; database doesn't exist` | 未知状态或 I/O 错误 |
| 20500 | `ErrRPCTimeout` | `rpc timeout` | RPC |
| 20501 | `ErrClientClosed` | `rpc client closed` | RPC |
| 20502 | `ErrBackendClosed` | `backend connection closed` | RPC |
| 20503 | `ErrStreamClosed` | `rpc stream closed` | RPC |
| 20504 | `ErrNoAvailableBackend` | `no available backend` | RPC |
| 20508 | `ErrAllCNServersBusy` | `all CN servers are busy, possibly due to too many active transactions` | RPC |
| 20600 | `ErrTxnClosed` | `the transaction %s has been committed or aborted` | 事务 |
| 20601 | `ErrTxnWriteConflict` | `txn write conflict %s` | 事务 |
| 20602 | `ErrMissingTxn` | `missing txn` | 事务 |
| 20603 | `ErrUnresolvedConflict` | `unresolved conflict` | 事务 |
| 20604 | `ErrTxnError` | `transaction error: %s` | 事务 |
| 20605 | `ErrTNShardNotFound` | `dn shard uuid %s, id %d not found` | 事务 |
| 20606 | `ErrShardNotReported` | `dn shard uuid %s, id %d not reported` | 事务 |
| 20607 | `ErrTAEError` | `tae error %s` | TAE 错误 |
| 20608 | `ErrTAERead` | `tae read error` | TAE 错误 |
| 20609 | `ErrRpcError` | `rpc error` | TAE 错误 |
| 20610 | `ErrWaitTxn` | `txn wait error` | TAE 错误 |
| 20611 | `ErrTxnNotFound` | `txn not found` | TAE 错误 |
| 20612 | `ErrTxnNotActive` | `txn not active, state %s` | TAE 错误 |
| 20613 | `ErrTAEWrite` | `tae write error` | TAE 错误 |
| 20614 | `ErrTAECommit` | `tae commit error %s` | TAE 错误 |
| 20615 | `ErrTAERollback` | `tae rollback error %s` | TAE 错误 |
| 20616 | `ErrTAEPrepare` | `tae prepare error %s` | TAE 错误 |
| 20617 | `ErrTAEPossibleDuplicate` | `tae possible duplicate` | TAE 错误 |
| 20618 | `ErrTxnRWConflict` | `r-w conflict` | TAE 错误 |
| 20619 | `ErrTxnWWConflict` | `w-w conflict` | TAE 错误 |
| 20620 | `ErrNotFound` | `not found` | TAE 错误 |
| 20621 | `ErrTxnInternal` | `txn internal error` | TAE 错误 |
| 20622 | `ErrTxnReadConflict` | `txn read conflict %s` | TAE 错误 |
| 20623 | `ErrPrimaryKeyDuplicated` | `duplicated primary key %v` | TAE 错误 |
| 20624 | `ErrAppendableObjectNotFound` | `appendable Object not found` | TAE 错误 |
| 20625 | `ErrAppendableBlockNotFound` | `appendable block not found` | TAE 错误 |
| 20628 | `ErrTxnNeedRetry` | `txn need retry in rc mode` | 事务 |
| 20630 | `ErrTxnCannotRetry` | `txn s3 writes can not retry in rc mode` | 事务 |
| 20638 | `ErrTxnUnknown` | `txn commit status is unknown: %s` | 事务 |
| 20701 | `ErrDeadLockDetected` | `deadlock detected` | 锁错误 |
| 20709 | `ErrRemoteLockWaitTimeout` | `remote lock wait timeout` | 锁错误 |
| 20710 | `ErrLockWaitTimeout` | `Lock wait timeout exceeded; try restarting transaction` | 锁错误 |

## 核对依据

本页的编号及名称来自 [v4.2.5 错误定义与消息映射](https://github.com/matrixorigin/matrixone/blob/v4.2.5/pkg/common/moerr/error.go)，客户端错误号取自 [MySQL 错误号定义](https://github.com/matrixorigin/matrixone/blob/v4.2.5/pkg/common/moerr/mysql_error_define.go)及[客户端错误转换逻辑](https://github.com/matrixorigin/matrixone/blob/v4.2.5/pkg/frontend/util.go#L1027)。
