# 批量导入概述

批量导入是将大量行插入至 MatrixOne 数据表中最快的方法。MatrixOne 支持从本地文件系统或 *S3 对象存储服务*批量导入 *csv* 文件、*jsonline* 文件。

## MatrixOne 支持导入不同的数据格式

根据*数据文件类型不同*的情况，MatrixOne 支持导入*。csv* 和*。jl* 格式。

- 一种是支持导入*。csv* 格式的数据，具体导入方式可以参考[导入*。csv* 格式数据](load-csv.md)。
- 一种是支持导入*。jl* 格式的数据，即 jsonlines 格式，具体导入方式可以参考[导入 jsonlines 数据](load-jsonline.md)。

## MatrixOne 支持从不同存储位置进行导入

根据*数据存储位置不同*的情况，MatrixOne 支持从*本地进行导入*和*从对象存储服务（Simple Storage Service，S3) 导入*。

- 从本地导入数据的方式，参考[从本地导入*。csv* 格式数据](load-csv.md)或[从本地导入 jsonlines 数据](load-jsonline.md)。
- 从 S3 导入数据的方式，参考[从 S3 读取数据并导入 MatrixOne](load-s3.md)。
