# 以图（文）搜图应用基础示例

当下，以图搜图和以文搜图的相关应用涵盖了广泛的领域，在电子商务中，用户可以通过上传图片或文本描述来搜索商品；在社交媒体平台，通过图像或文本快速找到相关内容，增强用户的体验；而在版权检测方面，则可以帮助识别和保护图像版权；此外，以文搜图还广泛应用于搜索引擎，帮助用户通过关键词找到特定图像，而以图搜图则在机器学习和人工智能领域中用于图像识别和分类任务。

以下为以图（文）搜图的流程图：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/Vector/search-image.png width=80% heigth=80%/>
</div>

可以看到，在构建以图（文）搜图应用中，涉及到对图片的向量化存储和检索，而 MatrixOne 具备向量能力，且提供多种检索方式，这为构建以图（文）搜图应用提供了关键的技术支持。

在本章节，我们将基于 MatrixOne 的向量能力来构建一个简单的以图（文）搜图的应用。

## 开始前准备

### 相关知识

**Transformers**：Transformers 是一个开源的自然语言处理库，提供了广泛的预训练模型，通过 Transformers 库，研究人员和开发者可以轻松地使用和集成 CLIP 模型到他们的项目中。

**CLIP**: CLIP 模型是由 OpenAI 发布的一种深度学习模型，核心是通过对比学习的方法来统一处理文本和图像，从而能够通过文本 - 图像相似度来完成图像分类等任务，而无需直接优化任务。它可以结合向量数据库，来构建以图（文）搜图的工具。通过 CLIP 模型提取图像的高维向量表示，以捕获其语义和感知特征，然后将这些图像编码到嵌入空间中。在查询时，样本图像通过相同的 CLIP 编码器来获取其嵌入，执行向量相似性搜索以有效地找到前 k 个最接近的数据库图像向量。

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
pip install pymysql
```

- 下载安装 `transformers` 库。使用下面的代码下载安装 `transformers` 库：

```
pip install transformers
```

- 下载安装 `Pillow` 库。使用下面的代码下载安装 `Pillow` 库：

```
pip install pillow 
```

## 构建应用

### 建表

连接 MatrixOne，建立一个名为 `pic_tab` 的表来存储图片路径信息和对应的向量信息。

```sql
create table pic_tab(pic_path varchar(200), embedding vecf64(512));
```

### 加载模型

```python
from transformers import CLIPProcessor, CLIPModel

# 从 HuggingFace 加载模型
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
```

### 遍历图片路径

定义方法 `find_img_files` 遍历本地图片文件夹，这里我预先在本地存了苹果、香蕉、蓝莓、樱桃、杏子五种类别的水果图片，每种类别若干张，格式都为 `.jpg`。

```python
def find_img_files(directory):
    img_files = []  # 用于存储找到的.jpg 文件路径
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith('.jpg'):
                full_path = os.path.join(root, file)
                img_files.append(full_path) # 构建完整的文件路径
    return img_files
```

- 图像向量化并存入 MatrixOne

定义方法 `storage_img` 将图片映射成向量，进行归一化（非必需）并存储到 MatrixOne 里。MatrixOne 支持使用 `NORMALIZE_L2()` 函数对向量执行 L2 归一化，在某些情况下，数据的特征可能分布在不同的尺度上，这可能会导致某些特征对距离计算有不成比例的影响。通过归一化，可以减少这种影响，使不同特征对最终结果的贡献更加均衡。而在使用 L2 distance 度量时，L2 归一化可以避免不同长度的向量影响距离计算。

```python
import pymysql
from PIL import Image

conn = pymysql.connect(
        host = '127.0.0.1',
        port = 6001,
        user = 'root',
        password = "111",
        db = 'db1',
        autocommit = True
        )

cursor = conn.cursor()

# 把图像映射成向量，存储在 MatrixOne 中
def storage_img():
 for file_path in jpg_files:
     image = Image.open(file_path)
     if image.mode != 'RGBA':
         image = image.convert('RGBA')
     inputs = processor(images=image, return_tensors="pt", padding=True)
     img_features = model.get_image_features(inputs["pixel_values"]) # 使用模型获取图像特征
     img_features = img_features .detach().tolist() # 分离张量，转换为列表
     embeddings = img_features [0]
     insert_sql = "insert into pic_tab(pic_path,embedding) values (%s, normalize_l2(%s))"
     data_to_insert = (file_path, str(embeddings))
     cursor.execute(insert_sql, data_to_insert)
     image.close()
