---
title: "AES_ENCRYPT()"
doc_type: reference
mysql_compat: partial
differs_from_mysql: ["仅支持 aes-128-ecb 和 aes-256-cbc，通过 block_encryption_mode 设置；其他 MySQL 模式未实现。"]
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "AES_ENCRYPT 使用密钥加密明文并返回 BLOB 密文，模式由 block_encryption_mode 设置，支持 aes-128-ecb（默认）和 aes-256-cbc（需要 16 字节 IV）。"
---

# **AES_ENCRYPT()**

> `AES_ENCRYPT(str, key_str[, init_vector])` 使用 AES 加密字符串并返回
> `BLOB` 密文；加密模式由会话变量 `block_encryption_mode` 选择（默认
> `aes-128-ecb`；`aes-256-cbc` 需要在第三个参数中提供 16 字节 IV）。

## 函数说明

`AES_ENCRYPT()` 使用 AES 以 `key_str` 加密 `str` 并返回 `BLOB` 密文。加
密模式由会话变量 [`block_encryption_mode`](../../Variable/system-variables/system-variables-overview.md)
选择。

MatrixOne 目前支持两种模式：

- `aes-128-ecb`（默认）。密钥派生为 16 字节；忽略可选的 `init_vector` 参数。
- `aes-256-cbc`。密钥派生为 32 字节；`init_vector` 参数为必填，且长度至
  少 16 字节。

以下情况下函数返回 `NULL`：

- `str` 或 `key_str` 为 `NULL`。
- `block_encryption_mode` 设置为不支持的值。
- 选择了 CBC 模式但 IV 缺失、为 `NULL` 或长度不足 16 字节。
- 密钥派生或底层 AES 操作失败。

## 函数语法

```
> AES_ENCRYPT(str, key_str)
> AES_ENCRYPT(str, key_str, init_vector)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| str | 必填。要加密的明文字符串。接受 `VARCHAR`、`CHAR`、`TEXT` 或 `BLOB`。 |
| key_str | 必填。加密密钥。 |
| init_vector | 可选。初始化向量，当 `block_encryption_mode` 选择 CBC 模式时为必填。长度至少 16 字节。 |

## 示例

<!-- validator-ignore-exec -->
```sql
mysql> SET block_encryption_mode = 'aes-128-ecb';
mysql> SELECT HEX(AES_ENCRYPT('MatrixOne', 'my-secret-key'));
+-------------------------------------------------+
| hex(aes_encrypt(matrixone, my-secret-key))      |
+-------------------------------------------------+
| 3B1A...                                         |
+-------------------------------------------------+

mysql> SET block_encryption_mode = 'aes-256-cbc';
mysql> SELECT HEX(AES_ENCRYPT('MatrixOne', 'my-secret-key', '0123456789abcdef'));
```

## 参考

- [`AES_DECRYPT()`](aes_decrypt.md)
