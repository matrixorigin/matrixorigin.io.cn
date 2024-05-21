# 向量类型

## 什么是向量？

在数据库中，向量通常是一组数字，它们以特定的方式排列，以表示某种数据或特征。这些向量可以是一维数组、多维数组或具有更高维度的数据结构。在机器学习和数据分析领域中，向量用于表示数据点、特征或模型参数。它们通常是用来处理非结构化数据，如图片，语音，文本等，以通过机器学习模型，将非结构化数据转化为 embedding 向量，随后处理分析这些数据。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/reference/vector/vector_introduction.png width=80% heigth=80%/>
</div>

## Matrixone 支持向量类型

Matrixone 目前支持 `float32` 及 `float64` 类型的向量，分别称之为 `vecf32` 与 `vecf64` 而不支持字符串类型和整型类型的数字。

## 最佳实践

- **向量类型转换**：在将向量从一种类型转换为另一种类型时，建议同时指定维度。例如：

    ```
    SELECT b + CAST("[1,2,3]" AS vecf32(3)) FROM t1;
    ```

    这种做法确保了向量类型转换的准确性和一致性。

- **使用二进制格式**：为了提高整体插入性能，考虑使用二进制格式而不是文本格式。在转换为十六进制编码之前，确保数组采用小端序格式。以下是示例 Python 代码：

    ```python
    import binascii
 
    # 'value' 是一个 NumPy 对象
    def to_binary(value):
        if value is None:
            return value

        # 小端序浮点数组
        value = np.asarray(value, dtype='<f')
 
        if value.ndim != 1:
            raise ValueError('期望 ndim 为 1')
 
        return binascii.b2a_hex(value)
    ```

    这种方法可以显著提高数据插入的效率。

- **构建 RAG 应用**：详情请查看应用开发示例中的 [RAG 应用基础示例](../../Tutorial/rag-demo.md)。

## 参考文档

[向量数据类型](../../Reference/Data-Types/vector-type.md)
