# RAG 应用基础示例

## 什么是 RAG?

RAG，全称为 Retrieval-Augmented Generation（检索增强生成），是一种结合了信息检索和文本生成的技术，用于提高大型语言模型（LLM）生成文本的准确性和相关性。LLM 由于其训练数据的局限性，可能无法获取最新的信息。

例如我向 GPT 询问 MatrixOne 的最新版本时，它并不能给出答案。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/Vector/rag-1.png width=80% heigth=80%/>
</div>

此外，这些模型有时也可能产生误导性的信息，生成与事实不符的内容。例如当我询问鲁迅和周树人的关系时，GPT 开始了一本正经地胡说八道。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/Vector/rag-2.png width=80% heigth=80%/>
</div>

要解决上述问题，我们可以把 LLM 模型重新再训练一遍，但成本是高昂的。而 RAG 的主要优势在于可以避免针对特定任务再次进行训练，其高可用性和低门槛使之成为 LLM 系统中最受欢迎的方案之一，许多 LLM 应用都会基于 RAG 构建。RAG 的核心思想是让模型在生成回答时，不仅依赖于其在训练阶段学到的知识，还能利用外部的、最新的、专有的信息源，因此用户可以根据实际情况额外附加外部知识库，丰富输入，从而优化模型的输出效果。

RAG 的工作流程通常包括以下几个步骤：

- 检索（Retrieve）：从大型数据集或知识库中查找并提取与当前查询最相关的信息。
- 增强（Augment）：将检索到的信息或数据集与 LLM 结合，以增强 LLM 的性能和输出的准确性。
- 生成（Generate）：使用检索到的信息利用 LLM 来生成新的文本或响应。

以下为 Native RAG 的流程图：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/Vector/rag-3.png width=80% heigth=80%/>
</div>

可以看到，检索环节在 RAG 架构中扮演着至关重要的角色，MatrixOne 具有向量检索的能力，这为构建 RAG 应用提供了强大的数据检索支持。

## Matrixone 在 RAG 中的作用

Matrxione 作为超融合数据库，自带向量能力，这在 RAG 应用中起着重要的作用，主要体现在以下几个方面：

- 高效的信息检索：Matrxione 拥有向量数据类型，专门用于处理和存储高维向量数据，它通过特殊的数据结构和索引策略，如 KNN 查询，来快速找到与查询向量最相似的数据项。

- 支持大规模数据处理：Matrxione 能够有效管理和处理大规模的向量数据，这对于 RAG 系统的检索组件来说是核心功能，它使得 RAG 系统能够快速从海量数据中检索出与用户查询最相关的信息。

- 提高生成质量：通过 Matrxione 向量能力的检索功能，RAG 技术能够引入外部知识库中的信息，生成更加准确、丰富和具有上下文的文本，从而提升生成文本的质量。

- 安全性和隐私保护：Matrxione 还可以通过加密存储和访问控制等数据安全措施来保护数据，这对于处理敏感数据的 RAG 应用尤其重要。

- 简化开发流程：使用 Matrxione 可以简化 RAG 应用的开发流程，因为它提供了存储和检索向量化数据的高效机制，从而减少了开发者在数据管理方面的工作负担。

本文基于 Ollama，结合 Llama2 和 Mxbai-embed-large，利用 Matrixone 的向量能力快速构建一个 Native RAG 应用。

## 开始前准备

### 相关知识

**Ollama**: Ollama 是一个开源的大型语言模型服务工具，它允许用户在自己的硬件环境中轻松部署和使用大规模预训练模型。Ollama 的主要功能是在 Docker 容器内部署和管理大型语言模型（LLM），使用户能够快速地在本地运行这些模型。Ollama 简化了部署过程，通过简单的安装指令，用户可以执行一条命令就在本地运行开源大型语言模型。

**Llama2**：llama2 是一个开源的语言大模型，可以理解和生成长文本，该模型可用于研究和商业用途。

**Mxbai-embed-large**：mxbai-embed-large 是一个开源的嵌入模型，专为文本嵌入和检索任务设计，模型生成的嵌入向量大小为 1024。

### 软件安装

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。

