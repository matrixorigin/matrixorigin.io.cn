# RAG 应用基础示例

## 什么是 RAG?

RAG，全称为 Retrieval-Augmented Generation（检索增强生成），是一种结合了信息检索和文本生成的技术，用于提高大型语言模型（LLM）生成文本的准确性和相关性。LLM 由于其训练数据的局限性，可能无法获取最新的信息，例如在模型训练完成后发生的新闻事件。此外，这些模型有时也可能产生误导性的信息，生成与事实不符的内容。RAG 的核心思想是让模型在生成回答时，不仅依赖于其在训练阶段学到的知识，还能利用外部的、最新的、专有的信息源。

RAG 的工作流程通常包括以下几个步骤：

- 检索（Retrieve）：根据用户的查询，从外部知识源（如数据库、知识库）检索相关的上下文信息。
- 增强（Augment）：将检索到的信息与用户查询结合起来，形成一个新的提示（prompt），这个提示将包含问题的上下文。
- 生成（Generate）：将这个增强后的提示输入到大型语言模型中，生成最终的回答。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/Vector/rag.png width=80% heigth=80%/>
</div>

## Matrixone 在 RAG 中的作用

Matrxione 作为超融合数据库，自带向量能力，这在 RAG 应用中起着重要的作用，主要体现在以下几个方面：

- 高效的信息检索：Matrxione 拥有向量数据类型，专门用于处理和存储高维向量数据，它通过特殊的数据结构和索引策略，如 KNN 查询，来快速找到与查询向量最相似的数据项。

- 支持大规模数据处理：Matrxione 能够有效管理和处理大规模的向量数据，这对于 RAG 系统的检索组件来说是核心功能，它使得 RAG 系统能够快速从海量数据中检索出与用户查询最相关的信息。

- 提高生成质量：通过 Matrxione 向量能力的检索功能，RAG 技术能够引入外部知识库中的信息，生成更加准确、丰富和具有上下文的文本，从而提升生成文本的质量。

- 安全性和隐私保护：Matrxione 还可以通过加密存储和访问控制等数据安全措施来保护数据，这对于处理敏感数据的 RAG 应用尤其重要。

- 简化开发流程：使用 Matrxione 可以简化 RAG 应用的开发流程，因为它提供了存储和检索向量化数据的高效机制，从而减少了开发者在数据管理方面的工作负担。

本文基于 Ollama，结合 Llama2 和 Mxbai-embed-large，利用 Matrixone 的向量能力快速构建一个 RAG 应用。

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

### 编写应用代码

创建文件 `rag_example.py`，输入以下代码：

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

cursor.execute("drop table if exists rag_tab")
cursor.execute("create table rag_tab(content text,embedding vecf64(1024))")

#生成 embeddings
documents = [
"MatrixOne is a hyper-converged cloud & edge native distributed database with a structure that separates storage, computation, and transactions to form a consolidated HSTAP data engine. This engine enables a single database system to accommodate diverse business loads such as OLTP, OLAP, and stream computing. It also supports deployment and utilization across public, private, and edge clouds, ensuring compatibility with diverse infrastructures.",
"MatrixOne touts significant features, including real-time HTAP, multi-tenancy, stream computation, extreme scalability, cost-effectiveness, enterprise-grade availability, and extensive MySQL compatibility. MatrixOne unifies tasks traditionally performed by multiple databases into one system by offering a comprehensive ultra-hybrid data solution. This consolidation simplifies development and operations, minimizes data fragmentation, and boosts development agility.",
"MatrixOne is optimally suited for scenarios requiring real-time data input, large data scales, frequent load fluctuations, and a mix of procedural and analytical business operations. It caters to use cases such as mobile internet apps, IoT data applications, real-time data warehouses, SaaS platforms, and more.",
"Matrix is a collection of complex or real numbers arranged in a rectangular array.",
]

for i,d in enumerate(documents):
  response = ollama.embeddings(model="mxbai-embed-large", prompt=d)
  embedding = response["embedding"]
  insert_sql = "insert into rag_tab(content,embedding) values (%s, %s)"
  data_to_insert = (d, str(embedding))
  cursor.execute(insert_sql, data_to_insert)

#检索
prompt = "What is MatrixOne?"

response = ollama.embeddings(
  prompt=prompt,
  model="mxbai-embed-large"
)
query_embedding= embedding = response["embedding"]

query_sql = "select content from rag_tab order by l2_distance(embedding,%s) asc limit 3"
data_to_query = str(query_embedding)
cursor.execute(query_sql, data_to_query)
data = cursor.fetchall()

#增强生成
output = ollama.generate(
  model="llama2",
  prompt=f"Using this data: {data}. Respond to this prompt: {prompt}"
)

print(output['response'])
```

### 运行应用

在终端输入以下命令运行应用：

```
python3 rag_example.py
```

### 查看运行结果

控制台输出相关回答：

```
Based on the provided data, MatrixOne appears to be a unified data solution that offers several significant features and benefits. Here are some key points about MatrixOne:

1. Real-time HTAP (Hybrid Transactional and Analytical Processing): MatrixOne provides real-time data processing capabilities for both transactional and analytical workloads, making it an ideal choice for applications that require immediate data insights.
2. Multi-tenancy: MatrixOne supports multi-tenancy, allowing multiple users to access the same database simultaneously without compromising performance or data security.
3. Stream computation: MatrixOne enables stream computing, which enables real-time data processing and analysis of large datasets.
4. Extreme scalability: MatrixOne is designed to handle large datasets and can scale horizontally by adding more nodes to the cluster, making it an ideal choice for applications that require high levels of performance and scalability.
5. Cost-effectiveness: MatrixOne offers a cost-effective solution compared to traditional database systems, as it eliminates the need for multiple databases and reduces operational complexity.
6. Enterprise-grade availability: MatrixOne provides an enterprise-grade availability guarantee, ensuring that data is always available when needed.
7. MySQL compatibility: MatrixOne supports extensive MySQL compatibility, making it easier to migrate existing applications or integrate with new ones.
8. Hyper-converged architecture: MatrixOne features a hyper-converged architecture that separates storage, computation, and transactions into a consolidated HSTAP data engine. This allows for efficient data processing and minimizes data fragmentation.
9. Cloud and edge compatibility: MatrixOne supports deployment and utilization across public, private, and edge clouds, ensuring compatibility with diverse infrastructures.

In summary, MatrixOne is a unified data solution that offers real-time data processing capabilities, multi-tenancy, stream computation, extreme scalability, cost-effectiveness, enterprise-grade availability, and MySQL compatibility. Its hyper-converged architecture and cloud and edge compatibility make it a versatile choice for various applications such as mobile internet apps, IoT data applications, real-time data warehouses, SaaS platforms, and more.

```