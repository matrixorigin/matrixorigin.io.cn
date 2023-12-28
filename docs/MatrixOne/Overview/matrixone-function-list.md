# MatrixOne 函数清单

本文档列出了 MatrixOne 最新版本所支持的函数清单。

## MatrixOne 聚合函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [ANY_VALUE()](../Reference/Functions-and-Operators/Aggregate-Functions/any-value.md)    | 在参数范围内任选一个值返回|
| [AVG()](../Reference/Functions-and-Operators/Aggregate-Functions/avg.md)  | 计算参数列的算术平均值。|
| [BIT_AND()](../Reference/Functions-and-Operators/Aggregate-Functions/bit_and.md)  | 计算了列中所有位的按位与|
| [BIT_OR()](../Reference/Functions-and-Operators/Aggregate-Functions/bit_or.md)  | 计算了列中所有位的按位或|
| [BIT_XOR()](../Reference/Functions-and-Operators/Aggregate-Functions/bit_xor.md)    | 计算了列中所有位的按位异或|
| [COUNT()](../Reference/Functions-and-Operators/Aggregate-Functions/count.md)    |计算了查询结果的记录数|
| [GROUP_CONCAT()](../Reference/Functions-and-Operators/Aggregate-Functions/group-concat.md)    | 将通过列或者表达式指定的内容连接起来|
| [MAX()](../Reference/Functions-and-Operators/Aggregate-Functions/max.md)|返回一组值的最大值。 |
| [MEDIAN()](../Reference/Functions-and-Operators/Aggregate-Functions/median.md)      | 返回一组数值的中值|
| [MIN()](../Reference/Functions-and-Operators/Aggregate-Functions/min.md)    | 返回一组值的最小值|
| [STDDEV_POP()](../Reference/Functions-and-Operators/Aggregate-Functions/stddev_pop.md)  | 用于计算总体标准差|
| [SUM()](../Reference/Functions-and-Operators/Aggregate-Functions/sum.md)|用于计算一组值的和|
| [VARIANCE()](../Reference/Functions-and-Operators/Aggregate-Functions/variance.md)      | 用于计算总体方差|

