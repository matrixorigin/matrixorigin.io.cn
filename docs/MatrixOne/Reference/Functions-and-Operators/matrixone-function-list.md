# 函数总表

本文档列出了 MatrixOne 最新版本所支持的函数清单。

## 聚合函数

| 函数名称                                                | 作用                                    |
| ------------------------------------------------------ | --------------------------------------- |
| [ANY_VALUE()](./Aggregate-Functions/any-value.md)      | 在参数范围内任选一个值返回|
| [AVG()](./Aggregate-Functions/avg.md)                  | 计算参数列的算术平均值。|
| [BITMAP](./Aggregate-Functions/bitmap.md)              | 一组用于处理位图的内置函数，主要用于计算不同值|
| [BIT_AND()](./Aggregate-Functions/bit_and.md)          | 计算了列中所有位的按位与|
| [BIT_OR()](./Aggregate-Functions/bit_or.md)            | 计算了列中所有位的按位或|
| [BIT_XOR()](./Aggregate-Functions/bit_xor.md)          | 计算了列中所有位的按位异或|
| [COUNT()](./Aggregate-Functions/count.md)              | 计算了查询结果的记录数|
| [GROUP_CONCAT()](./Aggregate-Functions/group-concat.md)| 将通过列或者表达式指定的内容连接起来|
| [MAX()](./Aggregate-Functions/max.md)                  | 返回一组值的最大值 |
| [MEDIAN()](./Aggregate-Functions/median.md)            | 返回一组数值的中值|
| [MIN()](./Aggregate-Functions/min.md)                  | 返回一组值的最小值|
| [STDDEV_POP()](./Aggregate-Functions/stddev_pop.md)    | 用于计算总体标准差|
| [SUM()](./Aggregate-Functions/sum.md)                  | 用于计算一组值的和|
| [VARIANCE()](./Aggregate-Functions/variance.md)        | 用于计算总体方差|
| [VAR_POP()](./Aggregate-Functions/var_pop.md)          | 用于计算总体方差|
  
## 日期时间类函数

| 函数名称                                               | 作用                                     |
| ----------------------------------------------------- | --------------------------------------- |
| [CONVERT_TZ()](./Datetime/convert-tz.md)              |用于将给定的日期时间从一个时区转换为另一个时区。|
| [CURDATE()](./Datetime/curdate.md)                    |返回当前日期的 YYYY-MM-DD 格式的值|
| [CURRENT_TIMESTAMP()](./Datetime/current-timestamp.md)|将当前日期和时间以 YYYY-MM-DD hh:mm:ss 或 YYYYMMDDhhmmss 的格式返回|
| [DATE()](./Datetime/date.md)                          |将 DATE 或者 DATETIME 格式的输入中的日期部分截取出来。|
| [DATE_ADD()](./Datetime/date-add.md)                  |用于执行日期运算：从指定日期中加上指定的时间间隔|
| [DATE_FORMAT()](./Datetime/date-format.md)            |根据格式字符串格式化日期值|
| [DATE_SUB()](./Datetime/date-sub.md)                  |用于执行日期运算：从指定日期中减去指定的时间间隔|
| [DATEDIFF()](./Datetime/datediff.md)                  |返回两个日期之间的天数|
| [DAY()](./Datetime/day.md)                            | 返回某日期为当月的第几号|
| [DAYOFYEAR()](./Datetime/dayofyear.md)                |返回日期所对应在一年中的天数|
| [EXTRACT()](./Datetime/extract.md)                    |从日期中提取部分内容|
| [HOUR()](./Datetime/hour.md)                          |返回时间的小时数|
| [FROM_UNIXTIME()](./Datetime/from-unixtime.md)        |把内部 UNIX 时间戳值转换为普通格式的日期时间值，以 YYYY-MM-DD HH:MM:SS 或 YYYYMMDDHHMMSS 格式来显示|
| [MINUTE()](./Datetime/minute.md)                      |返回时间参数的分钟|
| [MONTH()](./Datetime/month.md)                        |返回日期参数的月份|
| [NOW()](./Datetime/now.md)                            |返回当前日期和时间的 'YYYY-MM-DD HH:MM:SS' 格式的值。|
| [SECOND()](./Datetime/second.md)                      |返回时间参数的秒数|
| [STR_TO_DATE()](./Datetime/str-to-date.md)            |按照指定日期或时间显示格式，将字符串转换为日期或日期时间类型|
| [SYSDATE()](./Datetime/sysdate.md)                    |返回当前日期和时间的 'YYYY-MM-DD HH:MM:SS' 格式的值。|
| [TIME()](./Datetime/time.md)                          |提取时间或日期时间的时间部分并将其作为字符串返回|
| [TIMEDIFF()](./Datetime/timediff.md)                  |返回两个时间参数之间的差值|
| [TIMESTAMP()](./Datetime/timestamp.md)                |将日期或日期时间参数作为日期时间值返回|
| [TIMESTAMPDIFF()](./Datetime/timestampdiff.md)        |返回一个整数，表示在给定的时间单位内，从第一个日期时间表达式到第二个日期时间表达式之间的时间间隔|
| [TO_DATE()](./Datetime/to-date.md)                    |按照指定日期或时间显示格式，将字符串转换为日期或日期时间类型|
| [TO_DAYS()](./Datetime/to-days.md)                    |用于计算给定日期与公历日历的开始日期（0000 年 1 月 1 日）之间的天数差|
| [TO_SECONDS()](./Datetime/to-seconds.md)              |用于计算给定日期或日期时间 expr 与公元 0 年 1 月 1 日 0 时 0 分 0 秒之间的秒数差|
| [UNIX_TIMESTAMP](./Datetime/unix-timestamp.md)        |返回自 1970-01-01 00:00:00 UTC 至指定时间的秒数|
| [UTC_TIMESTAMP()](./Datetime/utc-timestamp.md)        |将当前 UTC 时间以 YYYY-MM-DD hh:mm:ss 或 YYYYMMDDhhmmss 的格式返回|
| [WEEK()](./Datetime/week.md)                          |用于计算给定日期的周数|
| [WEEKDAY()](./Datetime/weekday.md)                    |返回日期的工作日索引（0 = 星期一，1 = 星期二，... 6 = 星期日）|
| [YEAR()](./Datetime/year.md)                          |返回了给定日期的年份|

