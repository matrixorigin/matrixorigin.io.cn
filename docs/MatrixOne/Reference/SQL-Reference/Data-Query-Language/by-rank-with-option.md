# BY RANK WITH OPTION

## 语法说明

`BY RANK WITH OPTION` 子句用于向量相似性搜索查询，以控制使用 IVF（倒排文件）索引时排名的执行方式。此子句允许你优化查询速度和结果准确性之间的权衡。

## 语法结构

<!-- validator-ignore -->
```sql
SELECT column_list
FROM table_name
ORDER BY distance_function(vector_column, query_vector) ASC
LIMIT k
BY RANK WITH OPTION 'mode = <mode>';
```

## 参数

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `mode` | string | 控制排名函数的应用时机。有效值：`pre`、`force`、`post` |

### 模式值

| 模式 | 描述 |
|------|-------------|
| `pre` | 预排名模式。在排名前使用 IVF 索引过滤候选项。速度最快但召回率可能较低。 |
| `force` | 强制模式。强制使用 IVF 索引并采用严格排名策略。 |
| `post` | 后排名模式。检索更多候选项后用精确距离重新排名。准确性更高但速度较慢。 |

## 示例

### 基本用法

```sql
-- 预排名模式实现最快查询
SELECT id, name, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
LIMIT 10
BY RANK WITH OPTION 'mode = pre';

-- 强制模式确保使用索引
SELECT id, name, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
LIMIT 10
BY RANK WITH OPTION 'mode = force';

-- 后排名模式实现最高准确性
SELECT id, name, l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') AS distance
FROM products
ORDER BY l2_distance(embedding, '[1.0, 2.0, 3.0, 4.0]') ASC
LIMIT 10
BY RANK WITH OPTION 'mode = post';
```

### 完整示例

```sql
-- 创建带向量列的表
CREATE TABLE documents (
    id BIGINT PRIMARY KEY,
    title VARCHAR(200),
    embedding VECF32(4)
);

-- 插入示例数据
INSERT INTO documents VALUES (1, 'Document A', '[0.1, 0.2, 0.3, 0.4]');
INSERT INTO documents VALUES (2, 'Document B', '[0.5, 0.6, 0.7, 0.8]');
INSERT INTO documents VALUES (3, 'Document C', '[0.2, 0.3, 0.4, 0.5]');

-- 创建 IVF 索引
CREATE INDEX idx_docs_embedding
USING IVFFLAT ON documents(embedding)
LISTS=2 OP_TYPE "vector_l2_ops";

-- 设置探测限制
SET @PROBE_LIMIT = 1;

-- 使用排名选项查询
SELECT id, title, l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') AS distance
FROM documents
ORDER BY l2_distance(embedding, '[0.1, 0.2, 0.3, 0.4]') ASC
LIMIT 3
BY RANK WITH OPTION 'mode = post';
```

## 限制

- 仅适用于 IVF 索引的向量列
- 目前仅支持 `l2_distance` 度量
- 模式选项必须指定为字符串字面量

## 相关语句

- [CREATE INDEX...USING IVFFLAT](../Data-Definition-Language/create-index-ivfflat.md)
- [L2_DISTANCE()](../../Functions-and-Operators/Vector/l2_distance.md)

有关详细使用示例和最佳实践，请参阅 [IVF 向量查询排名选项](../../../Develop/Vector/ivf_rank_options.md)。