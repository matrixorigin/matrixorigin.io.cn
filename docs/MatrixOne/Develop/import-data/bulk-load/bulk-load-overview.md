# 批量导入概述

MatrixOne 支持批量导入数据。在我们使用 MatrixOne 数据库的过程中，根据不同的数据量，不同的数据文件类型，或者不同的数据存储位置，可以选择不同的导入的方法，提高我们的工作效率。

## MatrixOne 支持导入不同的数据格式

MatrixOne 当前主要支持导入两种数据格式：

- 一种是支持导入 *.csv* 格式的数据，具体导入方式可以参考[导入 *.csv* 格式数据](load-csv.md)。
- 一种是支持导入 *.jl* 格式的数据，即 jsonlines 格式，具体导入方式可以参考[导入 jsonlines 数据](load-jsonline.md)。

## MatrixOne 支持从其他文件系统中读取数据

MatrixOne 支持从其他文件系统中读取数据并导入到 MatrixOne 本身的数据库中。当前 MatrixOne 支持从对象存储服务（Simple Storage Service, S3) 中读取文件，并导入数据到 MatrixOne 数据库表中。具体导入方式可以参考[从 S3 读取数据并导入 MatrixOne](load-s3.md)。