- 确认你已完成安装 [Python 3.8(or plus) version](https://www.python.org/downloads/)。使用下面的代码检查 Python 版本确认安装成功：

```
python3 -V
```

- 确认你已完成安装 MySQL 客户端。

- 下载安装 `pymysql` 工具。使用下面的代码下载安装 `pymysql` 工具：

```
pip3 install pymysql
```

- 确认你已完成安装 [ollama](https://ollama.com/download)。使用下面的代码检查 ollama 版本确认安装成功：

```
ollama -v  
```

- 下载 LLM 模型 `llama2` 和 embedding 模型 `mxbai-embed-large`：

```
ollama pull llama2
ollama pull mxbai-embed-large
```

## 构建应用

### 建表

连接 MatrixOne，建立一个名为 `rag_tab` 的表来存储文本信息和对应的向量信息。

```sql
create table rag_tab(content text,embedding vecf32(1024));
```

### 文本向量化存储到 MatrixOne

创建 python 文件 rag_example.py，利用 mxbai-embed-large 嵌入模型将文本信息切分和向量化，然后存到 MatrixOne 的 `rag_tab` 表中。

```python
import ollama
import pymysql.cursors

conn = pymysql.connect(
        host='127.0.0.1',
        port=6001,
        user='root',
        password = "111",
        db='db1',
        autocommit=True
        )
cursor = conn.cursor()

#生成 embeddings
documents = [
"MatrixOne is a hyper-converged cloud & edge native distributed database with a structure that separates storage, computation, and transactions to form a consolidated HSTAP data engine. This engine enables a single database system to accommodate diverse business loads such as OLTP, OLAP, and stream computing. It also supports deployment and utilization across public, private, and edge clouds, ensuring compatibility with diverse infrastructures.",
"MatrixOne touts significant features, including real-time HTAP, multi-tenancy, stream computation, extreme scalability, cost-effectiveness, enterprise-grade availability, and extensive MySQL compatibility. MatrixOne unifies tasks traditionally performed by multiple databases into one system by offering a comprehensive ultra-hybrid data solution. This consolidation simplifies development and operations, minimizes data fragmentation, and boosts development agility.",
"MatrixOne is optimally suited for scenarios requiring real-time data input, large data scales, frequent load fluctuations, and a mix of procedural and analytical business operations. It caters to use cases such as mobile internet apps, IoT data applications, real-time data warehouses, SaaS platforms, and more.",
"Matrix is a collection of complex or real numbers arranged in a rectangular array.",
"The lastest version of MatrixOne is 3.0.0, releases on 2025/08/26.",
"We are excited to announce MatrixOne 0.8.0 release on 2023/6/30."
]

for i,d in enumerate(documents):
  response = ollama.embeddings(model="mxbai-embed-large", prompt=d)
  embedding = response["embedding"]
  insert_sql = "insert into rag_tab(content,embedding) values (%s, %s)"
  data_to_insert = (d, str(embedding))
  cursor.execute(insert_sql, data_to_insert)
```

### 查看 `rag_tab` 表中数量

```sql
mysql> select count(*) from rag_tab;
+----------+
| count(*) |
+----------+
|        6 |
+----------+
1 row in set (0.00 sec)
```

可以看到，数据成功存储到数据库中。

- 索引建立（非必需）

在大规模高维数据检索时，如果采用全量搜索，需要对每个查询都执行与整个数据集中每个向量的相似度计算，这会导致巨大的性能开销和延迟。而使用向量索引可以有效地解决上述问题，通过建立高效的数据结构和算法来优化搜索过程，提高检索性能，降低计算和存储成本，同时提升用户体验。因此，我们为向量字段建立 IVF-FLAT 向量索引

```sql
SET GLOBAL experimental_ivf_index = 1;--开启向量索引
create index idx_rag using ivfflat on rag_tab(embedding)  lists=1 op_type "vector_l2_ops";
```

### 向量检索

数据准备好以后就可以根据我们提出的问题在数据库搜索最相似的内容，这一步主要依赖 MatrixOne 的向量检索能力，MatrixOne 支持多种相似度搜索，在这里我们使用 `l2_distance` 来检索，并设置返回结果数量为 3。

```python
prompt = "What is the latest version of MatrixOne?"

response = ollama.embeddings(
  prompt=prompt,
  model="mxbai-embed-large"
)
query_embedding= response["embedding"]
query_sql = "select content from rag_tab order by l2_distance(embedding,%s) asc limit 3"
data_to_query = str(query_embedding)
cursor.execute(query_sql, data_to_query)
data = cursor.fetchall()
```

### 增强生成

我们将上一步检索到的内容与 LLM 结合，生成答案。

```python
#增强生成
output = ollama.generate(
  model="llama2",
  prompt=f"Using this data: {data}. Respond to this prompt: {prompt}"
)

print(output['response'])
```

控制台输出相关回答：

```
Based on the provided data, the latest version of MatrixOne is 3.0.0, which was released on 2025/08/26.
```

在增强后，模型生成了正确答案。

## 参考文档

- [向量类型](../Develop/Vector/vector_type.md)
- [向量检索](../Develop/Vector/vector_search.md)
- [CREATE INDEX...USING IVFFLAT](../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
- [L2_DISTANCE()](../Reference/Functions-and-Operators/Vector/l2_distance.md)