## 数学类函数

| 函数名称                            | 作用                                    |
| --------------------------------- | --------------------------------------- |
| [ABS()](./Mathematical/abs.md)    | 用于求参数的绝对值|
| [ACOS()](./Mathematical/acos.md)  | 用于求给定数值的余弦（用弧度表示）  |
| [ATAN()](./Mathematical/atan.md)  | 用于求给定数值的反正切（用弧度表示）|
| [CEIL()](./Mathematical/ceil.md)  | 用于求不小于参数的最小整数。|
| [CEILING()](./Mathematical/ceiling.md)  | 用于求不小于参数的最小整数。|
| [COS()](./Mathematical/cos.md)    | 用于求输入参数（用弧度表示）的余弦值。|
| [COT()](./Mathematical/cot.md)    | 用于求输入参数（用弧度表示）的余切值。 |
| [EXP()](./Mathematical/exp.md)    | 用于求以自然常数 e 为底的 number 的指数。|
| [FLOOR()](./Mathematical/floor.md)| 用于求不大于某个数字的相应数位的数。 |
| [LN()](./Mathematical/ln.md)      | 用于求参数的自然对数|
| [LOG()](./Mathematical/log.md)    | 用于求参数的自然对数|
| [LOG2()](./Mathematical/log2.md)  | 用于求以 2 为底参数的对数|
| [LOG10()](./Mathematical/log10.md)| 用于求以 10 为底参数的对数|
| [PI()](./Mathematical/pi.md)      | 用于求数学常量 π (pi)|
| [POWER()](./Mathematical/power.md)| POWER(X, Y) 用于求 X 的 Y 次方指数值|
| [ROUND()](./Mathematical/round.md)| 用于求某个数字在特定位数四舍五入后的数值|
| [RAND()](./Mathematical/rand.md)  | 用于生成一个介于 0 和 1 之间的 Float64 类型的随机数|
| [SIN()](./Mathematical/sin.md)    | 用于求输入参数（用弧度表示）的正弦值|
| [SINH()](./Mathematical/sinh.md)  | 用于求输入参数（用弧度表示）的双曲正弦值|
| [TAN()](./Mathematical/tan.md)    | 用于求输入参数（用弧度表示）的正切值。|

## 字符串类函数

