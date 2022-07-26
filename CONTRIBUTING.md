## 文档预览

文档的编写和渲染分 2 个仓库维护，markdown 文档见 [这里](https://github.com/matrixorigin/matrixone/tree/main/docs)。
当前仓库用于渲染 markdown 文档为 HTML。

> 基于 python 库 [mkdocs](https://www.mkdocs.org/getting-started/)，另搭配主题 [mkdocs-material](https://github.com/squidfunk/mkdocs-material)。

项目通过 `git submodule` 命令来管理当前项目和子模块的依赖关系。

### 下载代码

1. 如果是从零开始：

```bash
git clone --recurse-submodules git@github.com:matrixorigin/matrixorigin.io.cn.git
```

2. 如果使用的是 `git clone`, 需要额外执行子模块的初始化：

```
git clone git@github.com:matrixorigin/matrixorigin.io.cn.git
git submodule init
git submodule update --remote
```

3. 如果已下载, 需要更新到最新代码，可执行：

```
// 更新主项目 渲染文档
git remote update
git rebase upstream/main

// 更新子模块 文档内容
git submodule update --remote
// 然后提交, 因为子模块版本更新了, 主项目需要记录
git add .
git commit
```

### 安装依赖

```bash
pip install -r requirements.txt
```

> 提示：MkDocs 需要最新版本的 [Python](https://www.python.org/) 和 Python 包管理器 [pip](https://pip.readthedocs.io/en/stable/installing/) 才能安装在您的系统上。
> 查看是否安装成功, 可以通过 `pip list` 看 `mkdocs-material 8.2.8` 是否对应上。

### 启动服务

```bash
mkdocs serve
```

### 预览

打开浏览器访问 `http://127.0.0.1:8000/` 或 `localhost:8000`。

## 补充：同时修改文档和调整渲染样式

由于项目是通过 `git submodule` 来管理当前项目和子模块的依赖关系。
子模块也是一个 git 仓库，所以可以在当前项目中修改子模块代码并提交。
达成的效果即: 可以进行预览文档的修改，同时调整 HTML 样式布局，而不需要再保存一份子模块仓库代码。

对于主项目的修改提交方式不变, 下面介绍在子模块中所做的修改：

例如子模块在 `submodules` 下的 `matrixone` 中，进入这个路径，并做出修改, 例如增加一个文件：

```
cd submodules/matrixone
echo "test sub modify" > test.md
```

然后在子模块中正常进行提交。

> 注意子模块分支管理，注意子模块分支管理，注意子模块分支管理！！！
> 子模块默认是 `main` 分支

之后回到主项目目录下 `cd ../..`, 进行子模块更新后的操作。相当于之前介绍在主项目执行 `git submodule update --remote` 之后，提交子模块更新的操作。