## MatrixOne 日期时间类函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [CURDATE()](../Reference/Functions-and-Operators/Datetime/curdate.md)|返回当前日期的 YYYY-MM-DD 格式的值|
| [CURRENT_TIMESTAMP()](../Reference/Functions-and-Operators/Datetime/current-timestamp.md)|将当前日期和时间以 YYYY-MM-DD hh:mm:ss 或 YYYYMMDDhhmmss 的格式返回|
| [DATE()](../Reference/Functions-and-Operators/Datetime/date.md)|将 DATE 或者 DATETIME 格式的输入中的日期部分截取出来。|
| [DATE_ADD()](../Reference/Functions-and-Operators/Datetime/date-add.md)|用于执行日期运算：从指定日期中加上指定的时间间隔|
| [DATE_FORMAT()](../Reference/Functions-and-Operators/Datetime/date-format.md)|根据格式字符串格式化日期值|
| [DATE_SUB()](../Reference/Functions-and-Operators/Datetime/date-sub.md)|用于执行日期运算：从指定日期中减去指定的时间间隔|
| [DATEDIFF()](../Reference/Functions-and-Operators/Datetime/datediff.md)|返回两个日期之间的天数|
| [DAY()](../Reference/Functions-and-Operators/Datetime/day.md)|返回某日期为当月的第几号|
| [DAYOFYEAR()](../Reference/Functions-and-Operators/Datetime/dayofyear.md)|返回日期所对应在一年中的天数|
| [EXTRACT()](../Reference/Functions-and-Operators/Datetime/extract.md)|从日期中提取部分内容|
| [HOUR()](../Reference/Functions-and-Operators/Datetime/hour.md)|返回时间的小时数|
| [FROM_UNIXTIME()](../Reference/Functions-and-Operators/Datetime/from-unixtime.md)|把内部 UNIX 时间戳值转换为普通格式的日期时间值，以 YYYY-MM-DD HH:MM:SS 或 YYYYMMDDHHMMSS 格式来显示|
| [MINUTE()](../Reference/Functions-and-Operators/Datetime/minute.md)|返回时间参数的分钟|
| [MONTH()](../Reference/Functions-and-Operators/Datetime/month.md)|返回日期参数的月份|
| [SECOND()](../Reference/Functions-and-Operators/Datetime/second.md)|返回时间参数的秒数|
| [TIME()](../Reference/Functions-and-Operators/Datetime/time.md)|提取时间或日期时间的时间部分并将其作为字符串返回|
| [TIMEDIFF()](../Reference/Functions-and-Operators/Datetime/timediff.md)|返回两个时间参数之间的差值|
| [TIMESTAMP()](../Reference/Functions-and-Operators/Datetime/timestamp.md)|将日期或日期时间参数作为日期时间值返回|
| [TIMESTAMPDIFF()](../Reference/Functions-and-Operators/Datetime/timestampdiff.md)|返回一个整数，表示在给定的时间单位内，从第一个日期时间表达式到第二个日期时间表达式之间的时间间隔|
| [TO_DATE()](../Reference/Functions-and-Operators/Datetime/to-date.md)|按照指定日期或时间显示格式，将字符串转换为日期或日期时间类型|
| [TO_DAYS()](../Reference/Functions-and-Operators/Datetime/to-days.md)|用于计算给定日期与公历日历的开始日期（0000 年 1 月 1 日）之间的天数差|
| [TO_SECONDS()](../Reference/Functions-and-Operators/Datetime/to-seconds.md)|用于计算给定日期或日期时间 expr 与公元 0 年 1 月 1 日 0 时 0 分 0 秒之间的秒数差|
| [UNIX_TIMESTAMP](../Reference/Functions-and-Operators/Datetime/unix-timestamp.md)|返回自 1970-01-01 00:00:00 UTC 至指定时间的秒数|
| [UTC_TIMESTAMP()](../Reference/Functions-and-Operators/Datetime/utc-timestamp.md)|将当前 UTC 时间以 YYYY-MM-DD hh:mm:ss 或 YYYYMMDDhhmmss 的格式返回|
| [WEEK()](../Reference/Functions-and-Operators/Datetime/week.md)|用于计算给定日期的周数|
| [WEEKDAY()](../Reference/Functions-and-Operators/Datetime/weekday.md)|返回日期的工作日索引（0 = 星期一，1 = 星期二，... 6 = 星期日）|
| [YEAR()](../Reference/Functions-and-Operators/Datetime/year.md)|返回了给定日期的年份|

## MatrixOne 数学类函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [ABS()](../Reference/Functions-and-Operators/Mathematical/abs.md)    | 用于求参数的绝对值|
| [ACOS()](../Reference/Functions-and-Operators/Mathematical/acos.md)  | 用于求给定数值的余弦（用弧度表示）  |
| [ATAN()](../Reference/Functions-and-Operators/Mathematical/atan.md)  | 用于求给定数值的反正切（用弧度表示）|
| [CEIL()](../Reference/Functions-and-Operators/Mathematical/ceil.md)  | 用于求不小于参数的最小整数。|
| [COS()](../Reference/Functions-and-Operators/Mathematical/cos.md)    | 用于求输入参数（用弧度表示）的余弦值。|
| [COT()](../Reference/Functions-and-Operators/Mathematical/cot.md)    | 用于求输入参数（用弧度表示）的余切值。 |
| [EXP()](../Reference/Functions-and-Operators/Mathematical/ecp.md)    | 用于求以自然常数 e 为底的 number 的指数。|
| [FLOOR()](../Reference/Functions-and-Operators/Mathematical/floor.md)| 用于求不大于某个数字的相应数位的数。 |
| [LN()](../Reference/Functions-and-Operators/Mathematical/ln.md)      | 用于求参数的自然对数|
| [LOG()](../Reference/Functions-and-Operators/Mathematical/log.md)    | 用于求参数的自然对数|
| [LOG2()](../Reference/Functions-and-Operators/Mathematical/log2.md)  | 用于求以 2 为底参数的对数|
| [LOG10()](../Reference/Functions-and-Operators/Mathematical/log10.md)| 用于求以 10 为底参数的对数|
| [PI()](../Reference/Functions-and-Operators/Mathematical/pi.md)      | 用于求数学常量 π (pi)|
| [POWER()](../Reference/Functions-and-Operators/Mathematical/power.md)| POWER(X, Y) 用于求 X 的 Y 次方指数值|
| [ROUND()](../Reference/Functions-and-Operators/Mathematical/round.md)| 用于求某个数字在特定位数四舍五入后的数值|
| [RAND()](../Reference/Functions-and-Operators/Mathematical/rand.md)  | 用于生成一个介于 0 和 1 之间的 Float64 类型的随机数|
| [SIN()](../Reference/Functions-and-Operators/Mathematical/sin.md)    | 用于求输入参数（用弧度表示）的正弦值|
| [SINH()](../Reference/Functions-and-Operators/Mathematical/sinh.md)  | 用于求输入参数（用弧度表示）的双曲正弦值|
| [TAN()](../Reference/Functions-and-Operators/Mathematical/tan.md)    | 用于求输入参数（用弧度表示）的正切值。|

