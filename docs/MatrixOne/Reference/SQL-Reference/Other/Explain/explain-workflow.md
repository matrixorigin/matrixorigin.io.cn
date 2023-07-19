# EXPLAIN 输出格式

## 输出结构

语法结构执行结果是为 `statement` 选择的计划的文本描述，可以选择使用执行统计信息进行注释。

以下以 SQL 为例，演示输出结构：

```
explain select city,libname1,count(libname1) as a from t3 join t1 on libname1=libname3 join t2 on isbn3=isbn2 group by city,libname1;
```

```
+--------------------------------------------------------------------------------------------+
| QUERY PLAN                                                                                 |
+--------------------------------------------------------------------------------------------+
| Project(cost=0.00..0.00 card=400.00 ndv=0.00 rowsize=0                                     |
|   ->  Aggregate(cost=0.00..0.00 card=400.00 ndv=0.00 rowsize=0                             |
|         Group Key:#[0,1], #[0,0]                                                           |
|         Aggregate Functions: count(#[0,0])                                                 |
|         ->  Join(cost=0.00..0.00 card=400.00 ndv=0.00 rowsize=0                            |
|               Join Type: INNER                                                             |
|               Join Cond: (#[1,2] = #[0,0])                                                 |
|               ->  Table Scan on abc.t2(cost=0.00..0.00 card=8.00 ndv=0.00 rowsize=0        |
|               ->  Join(cost=0.00..0.00 card=50.00 ndv=0.00 rowsize=0                       |
|                     Join Type: INNER                                                       |
|                     Join Cond: (#[0,0] = #[1,1])                                           |
|                     ->  Table Scan on abc.t1(cost=0.00..0.00 card=5.00 ndv=0.00 rowsize=0  |
|                     ->  Table Scan on abc.t3(cost=0.00..0.00 card=10.00 ndv=0.00 rowsize=0 |
+--------------------------------------------------------------------------------------------+
13 rows in set (0.00 sec)
```

EXPLAIN 输出一个名称为 `Execution Plan Tree` 树形结构，每个叶子节点都包含节点类型、受影响的对象以及其他属性的信息，如 `cost`，`rowsize` 等。我们现在只使用节点类型信息来简化展示上面的示例。`Execution Plan Tree` 树形结构可以可视化 SQL 查询的整个过程，显示它所经过的操作节点以及它们的成本估计。

```
Project
└── Aggregate
    └── Join
        └── Table Scan
        └──	Join
        	  └──Table Scan
        	  └──Table Scan
```

## 节点类型

MatrixOne 支持以下节点类型。

| 节点类型       | Explain 中的命名 |
| --------------- | --------------- |
| Node_TABLE_SCAN | Table Scan      |
| Node_VALUE_SCAN | Values Scan     |
| Node_PROJECT    | Project         |
| Node_AGG        | Aggregate       |
| Node_FILTER     | Filter          |
| Node_JOIN       | Join            |
| Node_SORT       | Sort            |
| Node_INSERT     | Insert          |
| Node_UPDATE     | Update          |
| Node_DELETE     | Delete          |

### Table Scan

| Feature    | Format                                                      | Description                                                  |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| cost        | cost=0.00..0.00                                              | 第一个数是预计的启动成本。这是在输出阶段开始之前花费的时间，例如，在排序节点中进行排序的时间。第二个数是预计的总成本。这是在假设计划节点运行完成的情况下给出的，即检索所有可用的行。实际上，父节点可能在读取所有可用行之前停止（参见下面的“LIMIT”示例）。 |
| card        | card=14.00                                                   | 估计的列基数。                                              |
| ndv         | ndv=0.00                                                     | 估计的不同值的数量。                                       |
| rowsize     | rowsize=0.00                                                 | 估计的行大小。                                              |
| output      | Output: #[0,0], #[0,1], #[0,2], #[0,3], #[0,4], #[0,5], #[0,6], #[0,7] | 节点输出信息。                                              |
| Table       | Table : 'emp' (0:'empno', 1:'ename', 2:'job', 3:'mgr',)      | 经过列剪枝后的表定义信息。                                  |
| Filter Cond | Filter Cond: (CAST(#[0,5] AS DECIMAL128) > CAST(20 AS DECIMAL128)) | 过滤条件。                                                  |

### Values Scan

| Feature | Format                                          | Description          |
| -------- | ----------------------------------------------- | --------------------- |
| cost     | (cost=0.00..0.00 card=14.00 ndv=0.00 rowsize=0) | 预计成本               |
| output   | Output: 0                                       | 节点输出信息         |

### Project

| Feature | Format                                          | Description          |
| -------- | ----------------------------------------------- | --------------------- |
| cost     | (cost=0.00..0.00 card=25.00 ndv=0.00 rowsize=0) | 预计成本               |
| output   | Output: (CAST(#[0,0] AS INT64) + 2)             | 节点输出信息         |

### Aggregate

| Feature            | Format                                                     | Description          |
| ------------------- | ------------------------------------------------------------ | --------------------- |
| cost                | (cost=0.00..0.00 card=14.00 ndv=0.00 rowsize=0)              | 预计成本               |
| output              | Output: #[0,0], #[0,1], #[0,2], #[0,3], #[0,4], #[0,5], #[0,6], #[0,7] | 节点输出信息         |
| Group Key           | Group Key:#[0,0]                                             | 分组的关键字        |
| Aggregate Functions | Aggregate Functions: max(#[0,1])                             | 聚合函数的名称    |

### Filter

| Feature    | Format                                                      | Description          |
| ----------- | ------------------------------------------------------------ | --------------------- |
| cost        | (cost=0.00..0.00 card=14.00 ndv=0.00 rowsize=0)              | 预计成本               |
| output      | Output: #[0,0], #[0,1], #[0,2], #[0,3], #[0,4], #[0,5], #[0,6], #[0,7] | 节点输出信息         |
| Filter Cond | Filter Cond: (CAST(#[0,1] AS INT64) > 10)                    | 过滤条件              |

### Join

| Feature         | Format                                          | Description          |
| ---------------- | ----------------------------------------------- | --------------------- |
| cost             | (cost=0.00..0.00 card=14.00 ndv=0.00 rowsize=0) | 预计成本               |
| output           | Output: #[0,0]                                  | 节点输出信息         |
| Join Type: INNER | Join Type: INNER                                | 连接类型              |
| Join Cond        | Join Cond: (#[0,0] = #[1,0])                    | 连接条件              |

### Sort

| Feature | Format                                                      | Description          |
| -------- | ------------------------------------------------------------ | --------------------- |
| cost     | (cost=0.00..0.00 card=25.00 ndv=0.00 rowsize=0)              | 预计成本               |
| output   | Output: #[0,0], #[0,1], #[0,2], #[0,3], #[0,4],