| 函数名称                                        | 作用                                     |
| ---------------------------------------------- | --------------------------------------- |
| [BIN()](./String/bin.md)                       |  将参数转换为二进制的字符串形式。|
| [BIT_LENGTH()](./String/bit-length.md)         | 返回字符串 str 的长度，单位为 bit。|
| [CHAR_LENGTH()](./String/char-length.md)       | 以字符为单位返回字符串 str 的长度|
| [CONCAT()](./String/concat.md)                 | 将多个字符串（或仅含有一个字符串）连接成一个字符串|
| [CONCAT_WS()](./String/concat-ws.md)           | 代表 Concatenate With Separator，是 CONCAT() 的一种特殊形式。|
| [EMPTY()](./String/empty.md)                   | 判断输入的字符串是否为空。 |
| [ENDSWITH()](./String/endswith.md)             | 检查是否以指定后缀结尾。|
| [FIELD()](./String/field.md)                   | 返回第一个字符串 str 在字符串列表 (str1,str2,str3,...) 中的位置 |
| [FIND_IN_SET()](./String/find-in-set.md)       | 在逗号分隔的字符串列表中查找指定字符串的位置。|
| [FORMAT()](./String/format.md)                 | 用于将数字格式设置为 "#,###,###.##" 格式，并四舍五入到小数点后一位。|
| [FROM_BASE64()](./String/from_base64.md)       | 用于将 Base64 编码的字符串转换回原始的二进制数据（或文本数据）。|
| [HEX()](./String/hex.md)                       | 返回参数的十六进制字符串形式|
| [INSTR()](./String/instr.md)                   | 返回子字符串在给定字符串中首次出现的位置。|
| [LCASE()](./String/lcase.md)                   | 用于将给定的字符串转换为小写形式。|
| [LEFT()](./String/left.md)                     | 返回 str 字符串中最左边的长度字符。|
| [LENGTH()](./String/length.md)                 | 返回了字符串的长度。|
| [LOCATE()](./String/locate.md)                 | 用于在字符串中查找子字符串所在位置的函数。|
| [LOWER()](./String/lower.md)                   | 用于将给定的字符串转换为小写形式。|
| [LPAD()](./String/lpad.md)                     | 用于在字符串左侧填充。|
| [LTRIM()](./String/ltrim.md)                   | 将输入字符串的前部空格去除，返回处理后的字符。|
| [MD5()](./String/md5.md)                       | 将输入字符串生成一个 32 字符长的十六进制 MD5 哈希值。|
| [OCT()](./String/oct.md)                       | 返回参数的八进制值的字符串|
| [REPEAT()](./String/repeat.md)                 | 用于将输入的字符串重复 n 次，并返回一个新的字符串|
| [REVERSE()](./String/reverse.md)               | 将 str 字符串中的字符顺序翻转输出。|
| [RPAD()](./String/rpad.md)                     | 用于在字符串右侧填充|
| [RTRIM()](./String/rtrim.md)                   | 将输入字符串的后方空格去除|
| [SHA1()/SHA()](./String/sha1.md)               | 用于计算并返回给定字符串的 SHA-1 哈希值。|
| [SHA2()](./String/sha2.md)                     | 返回输入字符串的 SHA2 哈希值。|
| [SPACE()](./String/space.md)                   | 返回 N 个空格组成的字符串。|
| [SPLIT_PART()](./String/split_part.md)         | 用于在给定的分隔符基础上将一个字符串分解成多个部分|
| [STARTSWITH()](./String/startswith.md)         | 字符串如果以指定前缀开始返回 1，否则则返回 0。|
| [SUBSTRING()](./String/substring.md)           | 返回一个从指定位置开始的子字符串|
| [SUBSTRING_INDEX()](./String/substring-index.md)| 以分隔符为索引，获取不同索引位的字符。|
| [TO_BASE64()](./String/to_base64.md)           | 用于将字符串转换为 Base64 编码的字符串|
| [TRIM()](./String/trim.md)                     | 返回一个字符串，删除不需要的字符。|
| [UCASE()](./String/ucase.md)                   | 用于将给定的字符串转换为大写形式。|
| [UNHEX()](./String/unhex.md)                   | 用于将十六进制字符串转换为相应的二进制字符串。|
| [UPPER()](./String/upper.md)                   | 用于将给定的字符串转换为大写形式。|

## 正则表达式

| 函数名称                                                            | 作用                                     |
| ------------------------------------------------------------------ | -------------------------------------- |
| [NOT REGEXP()](./String/Regular-Expressions/not-regexp.md)         | 用于测试一个字符串是否不匹配指定的正则表达式|
| [REGEXP_INSTR()](./String/Regular-Expressions/regexp-instr.md)     | 返回匹配到的正则表达式模式在字符串中的起始位置。|
| [REGEXP_LIKE()](./String/Regular-Expressions/regexp-like.md)       | 用于判断指定的字符串是否与提供的正则表达式模式匹配|
| [REGEXP_REPLACE()](./String/Regular-Expressions/regexp-replace.md) | 用于将匹配给定正则表达式模式的字符串替换为指定的新字符串|
| [REGEXP_SUBSTR()](./String/Regular-Expressions/regexp-substr.md)   | 用于返回字符串参数中匹配正则表达式参数的子字符串|

## 向量类函数