## MatrixOne 字符串类函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [BIN()](../Reference/Functions-and-Operators/String/bin.md)    |  将参数转换为二进制的字符串形式。|
| [BIT_LENGTH()](../Reference/Functions-and-Operators/String/bit-length.md)  | 返回字符串 str 的长度，单位为 bit。|
| [CHAR_LENGTH()](../Reference/Functions-and-Operators/String/char-length.md)  | 以字符为单位返回字符串 str 的长度|
| [CONCAT()](../Reference/Functions-and-Operators/String/concat.md)  | 将多个字符串（或仅含有一个字符串）连接成一个字符串|
| [CONCAT_WS()](../Reference/Functions-and-Operators/String/concat-ws.md)    | 代表 Concatenate With Separator，是 CONCAT() 的一种特殊形式。|
| [EMPTY()](../Reference/Functions-and-Operators/String/empty.md)    | 判断输入的字符串是否为空。 |
| [ENDSWITH()](../Reference/Functions-and-Operators/String/endswith.md)    | 检查是否以指定后缀结尾。|
| [FIELD()](../Reference/Functions-and-Operators/String/field.md)| 返回第一个字符串 str 在字符串列表 (str1,str2,str3,...) 中的位置 |
| [FIND_IN_SET()](../Reference/Functions-and-Operators/String/find-in-set.md)      | 在逗号分隔的字符串列表中查找指定字符串的位置。|
| [FORMAT()](../Reference/Functions-and-Operators/String/format.md)    | 用于将数字格式设置为 "#,###,###.##" 格式，并四舍五入到小数点后一位。|
| [HEX()](../Reference/Functions-and-Operators/String/hex.md)  | 返回参数的十六进制字符串形式|
| [INSTR()](../Reference/Functions-and-Operators/String/instr.md)| 返回子字符串在给定字符串中首次出现的位置。|
| [LEFT()](../Reference/Functions-and-Operators/String/left.md)   | 返回 str 字符串中最左边的长度字符。|
| [LENGTH()](../Reference/Functions-and-Operators/String/length.md)| 返回了字符串的长度。|
| [LOCATE()](../Reference/Functions-and-Operators/String/locate.md)| 用于在字符串中查找子字符串所在位置的函数。|
| [LOWER()](../Reference/Functions-and-Operators/String/lower.md)| 用于在字符串左侧填充|
| [LPAD()](../Reference/Functions-and-Operators/String/lpad.md)| ROUND() 函数返回了某个数字在特定位数四舍五入后的数值|
| [LTRIM()](../Reference/Functions-and-Operators/String/ltrim.md)  | 将输入字符串的前部空格去除，返回处理后的字符。|
| [OCT()](../Reference/Functions-and-Operators/String/oct.md)    |返回参数的八进制值的字符串|
| [REPEAT()](../Reference/Functions-and-Operators/String/repeat.md)  |用于将输入的字符串重复 n 次，并返回一个新的字符串|
| [REVERSE()](../Reference/Functions-and-Operators/String/reverse.md)    | 将 str 字符串中的字符顺序翻转输出。|
| [RPAD()](../Reference/Functions-and-Operators/String/rpad.md)| 用于在字符串右侧填充|
| [RTRIM()](../Reference/Functions-and-Operators/String/rtrim.md)      | 将输入字符串的后方空格去除|
| [SPACE()](../Reference/Functions-and-Operators/String/space.md)| 返回 N 个空格组成的字符串。|
| [SPLIT_PART()](../Reference/Functions-and-Operators/String/split_part.md)| 用于在给定的分隔符基础上将一个字符串分解成多个部分|
| [STARTSWITH()](../Reference/Functions-and-Operators/String/startswith.md)  | 字符串如果以指定前缀开始返回 1，否则则返回 0。|
| [SUBSTRING()](../Reference/Functions-and-Operators/String/substring.md)    | 返回一个从指定位置开始的子字符串|
| [SUBSTRING_INDEX()](../Reference/Functions-and-Operators/String/substring-index.md)  | 以分隔符为索引，获取不同索引位的字符。|
| [TRIM()](../Reference/Functions-and-Operators/String/trim.md)    | 返回一个字符串，删除不需要的字符。|
| [UCASE()](../Reference/Functions-and-Operators/String/ucase.md)    | 用于将给定的字符串转换为大写形式。|
| [UPPER()](../Reference/Functions-and-Operators/String/upper.md)    | 用于将给定的字符串转换为大写形式。|

