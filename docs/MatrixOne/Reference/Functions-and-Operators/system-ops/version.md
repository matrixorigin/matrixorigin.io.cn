# **VERSION**

## **函数说明**

`VERSION()` 函数用于获取当前 MatrixOne 的版本信息。这个函数通常返回一个字符串，包含了 MatrixOne 的版本号。如 8.0.30-MatrixOne-v1.2.1，表示 MatrixOn 的版本号是 8.0.30-MatrixOne-v1.2.1, 它的定义是 MySQL 兼容版本号 (8.0.30) + MatrixOne + MatrixOne 内核版本 (v1.2.1)。

## **函数语法**

```
> VERSION()
```

## **示例**

```sql
mysql> select version();
+-------------------------+
| version()               |
+-------------------------+
| 8.0.30-MatrixOne-v1.2.1 |
+-------------------------+
1 row in set (0.00 sec)
```
