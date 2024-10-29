# **DECODE()**

## **函数说明**

`DECODE()` 函数用于对 [`ENCODE()`](./encode.md) 编码的数据进行解密。

## **函数语法**

```
> DECODE(crypt_str, pass_str)
```

## **参数释义**

|  参数             | 说明                           |
|  --------------- | ------------------------------ |
| crypt_str        | 通过 ENCODE() 编码后的加密字符串。           |
| pass_str         | 用于解密的密码字符串，必须与加密时使用的密钥相同。     |

## **示例**

```SQL
mysql> SELECT DECODE(ENCODE('hello', 'mysecretkey'), 'mysecretkey');
+-------------------------------------------------+
| DECODE(ENCODE(hello, mysecretkey), mysecretkey) |
+-------------------------------------------------+
| hello                                           |
+-------------------------------------------------+
1 row in set (0.00 sec)

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255),
    encrypted_password BLOB
);

INSERT INTO users (username, encrypted_password)
VALUES ('john', ENCODE('password123', 'mysecretkey'));

mysql> SELECT username, DECODE(encrypted_password, 'mysecretkey') AS decrypted_password FROM users WHERE username = 'john';
+----------+--------------------+
| username | decrypted_password |
+----------+--------------------+
| john     | password123        |
+----------+--------------------+
1 row in set (0.00 sec)
```
