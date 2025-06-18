# TypeScript 连接

MatrixOne 支持 TypeScript 连接。

本篇文档将指导你了解如何使用 TypeScript 连接 MatrixOne。

## 开始前准备

- 已完成[安装并启动 MatrixOne](../../Get-Started/install-standalone-matrixone.md)

- 已安装 [MySQL Client](https://dev.mysql.com/downloads/installer/)

## 使用 TypeScript 连接 MatrixOne 服务

### 步骤一：创建项目目录并初始化

```bash
mkdir ts-mo-demo
cd ts-mo-demo
npm init -y
```

### 步骤二：安装依赖

```bash
npm install mysql2
npm install --save-dev typescript @types/node ts-node
```

### 步骤三：初始化 TypeScript 项目

```
npx tsc --init
```

### 步骤四：创建代码文件夹和文件

```bash
mkdir src
touch src/index.ts
```

### 步骤五：连接 Matrixone

```ts
//src/index.ts
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '111',
    port: 6001
  });

  try {
    console.log('连接成功');
  } catch (e) {
    console.error('连接失败', e);
  } finally {
    await connection.end();
  }
}

main();
```

### 步骤四：运行程序

```bash
(base) admin@admindeMacBook-Pro ts-mo-demo % npx ts-node src/index.ts                     
连接成功
```

## 参考文档

关于使用 TypeScript 通过 MatrixOne 构建一个简单的 CRUD 的示例，参见 [TypeScript 基础示例](../../Tutorial/typescript-crud-demo.md)。
