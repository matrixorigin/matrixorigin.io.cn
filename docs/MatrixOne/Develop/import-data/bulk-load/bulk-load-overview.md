# 批量导入概述

MatrixOne 支持批量导入数据。在我们使用 MatrixOne 数据库的过程中，根据不同的数据量，不同的数据文件类型，或者不同的数据存储位置，可以选择不同的导入的方法，提高我们的工作效率。

## MatrixOne 支持导入不同的数据格式

根据*数据文件类型不同*的情况，MatrixOne 支持导入 *.csv* 和 *.jl* 格式。

- 一种是支持导入 *.csv* 格式的数据，具体导入方式可以参考[导入 *.csv* 格式数据](load-csv.md)。
- 一种是支持导入 *.jl* 格式的数据，即 jsonlines 格式，具体导入方式可以参考[导入 jsonlines 数据](load-jsonline.md)。

## MatrixOne 支持从不同存储位置进行导入

根据*数据存储位置不同*的情况，MatrixOne 支持从*本地进行导入*和*从对象存储服务（Simple Storage Service, S3) 导入*。

- 从本地导入数据的方式，参考[从本地导入 *.csv* 格式数据](load-csv.md)或[从本地导入 jsonlines 数据](load-jsonline.md)。
- 从 S3 导入数据的方式，参考[从 S3 读取数据并导入 MatrixOne](load-s3.md)。
