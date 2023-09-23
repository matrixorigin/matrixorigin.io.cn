# **NULLIF**

## **语法说明**

`NULLIF()` 函数用于比较两个表达式的值。如果 `expr1` 和 `expr2` 的值相等，那么 `NULLIF()` 函数返回 `NULL`；否则，返回 `expr1` 的值。这个函数通常用于处理避免除以零或避免在计算中使用无效的值时产生错误。

## **语法结构**

```
> NULLIF(expr1,expr2)
```

## **示例**

```sql
CREATE TABLE employees ( id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL, salary DECIMAL(10, 2) );

INSERT INTO employees (name, salary) VALUES ('John Doe', 1000), ('Alice Smith', 2000), ('Bob Johnson', 1500);

-- 使用 NULLIF() 函数将工资为特定值的员工的工资设为 NULL。NULLIF(salary, 1500) 函数将比较 salary 字段的值和 1500。如果 salary 的值等于 1500，则返回 NULL，否则返回 salary 的值。
mysql> SELECT name, salary, NULLIF(salary, 1500) AS adjusted_salary FROM employees;
+-------------+---------+-----------------+
| name        | salary  | adjusted_salary |
+-------------+---------+-----------------+
| John Doe    | 1000.00 | 1000.00         |
| Alice Smith | 2000.00 | 2000.00         |
| Bob Johnson | 1500.00 |                 |
+-------------+---------+-----------------+
3 rows in set (0.01 sec)
```
