---
title: "生态工具中的数据类型保真"
doc_type: guide
description: "通过显式类型映射和验收规则，检查 SQL 驱动、DataFrame 与文件格式之间的数据保真。"
---

# 生态工具中的数据类型保真

连接成功或行数一致，并不能证明 ETL 链路保留了完整数值。需要分别检查源值、连接器元数据、中间表示和目的端值。将高精度小数保存为文本可以保留数值，但不意味着中间引擎支持原生高精度小数运算。

## 定义数值验收规则

记录 MatrixOne 版本或提交、源系统版本、驱动和工具版本、SQL 模式、会话时区以及输入与目的表结构。说明链路使用默认类型推断还是显式映射，并分别验证读写方向。

加载前，为各字段确定验收规则：整数或小数精确值、二进制逐字节一致、时间值与精度，或明确的浮点容差。JSON、SET 成员和 CHAR 尾空格的归一化也需要说明。保留原始值及归一化后的表示，避免比较过程掩盖类型转换。

## 选择显式映射

| SQL 值 | 中间表示 | 验收规则 |
|---|---|---|
| 精度超过 38 位的 DECIMAL | 支持声明精度的小数类型，或显式十进制文本列 | 保留符号、声明的小数位和每一位有效数字，不经过 float64。 |
| BIGINT UNSIGNED | uint64、足够宽的小数或精确整数文本 | 包含 `18446744073709551615` 以及超过 `9007199254740992` 的值，不经过有符号 int64 或 float64。 |
| BIT(64) | uint64、明确字节序的二进制或精确十进制文本 | 检查高位及全 1 值，单独保留 NULL。 |
| FLOAT 与 DOUBLE | 分别为 float32 与 float64 | 记录容差; FLOAT 的六位有效数字验收不等于位级一致。 |
| BINARY、VARBINARY 与 BLOB | 二进制或明确解码的 HEX | 比较字节长度与内容，包含 `00`、`80`、`FF`, 不将任意字节解释为 UTF-8。 |
| 负值或超过 24 小时的 TIME | 有符号整数微秒或精确 SQL 时间文本 | 保留符号及小数秒; 仅表示一天内时刻的对象无法覆盖完整时长范围。 |
| DATE 与 DATETIME | 覆盖输入范围和精度的表示 | 检查年份边界及微秒，不假定 DataFrame 时间戳覆盖全部 SQL 日期。 |
| TIMESTAMP | 时区约定明确的时间戳 | 记录源和目的会话时区及 UTC 转换; DATETIME 测试不能代替 TIMESTAMP 验证。 |
| CHAR | 尾空格策略明确的文本 | 空格有业务含义时保留原始字节，SQL 比较语义可能不同于逐字节相等。 |
| ENUM 与 SET | 明确的成员文本或约定表示 | 区分 NULL、空串和空集合，说明 SET 成员顺序和枚举域约束。 |
| JSON | JSON 文档或精确文档文本 | 区分 SQL NULL、JSON `null`、空串和字符串 `"null"`, 说明对象键顺序是否重要。 |
| UUID | 原生 UUID 或校验后的 UUID 文本 | CHAR(36) 测试不能代替 MatrixOne UUID 类型或驱动默认 UUID 推断验证。 |
| Unicode 文本 | 归一化策略明确的 UTF-8 文本 | 包含非 ASCII 文本、emoji、引号、分隔符和换行。 |

SQL 类型行为见 [DECIMAL](../../Reference/Data-Types/fixed-point-types.md)、[JSON](../../Reference/Data-Types/json-type.md)、[SET](../../Reference/Data-Types/set-type.md) 和 [UUID](../../Reference/Data-Types/uuid-type.md)。实际限制取决于服务端版本以及链路中的每个中间引擎。

### 精确小数

支持 DECIMAL256 的服务端可使用精确文本输入，回读后不要转换为二进制浮点数：

```sql
SELECT CAST('9007199254740993.123456789012345678901234567890' AS DECIMAL(65,30)) AS exact_value;
```

结果应保留原值和 30 位小数。Python 适配器使用 `decimal.Decimal` 时，应在每个工作线程中设置足够的精度; 适用于普通金额的上下文可能会舍入 65 位数值。

### 无符号整数

```sql
SELECT CAST('18446744073709551615' AS UNSIGNED) AS unsigned_value;
```

结果应保持精确整数。构造 DataFrame 或复制表结构前，同时检查驱动返回值与反射类型。CAST 为文本的读取可以保留值，但不能证明默认元数据推断正确。

### 二进制

```sql
SELECT HEX(UNHEX('0000FF80')) AS binary_hex;
```

期望结果为 `0000FF80`。HEX 是显式传输编码，与目的端比较前需要还原为二进制。

### SQL 时长

```sql
SELECT CAST('-37:00:00.000001' AS TIME(6)) AS negative_duration;
```

结果表示负 37 小时再减一微秒。使用整数微秒时，应计算完整的有符号时长，不只读取语言时长对象中的正秒数组件。

### JSON null 与无效空文本

```sql
SELECT JSON_VALID('null') AS valid_json_null, JSON_VALID('') AS valid_empty_document;
```

期望标志分别为 `1` 和 `0`。JSON `null` 是有效文档，必须与 SQL NULL 分开保留。需要测试连接器 CSV/JSONLines 的空值标记，不假定空字段含义相同。

## 加载后检查数值

1. 保存包含稳定主键和边界值的确定性源数据。
2. 经实际工具 API 读取，记录类型、NULL 处理和显式转换。
3. 经预定 sink 写入，使用新连接完整回读目的端。
4. 比较主键集合、行的重复次数及所有字段。计算数量和哈希前，明确定序和带类型的编码。
5. 在分批、并行分区、重试和模式变更后重复检查，保留失败输入和中间文件供排查。

还需要检查不合法输入：JSONLines 最后一条不完整记录、小数溢出、不合法枚举成员或越界 TIME 应产生明确结果。作业成功不能掩盖静默丢行。

## 区分组件与服务端问题

在类型范围重叠时，使用相同逻辑值执行最小 SQL 探针与 MySQL 对照。文件格式或 Arrow 转换问题尽可能在不连接数据库时复现。尝试适配前保留原始错误。

历史兼容性报告包括 [Arrow/Parquet 映射](https://github.com/matrixorigin/matrixone/issues/29845)、[UInt64 元数据](https://github.com/matrixorigin/matrixone/issues/29846)、[空 ENUM/SET 文件加载](https://github.com/matrixorigin/matrixone/issues/29840)和[小数解析](https://github.com/matrixorigin/matrixone/issues/29841)。应检查受影响版本和修复可用性，不将 issue 链接解释为所有当前版本都有该问题。
