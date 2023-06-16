# **INSTR()**

## **函数说明**

`INSTR()` 函数也是用来返回子字符串在给定字符串中首次出现的位置。这个函数是多字节安全的，这意味着它适用于各种字符编码，并且能正确处理多字节字符（例如 UTF-8 编码的字符）。

`INSTR()` 函数主要是进行数据清洗和转换，例如当你需要在文本字段中查找特定的子字符串或根据特定的字符分割文本字段时。这对于处理包含某种模式或格式的数据（如电子邮件地址、电话号码等）非常有用。

关于大小写的处理，`INSTR()` 函数只有在至少有一个参数是二进制字符串的情况下才是大小写敏感的。也就是说，对于非二进制字符串，`INSTR()` 函数是不区分大小写的。但是，如果你希望进行大小写敏感的比较，你可以使用 `BINARY` 关键字来将字符串转换为二进制格式。

例如：

```sql
SELECT INSTR(BINARY 'abc', 'A');
```

上述查询将返回 0，因为在二进制格式下，'A' 和 'a' 被认为是不同的字符。

## **函数语法**

```
> INSTR(str,substr)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数。`string` 是要在其中搜索的字符串。|
| substr | 必要参数。`substring` 是你正在查找的字符串。|

## **示例**

- 示例 1

```sql
mysql> SELECT INSTR('foobarbar', 'bar');
+-----------------------+
| instr(foobarbar, bar) |
+-----------------------+
|                     4 |
+-----------------------+
1 row in set (0.01 sec)
```

- 示例 2

```sql
-- -- 在字符串 'Hello World' 中查找 'o' 首次出现的位置，INSTR 函数将返回 5，因为 'o' 首次出现在 'Hello World' 中的第 5 个位置
mysql> SELECT INSTR('Hello World', 'o');
+-----------------------+
| instr(Hello World, o) |
+-----------------------+
|                     5 |
+-----------------------+
1 row in set (0.01 sec)
```

- 示例 3

```sql
-- 创建一个名为 t1 的表，其中包含两个 VARCHAR 类型的列 a 和 b
CREATE TABLE t1(a VARCHAR, b VARCHAR);

-- 向表 t1 插入三行数据
INSERT INTO t1 VALUES('axa','x'),('abababa','qq'),('qwer','er');

-- 从表 t1 中选择每一行，然后使用 INSTR 函数找出列 a 中列 b 的字符串首次出现的位置
mysql> select instr(a,b) from t1;
+-------------+
| instr(a, b) |
+-------------+
|           2 |
|           0 |
|           3 |
+-------------+
3 rows in set (0.01 sec)

-- 从表 t1 中选择每一行，然后使用 INSTR 函数找出列 a 中 NULL 首次出现的位置
-- 由于 NULL 是未知值，所以这个查询会返回 NULL
mysql> select instr(a,null) from t1;
+----------------+
| instr(a, null) |
+----------------+
|           NULL |
|           NULL |
|           NULL |
+----------------+
3 rows in set (0.00 sec)
```
