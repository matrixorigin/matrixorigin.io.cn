# Git for Data：数据分支管理

在日常数据开发中，你一定遇到过这样的场景：

- 风控团队要修改规则表，运营团队同时要调整活动数据，两边都怕改坏对方的数据
- 测试环境需要一份和生产一模一样的数据，但复制 TB 级大表又慢又贵
- 数据口径调整后，想知道 "到底改了哪几行"，却只能靠人肉比对

传统做法是 "先拷一份"——复制库、复制表、跑脚本。但拷贝慢、成本高，最关键的是：**你很难说清楚改了什么，更难把改动安全地带回去。**

MatrixOne 的 **Data Branch（数据分支）**功能，把数据变更管理变成了一套类似 Git 的工程化流程。你可以用 SQL 完成：创建分支、查看差异、合并变更、处理冲突——就像管理代码一样管理数据。

本教程将带你从零开始，通过一个完整的实战场景，学会 Data Branch 的全部核心操作。

> **版本要求**：Data Branch 功能适用于 MatrixOne v3.0 及以上版本。

## 核心概念

在开始之前，先了解 5 个关键动作：

| 动作 | SQL 语法 | 类比 Git | 作用 |
|------|----------|----------|------|
| 快照 | `CREATE SNAPSHOT` | `git tag` | 给数据打一个时间点标记，作为安全锚点 |
| 创建分支 | `DATA BRANCH CREATE` | `git branch` + `git checkout` | 从主表/快照拉出一张独立的试验表 |
| 查看差异 | `DATA BRANCH DIFF` | `git diff` | 逐行比较两个分支之间的数据差异 |
| 合并 | `DATA BRANCH MERGE` | `git merge` | 把分支上的变更合并回目标表 |
| 删除分支 | `DATA BRANCH DELETE` | `git branch -d` | 清理不再需要的分支，保留审计元数据 |

与 Git 管理代码类似，Data Branch 的典型工作流是：

```
主表 → 打快照 → 创建分支 → 独立修改 → Diff 审阅 → Merge 回主表
```

!!! note
    Data Branch 基于 Copy-on-Write（写时复制）机制。创建分支时不会真正复制数据，只有修改时才分配新存储空间，因此创建分支非常快，几乎不占额外存储。

## 开始前准备

在你开始之前，确认：

- 已有可连接的 MatrixOne v3.0 及以上实例
- 已安装 MySQL 客户端，并能连接到 MatrixOne

连接到 MatrixOne：

```bash
mysql -h 127.0.0.1 -P 6001 -u root -p111
```

## 实战场景：订单表的双线并行修改

我们模拟一个真实场景：一张订单主表，风控团队和运营团队需要同时修改，互不干扰，最后把各自的改动合并回主表。

### 第一步：准备主表数据

```sql
-- 创建演示数据库
DROP DATABASE IF EXISTS demo_branch;
CREATE DATABASE demo_branch;
USE demo_branch;

-- 创建订单主表
CREATE TABLE orders (
    order_id    INT PRIMARY KEY,
    customer    VARCHAR(20),
    amount      DECIMAL(10,2),
    risk_flag   TINYINT DEFAULT 0,
    promo_tag   VARCHAR(20)
);

-- 插入初始数据
INSERT INTO orders VALUES
    (1001, 'Alice',   99.90,  0, NULL),
    (1002, 'Bob',    199.00,  0, NULL),
    (1003, 'Charlie', 10.00,  0, NULL),
    (1004, 'Diana',  350.00,  0, NULL),
    (1005, 'Eve',     75.50,  0, NULL);

-- 确认数据
SELECT * FROM orders ORDER BY order_id;
```

结果：

```
+----------+----------+--------+-----------+-----------+
| order_id | customer | amount | risk_flag | promo_tag |
+----------+----------+--------+-----------+-----------+
|     1001 | Alice    |  99.90 |         0 | NULL      |
|     1002 | Bob      | 199.00 |         0 | NULL      |
|     1003 | Charlie  |  10.00 |         0 | NULL      |
|     1004 | Diana    | 350.00 |         0 | NULL      |
|     1005 | Eve      |  75.50 |         0 | NULL      |
+----------+----------+--------+-----------+-----------+
```

### 第二步：打快照，建立安全锚点

在任何修改之前，先给主表打一个快照。这是你的 "安全网"——无论后续怎么操作，都能回到这个点。

```sql
CREATE SNAPSHOT sp_orders_v1 FOR TABLE demo_branch orders;
```

