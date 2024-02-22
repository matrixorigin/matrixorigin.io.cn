# **运算符概述**

## [**算数运算符**](arithmetic-operators/arithmetic-operators-overview.md)

| 名称 | 描述|
|---|-----|
| [%,MOD](arithmetic-operators/mod.md) | 取余 |
| [*](arithmetic-operators/multiplication.md) | 乘法 |
| [+](arithmetic-operators/addition.md) | 加法 |
| [-](arithmetic-operators/minus.md) | 减法 |
| [-](arithmetic-operators/unary-minus.md) | 负号 |
| [/](arithmetic-operators/division.md) | 除法 |
| [DIV](arithmetic-operators/div.md) | 用于整数相除 |

## [**赋值运算符**](assignment-operators/assignment-operators-overview.md)

| 名称 | 描述|
|---|-----|
| [=](assignment-operators/equal.md) | 等于运算符，用于赋值 |

## [**二进制运算符**](bit-functions-and-operators/bit-functions-and-operators-overview.md)

| 名称 | 描述|
|---|-----|
| [&](bit-functions-and-operators/bitwise-and.md) | 位运算符与，按位与 |
| [>>](bit-functions-and-operators/right-shift.md) | 位移运算符右移 |
| [<<](bit-functions-and-operators/left-shift.md) |位移运算符左移 |
| [^](bit-functions-and-operators/bitwise-xor.md) |按位异或 |
| [\|](bit-functions-and-operators/bitwise-or.md) |位运算符或，按位或|
| [~](bit-functions-and-operators/bitwise-inversion.md) |一元运算符，二进制取反 |

## [**强制转换函数和运算符**](cast-functions-and-operators/cast-functions-and-operators-overview.md)

| 名称 | 描述|
|---|-----|
| [BINARY()](cast-functions-and-operators/binary.md) | 将值转换为二进制字符串的函数 |
| [CAST()](cast-functions-and-operators/cast.md) | 将值转换为特定类型，用于小数转数值和字符型 |
| [CONVERT()](cast-functions-and-operators/convert.md) | 将值转换为特定类型，用于日期和时间值、小数之间进行转换 |

## [**比较函数和运算符**](comparison-functions-and-operators/comparison-functions-and-operators-overview.md)

| 名称 | 描述|
|---|-----|
| [>](comparison-functions-and-operators/greater-than.md) | 大于 |
| [>=](comparison-functions-and-operators/greater-than-or-equal.md) | 大于等于 |
| [<](comparison-functions-and-operators/less-than.md) | 小于 |
| [<>,!=](comparison-functions-and-operators/not-equal.md) | 不等于 |
| [<=](comparison-functions-and-operators/less-than-or-equal.md) | 小于等于 |
| [=](comparison-functions-and-operators/assign-equal.md) | 等于 |
| [BETWEEN ... AND ...](comparison-functions-and-operators/between.md) | 在两值之间 |
| [IN()](comparison-functions-and-operators/in.md) | 在集合中 |
| [IS](comparison-functions-and-operators/is.md) | 测试值是否是布尔值，若是布尔值，则返回“true” |
| [IS NOT](comparison-functions-and-operators/is-not.md) | 测试值是否是布尔值，IS 的否定用法 |
| [IS NOT NULL](comparison-functions-and-operators/is-not-null.md) | 不为空 |
| [IS NULL](comparison-functions-and-operators/is-null.md) | 为空 |
| [ISNULL](comparison-functions-and-operators/function_isnull.md) | 代替 `=` 来测试值是否为 `NULL`。|
| [LIKE](comparison-functions-and-operators/like.md) | 模糊匹配 |
| [ILIKE](comparison-functions-and-operators/ilike.md) | 模糊匹配，同 LIKE。但对大小写不敏感。 |
| [NOT BETWEEN ... AND ...](comparison-functions-and-operators/not-between.md) | 不在两值之间 |
| [NOT IN](comparison-functions-and-operators/not-in.md) | 多个 `XOR` 条件的简写 |
| [NOT LIKE](comparison-functions-and-operators/not-like.md) | 模糊匹配，Like 的否定用法 |
| [COALESCE](comparison-functions-and-operators/coalesce.md)|返回第一个非空值|

## [**控制流函数**](flow-control-functions/flow-control-functions-overview.md)

| 名称 | 描述|
|---|-----|
| [CASE](flow-control-functions/case-when.md) | Case when 运算符 |
| [IF()](flow-control-functions/function_if.md) | If/else 语句 |
| [IFNULL()](flow-control-functions/function_ifnull.md) | If null/else 语句 |
| [NULLIF()](flow-control-functions/function_nullif.md) | expr1 = expr2 时返回 NULL，否则返回 expr1 |

## [**逻辑运算符**](logical-operators/logical-operators-overview.md)

| 名称 | 描述|
|---|-----|
| [AND,&&](logical-operators/and.md) | 逻辑与 |
| [NOT,!](logical-operators/not.md) | 逻辑非 |
| [OR](logical-operators/or.md) | 逻辑或 |
| [XOR](logical-operators/xor.md) | 逻辑异或 |
