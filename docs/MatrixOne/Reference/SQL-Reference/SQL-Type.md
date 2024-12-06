# **SQL 语句的分类**

在 MatrixOne 中，SQL 语句包含多种分类，每一种分类的定义与包含内容按照如下描述的每个部分所展示：

## **DDL - 数据定义语言**

数据定义语言（Data Definition Language，DDL）是 DBMS 语言的一种，用于明确定义数据对象。在 MatrixOne 中，DDL 语句分为五个类别：

### CREATE 语句，创建 MatrixOne 中各类对象

- [CREATE DATABASE](Data-Definition-Language/create-database.md)
- [CREATE INDEX](Data-Definition-Language/create-index.md)
- [CREATE TABLE](Data-Definition-Language/create-table.md)
- [CREATE EXTERNAL TABLE](Data-Definition-Language/create-external-table.md)
- [CREATE FUNCTION](Data-Definition-Language/create-function-sql.md)
- [CREATE PITR](Data-Definition-Language/create-pitr.md)
- [CREATE PUBLICATION](Data-Definition-Language/create-publication.md)
- [CREATE SEQUENCE](Data-Definition-Language/create-sequence.md)
- [CREATE SNAPSHOT](Data-Definition-Language/create-snapshot.md)
- [CREATE STAGE](Data-Definition-Language/create-stage.md)
- [CREATE...FROM...PUBLICATION...](Data-Definition-Language/create-subscription.md)
- [CREATE VIEW](Data-Definition-Language/create-view.md)

### DROP 语句，删除 MatrixOne 中各类对象

- [DROP INDEX](Data-Definition-Language/drop-index.md)
- [DROP TABLE](Data-Definition-Language/drop-table.md)
- [DROP FUNCTION](Data-Definition-Language/drop-function.md)
- [DROP PITR](Data-Definition-Language/drop-pitr.md)
- [DROP PUBLICATION](Data-Definition-Language/drop-publication.md)
- [DROP SEQUENCE](Data-Definition-Language/drop-sequence.md)
- [DROP SNAPSHOT](Data-Definition-Language/drop-snapshot.md)
- [DROP STAGE](Data-Definition-Language/drop-stage.md)
- [DROP VIEW](Data-Definition-Language/drop-view.md)

### ALTER 语句，修改 MatrixOne 中各类对象

- [ALTER TABLE](Data-Definition-Language/alter-table.md)
- [ALTER PUBLICATION](Data-Definition-Language/alter-publication.md)
- [ALTER PITR](Data-Definition-Language/alter-pitr.md)
- [ALTER REINDEX](Data-Definition-Language/alter-reindex.md)
- [ALTER SEQUENCE](Data-Definition-Language/alter-sequence.md)
- [ALTER STAGE](Data-Definition-Language/alter-stage.md)
- [ALTER VIEW](Data-Definition-Language/alter-view.md)

### TRUNCATE 语句，清空表中的数据

- [TRUNCATE TABLE](Data-Definition-Language/truncate-table.md)

### RENAME 语句

- [RENAME TABLE](Data-Definition-Language/rename-table.md)

### RESTORE 语句

- [RESTORE SNAPSHOT](Data-Definition-Language/restore-snapshot.md)
- [RESTORE PITR](Data-Definition-Language/restore-pitr.md)

## **DML - 数据修改语言**

数据修改语言（Data Manipulation Language, DML）用于数据库操作，包括对数据库中的对象和资料执行访问工作的编程语句。在 MatrixOne 中，DML 包含如下分类：

### INSERT 语句，用于在表中插入新行

- [INSERT](Data-Manipulation-Language/insert.md)
- [INSERT INTO SELECT](Data-Manipulation-Language/insert-into-select.md)
- [INSERT ON DUPLICATE KEY UPDATE](Data-Manipulation-Language/insert-on-duplicate.md)

### DELETE 语句，用于在表中删除已存在的行

- [DELETE](Data-Manipulation-Language/delete.md)

