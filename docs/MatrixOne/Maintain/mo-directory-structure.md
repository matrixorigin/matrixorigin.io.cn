# MatrixOne 目录结构

完成 MatrixOne 搭建和连接后，首次执行时，MatrixOne 会自动生成以下目录，用于存放各类数据文件或元数据信息。

进入 *matrixone* 目录执行 `ls` 查看目录结构，相关目录结构以及用途如下：

matrixone    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***MatrixOne 主目录***<br>
|-- etc   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***配置文件目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |-- quickstart &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***配置文件目录***<br>
|-- mo-data  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***数据文件目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |-- local   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***本地 fileservice 目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |   |-- cnservice   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***cn 节点信息目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |   |-- tnservice   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***tn 节点信息目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |-- etl  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***外部表目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |        |-- sys &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***外部表信息归属于哪个租户*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |            |--  logs &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息的类型*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |               |-- 2022 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息的年份*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                   |-- 10  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息的月份*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                       |-- 27 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息的天数*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- metric &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息对应表的存储目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- rawlog &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息对应表的存储目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- statement_info &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息对应表的存储路目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |  	        |-- merged &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***过往外部表信息的合并记录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                  |--  2022 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息的年份*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                      |--  10  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息的月份*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                         |--  27 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息的天数*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- metric &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息对应表的存储目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- rawlog &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息对应表的存储目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- statement_info &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***统计信息对应表的存储路目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |-- logservice  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***logservice 目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |-- 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***logservice 节点对应目录（随机生成 uuid）***<br>
│&nbsp;&nbsp;&nbsp;&nbsp; |--hostname &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***MatrixOne 的服务器域名*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- 00000000000000000001 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***快照保存目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- exported-snapshot &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***导出快照目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- snapshot-part-n &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***快照分部保存目录*** <br>
│&nbsp;&nbsp;&nbsp;&nbsp; |                           |-- tandb &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***bootstrap 信息保存目录***<br>
|-- s3  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//***数据保存目录***<br>
