# 使用 DataX 将数据写入 MatrixOne

本文介绍如何使用 DataX 工具将 Oracle 数据离线写入 MatrixOne 数据库。

## 开始前准备

在开始使用 DataX 将数据写入 MatrixOne 之前，需要完成安装以下软件：

- 完成[单机部署 MatrixOne](https://docs.matrixorigin.cn/1.2.2/MatrixOne/Get-Started/install-standalone-matrixone/)。
- 安装 [JDK 8+ version](https://www.oracle.com/sg/java/technologies/javase/javase8-archive-downloads.html)。
- 安装 [Python 3.8(or plus)](https://www.python.org/downloads/)。
- 下载 [DataX](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202210/datax.tar.gz) 安装包，并解压。
- 下载 [matrixonewriter.zip](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/develop/Computing-Engine/datax-write/matrixonewriter.zip)，解压至 DataX 项目根目录的 `plugin/writer/` 目录下。
- 安装 [Oracle 19c](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html)。
- 安装 <a href="https://dev.mysql.com/downloads/mysql" target="_blank">MySQL Client</a>。

## 操作步骤

### 使用 Oracle 的 scott 用户

本次使用 Oracle 中用户 scott 来创建表（当然也可以用其他用户），在 Oracle 19c 中，scott 用户需要手动创建，可以使用 sqlplus 工具通过命令将其解锁。

```sql
sqlplus / as sysdba
create user scott identified by tiger;
grant dba to scott;
```

后续就可以通过 scott 用户登录访问：

```sql
sqlplus scott/tiger
```

### 创建 Oracle 测试数据

在 Oracle 中创建 employees_oracle 表：

```sql
create table employees_oracle(
  id number(5),
  name varchar(20)
);
--插入示例数据：
insert into employees_oracle values(1,'zhangsan');
insert into employees_oracle values(2,'lisi');
insert into employees_oracle values(3,'wangwu');
insert into employees_oracle values(4,'oracle');
-- 在 sqlplus 中，默认不退出就不会提交事务，因此插入数据后需手动提交事务（或通过 DBeaver 等工具执行插入）
COMMIT;
```

### 创建 MatrixOne 测试表

由于 DataX 只能同步数据，不能同步表结构，所以在执行任务前，我们需要先在目标数据库（MatrixOne）中手动创建好表。

```sql
CREATE TABLE `oracle_datax` (
     `id` bigint(20) NOT NULL,
     `name` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`)
) ;
```

### 创建作业配置文件

DataX 中的任务配置文件是 json 格式，可以通过下面的命令查看内置的任务配置模板：

```python
python datax.py -r oraclereader -w matrixonewriter
```

进入到 datax/job 路径，根据模板，编写作业文件 oracle2mo.json

```json
{
  "job": {
    "setting": {
      "speed": {
        "channel": 8
      }
    },
    "content": [
      {
        "reader": {
          "name": "oraclereader",
          "parameter": {
            "username": "scott",
            "password": "tiger",
            "column": [
              '*'
            ],
            "connection": [
              {
                "table": [
                  "employees_oracle"
                ],
                "jdbcUrl": [
                  "jdbc:oracle:thin:@xx.xx.xx.xx:1521:ORCLCDB"
                ]
              }
            ]
          }
        },
        "writer": {
          "name": "matrixonewriter",
          "parameter": {
            "writeMode": "insert",
            "username": "root",
            "password": "111",
            "column": [
              '*'
            ],
            "connection": [
              {
                "jdbcUrl": "jdbc:mysql://xx.xx.xx.xx:6001/test",
                "table": [
                  "oracle_datax"
                ]
              }
            ]
          }
        }
      }
    ]
  }
}
```

### 启动 datax 作业

```bash
python /opt/module/datax/bin/datax.py /opt/module/datax/job/oracle2mo.json
```

### 查看 MatrixOne 表中数据

```sql
mysql> select * from oracle_datax;
+------+----------+
| id   | name     |
+------+----------+
|    1 | zhangsan |
|    2 | lisi     |
|    3 | wangwu   |
|    4 | oracle   |
+------+----------+
4 rows in set (0.00 sec)
```