| 函数名称                                              | 作用                                     |
| ---------------------------------------------------- | --------------------------------------- |
| [基本操作符](./Vector/arithmetic.md)                   | 向量的加法 (+)、减法 (-)、乘法 (*) 和除法 (/)|
| [SQRT()](./Vector/misc.md)                           | 用于计算向量中每个元素的平方根|
| [ABS()](./Vector/misc.md)                            | 用于计算向量的绝对值|
| [CAST()](./Vector/misc.md)                           | 用于显式将一个向量从一个向量类型转换为另一个向量类型|
| [SUMMATION()](./Vector/misc.md)                      | 返回向量中所有元素的总和|
| [INNER_PRODUCT()](./Vector/inner_product.md)         | 用于计算两个向量之间的内积/点积|
| [CLUSTER_CENTERS()](./Vector/cluster_centers.md)       | 用于确定向量列的 K 个聚类中心 |
| [COSINE_DISTANCE()](./Vector/cosine_distance.md)     | 用于计算两个向量的余弦距离。|
| [COSINE_SIMILARITY()](./Vector/cosine_similarity.md) | 衡量了两个向量之间夹角的余弦值，通过它们在多维空间中的接近程度来表示它们的相似性|
| [L2_DISTANCE()](./Vector/l2_distance.md)             |用于计算两个向量之间的欧几里得距离|
| [L1_NORM()](./Vector/l1_norm.md)                     | 用于计算 l1/曼哈顿/TaxiCab 范数|
| [L2_NORM()](./Vector/l2_norm.md)                     | 用于计算 l2/欧几里得范数|
| [NORMALIZE_L2()](./Vector/normalize_l2.md)           | 用于执行欧几里得归一化|
| [SUBVECTOR()](./Vector/subvector.md)                 | 用于从向量中提取子向量|
| [VECTOR_DIMS()](./Vector/vector_dims.md)             | 用于确定向量的维度|

## 表函数

| 函数名称                          | 作用                                     |
| -------------------------------- | --------------------------------------- |
| [UNNEST()](./Table/unnest.md)    | 用于将 JSON 类型数据内的数组类型的列或参数展开为一个表|

## 窗口函数

| 函数名称                                             | 作用                                     |
| --------------------------------------------------- | --------------------------------------- |
| [DENSE_RANK()](./Window-Functions/dense_rank.md)    | 为数据集中的每一行提供一个唯一的排名|
| [RANK()](./Window-Functions/rank.md)                | 为数据集中的每一行提供一个唯一的排名|
| [ROW_UNMBER()](./Window-Functions/row_number.md)    | 为数据集中的每一行提供一个唯一的序号|

## JSON 函数

| 函数名称                                       | 作用                                     |
| --------------------------------------------- | --------------------------------------- |
| [JQ()](./Json/jq.md)    | 用于根据 jq 表达式解析和转换 JSON 数据|
| [JSON_EXTRACT()](./Json/json_extract.md)    | 从 JSON 文档返回数据|
| [JSON_EXTRACT_FLOAT64()](./Json/json_extract_float64.md)    | 从 JSON 数据中提取指定路径的数值的值|
| [JSON_EXTRACT_STRING()](./Json/json_extract_string.md)      | 从 JSON 数据中提取指定路径的字符串的值|
| [JSON_QUOTE()](./Json/json_quote.md)      | 引用 JSON 文档|
| [JSON_ROW()](./Json/json_row.md)      | 用于将每一行转化为 json 数组|
| [JSON_UNQUOTE()](./Json/json_unquote.md)    | 取消引用 JSON 文档|
| [TRY_JQ()](./Json/try_jq.md)    | 用于根据 jq 表达式解析和转换 JSON 数据，并提供容错机制|

## 系统运维函数

| 函数名称                                                     | 作用                                     |
| ----------------------------------------------------------- | --------------------------------------- |
| [CURRENT_ROLE_NAME()](./system-ops/current_role_name.md)    | 用于查询当前登录的用户所拥有的角色的名称。|
| [CURRENT_ROLE()](./system-ops/current_role.md)              | 返回当前会话的角色。|
| [CURRENT_USER_NAME()](./system-ops/current_user_name.md)    | 用于查询你当前所登录的用户名称。|
| [CURRENT_USER()](./system-ops/current_user.md)              | 返回当前用户账户|
| [PURGE_LOG()](./system-ops/purge_log.md)                    | 用于删除记录于 MatrixOne 数据库系统表中的日志。|

## 其他函数

| 函数名称                        | 作用                                     |
| ------------------------------ | --------------------------------------- |
| [LOAD_FILE()](./Other/load_file.md)    | 用于读取 datalink 类型指向文件的内容。|
| [SAVE_FILE()](./Other/save_file.md)    | 用于保存 datalink 类型指向文件的内容。|
| [SAMPLE()](./Other/sample.md)  | 主要用于快速缩减查询范围|
| [SERIAL_EXTRACT()](./Other/serial_extract.md)    | 用于提取序列/元组值中的各个元素|
| [SLEEP()](./Other/sleep.md)    | 将当前查询暂停（睡眠）指定的秒数|
| [STAGE_LIST()](./Other/stage_list.md)    | 用于查看 stage 中的目录和文件。|
| [UUID()](./Other/uuid.md)      | 返回根据 RFC 4122 生成国际通用唯一标识符|