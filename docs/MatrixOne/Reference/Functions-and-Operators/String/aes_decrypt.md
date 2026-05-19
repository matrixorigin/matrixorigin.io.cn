---
title: "AES_DECRYPT()"
doc_type: reference
mysql_compat: partial
differs_from_mysql: ["仅支持 aes-128-ecb 和 aes-256-cbc，通过 block_encryption_mode 设置；其他 MySQL 模式未实现。"]
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "AES_DECRYPT 使用密钥解密密文，模式由 block_encryption_mode 设置，支持 aes-128-ecb（默认）和 aes-256-cbc（需要 16 字节 IV）。"
---

# **AES_DECRYPT()**

> `AES_DECRYPT(crypt_str, key_str[, init_vector])` 使用 AES 解密密文并返回
> `VARCHAR` 明文；加密模式由会话变量 `block_encryption_mode` 选择，必须
> 与加密时使用的模式一致（默认 `aes-128-ecb`；`aes-256-cbc` 需要 16 字节
> IV）。

## 函数说明

`AES_DECRYPT()` 使用 AES 以 `key_str` 解密 `crypt_str` 并返回 `VARCHAR`
明文。加密模式由会话变量 [`block_encryption_mode`](../../Variable/system-variables/system-variables-overview.md)
选择，必须与生成 `crypt_str` 时使用的模式一致。

MatrixOne 目前支持两种模式：

- `aes-128-ecb`（默认）。密钥派生为 16 字节；忽略可选的 `init_vector` 参数。
- `aes-256-cbc`。密钥派生为 32 字节；`init_vector` 参数为必填，且长度至
  少 16 字节，必须与加密时使用的 IV 一致。

以下情况下函数返回 `NULL`：

- `crypt_str` 或 `key_str` 为 `NULL`。
- `block_encryption_mode` 设置为不支持的值。
- 选择了 CBC 模式但 IV 缺失、为 `NULL` 或长度不足 16 字节。
- 密钥派生或底层 AES 操作失败（密钥错误、密文被篡改或填充错误）。

## 函数语法

```
> AES_DECRYPT(crypt_str, key_str)
> AES_DECRYPT(crypt_str, key_str, init_vector)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| crypt_str | 必填。要解密的密文。接受 `BLOB`、`VARCHAR`、`CHAR` 或 `TEXT`。 |
| key_str | 必填。生成 `crypt_str` 时使用的加密密钥。 |
| init_vector | 可选。初始化向量，当 `block_encryption_mode` 选择 CBC 模式时为必填。 |

## 示例

<!-- validator-ignore-exec -->
```sql
mysql> SET block_encryption_mode = 'aes-128-ecb';
mysql> SELECT AES_DECRYPT(AES_ENCRYPT('MatrixOne', 'my-secret-key'), 'my-secret-key');
+--------------------------------------------------------------------------+
| aes_decrypt(aes_encrypt(matrixone, my-secret-key), my-secret-key)        |
+--------------------------------------------------------------------------+
| MatrixOne                                                                |
+--------------------------------------------------------------------------+
```

## 参考

- [`AES_ENCRYPT()`](aes_encrypt.md)