### 第三步：创建两个分支

从主表创建两个独立的分支表，分别给风控团队和运营团队使用：

```sql
-- 风控分支：用于标记高风险订单
DATA BRANCH CREATE TABLE orders_risk FROM orders;

-- 运营分支：用于打活动标签、调整价格
DATA BRANCH CREATE TABLE orders_promo FROM orders;
```

此时三张表的数据完全一致。验证一下：

```sql
SELECT * FROM orders_risk ORDER BY order_id;
SELECT * FROM orders_promo ORDER BY order_id;
```

两个查询的结果都和主表一样。

!!! info
    你也可以从快照创建分支：`DATA BRANCH CREATE TABLE orders_risk FROM orders{SNAPSHOT='sp_orders_v1'};`，这样即使主表在创建分支前被修改了，分支仍然基于快照时刻的数据。

### 第四步：两个分支独立修改

现在两个团队各自在自己的分支上工作，互不干扰。

**风控团队**在 `orders_risk` 上操作：

```sql
-- 标记 Bob 的订单为高风险
UPDATE orders_risk SET risk_flag = 1 WHERE order_id = 1002;

-- 删除 Charlie 的异常小额订单
DELETE FROM orders_risk WHERE order_id = 1003;

-- 新增一笔需要审查的订单
INSERT INTO orders_risk VALUES (1006, 'Frank', 500.00, 1, NULL);
```

**运营团队**在 `orders_promo` 上操作：

```sql
-- 给 Alice 和 Bob 的订单打上活动标签，并打九折
UPDATE orders_promo SET promo_tag = 'summer_sale', amount = amount * 0.9
WHERE order_id IN (1001, 1002);

-- 新增一笔活动订单
INSERT INTO orders_promo VALUES (1007, 'Grace', 39.90, 0, 'summer_sale');
```

此时主表完全不受影响：

```sql
SELECT * FROM orders ORDER BY order_id;
-- 仍然是最初的 5 行数据，没有任何变化
```

### 第五步：用 DIFF 查看差异

在合并之前，先看看每个分支相对于主表改了什么。

**查看风控分支 vs 主表的差异：**

```sql
DATA BRANCH DIFF orders_risk AGAINST orders;
```

结果：

```
+----------------------------+--------+----------+----------+--------+-----------+-----------+
| diff orders_risk against orders | flag   | order_id | customer | amount | risk_flag | promo_tag |
+----------------------------+--------+----------+----------+--------+-----------+-----------+
| orders_risk                | UPDATE |     1002 | Bob      | 199.00 |         1 | NULL      |
| orders_risk                | DELETE |     1003 | Charlie  |  10.00 |         0 | NULL      |
| orders_risk                | INSERT |     1006 | Frank    | 500.00 |         1 | NULL      |
+----------------------------+--------+----------+----------+--------+-----------+-----------+
```

可以清楚地看到：1 行更新、1 行删除、1 行新增。

**查看运营分支 vs 主表的差异：**

```sql
DATA BRANCH DIFF orders_promo AGAINST orders;
```

结果：

```
+-----------------------------+--------+----------+----------+--------+-----------+-------------+
| diff orders_promo against orders | flag   | order_id | customer | amount | risk_flag | promo_tag   |
+-----------------------------+--------+----------+----------+--------+-----------+-------------+
| orders_promo                | UPDATE |     1001 | Alice    |  89.91 |         0 | summer_sale |
| orders_promo                | UPDATE |     1002 | Bob      | 179.10 |         0 | summer_sale |
| orders_promo                | INSERT |     1007 | Grace    |  39.90 |         0 | summer_sale |
+-----------------------------+--------+----------+----------+--------+-----------+-------------+
```

2 行更新、1 行新增。

**也可以直接比较两个分支之间的差异：**

```sql
-- DATA BRANCH DIFF orders_risk AGAINST orders_promo;
```

这会显示两个分支之间所有不同的行，帮助你在合并前预判可能的冲突。

!!! tip
    对于大表，可以先用 `OUTPUT COUNT` 了解差异规模：
    ```sql
    -- DATA BRANCH DIFF orders_risk AGAINST orders OUTPUT COUNT;
    ```
    也可以用 `OUTPUT LIMIT 10` 只看前 10 行差异。

**将差异导出为补丁文件：**

如果你需要把变更带到另一个环境（比如从预发同步到生产），可以在合并前把 DIFF 结果导出为文件：

