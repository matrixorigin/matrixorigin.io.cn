# 用户定义函数 UDF 
您可以编写用户定义函数 (UDF) 来扩展系统，以执行 MatrixOne 提供的内置系统定义函数无法执行的操作，创建 UDF 后，您可以多次重复使用它。

## 什么是UDF ?

在数据库管理系统中，用户定义函数（UDF）是一种强大的功能，允许用户根据特定需求创建自定义的函数。这些函数可以用于执行复杂的计算、数据转换等可能超出了标准 SQL 函数的范围的函数。

## UDF 的核心能力
- 增强数据处理能力：对数据进行复杂的数学运算，如高级的统计分析或金融模型计算，这些操作往往超出了标准SQL函数的能力。通过创建UDF，你可以在数据库内部执行这些复杂运算，而不需要将数据导出到外部程序处理。
- 简化复杂查询：可以将一个需要频繁执行的复杂查询操作封装在UDF中，从而简化SQL查询，使其更加清晰和易于管理。
- 提高代码重用性和维护性：在不同的查询和数据库应用中可能需要执行相同的数据处理逻辑。通过创建UDF，你可以在任何需要该逻辑的地方重用同一个函数，这有助于维护一致性并减少重复代码。
- 优化性能：某些类型的操作，如字符串处理或复杂的条件判断，如果在数据库层面通过UDF实现，可能比在应用层实现更高效，因为这减少了数据在网络中的传输和应用层的处理负担。
- 定制化和灵活性：特定业务需求，如货币转换、税率计算或特殊的日期时间处理，可能在标准SQL中没有直接对应的函数。通过UDF，你可以根据业务需求定制这些功能。
- 跨平台兼容性：许多数据库系统支持类似的UDF创建方式和执行逻辑。这意味着在一个数据库系统中开发的UDF，在经过少量修改后，可能在另一个系统中也能使用，从而提高了代码的可移植性。

## MatrixOne对 UDF 的支持

在当前版本中，MatrixOne 支持使用 Python 语言的 UDF。

有关 MatrixOne 中 UDF-python 的基础用法，参见 [UDF-python基础用法](../../Develop/udf/udf-python.md)。

有关 MatrixOne 中 UDF-python 的进阶用法，参见 [UDF-python进阶用法](../../Develop/udf/udf-python-advanced.md)。

有关 MatrixOne 对 UDF 创建的具体参数，参见[创建 UDF](../../Reference/SQL-Reference/Data-Definition-Language/create-function-python.md)。

有关 MatrixOne 对 UDF 删除的具体参数，参见[删除 UDF](../../Reference/SQL-Reference/Data-Definition-Language/drop-function.md)。
