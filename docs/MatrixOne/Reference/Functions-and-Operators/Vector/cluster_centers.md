# CLUSTER_CENTERS

## 函数说明

`CLUSTER_CENTERS()` 函数可用于确定向量列的 K 个聚类中心。返回一行 JSON 数组字符串，包含所有聚类中心。

## 语法结构

```
SELECT cluster_centers(col kmeans 'k, op_type, init_type, normalize')  FROM tbl;
```

## 参数释义

|  参数  | 说明 |
|  ----  | ----  |
| col | 必需的。要确定聚类中心的向量列。|
| k | 必需的。要将数据集分成的簇的数量，大于 0，小于等于总行数。|
| op_type| 必需的。在聚类计算过程中使用的距离函数。目前支持 vector_l2_ops。|
| init_type | 必需的。要使用的初始化聚类中心算法。目前我们支持 random 和 kmeansplusplus(K-means++)。|
| normalize | 必需的。布尔值，要使用的聚类算法，true 代表 Spherical Kmeans，false 代表 Regular Kmeans。|

## 示例

<!-- validator-ignore -->
```sql
drop table if exists points;
CREATE TABLE points (id int auto_increment PRIMARY KEY,coordinate vecf32(2));
insert into points(coordinate) VALUES
 ("[-7.68905443,6.62034649]"),
 ("[-9.57651383,-6.93440446]"),
 ("[6.82968177,1.1648714]"),
 ("[-2.90130578,7.55077118]"),
 ("[-5.67841327,-7.28818497]"),
 ("[-6.04929137,-7.73619342]"),
 ("[-6.27824322,7.22746302]");

--create index idx_t1 using ivfflat on points(coordinate)  lists=1 op_type "vector_l2_ops";

-- 每个点代表其在 x 和 y 轴上的坐标，查询聚类中心，使用 Regular Kmeans
--K-means++
mysql>  SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,kmeansplusplus,false') AS centers FROM points;
+----------------------------------------------------+
| centers                                            |
+----------------------------------------------------+
| [ [-2.5097303, 5.640863],[-7.101406, -7.3195944] ] |
+----------------------------------------------------+
1 row in set (0.01 sec)

--KMeans
mysql>  SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,random,false') AS centers FROM points;
+----------------------------------------------------+
| centers                                            |
+----------------------------------------------------+
| [ [-6.362137, -0.09336702],[6.829682, 1.1648715] ] |
+----------------------------------------------------+
1 row in set (0.00 sec)

-- 每个点代表经纬度坐标，查询聚类中心，使用 Spherical Kmeans
mysql> SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,kmeansplusplus,true') AS centers FROM points;
+------------------------------------------------------+
| centers                                              |
+------------------------------------------------------+
| [ [0.70710677, 0.70710677],[0.83512634, 0.5500581] ] |
+------------------------------------------------------+
1 row in set (0.00 sec)

--可结合 CROSS JOIN 和 UNNEST 语法将 JSON 类型数据内的聚类中心取出来。
mysql> SELECT value FROM  (
    -> SELECT cluster_centers(coordinate kmeans '2,vector_l2_ops,kmeansplusplus,false') AS centers FROM  points
    -> ) AS subquery 
    -> CROSS JOIN  UNNEST(subquery.centers) AS u;
+-------------------------+
| value                   |
+-------------------------+
| [-2.5097303, 5.640863]  |
| [-7.101406, -7.3195944] |
+-------------------------+
2 rows in set (0.00 sec)
```
