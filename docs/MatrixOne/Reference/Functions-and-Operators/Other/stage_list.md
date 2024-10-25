# **STAGE_LIST()**

## **函数说明**

`STAGE_LIST()` 函数用于查看 stage 中的目录和文件。

## **函数语法**

```
>STAGE_LIST(stage://<stage_name>/<path>/<file_name>) as f;
```

## **参数释义**

|  参数  | 说明 |
|  ----  | ----  |
| stage_name | 必需的。stage 的名称。|
| path | 非必填。stage 下的目录名称。|
| file_name | 非必填。stage 下文件名称，可使用通配符*|

## **示例**

在目录 `/Users/admin/case` 下有以下文件和目录：

```bash
(base) admin@192 case % ls
customer	student.csv	t1.csv		t2.txt		t3		user.txt
```

```sql
create stage stage_test url = 'file:///Users/admin/case';

mysql> select * from stage_list('stage://stage_test') as f;
+-------------------------------+
| file                          |
+-------------------------------+
| /Users/admin/case/customer    |
| /Users/admin/case/student.csv |
| /Users/admin/case/t1.csv      |
| /Users/admin/case/t2.txt      |
| /Users/admin/case/t3          |
| /Users/admin/case/user.txt    |
+-------------------------------+
6 rows in set (0.00 sec)

mysql> select * from stage_list('stage://stage_test/t*') as f;
+--------------------------+
| file                     |
+--------------------------+
| /Users/admin/case/t1.csv |
| /Users/admin/case/t2.txt |
+--------------------------+
2 rows in set (0.01 sec)

mysql> select * from stage_list('stage://stage_test/customer') as f;
Empty set (0.00 sec)
```
