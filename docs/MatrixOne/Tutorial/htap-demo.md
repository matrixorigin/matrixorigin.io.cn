# HTAP

随着企业规模的增长和数据量的爆炸性增加，传统的交易型数据库在应对数据分析等高级应用时开始显得捉襟见肘，无法满足企业对数据分析的多维需求。业务系统的激增和业务逻辑的日益复杂化，迫使许多企业不得不对数据库进行拆分。但是，这种拆分后的架构因为实例之间的物理隔离，难以实现跨分片的复杂关联统计和实时分析，这大大限制了数据库的应用潜力。为了应对这些挑战，实时数据仓库技术应运而生。然而，实时数据仓库虽然提供了解决方案，但其架构的复杂性和高昂的成本，要求企业投入大量的人力资源去维护和构建复杂的数据同步链路，这在很多情况下并不是必需的。

MatrixOne 的 HTAP 混合负载引擎提供了一种突破性的解决方案。它通过单一的数据库内核，无缝集成了在线交易处理和实时数据分析的能力，从而消除了传统架构中数据同步的需求。这种集成化的架构设计，不仅极大地简化了技术架构，提升了业务处理的效率，而且为企业的持续创新和效率提升注入了新的活力。MatrixOne HTAP 的实施，使企业能够更加敏捷地应对数据分析和交易处理的双重挑战，实现数据的即时分析和快速决策，同时避免了额外的维护成本和技术上的复杂性。

## 什么是 HTAP?

HTAP，即 Hybrid Transactional/Analytical Processing（混合事务/分析处理），是一种数据库架构，它能够在单个数据库系统内同时处理事务型（OLTP）和分析型（OLAP）工作负载。这种架构的优势在于它可以减少数据存储的冗余，提高查询性能，并支持实时数据分析，从而帮助企业快速做出决策。

<div align="center">
<img src= https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/htap/htap.png width=80% heigth=80%/>
</div>

## 应用场景

HTAP 数据库的应用场景主要集中在需要同时处理高并发事务和复杂分析查询的业务环境中。以下是一些具体的应用场景：

1. **金融行业实时风控与反欺诈**：金融行业对交易数据的实时监控和分析有着迫切需求，HTAP 数据库能够实现交易与风险分析的同步进行，帮助金融机构及时发现并阻断欺诈行为，减少损失。

2. **物联网系统中的实时数据处理**：物联网设备产生的数据量巨大，HTAP 数据库能够实时处理和分析这些数据，为智能决策提供支持，例如在工业自动化和智慧城市建设中。

3. **数据服务平台或数据中台**：HTAP 数据库可以作为数据服务平台的底层支撑，提供统一的数据视图和实时数据分析能力，支持企业内部不同部门的数据需求，促进数据共享和业务创新。

4. **电信行业中的网络管理和优化**：电信运营商可以利用 HTAP 数据库实时监控网络状态，分析用户行为模式，优化网络资源分配，提升网络服务质量。

5. **企业资源规划（ERP）系统中的实时分析**：在 ERP 系统中，HTAP 数据库能够提供实时的业务洞察和决策支持，帮助企业快速响应市场变化，优化资源配置。

HTAP 数据库通过其行列共存的存储架构，有效地结合了 OLTP 和 OLAP 的优势，支持实时的事务处理和复杂的数据分析，满足了现代企业对数据实时性、一致性和分析能力的需求。随着技术的发展和应用的深入，HTAP 数据库将在更多领域发挥重要作用。

## 开始前准备

### 环境配置

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。

- 确认你已完成安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。

   使用下面的代码检查 Python 版本确认安装成功：

    ```
    #To check with Python installation and its version
    python3 -V
    ```

- 确认你已完成安装 MySQL 客户端。

## 应用案例

我们根据**场景 1** 创建一个金融行业实时风控与反欺诈应用示例，主要是通过模拟并发交易并定时检查 24h 内是否有用户的交易总额超过了他们的账户余额。系统将报告这些风险交易。

### 建表

准备一个用户表和交易表
  
```sql
drop table transactions;
drop table users;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY, -- 用户 id
    username VARCHAR(255) NOT NULL, -- 用户名
    account_balance DECIMAL(10, 2) NOT NULL -- 账户余额
);

CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY, -- 交易 id
    user_id INT NOT NULL, -- 用户 id
    amount DECIMAL(10, 2) NOT NULL, -- 交易金额
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 交易时间
    FOREIGN KEY (user_id) REFERENCES Users(user_id)  
);
```

### 创建数据库连接池

