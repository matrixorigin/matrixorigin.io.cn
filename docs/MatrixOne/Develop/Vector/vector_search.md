# 向量检索

## 什么是向量检索

向量检索就是在一个给定向量数据集中，按照某种度量方式，检索出与查询向量相近的 K 个向量（K-Nearest Neighbor，KNN）。这是一种在大规模高维向量数据中寻找与给定查询向量相似的向量的技术。向量检索在许多 AI 领域具有广泛的应用，如图像检索、文本检索、语音识别、推荐系统等。向量检索与传统数据库检索有很大差别，传统数据库上的标量搜索主要针对结构化数据进行精确的数据查询，而向量搜索主要针对非结构化数据向量化之后的向量数据进行相似检索，只能近似获得最匹配的结果。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/vector_vs_scalar.png width=60% heigth=60%/>
</div>

Matrixone 目前支持使用以下距离度量函数进行向量检索：

- 余弦相似度函数 [`cosine_similarity`](../../Reference/Functions-and-Operators/Vector/cosine_similarity.md)
- 余弦距离函数 [`cosine_distance`](../../Reference/Functions-and-Operators/Vector/cosine_distance.md)
- L2 距离函数 [`l2_distance`](../../Reference/Functions-and-Operators/Vector/l2_distance.md)

## 向量检索的应用场景

数据库拥有向量能力意味着数据库系统具备存储、查询和分析向量数据的能力。这些向量通常与复杂的数据分析、机器学习和数据挖掘任务相关。以下是数据库拥有向量处理能力后的部分应用场景：

- **生成式 AI 应用程序**：这些数据库可以作为生成式 AI 应用程序的后端，使它们能够根据用户提供的查询获取最近邻结果，提高输出质量和相关性。
- **高级对象识别**：它们对于开发识别不同数据集之间相似性的高级对象识别平台是无价的。这在抄袭检测、面部识别和 DNA 匹配等领域都有实际应用。
- **个性化推荐系统**：矢量数据库可以通过整合用户偏好和选择来增强推荐系统。这将带来更准确、更有针对性的推荐，从而改善用户体验和参与度。
- **异常检测**：向量数据库可以用来存储代表正常行为的特征向量。然后可以通过比较输入向量和存储向量来检测异常。这在网络安全和工业质量控制中很有用。
- **营销优化**：通过对用户数据的分析和挖掘，向量数据库能够实现个性化推荐、客户细分和市场趋势预测等功能，为企业提供精准的营销策略。
- **自然语言处理**：向量数据库可以处理大规模文本数据，实现语义相似性搜索、文本分类、文档聚类等自然语言处理任务，广泛应用于智能客服、舆情分析等领域。
- **语义搜索和检索**：在涉及大型语言模型的应用中，向量数据库可以存储和检索海量的文本向量，通过计算向量之间的相似度，实现智能的文本匹配和语义搜索。

## 示例

鸢尾花数据集是一个著名的多类分类数据集，可自行在网上搜索并下载。此数据集包含 150 个样本，分为 3 个类别：Iris Setosa（山鸢尾）、Iris Versicolour（变色鸢尾）和 Iris Virginica（维吉尼亚鸢尾）。每个样本有 4 个特征：花萼长度、花萼宽度、花瓣长度和花瓣宽度。下面我们在鸢尾花数据集上执行 KNN 查询（基于 l2_distance)，根据鸢尾花的特征找出与某个特定样本最相似的 K 个样本，从而确定该样本的种类。

### 步骤

1. 建立鸢尾花表并导入数据

    准备一个名为 `iris_table` 的表以及对应的鸢尾花数据集数据，数据集共有 150 行数据，每行由一个四维的特征向量和种类组成。

    ```sql
    CREATE TABLE iris_table(
        species varchar(100),--类别
        attributes vecf64(4)--特征
        );
    LOAD DATA INFILE '/your_path/iris.csv' INTO TABLE iris_table;
    ```

2. 使用 KNN 来预测这个输入特征的类别

    ```sql
    mysql>  select * from iris_table order by l2_distance(attributes,"[4,3.3,3,0.9]") asc limit 1;
    +------------------+--------------------+
    | species          | attributes         |
    +------------------+--------------------+
    | Iris-versicolour | [4.9, 2.4, 3.3, 1] |
    +------------------+--------------------+
    1 row in set (0.00 sec)

    mysql>  select * from iris_table order by l2_distance(attributes,"[4,3.3,3,0.9]") asc limit 5;
    +------------------+----------------------+
    | species          | attributes           |
    +------------------+----------------------+
    | Iris-versicolour | [4.9, 2.4, 3.3, 1]   |
    | Iris-versicolour | [5.1, 2.5, 3, 1.1]   |
    | Iris-versicolour | [5, 2.3, 3.3, 1]     |
    | Iris-setosa      | [4.8, 3.4, 1.9, 0.2] |
    | Iris-versicolour | [5.2, 2.7, 3.9, 1.4] |
    +------------------+----------------------+
    5 rows in set (0.00 sec)
    ```

经过检索，我们可以大致确定该样本类型为变色鸢尾。

## 参考文档

[向量数据类型](../../Reference/Data-Types/vector-type.md)

[L2_DISTANCE()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)