### UPDATE 语句，修改表中已存在行的数据

- [UPDATE](Data-Manipulation-Language/update.md)

### LOAD DATA 语句，从文件批量导入数据到数据库

- [LOAD DATA](Data-Manipulation-Language/load-data.md)

### REPLACE 语句，替换行

- [REPLACE](Data-Manipulation-Language/replace.md)

## **DQL - Data Query Language**

查询类语句（Data Query Language, DQL）用于检索 MatrixOne 中现有数据。以 SELECT 语句为核心，分为以下几类：

### 单表查询，查询层级只有一层，只涉及到单表的查询

- [SELECT](Data-Query-Language/select.md)

### 子查询（Subquery），也称为嵌套查询或子选择，是 SELECT 子查询语句嵌入在另一个 SQL 查询的查询方式，分为关联子查询与非关联子查询

- [SUBQUERY with ANY or SOME](Data-Query-Language/subqueries/subquery-with-any-some.md)
- [SUBQUERY with ALL](Data-Query-Language/subqueries/subquery-with-all.md)
- [SUBQUERY with EXISTS](Data-Query-Language/subqueries/subquery-with-exists.md)
- [SUBQUERY with IN](Data-Query-Language/subqueries/subquery-with-in.md)

### 关联查询（Join Query），将多表之间的结果进行关联并输出结果的查询方式

- [INNER JOIN](Data-Query-Language/join/inner-join.md)
- [LEFT JOIN](Data-Query-Language/join/left-join.md)
- [RIGHT JOIN](Data-Query-Language/join/right-join.md)
- [FULL JOIN](Data-Query-Language/join/full-join.md)
- [OUTER JOIN](Data-Query-Language/join/outer-join.md)
- [NATURAL JOIN](Data-Query-Language/join/natural-join.md)

### 应用查询（Apply Query），将某个操作应用于每一行数据的查询方式

- [CROSS APPLY](Data-Query-Language/apply/cross-apply.md)
- [OUTER APPLY](Data-Query-Language/apply/outer-apply.md)

### 公用表达式（Common Table Expressions），将某些查询作为是临时结果，可以在其他 SQL 中引用，如 SELECT, INSERT, UPDATE 和 DELETE，其仅存在于查询执行期间

- [With CTE](Data-Query-Language/with-cte.md)

### 组合查询，将多个查询的结果进行组合，以集合的方式进行呈现，分为并集（UNION）、交集（INTERSECT）、差集（MINUS）

- [UNION](Data-Query-Language/union.md)
- [INTERSECT](Data-Query-Language/intersect.md)
- [MINUS](Data-Query-Language/minus.md)

### 除 SELECT STATEMENT 之外，还包含了针对常量的查询 VALUES 语句

- [SELECT](Data-Query-Language/select.md)

### 以及 mo-dump 工具所对应的内部命令

- [Export Data](../../Develop/export-data/modump.md)

## **TCL - 事务语言**

事务语言是 MatrixOne 中提供事务管控专用的语言，包括如下几类：

### START TRANSACTION，开启事务，在 MatrixOne 中可以使用其方言 BEGIN 实现替代

```
START TRANSACTION;
  TRANSACTION STATEMENTS
  ```

### COMMIT，提交事务，用于在 START TRANSACTION 或非自动提交场景下对事务的显式提交

```
START TRANSACTION;
  TRANSACTION STATEMENTS
  COMMIT;
  OR
  SET AUTOCOMMIT=0;
  TRANSACTION STATEMENTS
  COMMIT;
```

### ROLLBACK，回滚事务，用于在 START TRANSACTION 或非自动提交场景下对事务的显式回滚

```
START TRANSACTION;
  TRANSACTION STATEMENTS
  ROLLBACK;
  OR
  SET AUTOCOMMIT=0;
  TRANSACTION STATEMENTS
  ROLLBACK;
```

## **DCL - 数据控制语言**