```python
import mysql.connector

def create_connection_pool(max_connections=10):
    return mysql.connector.pooling.MySQLConnectionPool(
        pool_name="my_connection_pool",
        pool_size=max_connections,
        host='127.0.0.1',
        database = 'test',
        user = 'root',
        password = '111',
        port = 6001,
        autocommit=True
    )
```

### 准备用户信息数据

在这里，我们将通过程序生成 100 条随机用户账户数据。

```python
import random

def insert_users(pool):
    conn = pool.get_connection()
    try:
            cursor = conn.cursor()
            for _ in range(100):  # 假设我们要插入 100 个用户
                username = f'user{_}'
                account_balance = round(random.uniform(100, 10000), 2)
                sql = "INSERT INTO Users (username, account_balance) VALUES (%s, %s)"
                cursor.execute(sql, (username, account_balance))
    except Exception as e:
        print(e)
```
  
### 准备交易信息数据

通过程序随机生成交易信息。

```python
import secrets

def insert_transactions(pool):
    conn = pool.get_connection()
    try:
            cursor = conn.cursor()
            for _ in range(10):  # 假设我们要插入 10 条数据
                user_id = random.randint(1, 100)  # 假设用户 ID 从 1 到 100
                amount = round(secrets.randbelow(1000 * 100) / 100, 2)
                sql = """
                INSERT INTO Transactions (user_id, amount)
                VALUES (%s, %s)
                """
                cursor.execute(sql, (user_id, amount))
    except Exception as e:
        print(e)
```

### 定义风控分析规则

我们定义风控规则为：对每个用户在一天内的所有交易进行汇总，计算其交易总额。如果发现某个用户在同一天的交易累计金额超过了其账户中的当前余额，系统将自动标记该用户为可疑用户，从而触发风险预警。

```python
def analyze_transactions(pool):
    try:
            conn = pool.get_connection()
            cursor = conn.cursor()
            sql = """
            SELECT 
                t.user_id, 
                SUM(t.amount) AS total_transaction_amount,
                t.transaction_time,
                u.account_balance
            FROM 
                Transactions t
            JOIN 
                Users u ON t.user_id = u.user_id
            WHERE 
                t.transaction_time > DATE_SUB(NOW(), INTERVAL 1 DAY) 
            GROUP BY 
                t.user_id, t.transaction_time,u.account_balance
            HAVING 
                SUM(t.amount) > u.account_balance;
            """
            cursor.execute(sql)
            result = cursor.fetchall()
            for row in result:
                 print("可疑账户 id",row[0],"当日交易总额",row[1],"交易时间",row[2],"账户余额",row[3])
    except Exception as e:
        print(e)
```

### 交易及分析

在此，我们创建了五个线程来模拟并行处理的交易环境。在每个交易操作成功完成后，系统将自动启动风险控制分析流程。

```python
import threading

def thread_insert():
    # 创建连接池
    pool = create_connection_pool()
    if pool:
        # 创建多个线程
        threads = []
        for _ in range(5):  # 创建 5 个线程
            thread = threading.Thread(target=insert_transactions, args=(pool,))
            threads.append(thread)
            thread.start()
        for thread in threads:
            thread.join()  # 等待所有线程完成
        analyze_transactions(pool)
```

### 创建定时任务

通过安排定时任务，模拟生成连续的实时交易数据流。

```python
import time
from apscheduler.schedulers.background import BackgroundScheduler

def main():
    pool = create_connection_pool()
    insert_users(pool)
    while True:
        # 创建后台调度器
        scheduler = BackgroundScheduler()
        # 每分钟执行一次插入数据任务并进行风控分析
        scheduler.add_job(thread_insert, 'interval', minutes=1)
        # 启动调度器
        scheduler.start()
        # 防止脚本退出
        try:
            while True:
                time.sleep(2)
        except (KeyboardInterrupt, SystemExit):
            # 关闭调度器
            scheduler.shutdown()
```

### 查看结果

```python
if __name__ == '__main__':
    main()
```

控制台输出：

```bash
可疑账户id 56 当日交易总额 754.52 交易时间 2024-07-12 15:57:33 账户余额 516.29
可疑账户id 82 当日交易总额 817.18 交易时间 2024-07-12 15:57:33 账户余额 461.46
可疑账户id 40 当日交易总额 502.32 交易时间 2024-07-12 15:57:33 账户余额 174.15
可疑账户id 82 当日交易总额 525.94 交易时间 2024-07-12 15:57:33 账户余额 461.46
......
```