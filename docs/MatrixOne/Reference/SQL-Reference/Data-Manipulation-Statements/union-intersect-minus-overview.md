# 组合查询 (UNION, INTERSECT, MINUS)

两个查询的结果可以使用 `UNION`，`INTERSECT` 和 `MINUS` 语法进行组合查询。

示例语法如下：

```
query1 UNION [ALL] query2
query1 INTERSECT [ALL] query2
query1 MINUS [ALL] query2
```

__Tips:__ *query1* 和 *query2* 是可以使用到目前为止讨论的任何功能的查询。

`UNION` 有效地将 *query2* 的结果合并到 *query1* 的结果中（但不能保证这是返回行的顺序）。此外，它以与 `DISTINCT` 语法相同，即从结果中消除重复行；使用了 `UNION ALL`，即从结果中不消除重复行。

`INTERSECT` 返回 *query1* 和 *query2* 相交的结果中的所有行。不使用 `INTERSECT ALL`，则消除结果中的重复的行；使用 `INTERSECT ALL`，不消除结果中的重复的行。

`MINUS` 返回 *query1* 结果，但不在 *query2* 中的所有行。即 *query1* 和 *query2* 的结果的差集。同样，不使用 `MINUS ALL`，则消除结果中的重复的行；使用 `MINUS ALL`，不消除结果中的重复的行。

要计算两个查询的并集、交集或差集，这两个查询必须是“并集兼容的”，这意味着它们返回相同数量的列并且对应的列具有兼容的数据类型。

`UNION`，`INTERSECT` 和 `MINUS` 操作可以组合，例如：

```
query1 UNION query2 MINUS query3
```

它也等价于：

```
(query1 UNION query2) MINUS query3
```

如上述代码行所示，你可以使用括号来控制计算顺序。如果没有括号，`UNION` 和 `MINUS` 从左到右关联。但 `INTERSECT` 比这两个运算符优先级更高，因此参见下面的代码行：

```
query1 UNION query2 INTERSECT query3
```

表示：

```
query1 UNION (query2 INTERSECT query3)
```

你还可以用括号将单个查询括起来。如果查询需要使用以下示例中的子句（例如 `LIMIT` 子句），如果没有括号，将会导致语法错误，该子句在计算过程中将被理解为应用于组合操作的输出而不是其输入之一。如下述例子所示：

```
SELECT a FROM b UNION SELECT x FROM y LIMIT 10
```

它可被接受，但是它表示的计算顺序如下：

```
(SELECT a FROM b UNION SELECT x FROM y) LIMIT 10
```

而不是下面的计算顺序：

```
SELECT a FROM b UNION (SELECT x FROM y LIMIT 10)
```

## 参考

关于 `UNION`，`INTERSECT` 和 `MINUS` 单个语法的文档，可以参见如下：

- [UNION](union.md)
- [INTERSECT](intersect.md)
- [MINUS](minus.md)
