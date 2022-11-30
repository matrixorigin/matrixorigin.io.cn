# **PI()**

## **函数说明**

PI() 返回数学常量π (pi).

## **函数语法**

```
> PI()
```

## **示例**

```sql
drop table if exists t1;
create table t1(a int,b float);
insert into t1 values(0,0),(-15,-20),(-22,-12.5);
insert into t1 values(0,360),(30,390),(90,450),(180,270),(180,180);

mysql> select acos(a*pi()/180) as acosa,acos(b*pi()/180) acosb from t1;
+--------------------+--------------------+
| acosa              | acosb              |
+--------------------+--------------------+
| 1.5707963267948966 | 1.5707963267948966 |
| 1.8356824738191324 |  1.927370391646567 |
| 1.9648910192076245 | 1.7907312931992256 |
| 1.5707963267948966 |               NULL |
| 1.0197267436954502 |               NULL |
|               NULL |               NULL |
|               NULL |               NULL |
|               NULL |               NULL |
+--------------------+--------------------+
8 rows in set (0.01 sec)

mysql> select acos(a*pi()/180)*acos(b*pi()/180) as acosab,acos(acos(a*pi()/180)) as c from t1;
+--------------------+------+
| acosab             | c    |
+--------------------+------+
| 2.4674011002723395 | NULL |
| 3.5380400485035204 | NULL |
|  3.518591835821214 | NULL |
|               NULL | NULL |
|               NULL | NULL |
|               NULL | NULL |
|               NULL | NULL |
|               NULL | NULL |
+--------------------+------+
8 rows in set (0.01 sec)
```
