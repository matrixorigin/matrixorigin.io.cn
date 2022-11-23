# MatrixOne 目录结构

完成 MatrixOne 搭建和连接后，首次执行时，MatrixOne 会自动生成以下目录，用于存放各类数据文件或元数据信息。

进入 *matrixone* 目录执行 `ls` 查看目录结构，相关目录结构以及用途如下：

matrixone    //MatrixOne主目录<br>
├── etc   //配置文件目录<br>
│    └── quickstart //配置文件目录<br>
├── mo-data  //数据文件目录<br>
│   ├── local   //本地fileservice目录<br>
│   │   ├── xf<br>
│   │   └── dnservice   //dn节点信息目录<br>
│   ├── etl  //外部表目录<br>
│   │        └── sys //外部表信息归属于哪个租户<br>
│   │            ├──  logs //统计信息的类型<br>
│   │               └── 2022 //统计信息的年份<br>
│   │                   └── 10  //统计信息的月份<br>
│   │                       └── 27 //统计信息的天数<br>
│   │                           ├── metric //统计信息对应表的存储目录<br>
│   │                           ├── rawlog //统计信息对应表的存储目录<br>
│   │                           └── statement_info //统计信息对应表的存储路目录<br>
│   │  	        └── merged //过往外部表信息的合并记录<br>
│   │                  └──  2022 //统计信息的年份<br>
│   │                      └──  10  //统计信息的月份<br>
│   │                         └──  27 //统计信息的天数<br>
│   │                           ├── metric //统计信息对应表的存储目录<br>
│   │                           ├── rawlog //统计信息对应表的存储目录<br>
│   │                           └── statement_info //统计信息对应表的存储路目录<br>
│   └── logservice  //logservice目录<br>
 |      └── 7c4dccb4-4d3c-41f8-b482-5251dc7a41bf //logservice节点对应目录（随机生成uuid）<br>
│       ├──hostname //MatrixOne的服务器域名<br>
│       │   └── 00000000000000000001 //快照保存目录<br>
│        |	   ├── exported-snapshot //导出快照目录<br>
 |         │     └── snapshot-part-n //快照分部保存目录<br>
│       │       └── tandb //bootstrap信息保存目录<br>
└── s3  //数据保存目录<br>
