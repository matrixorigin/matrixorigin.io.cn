# 贡献指南

我们诚挚地欢迎任何人为 MatrixOne 文档做出贡献。同时，我们的社区也致力于简化贡献流程，使其简单易行。

## 贡献类型

我们鼓励您通过以下方式为 MatrixOne 文档做出贡献：

- 如果您发现文档中存在任何过时、模糊或者错误的地方，请[创建一个 Issue](https://github.com/matrixorigin/matrixorigin.io.cn/issues/new/choose) 来告知我们。您还可以提出在浏览文档时遇到的有关网站本身的任何问题。
- 对于显而易见的问题，如拼写错误或链接失效，您可以直接[创建一个 Pull Request](https://github.com/matrixorigin/matrixorigin.io.cn/compare) 进行修复。
- 欢迎查看我们的 [Issue 列表](https://github.com/matrixorigin/matrixorigin.io.cn/issues)，看看是否有您感兴趣的问题。您可以通过在 Issue 下方评论来参与讨论，或者创建 Pull Request 的方式来解决它们。

创建 Issue 通常是对文档发起改动的第一步，如果您不知道该如何开始，请直接创建 Issue 来告知我们您的想法。

## 创建 Pull Request

### Fork 仓库

您需要先 Fork 本仓库至您的 GitHub 账户下，然后再进行修改。Fork 是您在 GitHub 上创建的一个副本，您可以在其中进行任何修改，而不会影响到原始仓库。您可以查阅[ GitHub 官方文档](https://guides.github.com/activities/forking/)以了解更多关于 Fork 的信息。

### 本地开发环境搭建

#### 克隆仓库

在本地进行开发之前，您需要将 Fork 的仓库克隆到本地。

```bash
# 您需要将此处的 YOUR_USERNAME 替换为您的 GitHub 用户名
git clone git@github.com:YOUR-USERNAME/matrixorigin.io.cn.git

# 将该仓库设置为您的 Fork 的上游仓库
git remote add upstream git@github.com:matrixorigin/matrixorigin.io.cn.git
```

#### 安装依赖

本仓库使用 [Material for MkDocs](https://squidfunk.github.io/mkdocs-material) 作为文档框架。您需要先安装 Python 3.10+ 和 pip，然后执行以下命令安装依赖：

```bash
pip install -r requirements.txt
```

安装成功后，可通过 `pip list` 查看 `mkdocs-material` 是否对应 `requirements.txt` 中指定的版本。

为保障文档的一致性，我们使用了多种工具对 `markdown` 文档进行格式校验，这些工具依赖 Node.js 运行。您需要使用 [pnpm](https://pnpm.io/) 安装运行这些工具所需的依赖：

```bash
pnpm i --frozen-lockfile
```

#### 运行本地开发服务器

1. 运行 `mkdocs serve` 命令，启动本地开发服务器。
2. 在浏览器中打开 `http://localhost:8000`，即可预览文档网站。
3. 您可以在本地开发服务器运行的情况下，对 `markdown` 文档进行修改并保存，网页将会自动更新以展示被修改后的效果。

### Pull Request 流程

#### 创建分支

在本地仓库中，您需要创建一个新的分支来进行修改。我们对分支的命名并无严格要求，但请尽量精确地概括您的修改内容，以便于我们更好地理解您的意图。

```bash
git checkout -b fix/feature-overview-typo
```

#### 运行校验工具

在创建 Pull Request 之前，我们推荐您事先在本地运行校验工具，以确保您的修改符合文档要求。

```bash
# 运行校验
pnpm lint

# 运行校验并自动修复部分问题
pnpm lint:fix
```

#### 提交 Pull Request

在完成上述步骤并将修改提交至 Fork 后，您便可为其提交 Pull Request。在提交 Pull Request 时，请按照我们提供的模板填写相关信息，以便于我们更好地理解您的修改。

在提交 Pull Request 后，我们的 CI 会自动运行校验工具，以确保您的修改符合文档要求。如果校验失败，您可以通过在本地运行校验工具并修复问题后，将修改追加提交至相应分支。

您的 Pull Request 将由我们的文档维护者进行审核，在被维护者 Approve 后，我们将会将其合并至 `main` 分支，并在后续的发布中将其更新至文档网站。