```sql
-- 导出到本地目录（在 merge 前执行，确保补丁反映的是分支原始变更）
-- DATA BRANCH DIFF orders_risk AGAINST orders OUTPUT FILE '/tmp/diff_output/';
```

系统会生成一个 `.sql` 文件（增量场景）或 `.csv` 文件（全量场景），并告诉你文件路径和使用方式。

在目标环境回放补丁：

```bash
# 回放 SQL 补丁
mysql -h <目标主机> -P 6001 -u root -p111 demo_branch < /tmp/diff_output/diff_xxx.sql
```

也可以导出到对象存储（通过 Stage）：

```sql
-- 创建 Stage 指向 S3
-- CREATE STAGE my_stage URL = 's3://my-bucket/diffs/?region=us-east-1&access_key_id=<ak>&secret_access_key=<sk>';

-- 导出到 Stage
-- DATA BRANCH DIFF orders_risk AGAINST orders OUTPUT FILE 'stage://my_stage/';
```

### 第六步：合并分支到主表

先合并风控分支（无冲突场景）：

```sql
DATA BRANCH MERGE orders_risk INTO orders;
```

验证主表：

```sql
SELECT * FROM orders ORDER BY order_id;
```

结果：

```
+----------+----------+--------+-----------+-----------+
| order_id | customer | amount | risk_flag | promo_tag |
+----------+----------+--------+-----------+-----------+
|     1001 | Alice    |  99.90 |         0 | NULL      |
|     1002 | Bob      | 199.00 |         1 | NULL      |
|     1004 | Diana    | 350.00 |         0 | NULL      |
|     1005 | Eve      |  75.50 |         0 | NULL      |
|     1006 | Frank    | 500.00 |         1 | NULL      |
+----------+----------+--------+-----------+-----------+
```

风控的修改已经生效：Bob 被标记为高风险，Charlie 的订单被删除，Frank 的订单被新增。

### 第七步：处理合并冲突

现在合并运营分支。注意，运营分支也修改了 `order_id = 1002`（Bob 的订单），而风控分支已经先合并了对同一行的修改，这就产生了冲突。

**默认行为 — 遇到冲突报错：**

```sql
-- DATA BRANCH MERGE orders_promo INTO orders;
-- ERROR: conflict on pk(1002)
```

系统会告诉你哪些行有冲突，不会静默覆盖数据。

**三种冲突处理策略：**

| 策略 | 语法 | 行为 | 适用场景 |
|------|------|------|----------|
| FAIL | 默认 | 遇到冲突立即报错 | 需要人工审查的场景 |
| SKIP | `WHEN CONFLICT SKIP` | 跳过冲突行，保留主表数据 | 主表数据优先 |
| ACCEPT | `WHEN CONFLICT ACCEPT` | 用分支数据覆盖主表 | 分支数据优先 |

在本场景中，风控标记比运营折扣更重要，所以我们选择 SKIP（保留主表中风控的修改）：

```sql
DATA BRANCH MERGE orders_promo INTO orders WHEN CONFLICT SKIP;
```

验证最终结果：

```sql
SELECT * FROM orders ORDER BY order_id;
```

结果：

```
+----------+----------+--------+-----------+-------------+
| order_id | customer | amount | risk_flag | promo_tag   |
+----------+----------+--------+-----------+-------------+
|     1001 | Alice    |  89.91 |         0 | summer_sale |
|     1002 | Bob      | 199.00 |         1 | NULL        |
|     1004 | Diana    | 350.00 |         0 | NULL        |
|     1005 | Eve      |  75.50 |         0 | NULL        |
|     1006 | Frank    | 500.00 |         1 | NULL        |
|     1007 | Grace    |  39.90 |         0 | summer_sale |
+----------+----------+--------+-----------+-------------+
```

- Alice 的订单：运营的折扣和标签生效（无冲突）
- Bob 的订单：保留了风控的 `risk_flag = 1`（冲突被 SKIP）
- Grace 的订单：运营新增的订单成功合并

### 第八步：删除分支

分支使用完毕后，及时清理：

```sql
DATA BRANCH DELETE TABLE orders_risk;
DATA BRANCH DELETE TABLE orders_promo;
```

与普通的 `DROP TABLE` 不同，`DATA BRANCH DELETE` 会在系统表 `mo_catalog.mo_branch_metadata` 中保留元数据记录（标记为已删除），方便后续审计追踪。

### 第九步：回滚（如果需要）

如果合并后发现问题，可以用快照回到初始状态：

```sql
RESTORE TABLE sys.demo_branch.orders{SNAPSHOT='sp_orders_v1'};
```

