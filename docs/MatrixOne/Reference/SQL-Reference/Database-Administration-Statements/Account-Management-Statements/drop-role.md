# **DROP ROLE**

## **语法说明**

将指定的角色从系统中移除。

## **语法结构**

```
> DROP ROLE [IF EXISTS] role [, role ] ...
```

## **示例**

```sql
> drop role if exists rolex;
Query OK, 0 rows affected (0.02 sec)
```

!!! note
    如果使用这个角色的用户正在会话中，当角色被移除，会话随即断开，无法再使用这个角色进行操作。
