# **DROP USER**

## **语法说明**

将指定的用户从系统中移除。

## **语法结构**

```
> DROP USER [IF EXISTS] user [, user] ...
```

## **示例**

```sql
> drop user if exists userx;
Query OK, 0 rows affected (0.02 sec)
```

!!! note
    如果用户正在会话中，当用户被移除，会话随即断开，无法再连接 MatrixOne。