> **说明**：以上为 v3.0 之后版本的语法。v3.0 版本请使用以下语法：
>
> ```sql
> -- v3.0 语法
> -- RESTORE ACCOUNT sys DATABASE demo_branch TABLE orders FROM SNAPSHOT sp_orders_v1;
> ```

这就是快照的价值——让 "回退" 从高风险操作变成常规动作。

### 清理环境

```sql
DROP SNAPSHOT sp_orders_v1;
DROP DATABASE demo_branch;
```

## 进阶用法

### 数据库级分支

除了表级分支，你还可以对整个数据库创建分支，一次性复制所有表：

```sql
-- DATA BRANCH CREATE DATABASE dev_db FROM prod_db;

-- 在 dev_db 中自由修改，不影响 prod_db
-- 修改完成后合并回去
```

### 从快照创建分支

指定一个历史时间点创建分支，适合 "回到昨天的数据做分析"：

```sql
-- CREATE SNAPSHOT sp_yesterday FOR TABLE mydb mytable;
-- ... 时间过去，数据发生了变化 ...
-- DATA BRANCH CREATE TABLE mytable_analysis FROM mytable{SNAPSHOT='sp_yesterday'};
```

### 多级分支

分支可以继续创建分支，形成多级结构：

```sql
-- DATA BRANCH CREATE TABLE branch_v1 FROM main_table;
-- 在 branch_v1 上修改...
-- DATA BRANCH CREATE TABLE branch_v2 FROM branch_v1;
-- 在 branch_v2 上继续修改...
```

## 最佳实践

1. **先打快照再操作**：任何批量修改前，先 `CREATE SNAPSHOT`，给自己留退路
2. **表强烈建议有主键**：DIFF 和 MERGE 依赖主键定位行，虽然无主键表也支持（系统会使用内部隐藏主键），但有主键时结果更可控、冲突识别更精确
3. **合并前先 DIFF**：用 `DATA BRANCH DIFF ... OUTPUT COUNT` 了解变更规模，避免盲目合并
4. **统一命名规范**：分支表和快照建议带上用途和日期，如 `orders_risk_20260226`、`sp_orders_v1`
5. **及时清理分支**：用完的分支及时 `DATA BRANCH DELETE`，保持环境整洁
6. **冲突策略提前约定**：团队内约定好 FAIL/SKIP/ACCEPT 的使用规则，不要靠口头沟通

## 语法速查

| 操作 | 语法 |
|------|------|
| 创建表分支 | `DATA BRANCH CREATE TABLE new_table FROM source_table` |
| 创建库分支 | `DATA BRANCH CREATE DATABASE new_db FROM source_db` |
| 从快照创建 | `DATA BRANCH CREATE TABLE t FROM src{SNAPSHOT='sp_name'}` |
| 查看差异 | `DATA BRANCH DIFF target AGAINST base` |
| 差异计数 | `DATA BRANCH DIFF target AGAINST base OUTPUT COUNT` |
| 差异限制行数 | `DATA BRANCH DIFF target AGAINST base OUTPUT LIMIT 10` |
| 导出差异文件 | `DATA BRANCH DIFF target AGAINST base OUTPUT FILE '/path/'` |
| 合并（默认报错） | `DATA BRANCH MERGE source INTO dest` |
| 合并（跳过冲突） | `DATA BRANCH MERGE source INTO dest WHEN CONFLICT SKIP` |
| 合并（接受覆盖） | `DATA BRANCH MERGE source INTO dest WHEN CONFLICT ACCEPT` |
| 删除表分支 | `DATA BRANCH DELETE TABLE table_name` |
| 删除库分支 | `DATA BRANCH DELETE DATABASE db_name` |

## 参考文档

- [DATA BRANCH CREATE](../Reference/SQL-Reference/Data-Definition-Language/data-branch-create-cn.md)
- [DATA BRANCH DIFF](../Reference/SQL-Reference/Data-Definition-Language/data-branch-diff-cn.md)
- [DATA BRANCH MERGE](../Reference/SQL-Reference/Data-Definition-Language/data-branch-merge-cn.md)
- [DATA BRANCH DELETE](../Reference/SQL-Reference/Data-Definition-Language/data-branch-delete-cn.md)
- [CREATE SNAPSHOT](../Reference/SQL-Reference/Data-Definition-Language/create-snapshot.md)
- [RESTORE SNAPSHOT](../Reference/SQL-Reference/Data-Definition-Language/restore-snapshot.md)