```

### 查看 `pic_tab` 表中数量

```sql
mysql> select count(*) from pic_tab;
+----------+
| count(*) |
+----------+
|     4801 |
+----------+
1 row in set (0.00 sec)
```

可以看到，数据成功存储到数据库中。

### 建立向量索引

MatrixOne 支持在 IVF-FLAT 向量索引，在没有索引的情况下，每次搜索都需要重新计算查询图像与数据库中每张图像之间的相似度。而索引可以减少必要的计算量，只对索引中标记为“相关”的图像进行相似度计算。

```python
def create_idx(n):
    cursor.execute('SET GLOBAL experimental_ivf_index = 1')
    create_sql = 'create index idx_pic using ivfflat on pic_tab(embedding) lists=%s op_type "vector_l2_ops"'
    cursor.execute(create_sql, n)
```

### 以图（文）搜图

接着，我们定义方法 `img_search_img` 和 `text_search_img` 实现以图搜图和以文搜图，MatrixOne 具有向量检索能力，支持多种相似度搜索，在这里我们使用 `l2_distance` 来检索。

```python
# 以图搜图
def img_search_img(img_path, k):
    image = Image.open(img_path)
    inputs = processor(images=image, return_tensors="pt")
    img_features = model.get_image_features(**inputs)
    img_features = img_features.detach().tolist()
    img_features = img_features[0]
    query_sql = "select pic_path from pic_tab order by l2_distance(embedding,normalize_l2(%s)) asc limit %s"
    data_to_query = (str(img_features), k)
    cursor.execute(query_sql, data_to_query)
    global data
    data = cursor.fetchall()

# 以文搜图
def text_search_img(text,k):
    inputs = processor(text=text, return_tensors="pt", padding=True)
    text_features = model.get_text_features(inputs["input_ids"], inputs["attention_mask"])
    embeddings = text_features.detach().tolist()
    embeddings = embeddings[0]
    query_sql = "select pic_path from pic_tab order by l2_distance(embedding,normalize_l2(%s)) asc limit %s"
    data_to_query = (str(embeddings),k)
    cursor.execute(query_sql, data_to_query)
    global data
    data = cursor.fetchall()
```

### 搜索结果展示

在根据图片或文字检索到相关图片时，我们需要把结果打印出来，在这里我们使用 Matplotlib 来展示搜索结果。

```python
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

def show_img(img_path,rows,cols):
    if img_path:
        result_path = [img_path] + [path for path_tuple in data for path in path_tuple]
    else:
        result_path = [path for path_tuple in data for path in path_tuple]
    # 创建一个新的图和坐标轴
    fig, axes = plt.subplots(nrows=rows, ncols=cols, figsize=(10, 10))
    # 循环遍历图片路径和坐标轴
    for i, (result_path, ax) in enumerate(zip(result_path, axes.ravel())):
        image = mpimg.imread(result_path) # 读取图片
        ax.imshow(image) # 显示图片
        ax.axis('off') # 移除坐标轴
        ax.set_title(f'image{i + 1}') # 设置子图标题
    plt.tight_layout() # 调整子图间距
    plt.show() # 显示整个图形
```

### 查看结果

在主程序输入以下代码，运行程序：

```python
if __name__ == "__main__":
    directory_path = '/Users/admin/Downloads/fruit01' # 替换为实际的目录路径
    jpg_files = find_img_files(directory_path)
    storage_img()
    create_idx(4)
    img_path = '/Users/admin/Downloads/fruit01/blueberry/f_01_04_0450.jpg'
    img_search_img(img_path, 3) # 以图搜图
    show_img(img_path,1,4)
    text = ["Banana"]
    text_search_img(text,3) # 以文搜图
    show_img(None,1,3)
```

以图搜图结果，左边第一张图为比对图，可以看到，搜索出来的图片与被比对图非常相似：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/Vector/img_search.png width=80% heigth=80%/>
</div>

以文搜图结果，可以看到，搜出来的图片与输入文本一致：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/tutorial/Vector/text_search_pic.png width=50% heigth=50%/>
</div>

## 参考文档

- [向量类型](../Develop/Vector/vector_type.md)
- [向量检索](../Develop/Vector/vector_search.md)
- [CREATE INDEX...USING IVFFLAT](../Reference/SQL-Reference/Data-Definition-Language/create-index-ivfflat.md)
- [L2_DISTANCE()](../Reference/Functions-and-Operators/Vector/l2_distance.md)
- [NORMALIZE_L2()](../Reference/Functions-and-Operators/Vector/normalize_l2.md)