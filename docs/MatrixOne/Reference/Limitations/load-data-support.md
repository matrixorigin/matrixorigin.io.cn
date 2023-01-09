# 关于 MatrixOne Load Data 支持的说明

[MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/load-data.html) 的完整语法如下所示：

```
LOAD DATA
    [LOW_PRIORITY | CONCURRENT] [LOCAL]
    INFILE 'file_name'
    [REPLACE | IGNORE]
    INTO TABLE tbl_name
    [PARTITION (partition_name [, partition_name] ...)]
    [CHARACTER SET charset_name]
    [{FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
        [ESCAPED BY 'char']
    ]
    [LINES
        [STARTING BY 'string']
        [TERMINATED BY 'string']
    ]
    [IGNORE number {LINES | ROWS}]
    [(col_name_or_user_var
        [, col_name_or_user_var] ...)]
    [SET col_name={expr | DEFAULT}
        [, col_name={expr | DEFAULT}] ...]
```

## MatrixOne 暂不支持的字段

上述完整的语法结构中，MatrixOne 暂还不支持以下字段：

- REPLACE
- PARTITION
- CHARACTER SET：目前仅支持 UTF8
- FIELDS TERMINATED BY 'string'：simdcsv 不接受 \r,\n,Unicode replacement character (0xFFFD).
- FIELDS [OPTIONALLY] ENCLOSED BY 'char'：simdCSV固定是'"'。
- FIELDS ESCAPED BY 'char': simdcsv 暂不支持。
- LINES STARTING BY 'string': simdcsv 不支持。'#'是第一个字符的行都会被过滤掉。
- LINES TERMINATED BY 'string':simdcsv 不支持修改。固定'\n'，'\r\n'.
- user_var：不支持。变量对应的数据列，被过滤掉。
- SET col_name={expr | DEFAULT}:不支持。
- LOW_PRIORITY:不支持
- CONCURRENT：不支持
- LOCAL：不支持。local 需要从 client 端将数据传输到 server 端。

## MatrixOne 支持的语法及格式

### 语法

|语法 | 描述|
|---|---|
|use T;||
|load data||
|infile 'pathto/file'||
|ignore|可选。<br>加 `ignore`, 表示字段转到表中列出错时，不会终止整个 `load`，会记录 `warnings` 个数，但不记录 `warings` 内容；<br>不加 `ignore`, 字段转到表中列出错时，会终止整个 `load`|
|INTO TABLE tableA||
|FIELDS TERMINATED BY ','|必须，表示字段分割符。通常是','。而 ssb 的是'|'|
|IGNORE number LINES|可选，表示忽略掉文件开头的 number 行|
|(col0,col1,...,coln);|可选，表示 表中的列名列表。例如，`coli` 对应表中第 `i` 个列。<br> 例如，数据行 `field0 field1 field2 ... fieldN`，对应插入到表列 `(col0,  col1,  col2  ,...,colN)`<br>如果列 coli 以'@'开头，那么 fieldi 被丢弃；<br>(col0,col1,...,coln) 可以不与表中的列名顺序相同。fieldi 绑定到对应的列名。<br>如果数据行的字段 少于 (col0,col1,...,coln) 或表中的列数，多余的字段被丢弃。<br>如果数据行的字段 少于 (col0,col1,...,coln) 或表中的列数，少的列补 NULL。<br>如果 load data 语法中没有 (col0,col1,...,coln)，相当于 加载到表中的全部列。|

### csv 的格式要求

|字符 | 描述|
|---|---|
|字段分割符 | 通常是','，也可以是其它字符（不是'"','\r','\n')。例如：SSB 数据集就是'|'|
|字段包含符|'"'|
|行结束符|'\r\n'或'\n'|
|字段 NULL 值 | 对于值 \N , 表示该字段为 NULL，其他任何情况均视为字符串输入|
|注释符号|'#' 作为第一个字符的行都会被过滤掉|
