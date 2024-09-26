# 使用 DataX 将数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 PostgreSQL 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 完成[单机部署 MatrixOne](../../../../Get-Started/install-standalone-matrixone.md)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 安装 [PostgreSQL](https://www.postgresql.org/download/)。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 操作步骤

### 在 postgresql 中创建测试数据

```sql
create table  public.student
(
    stu_id      integer not null unique,
    stu_name    varchar(50),
    stu_age     integer,
    stu_bth     date,
    stu_tel     varchar(20),
    stu_address varchar(100)
);

insert into public.student (stu_id, stu_name, stu_age, stu_bth, stu_tel, stu_address)
values  (1, '89', 37, '2020-04-08', '13774736413', '8c5ab4290b7b503a616428aa018810f7'),
        (2, '32', 99, '2021-03-29', '15144066883', '6362da2f9dec9f4ed4b9cb746d614f8b'),
        (3, '19', 47, '2022-08-12', '18467326153', '3872f24472ac73f756093e7035469519'),
        (4, '64', 52, '2020-05-23', '17420017216', '70ae7aa670faeb46552aad7a1e9c0962'),
        (5, '4', 92, '2021-07-26', '17176145462', 'e1a98b2e907d0c485278b9f4ccc8b2e2'),
        (6, '64', 32, '2021-02-15', '17781344827', '46ee127c3093d94626ba6ef8cd0692ba'),
        (7, '3', 81, '2021-05-30', '18884764747', '0d1933c53c9a4346d3f6c858dca790fd'),
        (8, '20', 53, '2022-05-09', '18270755716', '0b58cad62f9ecded847a3c5528bfeb32'),
        (9, '35', 80, '2022-02-06', '15947563604', 'a31547f9dc4e47ce78cee591072286a5'),
        (10, '2', 4, '2021-12-27', '17125567735', '527f56f97b043e07f841a71a77fb65e1'),
        (11, '93', 99, '2020-09-21', '17227442051', '6cd20735456bf7fc0de181f219df1f05'),
        (12, '85', 92, '2021-06-18', '17552708612', 'ec0f8ea9c8c9a1ffba168b71381c844a'),
        (13, '4', 85, '2022-06-23', '18600681601', 'f12086a2ac3c78524273b62387142dbb'),
        (14, '57', 62, '2022-09-05', '15445191147', '8e4a867c3fdda49da4094f0928ff6d9c'),
        (15, '60', 14, '2020-01-13', '15341861644', 'cb2dea86155dfbe899459679548d5c4d'),
        (16, '38', 4, '2021-06-24', '17881144821', 'f8013e50862a69cb6b008559565bd8a9'),
        (17, '38', 48, '2022-01-10', '17779696343', 'c3a6b5fbeb4859c0ffc0797e36f1fd83'),
        (18, '22', 26, '2020-10-15', '13391701987', '395782c95547d269e252091715aa5c88'),
        (19, '73', 15, '2022-05-29', '13759716790', '808ef7710cdc6175d23b0a73543470d9'),
        (20, '42', 41, '2020-10-17', '18172716366', 'ba1f364fb884e8c4a50b0fde920a1ae8'),
        (21, '56', 83, '2020-03-07', '15513537478', '870ad362c8c7590a71886243fcafd0d0'),
        (22, '55', 66, '2021-10-29', '17344805585', '31691a27ae3e848194c07ef1d58e54e8'),
        (23, '90', 36, '2020-10-04', '15687526785', '8f8b8026eda6058d08dc74b382e0bd4d'),
        (24, '16', 35, '2020-02-02', '17162730436', '3d16fcff6ef498fd405390f5829be16f'),
        (25, '71', 99, '2020-06-25', '17669694580', '0998093bfa7a4ec2f7e118cd90c7bf27'),
        (26, '25', 81, '2022-01-30', '15443178508', '5457d230659f7355e2171561a8eaad1f'),
        (27, '84', 9, '2020-03-04', '17068873272', '17757d8bf2d3b2fa34d70bb063c44c4a'),
        (28, '78', 15, '2020-05-29', '17284471816', 'a8e671065639ac5ca655a88ee2d3818f'),
        (29, '50', 34, '2022-05-20', '18317827143', '0851e6701cadb06352ee780a27669b3b'),
        (30, '90', 20, '2022-02-02', '15262333350', 'f22142e561721084763533c61ff6af36'),
        (31, '7', 30, '2021-04-21', '17225107071', '276c949aec2059caafefb2dee1a5eb11'),
        (32, '80', 15, '2022-05-11', '15627026685', '2e2bcaedc089af94472cb6190003c207'),
        (33, '79', 17, '2020-01-16', '17042154756', 'ebf9433c31a13a92f937d5e45c71fc1b'),
        (34, '93', 30, '2021-05-01', '17686515037', 'b7f94776c0ccb835cc9dc652f9f2ae3f'),
        (35, '32', 46, '2020-06-15', '15143715218', '1aa0ce5454f6cfeff32037a277e1cbbb'),
        (36, '21', 41, '2020-07-07', '13573552861', '1cfabf362081bea99ce05d3564442a6a'),
        (37, '38', 87, '2022-01-27', '17474570881', '579e80b0a04bfe379f6657fad9abe051'),
        (38, '95', 61, '2022-07-12', '13559275228', 'e3036ce9936e482dc48834dfd4efbc42'),
        (39, '77', 55, '2021-01-27', '15592080796', '088ef31273124964d62f815a6ccebb33'),
        (40, '24', 51, '2020-12-28', '17146346717', '6cc3197ab62ae06ba673a102c1c4f28e'),
        (41, '48', 93, '2022-05-12', '15030604962', '3295c7b1c22587d076e02ed310805027'),
        (42, '64', 57, '2022-02-07', '17130181503', 'e8b134c2af77f5c273c60d723554f5a8'),
        (43, '97', 2, '2021-01-05', '17496292202', 'fbfbdf19d463020dbde0378d50daf715'),
        (44, '10', 92, '2021-08-17', '15112084250', '2c9b3419ff84ba43d7285be362221824'),
        (45, '99', 55, '2020-09-26', '17148657962', 'e46e3c6af186e95ff354ad08683984bc'),
        (46, '24', 27, '2020-10-09', '17456279238', '397d0eff64bfb47c8211a3723e873b9a'),
        (47, '80', 40, '2020-02-09', '15881886181', 'ef2c50d70a12dfb034c43d61e38ddd9f'),
        (48, '80', 65, '2021-06-17', '15159743156', 'c6f826d3f22c63c89c2dc1c226172e56'),
        (49, '92', 73, '2022-01-16', '18614514771', '657af9e596c2dc8b6eb8a1cda4630a5d'),
        (50, '46', 1, '2022-04-10', '17347722479', '603b4bb6d8c94aa47064b79557347597');
```