## MatrixOne 正则表达式

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [NOT REGEXP()](../Reference/Functions-and-Operators/String/Regular-Expressions/not-regexp.md)    | 用于测试一个字符串是否不匹配指定的正则表达式|
| [REGEXP_INSTR()](../Reference/Functions-and-Operators/String/Regular-Expressions/regexp-instr.md)  | 返回匹配到的正则表达式模式在字符串中的起始位置。|
| [REGEXP_LIKE()](../Reference/Functions-and-Operators/String/Regular-Expressions/regexp-like.md)    | 用于判断指定的字符串是否与提供的正则表达式模式匹配|
| [REGEXP_REPLACE()](../Reference/Functions-and-Operators/String/Regular-Expressions/regexp-replace.md)    | 用于将匹配给定正则表达式模式的字符串替换为指定的新字符串|
| [REGEXP_SUBSTR()](../Reference/Functions-and-Operators/String/Regular-Expressions/regexp-substr.md)  | 用于返回字符串参数中匹配正则表达式参数的子字符串|

## MatrixOne 表函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [UNNEST()](../Reference/Functions-and-Operators/Table/unnest.md)    | 用于将 JSON 类型数据内的数组类型的列或参数展开为一个表|

## MatrixOne 窗口函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [DENSE_RANK()](../Reference/Functions-and-Operators/Window-Functions/dense_rank.md)    | 为数据集中的每一行提供一个唯一的排名|
| [RANK()](../Reference/Functions-and-Operators/Window-Functions/rank.md)  | 为数据集中的每一行提供一个唯一的排名|
| [ROW_UNMBER()](../Reference/Functions-and-Operators/Window-Functions/row_number.md)  | 为数据集中的每一行提供一个唯一的序号|

## MatrixOne JSON 函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [JSON_EXTRACT()](../Reference/Functions-and-Operators/Json/json-functions.md)    | 从 JSON 文档返回数据|
| [JSON_QUOTE()](../Reference/Functions-and-Operators/Json/json-functions.md)  | 引用 JSON 文档|
| [JSON_UNQUOTE()](../Reference/Functions-and-Operators/Json/json-functions.md)  | 取消引用 JSON 文档|

## MatrixOne 系统运维函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [CURRENT_ROLE_NAME()](../Reference/Functions-and-Operators/system-ops/current_role_name.md)    | 用于查询当前登录的用户所拥有的角色的名称。|
| [CURRENT_ROLE()](../Reference/Functions-and-Operators/system-ops/current_role.md)  | 返回当前会话的角色。|
| [CURRENT_USER_NAME()](../Reference/Functions-and-Operators/system-ops/current_user_name.md)    | 用于查询你当前所登录的用户名称。|
| [CURRENT_USER()](../Reference/Functions-and-Operators/system-ops/current_user.md)    | 返回当前用户账户|
| [PURGE_LOG()](../Reference/Functions-and-Operators/system-ops/purge_log.md)  | 用于删除记录于 MatrixOne 数据库系统表中的日志。|

## MatrixOne 其他函数

| 函数名称                                                              | 作用                                     |
| ---------------------------------------------------------------------|---------------------------------------- |
| [SLEEP()](../Reference/Functions-and-Operators/Other/sleep.md)    | 将当前查询暂停（睡眠）指定的秒数|
| [UUID()](../Reference/Functions-and-Operators/Other/uuid.md)  | 返回根据 RFC 4122 生成国际通用唯一标识符|