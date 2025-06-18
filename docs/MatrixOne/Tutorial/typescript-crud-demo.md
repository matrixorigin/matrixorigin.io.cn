# TypeScript 基础示例

本篇文档将指导你如何使用 **TypeScript** 构建一个简单的应用程序，并实现 CRUD（创建、读取、更新、删除）功能。

**TypeScript** 是由微软开发的一个 JavaScript 的超集（superset），它在 JavaScript 的基础上添加了静态类型系统和一些面向对象编程的特性，目标是让开发大型应用变得更可靠、更易维护。

## 开始前准备

### 软件安装

在你开始之前，确认你已经下载并安装了如下软件：

- 确认你已完成[单机部署 MatrixOne](../Get-Started/install-standalone-matrixone.md)。

- 确认你已完成安装 MySQL 客户端。

### 环境配置

1. 创建项目目录并初始化

    ```bash
    mkdir ts-mo-demo
    cd ts-mo-demo
    npm init -y
    ```

2. 安装依赖

    ```bash
    npm install mysql2
    npm install --save-dev typescript @types/node ts-node
    ```

3. 初始化 TypeScript 项目

    ```
    npx tsc --init
    ```

4. 创建代码文件夹和文件

    ```bash
    mkdir src
    touch src/index.ts
    ```

## 编写 TypeScript 连接 MatrixOne

```ts
// src/index.ts
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '111',
    port: 6001,
    database: 'example_db',
    multipleStatements: true
  });

  try {

    // . 创建表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100)
      )
    `);
    console.log('表创建成功');

    // 2. 插入数据
    await connection.query(`INSERT INTO users (name, email) VALUES (?, ?)`, ['Alice', 'alice@example.com']);
    await connection.query(`INSERT INTO users (name, email) VALUES (?, ?)`, ['Bob', 'bob@example.com']);
    console.log('数据插入成功');

    // 3. 修改数据
    await connection.query(`UPDATE users SET email = ? WHERE name = ?`, ['alice@newmail.com', 'Alice']);
    console.log('数据修改成功');

    // 4. 删除数据
    await connection.query(`DELETE FROM users WHERE name = ?`, ['Bob']);
    console.log('数据删除成功');

    // 5. 查询数据
    const [rows] = await connection.query(`SELECT * FROM users`);
    console.log('查询结果：', rows);
  } catch (error) {
    console.error ('出错了：', error);
  } finally {
    await connection.end();
    console.log ('数据库连接关闭');
  }
}

main();

```

## 运行脚本

```bash
base) admin@admindeMacBook-Pro ts-mysql-demo % npx ts-node src/index.ts
表创建成功
数据插入成功
数据修改成功
数据删除成功
查询结果：[ { id: 1, name: 'Alice', email: 'alice@newmail.com' } ]
数据库连接关闭
```