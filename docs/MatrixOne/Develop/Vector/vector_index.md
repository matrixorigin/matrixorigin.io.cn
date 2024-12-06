# 向量索引

向量索引是一种用于在高维向量空间中快速查找和检索数据的技术，通常用于处理大规模的向量数据集。向量索引的核心目的是在大量向量中高效地找到与查询向量相似的向量，常用于应用场景如图像检索、推荐系统、自然语言处理等。向量索引在现代信息检索和数据分析中至关重要，尤其在需要处理高维向量数据的情况下，它能够极大地提高系统的性能和响应速度。

Matrixone 目前支持 L2_distance 的 IVF_FLAT 向量索引。

## 什么是 IVF_FLAT

IVF_FLAT（Inverted File with Flat）是一种常用的向量索引技术，用于在大规模向量数据中进行高效的相似性搜索。它结合了倒排索引（Inverted File Index）和“Flat”向量存储的方式，可以加速向量搜索，是处理大规模向量数据的有效方法。

### 主要原理

**倒排索引**：

   - IVF_FLAT 首先将向量数据通过一种称为“粗量量化器”（coarse quantizer）的过程，分成若干个簇（clusters）。
   - 每个簇都有一个中心（centroid），查询时，首先根据查询向量找到距离最近的几个簇中心，这些簇中存储着可能包含最接近查询向量的向量数据。

**Flat 检索**：

   - 在确定了最可能包含目标的簇后，IVF_FLAT 在这些簇内进行逐一比较（即 "Flat" 搜索），以找到与查询向量最相似的向量。
   - 这种方法减少了需要进行全量比较的向量数量，从而提高了检索效率。

### 主要特点

- **高效**：通过将大规模数据分成多个簇，并只在最相关的簇内进行详细搜索，IVF_FLAT 大大减少了需要计算的距离比较次数，提升了搜索速度。
- **近似搜索**：IVF_FLAT 是一种近似算法，虽然可能不会找到精确的最近邻，但在实际应用中通常可以提供足够高的精度。
- **可扩展性**：IVF_FLAT 可以很好地扩展到处理数百万甚至上亿条向量数据的场景。

### 应用场景

IVF_FLAT 广泛应用于图像检索、推荐系统、文本检索、生物信息学等需要快速相似性搜索的大规模数据处理任务中。通过将大规模数据分片和分簇，它能够有效地应对大数据量下的高效检索需求。

## 示例

下面我们将给出一个例子，通过 Python 脚本随机生成 200 万条 128 维向量数据，并对比创建向量索引前后，向量检索的时间差异。

### 步骤一：建立数据表

准备一个名为 `vec_table` 的表，用来存储向量数据。

```sql
create table vec_table(
    n1 int primary key auto_increment,
    vec vecf32(128)
    );
```

### 步骤二：开启向量索引的选项

在数据库中用以下 SQL 开启向量索引，重连数据库生效。

```sql
SET GLOBAL experimental_ivf_index = 1;
```

### 步骤三：构建 python 脚本

建立一个名为 `vec_test.py` 的 python 文件，定义了向量数据插入函数、向量检索函数和创建向量索引的函数，然后计算在创建索引前后进行向量检索所花费的时间。

```python
import numpy as np
import pymysql.cursors
import time

conn = pymysql.connect(
        host='127.0.0.1',
        port=6001,
        user='root',
        password = "111",
        db='vec',
        autocommit=False
        )
cursor = conn.cursor()

#定义插入数据函数，参数为向量维度、数量、单次提交条数
def insert_data(vector_dim,num_vectors,batch_size):
    vectors = np.random.rand(num_vectors, vector_dim)
    batch_data = []
    count = 0
    for vector in vectors:
        formatted_vector = '[' + ','.join(f"{x}" for x in vector) + ']'
        batch_data.append((formatted_vector,))
        count += 1

        if count % batch_size == 0:
            insert_sql = "INSERT INTO vec_table(vec) VALUES (%s)"
            cursor.executemany(insert_sql, batch_data)
            conn.commit()
            batch_data.clear()

    # 如果还有未提交的数据，进行最终提交
    if batch_data:
        cursor.executemany("INSERT INTO vec_table(vec) VALUES (%s)", batch_data)
        conn.commit()

#定义检索函数，参数为向量维度，检索返回的条数
def vec_search(vector_dim,topk):
    vector = np.random.rand(vector_dim)
    formatted_vector = '[' + ','.join(f"{x}" for x in vector) + ']'
    search_sql="select * from vec_table order by l2_distance(vec,%s) asc limit %s;"
    data_to_search=(formatted_vector,topk)
    start_time = time.time()
    cursor.execute(search_sql, data_to_search)
    end_time = time.time()
    execution_time = end_time - start_time
    print(f" {execution_time:.6f} 秒")

def vec_indx(n):
    index_sql = 'create index idx_vec using ivfflat on vec_table(vec) lists=%s op_type "vector_l2_ops"'
    cursor.execute(index_sql, n)

if __name__ == "__main__":
    insert_data(128, 2000000, 10000)
    print("未创建向量索引 SQL 执行时间：")
    vec_search(128,3)
    print("创建向量索引中......")
    vec_indx(1000)
    print("已创建向量索引 SQL 执行时间：")
    vec_search(128,3)
    cursor.close()
    conn.close()
```

### 步骤四：运行脚本

```bash
python vec_test.py  
```

控制台输出结果如下：

```
未创建向量索引 SQL 执行时间：
0.780407 秒
创建向量中......
已创建向量索引 SQL 执行时间：
0.015610 秒
```

可以看到，在创建索引后，向量检索的执行时间明显缩短。

## 参考文档

[向量数据类型](../../Reference/Data-Types/vector-type.md)
[向量索引](../../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
[L2_DISTANCE()](../../Reference/Functions-and-Operators/Vector/l2_distance.md)