### 在 MatrixOne 中创建目标表

```sql
CREATE TABLE `student` (
    `stu_id` int(11) NOT NULL COMMENT "",
    `stu_name` varchar(50) NULL COMMENT "",
    `stu_age` int(11) NULL COMMENT "",
    `stu_bth` date NULL COMMENT "",
    `stu_tel` varchar(11) NULL COMMENT "",
    `stu_address` varchar(100) NULL COMMENT "",
    primary key(stu_id)
    );
```

### 创建作业配置文件

进入到 datax/job 路径，创建文件 `pgsql2matrixone.json`，输入以下内容：

```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 3,
        "byte": 1048576
      },
      "errorLimit": {
        "record": 0,
        "percentage": 0.02
      }
    },
    "content": [
      {
        "reader": {
          "name": "postgresqlreader",
          "parameter": {
            "connection": [
              {
                "jdbcUrl": [
                  "jdbc:postgresql://xx.xx.xx.xx:5432/postgres"
                ],
                "table": [
                  "public.student"
                ],
                
              }
            ],
            "password": "123456",
            "username": "postgres",
            "column": [
              "stu_id",
              "stu_name",
              "stu_age",
              "stu_bth",
              "stu_tel",
              "stu_address"
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "column": [
              "stu_id",
              "stu_name",
              "stu_age",
              "stu_bth",
              "stu_tel",
              "stu_address"
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/postgre",
                "table": [
                  "student"
                ]
              }
            ],
            "username": "root",
            "password": "111",
            "writeMode": "insert"
          }
        }
      }
    ]
  }
}
```

若报错 "经 DataX 智能分析，该任务最可能的错误原因是：com.alibaba.datax.common.exception.DataXException: Code: [Framework-03], Description: DataX 引擎配置错误，该问题通常是由于 DataX 安装错误引起，请联系您的运维解决。 - 在有总 bps 限速条件下，单个 channel 的 bps 值不能为空，也不能为非正数", 则需要在 json 中添加

```json
"core": {
        "transport": {
        "channel": {
        "class": "com.alibaba.datax.core.transport.channel.memory.MemoryChannel",
        "speed": {
        "byte": 2000000,
        "record": -1
                }
            }
        }
    }
```

### 启动 datax 作业

```bash
python ./bin/datax.py ./job/pgsql2mo.json   #在datax目录下
```

任务完成后，打印总体运行情况：

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/datax/datax-pg-01.jpg width=70% heigth=70%/>
</div>

### 查看 MatrixOne 表中数据

<div align="center">
    <img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/datax/datax-pg-02.jpg width=70% heigth=70%/>
</div>