# 悲观事务

## 悲观事务原理

悲观事务开始时，一定会做冲突检测或锁操作，在未检测到冲突或锁的时候，会将待写数据中的某一列当做主键列，并对该列上锁并创建时间戳。对于此时间戳之后对相关行进行的写入均判定为写冲突。

将当前相关数据缓存至对应内存区域，并对该数据进行增删改。如果当前表存在锁，则进入等待状态，当等待超时后，等待事务将会被取消。

在完成修改后，进入提交阶段，写入数据，并且记录此时的时间戳，解开锁。

## 悲观事务模型

MatrixOne 默认悲观事务。

你在使用悲观并发读取一行时，不会锁定该行。当你想要更新一行时，应用程序必须确定其他用户是否已经对该行上锁。悲观并发事务通常用于数据争用较高的环境中。

在悲观并发模型中，如果你从数据库接收到一个值后，另一个用户在你试图修改该值之前，将会遇到锁而进入等待状态，超过 MatrixOne 设置的事务等待时间（5 分钟）后，等待事务将会被强制取消。

### 死锁

在悲观事务中，有可能出现一种情况，即两个或两个以上事务互相锁住了对方所需要的资源时，令每个事务都无法进行下去的状态，这种情况被称之为死锁（Deadlock）。只有通过人为干预其中某个事务，例如，通过手动 `Kill` 会话的方式，才能立即结束死锁，否则只能等事务超出最长等待时间。

死锁示例如下图所示：

![image-20221026152318567](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/distributed-transaction/deadlocked-zh.png)

### 模型示例

下面为悲观并发的示例，将为你展示 MatrixOne 如何解决并发冲突。

1. 在下午 1:00，用户 1 从数据库中读取一行，其值如下：

   ```
   CustID LastName FirstName
   101 Smith Bob
   ```

   |Column name|Original value|Current value|Value in database|
   |---|---|---|---|
   |CustID|101|101|101|
   |LastName|Smith|Smith|Smith|
   |FirstName|Bob|Bob|Bob|

2. 在下午 1:01，用户 2 从数据库中读取同一行。

3. 在下午 1:03，用户 2 将 FirstName 列的“Bob”改为“Robert”，此时处于未提交状态。

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|Robert|Bob|

4. 在下午 1:05，用户 1 将 FirstName 列的“Bob”改为“James”，并尝试进行更新。

    |Column name|Original value|Current value|Value in database|
    |---|---|---|---|
    |CustID|101|101|101|
    |LastName|Smith|Smith|Smith|
    |FirstName|Bob|James|Bob|

5. 此时，用户 1 遇到了悲观并发冲突，因为数据库中的值“Robert”所在行已经被锁定，需要等待用户 2 的下一步操作。

6. 在下午 1:06，用户 1 对事务提交。此时用户 2 解除等待状态开始事务，但是因为已经无法匹配到对应的 FirstName，因此用户 2 的事务会更新失败。
