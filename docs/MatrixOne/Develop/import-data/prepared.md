# 预处理

MatrixOne 提供对服务器端预处理语句的支持。利用客户端或服务器二进制协议的高效性，对参数值使用带有占位符的语句进行预处理，执行过程中的优点如下：

- 每次执行语句时解析语句的效率提高。通常，数据库应用程序处理大量几乎相同的语句，只更改子句中的文字或变量值，例如用于查询和删除的 `WHERE`、用于更新的 `SET` 和用于插入的 `VALUES`。

- 防止 SQL 注入。参数值可以包含未转义的 SQL 引号和分隔符，一次编译，多次运行，省去了解析优化等过程。

## `PREPARE`、`EXECUTE`、和 `DEALLOCATE PREPARE` 语句

PREPARE 语句的 SQL 基本语法主要为以下三种 SQL 语句：

- [PREPARE](../../Reference/SQL-Reference/Other/Prepared-Statements/prepare.md)：执行预编译语句。

- [EXECUTE](../../Reference/SQL-Reference/Other/Prepared-Statements/execute.md)：执行已预编译的句。

- [DEALLOCATE PREPARE](../../Reference/SQL-Reference/Other/Prepared-Statements/deallocate.md)：释放一条预编译的语句。

### 创建预处理语句

```
PREPARE stmt_name FROM preparable_stmt
```

|  参数   | 说明 |
|  ----  | ----  |
|stmt_name | 预编译的 SQL 语句的名称|
|preparable_stmt|包含 SQL 语句文本的字符串文字或用户变量。文本必须代表单个语句，而不是多个语句。|

### 执行预处理语句

```
EXECUTE stmt_name [USING @var_name [, @var_name] ...]
```

|  参数   | 说明 |
|  ----  | ----  |
|stmt_name | 预编译的 SQL 语句的名称 |

### 删除预处理语句

```
{DEALLOCATE | DROP} PREPARE stmt_name
```

|  参数   | 说明 |
|  ----  | ----  |
|stmt_name | 预编译的 SQL 语句的名称 |

## 示例

```sql
-- 创建表
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(50)
);

-- 插入数据
INSERT INTO customers (id, name, email)
VALUES (1, 'John Doe', 'john@example.com'),
       (2, 'Jane Smith', 'jane@example.com'),
       (3, 'Mike Johnson', 'mike@example.com');

-- 进行预处理
mysql> PREPARE stmt FROM 'SELECT * FROM customers WHERE id = ?';
Query OK, 0 rows affected (0.02 sec)

-- 执行预处理
mysql> SET @id = 2;
Query OK, 0 rows affected (0.00 sec)

mysql> EXECUTE stmt USING @id;
+------+------------+------------------+
| id   | name       | email            |
+------+------------+------------------+
|    2 | Jane Smith | jane@example.com |
+------+------------+------------------+
1 row in set (0.01 sec)

-- 删除预处理
mysql> DEALLOCATE PREPARE stmt;
Query OK, 0 rows affected (0.00 sec)
```

上述示例首先创建了一个名为 `customers` 的表，该表包含 `id`、`name` 和 `email` 三个列。接下来，插入了三条数据到该表中。

然后，使用 `PREPARE` 语句进行预处理，将 `SELECT * FROM customers WHERE id = ?` 作为预处理语句保存在 `stmt` 中。

执行预处理时，将 `@id` 变量设置为 2，并使用 `EXECUTE` 语句执行预处理，将 `@id` 作为参数传递给预处理语句。

最后，使用 `DEALLOCATE PREPARE` 语句删除预处理，释放相关资源。
