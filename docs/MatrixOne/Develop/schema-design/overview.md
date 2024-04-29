# 数据库模式设计概述

本篇文章简要概述了 MatrixOne 的数据库模式。本篇概述主要介绍 MatrixOne 数据库相关术语和后续的数据读写示例。

## 关键术语 - 数据库模式

数据库模式 (Schema)：本篇文章所提到的**数据库模式**等同于逻辑对象*数据库*，与 MySQL 一样，不做区分。

## 数据库 Database

MatrixOne 数据库或 MatrixOne Database，为表的集合。

你可以使用 `SHOW DATABASES;` 查看 MatrixOne 所包含的默认数据库。你也可以使用 `CREATE DATABASE database_name;` 创建一个新的数据库。

## 表 Table

MatrixOne 所指的表或 Table，从属于 MatrixOne 的某个数据库。

表包含数据行。每行数据中的每个值都属于一个特定的列。每列都只允许单一数据类型的数据值。

## 索引 Index

索引是一种数据结构，用于快速查找数据库表格中的数据。它可以看作是一本*目录*，包含有关表格中各行数据的指针，使得查询可以更快速地定位到满足特定条件的数据。

数据库中常用的索引类型包括主键索引、次级索引等。其中，唯一索引用于保证特定列或列组合的唯一性，普通索引用于提高查询性能，全文索引则用于在文本数据中进行全文检索。

索引有两种常见的类型，分别为：

- Primary Key：主键索引，即标识在主键列上的索引，主键索引用于唯一标识表格中的每一行数据。
- Secondary Index：次级索引，即在非主键上标识的索引，次级索引也称为非聚集索引（non-clustered index），用于提高查询性能和加速数据检索。

## 其他对象

MatrixOne 支持一些和表同级的对象：

- 视图：视图是一张虚拟表，该虚拟表的结构由创建视图时的 SELECT 语句定义，MatrixOne 暂不支持物化视图。
- 临时表：临时表是数据不持久化的表。

## 向量

MatrixOne 现在支持存储和查询向量。向量是通常由 AI 模型（如大型语言模型）生成的数字列表。

更多信息，参见[向量](../Vector/vector_type.md)

## 访问控制

MatrixOne 支持基于用户或角色的访问控制。你可以通过角色或直接指向用户，从而授予用户查看、修改或删除数据对象和数据模式的权限。

更多信息，参见 [MatrixOne 中的权限控制](../../Security/role-priviledge-management/about-privilege-management.md)。
