# **BINARY**

## **函数说明**

`BINARY()` 函数是一个用于将值转换为二进制字符串的函数。它通常用于比较文本或字符数据时，将字符串视为二进制数据而不是普通的字符数据。这样可以实现对字符数据的二进制比较，而不受字符集或编码的影响。

`BINARY()` 函数实现对字符数据的二进制比较，用于处理大小写敏感的字符串比较等场景。

## **语法结构**

```
> BINARY value

```

## **相关参数**

|  参数  | 说明 |
|  ----  | ----  |
| value  | 必要参数。待转化的值。 |

## **示例**

```sql
CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL, password VARCHAR(100) NOT NULL);

INSERT INTO users (username, password) VALUES ('JohnDoe', 'Abcd123'), ('AliceSmith', 'Efgh456'), ('BobJohnson', 'ijkl789');

-- 使用 BINARY() 操作符进行密码验证，BINARY password = 'Abcd123'部分将密码值视为二进制字符串，这样进行的比较是大小写敏感的。如果输入的密码与数据库中的记录匹配，查询将返回相应的用户 id 和 username，否则将返回空结果。
mysql> SELECT id, username FROM users WHERE username = 'JohnDoe' AND BINARY password = 'Abcd123';
+------+----------+
| id   | username |
+------+----------+
|    1 | JohnDoe  |
+------+----------+
1 row in set (0.00 sec)

mysql> SELECT id, username FROM users WHERE username = 'JohnDoe' AND BINARY password = 'abcd123';
Empty set (0.00 sec)
```
