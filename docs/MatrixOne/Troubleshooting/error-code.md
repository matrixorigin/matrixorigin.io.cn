# 错误码

| **错误码** | **错误信息** | **错误详情** | **错误分类** |
| --- | --- | --- | --- |
| 20100 | ErrStart | internal error code start | 内部错误 |
| 20101 | ErrInternal   | Internal error | 内部错误 |
| 20103 | ErrNYI   | not yet implemented | 内部错误 |
| 20104 | ErrOOM  | out of memory | 内部错误 |
| 20105 | ErrQueryInterrupted | query interrupted | 内部错误 |
| 20106 | ErrNotSupported  | not supported | 内部错误 |
| 20200 | ErrDivByZero | division by zero | 数字与函数 |
| 20201 | ErrOutOfRange | data out of range | 数字与函数 |
| 20202 | ErrDataTruncated  | data truncated | 数字与函数 |
| 20203 | ErrInvalidArg  | invalid argument | 数字与函数 |
| 20204 | ErrTruncatedWrongValueForField | truncated wrong value for column | 数字与函数 |
| 20300 | ErrBadConfig | invalid configuration | 无效操作 |
| 20301 | ErrInvalidInput | invalid input | 无效操作 |
| 20302 | ErrSyntaxError | SQL syntax error | 无效操作 |
| 20303 | ErrParseError | SQL parser error | 无效操作 |
| 20304 | ErrConstraintViolation | constraint violation | 无效操作 |
| 20305 | ErrDuplicate | tae data duplicated | 无效操作 |
| 20306 | ErrRoleGrantedToSelf  | cannot grant role | 无效操作 |
| 20307 | ErrDuplicateEntry | duplicate entry for key | 无效操作 |
| 20400 | ErrInvalidState | invalid state | 未知状态或 I/O 错误 |
| 20401 | ErrLogServiceNotReady | log service not ready | 未知状态或 I/O 错误 |
| 20402 | ErrBadDB | invalid database | 未知状态或 I/O 错误 |
| 20403 | ErrNoSuchTable  | no such table | 未知状态或 I/O 错误 |
| 20404 | ErrEmptyVector     | empty vector | 未知状态或 I/O 错误 |
| 20405 | ErrFileNotFound   | file is not found | 未知状态或 I/O 错误 |
| 20406 | ErrFileAlreadyExists  | file alread exists | 未知状态或 I/O 错误 |
| 20407 | ErrUnexpectedEOF | unexpteded end of file | 未知状态或 I/O 错误 |
| 20408 | ErrEmptyRange     | empty range of file | 未知状态或 I/O 错误 |
| 20409 | ErrSizeNotMatch  | file size does not match | 未知状态或 I/O 错误 |
| 20410 | ErrNoProgress | file has no io progress | 未知状态或 I/O 错误 |
| 20411 | ErrInvalidPath | invalid file path | 未知状态或 I/O 错误 |
| 20412 | ErrShortWrite | file io short write | 未知状态或 I/O 错误 |
| 20413 | ErrInvalidWrite | file io invalid write | 未知状态或 I/O 错误 |
| 20414 | ErrShortBuffer  | file io short buffer | 未知状态或 I/O 错误 |
| 20415 | ErrNoDB | not connect to a database | 未知状态或 I/O 错误 |
| 20416 | ErrNoWorkingStore   | no working store | 未知状态或 I/O 错误 |
| 20417 | ErrNoHAKeeper          | cannot locate ha keeper | 未知状态或 I/O 错误 |
| 20418 | ErrInvalidTruncateLsn | invalid truncate lsn, shard already truncated | 未知状态或 I/O 错误 |
| 20419 | ErrNotLeaseHolder         | not lease holder, current lease holder ID xxx | 未知状态或 I/O 错误 |
| 20420 | ErrDBAlreadyExists   | database already exists | 未知状态或 I/O 错误 |
| 20421 | ErrTableAlreadyExists   | table already exists | 未知状态或 I/O 错误 |
| 20422 | ErrNoService    | service not found | 未知状态或 I/O 错误 |
| 20423 | ErrDupServiceName | duplicate service name | 未知状态或 I/O 错误 |
| 20424 | ErrWrongService        | wrong service, expecting A, got B | 未知状态或 I/O 错误 |
| 20425 | ErrBadS3Config        | bad s3 config | 未知状态或 I/O 错误 |
| 20426 | ErrBadView   | invalid view | 未知状态或 I/O 错误 |
| 20427 | ErrInvalidTask    | invalid task | 未知状态或 I/O 错误 |
| 20428 | ErrInvalidServiceIndex     | invalid service idx | 未知状态或 I/O 错误 |
| 20429 | ErrDragonboatTimeout   | Dragonboat timeout | 未知状态或 I/O 错误 |
| 20430 | ErrDragonboatTimeoutTooSmall | Dragonboat timeout too small | 未知状态或 I/O 错误 |
| 20431 | ErrDragonboatInvalidDeadline | Dragonboat invalid deadline | 未知状态或 I/O 错误 |
| 20432 | ErrDragonboatRejected  | Dragonboat rejected | 未知状态或 I/O 错误 |
| 20433 | ErrDragonboatInvalidPayloadSize | invalid payload size | 未知状态或 I/O 错误 |
| 20434 | ErrDragonboatShardNotReady  | shard not ready  | 未知状态或 I/O 错误 |
| 20435 | ErrDragonboatSystemClosed | Dragonboat system closed | 未知状态或 I/O 错误 |
| 20436 | ErrDragonboatInvalidRange  | Dragonboat invalid range  | 未知状态或 I/O 错误 |
| 20437 | ErrDragonboatShardNotFound | shard not found | 未知状态或 I/O 错误 |
| 20438 | ErrDragonboatOtherSystemError | other system error | 未知状态或 I/O 错误 |
| 20439 | ErrDropNonExistsDB | Can't drop database ; database doesn't exist | 未知状态或 I/O 错误 |
| 20500 | ErrRPCTimeout | rpc timeout | RPC 超时 |
| 20501 | ErrClientClosed | client closed | RPC 超时 |
| 20502 | ErrBackendClosed | backend closed | RPC 超时 |
| 20503 | ErrStreamClosed | stream closed | RPC 超时 |
| 20504 | ErrNoAvailableBackend  | no available backend | RPC 超时 |
| 20600 | ErrTxnClosed | the transaction has been committed or aborted | 事务 |
| 20601 | ErrTxnWriteConflict | transaction write conflict | 事务 |
| 20602 | ErrMissingTxn | missing transaction | 事务 |
| 20603 | ErrUnresolvedConflict | unresolved conflict | 事务 |
| 20604 | ErrTxnError  | transaction error | 事务 |
| 20605 | ErrDNShardNotFound | dn shard not found | 事务 |
| 20606 | ErrShardNotReported  | dn shard not reported | 事务 |
| 20607 | ErrTAEError | tae error | TAE 错误 |
| 20608 | ErrTAERead | tae read error | TAE 错误 |
| 20609 | ErrRpcError | rpc error | TAE 错误 |
| 20610 | ErrWaitTxn | transaction wait error | TAE 错误 |
| 20611 | ErrTxnNotFound | transaction not found | TAE 错误 |
| 20612 | ErrTxnNotActive | transaction not active | TAE 错误 |
| 20613 | ErrTAEWrite  | tae write error | TAE 错误 |
| 20614 | ErrTAECommit | tae commit error | TAE 错误 |
| 20615 | ErrTAERollback  | tae rollback error | TAE 错误 |
| 20616 | ErrTAEPrepare | tae prepare error | TAE 错误 |
| 20617 | ErrTAEPossibleDuplicate | tae possible duplicate | TAE 错误 |
| 20618 | ErrTxnRWConflict | r-w conflict | TAE 错误 |
| 20619 | ErrTxnWWConflict  | w-w conflict | TAE 错误 |
| 20620 | ErrNotFound | transaction not found | TAE 错误 |
| 20621 | ErrTxnInternal | transaction internal error | TAE 错误 |
| 20622 | ErrTxnReadConflict | transaction read conflict | TAE 错误 |
| 20623 | ErrPrimaryKeyDuplicated | duplicated primary key | TAE 错误 |
| 20624 | ErrAppendableSegmentNotFound | appendable segment not found | TAE 错误 |
| 20625 | ErrAppendableBlockNotFound | appendable block not found | TAE 错误 |
| 20626 | ErrTAEDebug | TAE debug | TAE 错误 |
