# IVF 向量查询排名选项

## 概述

在使用 IVF（倒排文件）索引进行向量相似性搜索时，MatrixOne 提供了 `BY RANK WITH OPTION` 子句来控制查询执行过程中排名函数的应用方式。此功能允许你根据具体使用场景优化查询性能和准确性。

## 语法

<!-- validator-ignore -->
```sql
SELECT column_list
FROM table_name
ORDER BY distance_function(vector_column, query_vector) ASC
LIMIT k
BY RANK WITH OPTION 'mode = <mode>';
```

### 参数

| 参数 | 描述 |
|-----------|-------------|
| `mode` | 控制排名函数的应用时机。有效值：`pre`、`force`、`post` |

## 模式选项

### `mode = pre`（预排名模式）

在预排名模式下，IVF 索引用于在应用排名函数**之前**过滤候选向量。此模式：

- **行为**：首先使用 IVF 索引选择候选质心，然后在这些候选中应用排名
- **性能**：执行速度最快，因为排名仅应用于数据子集
- **准确性**：如果相关结果位于未被探测限制选中的质心中，可能会遗漏

**使用场景**：高吞吐量场景，查询速度优先于完美召回率。

```sql
-- 示例：预排名模式
SELECT id, content, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
LIMIT 10
BY RANK WITH OPTION 'mode = pre';
```

### `mode = force`（强制模式）

在强制模式下，系统**强制**使用 IVF 索引进行排名，无论查询优化器的默认决策如何。此模式：

- **行为**：明确强制使用索引并应用严格的排名策略
- **性能**：针对确定索引使用有益的场景进行了优化
- **准确性**：基于探测限制设置，在速度和准确性之间取得平衡

**使用场景**：当你知道 IVF 索引非常适合你的查询模式并希望确保使用它时。

```sql
-- 示例：强制模式
SELECT id, content, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
LIMIT 10
BY RANK WITH OPTION 'mode = force';
```

### `mode = post`（后排名模式）

在后排名模式下，排名函数在 IVF 索引检索出扩展的候选集**之后**应用。此模式：

- **行为**：从 IVF 索引检索更多候选项，然后使用精确距离计算对它们重新排名
- **性能**：比预排名慢，但比全表扫描快
- **准确性**：更高的准确性，因为最终排名基于精确距离计算

**使用场景**：需要高召回率且精确排名很重要的场景。

```sql
-- 示例：后排名模式
SELECT id, content, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
LIMIT 10
BY RANK WITH OPTION 'mode = post';
```

## 模式比较

| 模式 | 索引使用 | 排名策略 | 速度 | 准确性 | 适用场景 |
|------|-------------|-----------------|-------|----------|----------|
| `pre` | 先使用 IVF 过滤 | 在 IVF 候选中排名 | ⚡ 最快 | 较低 | 高吞吐量、对延迟敏感 |
| `force` | 强制使用 IVF 索引 | 严格基于索引排名 | 🚀 快 | 中等 | 可预测的索引使用 |
| `post` | 使用 IVF 获取候选 | 用精确距离重新排名 | 🐢 较慢 | ⭐ 最高 | 高召回率需求 |

## 完整示例

### 设置

```sql
-- 创建带向量列的表
CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200),
    embedding VECF32(4)
);

-- 插入示例数据
INSERT INTO products VALUES (1, 'Product A', '[0.1, 0.2, 0.3, 0.4]');
INSERT INTO products VALUES (2, 'Product B', '[0.5, 0.6, 0.7, 0.8]');
INSERT INTO products VALUES (3, 'Product C', '[0.2, 0.3, 0.4, 0.5]');
INSERT INTO products VALUES (4, 'Product D', '[0.9, 0.8, 0.7, 0.6]');
INSERT INTO products VALUES (5, 'Product E', '[0.3, 0.4, 0.5, 0.6]');

-- 创建 IVF 索引
CREATE INDEX idx_products_embedding
USING IVFFLAT ON products(embedding)
LISTS=2 OP_TYPE "vector_l2_ops";

-- 设置查询的探测限制
SET @PROBE_LIMIT = 1;
```

### 查询示例

```sql
-- 快速近似搜索（预排名）
SELECT id, name, l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') ASC
LIMIT 3
BY RANK WITH OPTION 'mode = pre';

-- 保证使用索引（强制模式）
SELECT id, name, l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') ASC
LIMIT 3
BY RANK WITH OPTION 'mode = force';

-- 高准确度搜索（后排名）
SELECT id, name, l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') ASC
LIMIT 3
BY RANK WITH OPTION 'mode = post';
```

## 最佳实践

### 选择合适的模式

1. **实时应用**（如边输边搜）：使用 `mode = pre`
2. **批量处理**且准确性重要：使用 `mode = post`
3. **查询优化器决策不优时**：使用 `mode = force`

### 结合探测限制使用

`@PROBE_LIMIT` 变量控制扫描多少个质心。将其与排名选项结合使用以获得最佳结果：

```sql
-- 高准确度配置
SET @PROBE_LIMIT = 10;

SELECT id, name, l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') ASC
LIMIT 5
BY RANK WITH OPTION 'mode = post';
```

```sql
-- 高速度配置
SET @PROBE_LIMIT = 1;

SELECT id, name, l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') ASC
LIMIT 5
BY RANK WITH OPTION 'mode = pre';
```

### 性能调优

- **大多数用例从 `mode = pre` 开始**
- **监控召回率**，如果准确性不足则切换到 `mode = post`
- **当观察到查询优化器未使用索引时**，使用 `mode = force`

## 限制

- `BY RANK WITH OPTION` 仅适用于 IVF 索引的向量列
- 目前仅支持 `l2_distance` 度量
- 模式选项必须指定为字符串字面量

## 相关文档

- [创建 IVF 索引](../../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
- [向量检索](./vector_search.md)
- [向量数据类型](../../Reference/Data-Types/vector-type.md)
- [L2_DISTANCE()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)
