# MatrixOne 的乐观事务

## 乐观事务原理

乐观事务事务开始时，不会做冲突检测或锁，会将当前相关数据缓存至对应内存区域，并对该数据进行增删改。

在完成修改后，进入提交阶段时，将分为两个步骤进行提交：

**步骤一**：将待写数据中的某一列当做主键列，并对该列上锁并创建时间戳。基于此时间戳之后对相关行进行的写入均判定为写冲突。

**步骤二**：写入数据，并且记录此时的时间戳，解开锁。

## 乐观事务模型

MatrixOne 支持乐观事务模型。你在使用乐观并发读取一行时不会锁定该行。当你想要更新一行时，应用程序必须确定其他用户是否在读取该行后对该行进行了。乐观并发事务通常用于数据争用较低的环境中。

在乐观并发模型中，如果你从数据库接收到一个值后，另一个用户在你试图修改该值之前修改了该值，则产生报错。

### 模型示例

下面给出乐观并发的示例，将为你展示服务器如何解决并发冲突。

1. 在下午 1:00，用户1 从数据库中读取一行，其值如下:

    ```
    CustID LastName FirstName
    101 Smith Bob
    ```

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|Bob|Bob|

2. 在下午 1:01，User2 从数据库中读取同一行。

3. 在下午 1:03，用户2 将 FirstName 行的“Bob”改为“Robert”，并更新到数据库里。

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|Robert|Bob|

4. 上表所示，更新成功，因为更新时数据库中的值与用户2 的原始值匹配。

5. 在下午 1:05，用户1 将 FirstName 行的“Bob”改为“James”，并尝试进行更新。

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|James|Robert|

6. 此时，用户1 遇到了乐观并发冲突，因为数据库中的值“Robert”不再与用户1 期望的原始值“Bob”匹配，并发冲突提示更新失败。下一步需要决定，是采用用户1 的更改覆盖用户2 的更改，还是取消用户1 的更改。
