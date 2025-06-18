# CREATE INDEX USING HNSW

## 语法说明

MatrixOne 在向量检索功能中支持使用 HNSW（Hierarchical Navigable Small World）算法来加速高维向量的相似度搜索。

## 语法结构

```
> CREATE INDEX index_name
USING HNSW
ON tbl_name (col,...)
OP_TYPE "vector_l2_ops"
[M <n>]
[EF_CONSTRUCTION <n>]  
[EF_SEARCH <n>] ;
```

### 语法释义

- `index_name`：索引名称
- `HNSW`：向量索引类型
- `OP_TYPE`：要使用的距离度量，目前支持 vector_l2_ops
- M：默认值为 16，控制 HNSW 图中每个节点连接的最大邻居数，默认是 16。值越大，索引质量越好但构建时间和存储开销越大。
- EF_CONSTRUCTION - 默认值为 128，构建索引时的扩展因子，控制构图时的探索宽度。默认是 128。
- EF_SEARCH - 默认值为 64，查询时的扩展因子，控制搜索过程中访问的候选节点数量。

## 示例

```sql
--需设置参数 experimental_ivf_index 值为 1（默认 0）才能使用向量索引
SET GLOBAL experimental_hnsw_index = 1;
drop table if exists t1;

create table vector_index_02(a bigint primary key, b vecf32(3),c int);
insert into vector_index_02 values(1 ,"[1, 0, 1]",3);
create index idx01 using hnsw on vector_index_02(b) op_type "vector_l2_ops" M 48 EF_CONSTRUCTION 64 EF_SEARCH 64;
mysql> show create table vector_index_02;
+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table           | Create Table                                                                                                                                                                                                                               |
+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| vector_index_02 | CREATE TABLE `vector_index_02` (
  `a` bigint NOT NULL,
  `b` vecf32(3) DEFAULT NULL,
  `c` int DEFAULT NULL,
  PRIMARY KEY (`a`),
  KEY `idx01` USING hnsw (`b`) m = 48  ef_construction = 64  ef_search = 64  op_type 'vector_l2_ops' 
) |
+-----------------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
mysql> desc vector_index_02;
+-------+------------+------+------+---------+-------+---------+
| Field | Type       | Null | Key  | Default | Extra | Comment |
+-------+------------+------+------+---------+-------+---------+
| a     | BIGINT(64) | NO   | PRI  | NULL    |       |         |
| b     | VECF32(3)  | YES  | MUL  | NULL    |       |         |
| c     | INT(32)    | YES  |      | NULL    |       |         |
+-------+------------+------+------+---------+-------+---------+
3 rows in set (0.03 sec)
```

## 限制

- 需要将 bigint 主键作为主键  
- 仅支持 vecf32 向量类型，不支持 vecf64 向量类型