数据控制语言（Data Control Language, DCL）包括资源的分配与回收、用户与角色的创建与删除、权限的授权与回收，分为如下分类：

### CREATE 语句，用于创建租户、用户与角色

- [CREATE ACCOUNT](Data-Control-Language/create-account.md)
- [CREATE ROLE](Data-Control-Language/create-role.md)
- [CREATE USER](Data-Control-Language/create-user.md)

### DROP 语句，用于删除用户与角色

- [DROP ACCOUNT](Data-Control-Language/drop-account.md)
- [DROP USER](Data-Control-Language/drop-user.md)
- [DROP ROLE](Data-Control-Language/drop-role.md)

### ALTER 语句，修改租户、用户信息

- [ALTER ACCOUNT](Data-Control-Language/alter-account.md)
- [ALTER USER](Data-Control-Language/alter-user.md)

### GRANT 语句，对用户或角色进行授权操作

- [GRANT](Data-Control-Language/grant.md)

### REVOKE 语句，对用户或角色进行回收操作

- [REVOKE](Data-Control-Language/revoke.md)

## **Other - 管理语言**

管理语言包含与数据无直接关联的数据库参数、资源分配的获取与修改，包括如下语句种类：

### SHOW 语句

通过 SHOW 语句，获取信息：

- [SHOW DATABASES](Other/SHOW-Statements/show-databases.md)
- [SHOW CREATE TABLE](Other/SHOW-Statements/show-create-table.md)
- [SHOW CREATE VIEW](Other/SHOW-Statements/show-create-view.md)
- [SHOW CREATE PUBLICATION](Other/SHOW-Statements/show-create-publication.md)
- [SHOW TABLES](Other/SHOW-Statements/show-tables.md)
- [SHOW INDEX](Other/SHOW-Statements/show-index.md)
- [SHOW COLLATION](Other/SHOW-Statements/show-collation.md)
- [SHOW COLUMNS](Other/SHOW-Statements/show-columns.md)
- [SHOW FUNCTION STATUS](Other/SHOW-Statements/show-function-status.md)
- [SHOW GRANT](Other/SHOW-Statements/show-grants.md)
- [SHOW PROCESSLIST](Other/SHOW-Statements/show-processlist.md)
- [SHOW PUBLICATIONS](Other/SHOW-Statements/show-publications.md)
- [SHOW PITRS](Other/SHOW-Statements/show-pitrs.md)
- [SHOW ROLES](Other/SHOW-Statements/show-roles.md)
- [SHOW SEQUENCES](Other/SHOW-Statements/show-sequences.md)
- [SHOW SNAPSHOT](Other/SHOW-Statements/show-snapshot.md)
- [SHOW STAGE](Other/SHOW-Statements/show-stage.md)
- [SHOW SUBSCRIPTIONS](Other/SHOW-Statements/show-subscriptions.md)
- [SHOW VARIABLES](Other/SHOW-Statements/show-variables.md)

### SET 语句

通过 SET 语句用户可以对各类数据库参数进行调整，并通过 SHOW 命令呈现

- [SET ROLE](Other/Set/set-role.md)

### KILL 语句

中止某个数据库连接的语句：

- [KILL](Other/kill.md)

### USE 语句

用于连接某个已存在的数据库：

- [USE DATABASE](Other/use-database.md)

### Explain 语句

用于查看 SQL 执行计划：

- [Explain Analyze](Other/Explain/explain-analyze.md)

### PREPARE 语句

准备一条 SQL 语句并给它分配一个名称：

- [PREPARE](Other/Prepared-Statements/prepare.md)

### EXECUTE 语句

使用 PREPARE 准备好的语句名称并执行：

- [EXECUTE](Other/Prepared-Statements/execute.md)

### DEALLOCATE PREPARE 语句

释放使用 PREPARE 生成的预编译语句。在释放预编译语句后，再次执行预编译的语句会导致错误：

- [DEALLOCATE](Other/Prepared-Statements/deallocate.md)
