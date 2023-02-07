# **SHOW VARIABLES**

## **语法说明**

以列表的形式展现当前数据库系统变量的值。

## **语法结构**

```
> SHOW [GLOBAL | SESSION] VARIABLES
    [LIKE 'pattern']
```

### **语法释义**

- [GLOBAL | SESSION]|：可变的范围修饰符。

SHOW VARIABLES 接受一个可选的 GLOBAL 或 SESSION 可变的范围修饰符：

使用 GLOBAL 修饰符，该语句显示全局系统变量值。这些是用于初始化与 MySQL 的新连接的相应会话变量的值。如果变量没有全局值，则不显示任何值。

使用 SESSION 修饰符，该语句显示对当前连接有效的系统变量值。如果变量没有会话值，则显示全局值。LOCAL 是的同义词 SESSION。

如果没有修饰符，则默认为 SESSION。

- 对于 LIKE 子句，该语句仅显示名称与模式匹配的那些变量的行。

- 要获取名称与模式匹配的变量列表，请在子句中使用%通配符：LIKE

## **示例**

```sql
mysql> SHOW VARIABLES;
+--------------------------+-----------------------------------------------------------------------------------------------------------------------+
| Variable_name            | Value                                                                                                                 |
+--------------------------+-----------------------------------------------------------------------------------------------------------------------+
| auto_increment_increment | 1                                                                                                                     |
| auto_increment_offset    | 1                                                                                                                     |
| autocommit               | 1                                                                                                                     |
| character_set_client     | utf8mb4                                                                                                               |
| character_set_connection | utf8mb4                                                                                                               |
| character_set_database   | utf8mb4                                                                                                               |
| character_set_results    | utf8mb4                                                                                                               |
| character_set_server     | utf8mb4                                                                                                               |
| collation_connection     | default                                                                                                               |
| collation_server         | utf8mb4_bin                                                                                                           |
| completion_type          | NO_CHAIN                                                                                                              |
| host                     | 0.0.0.0                                                                                                               |
| init_connect             |                                                                                                                       |
| interactive_timeout      | 28800                                                                                                                 |
| license                  | APACHE                                                                                                                |
| lower_case_table_names   | 0                                                                                                                     |
| max_allowed_packet       | 16777216                                                                                                              |
| net_write_timeout        | 60                                                                                                                    |
| performance_schema       | 0                                                                                                                     |
| port                     | 6001                                                                                                                  |
| profiling                | 0                                                                                                                     |
| query_result_maxsize     | 100                                                                                                                   |
| query_result_timeout     | 24                                                                                                                    |
| save_query_result        | 0                                                                                                                     |
| sql_mode                 | ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION |
| sql_safe_updates         | 0                                                                                                                     |
| sql_select_limit         | 18446744073709551615                                                                                                  |
| system_time_zone         |                                                                                                                       |
| testbotchvar_nodyn       | 0                                                                                                                     |
| testbothvar_dyn          | 0                                                                                                                     |
| testglobalvar_dyn        | 0                                                                                                                     |
| testglobalvar_nodyn      | 0                                                                                                                     |
| testsessionvar_dyn       | 0                                                                                                                     |
| testsessionvar_nodyn     | 0                                                                                                                     |
| time_zone                | SYSTEM                                                                                                                |
| transaction_isolation    | REPEATABLE-READ                                                                                                       |
| transaction_read_only    | 0                                                                                                                     |
| tx_isolation             | REPEATABLE-READ                                                                                                       |
| tx_read_only             | 0                                                                                                                     |
| version_comment          | MatrixOne                                                                                                             |
| wait_timeout             | 28800                                                                                                                 |
+--------------------------+-----------------------------------------------------------------------------------------------------------------------+
41 rows in set (0.01 sec)

mysql> show variables like 'auto%';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| auto_increment_increment | 1     |
| auto_increment_offset    | 1     |
| autocommit               | 1     |
+--------------------------+-------+
3 rows in set (0.00 sec)

mysql> show variables like 'auto_increment_increment';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| auto_increment_increment | 1     |
+--------------------------+-------+
1 row in set (0.00 sec)
```
