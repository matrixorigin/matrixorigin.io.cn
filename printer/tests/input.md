# **文档贡献指南**

欢迎对 MatrixOne 文档的提出贡献。MatrixOne 社区一直在努力简化整个贡献流程，为此，我们创建本节来一步步地指导您完成文档贡献的过程。

## **准备工作**

开始之前请尽量熟悉基本的 [Markdown](https://www.markdownguide.org/basic-syntax/) 语法并阅读[行为守则](../Code-Style/code-of-conduct.md)和[谷歌开发者文档风格指南](https://developers.google.com/style/)，以便您写出更高质量的文档。

## **文档管理逻辑**

MatrixOne 文档通过三个仓库来协调管理：

* [matrixorigin.io](https://github.com/matrixorigin/matrixorigin.io) 仓库包含英文文档的具体内容。（*. md* 文件）

* [matrixorigin.io.cn](https://github.com/matrixorigin/matrixorigin.io.cn) 仓库包含中文文档的具体内容。（*. md* 文件）

* [artwork](https://github.com/matrixorigin/artwork) 仓库包含了文档所用到的图像等非结构性文件。图像等非结构化文件则直接引用 `artwork` 仓库的网站链接，如：

```
https://github.com/matrixorigin/artwork/blob/main/docs/overview/overall-architecture.png?raw=true
```

`matrixorigin.io` 和 `matrixorigin.io.cn` 均部署了一个 CI 程序，当有新的代码被合并时将自动触发，将文档发布到我们的[官方文档网站](https://docs.matrixorigin.cn)。  
我们的文档是基于 [mkdocs-material](https://github.com/squidfunk/mkdocs-material) 组件进行开发的，您可以在此链接中了解更多信息。

## **文档内容架构**

MatrixOne 文档内容可以分为如下几个模块：

* **Overview**: MatrixOne 的简介，包含了产品特点、架构、设计思路和技术细节。

* **Getting Started**: 介绍如何在单机环境中快速部署和运行 MatrixOne。

* **Developing Guide**: 介绍如何在单机或分布式环境中深度使用 MatrixOne。

* **Deploying**: 介绍如何在部署和运行 MatrixOne 集群。

* **Maintenance**: 介绍如何运维 MatrixOne，包括备份与恢复数据等。

* **Migrating**: 介绍如何将数据从其他数据库迁移至 MatrixOne。

* **Testing**: 介绍如何在使用测试工具完成自测，或者对 MatrixOne 进行性能测试。

* **Troubleshooting**: 介绍如何对 MatrixOne 进行故障诊断。

* **Tuning Performance**: 介绍如何在单机或分布式环境中对 MatrixOne 进行性能调优。

* **Privilege**: 介绍 MatrixOne 集群下多租户管理、账号生命周期管理、授权等。

* **Reference**: 包括 SQL 参考指南、配置参数设置、使用限制等。

* **FAQs**: 关于产品、技术设计、SQL、部署的常见疑难问题。

* **Release Notes**: 所有版本的发布说明。

* **Contribution Guide**: 介绍如何为 MatrixOne 项目做出贡献。

* **Glossary**: 名词释义表。

## **简易的修改**

如果您发现了错别字或语法错误，可以点击本页面的 `Edit this Page` 按键直接进行修改。

## **一般工作流程**

当您需要更改文档的具体内容但不涉及章节顺序、架构组织的调整时，需要对 `matrixorigin.io/tree/main/docs/MatrixOne` 或 `matrixorigin.io.cn/tree/main/docs/MatrixOne` 进行操作。

!!! note
    若您在中英文两个仓库都做了修改，那么以上大部分操作都需要分别针对中英文两个仓库都执行一遍。

如果需要对章节顺序、架构组织进行调整时，需要对 `matrixorigin.io/blob/main/mkdocs.yml` 或 `matrixorigin.io.cn/blob/main/mkdocs.yml` 进行操作。

以下流程演示的是对二者均做修改的情况，实际情况可以根据您的需求进行简化。

**1.** 在 GitHub 上[对英文文档提出 Issue](https://github.com/matrixorigin/matrixorigin.io/issues/new/choose) 或[对中文文档提出 Issue](https://github.com/matrixorigin/matrixorigin.io.cn/issues/new/choose)，简单介绍您发现的问题。并且在 Issue 下面评论认领该问题。

**2.** Fork [matrixorigin.io](https://github.com/matrixorigin/matrixorigin.io) 和 [matrixorigin.io.cn](https://github.com/matrixorigin/matrixorigin.io.cn) 仓库。

**3.** 克隆 [matrixorigin.io](https://github.com/matrixorigin/matrixorigin.io) 和 [matrixorigin.io.cn](https://github.com/matrixorigin/matrixorigin.io.cn) 仓库。

- 克隆 [matrixorigin.io](https://github.com/matrixorigin/matrixorigin.io)：

```
git clone git@github.com:yourusername/matrixorigin.io.git
```

- 克隆 [matrixorigin.io.cn](https://github.com/matrixorigin/matrixorigin.io.cn)：

```
git clone git@github.com:yourusername/matrixorigin.io.cn.git
```

**4.** 在您的本地 *matrixorigin.io* 和 *matrixorigin.io.cn* 文件夹中将对应仓库添加为远程仓库。

- 在您的本地 *matrixorigin.io* 文件夹中添加 `matrixorigin.io` 为远程仓库：

```
git remote add upstream https://github.com/matrixorigin/matrixorigin.io.git
```

- 在您的本地 *matrixorigin.io.cn* 文件夹中添加 `matrixorigin.io.cn` 为远程仓库：

```
git remote add upstream https://github.com/matrixorigin/matrixorigin.io.cn.git
```

**5.** 本地的 *matrixorigin.io* 或 *matrixorigin.io.cn* 文件夹中将包含文档所需要的全部文件，因此您可以运行 `mkdocs serve` 命令，然后在 `http://localhost:8000` 网址中预览文档，检查整个项目文件是否可以正常运行，并且后续也可以检查您所做的修改是否正确。

```
mkdocs serve
```

**6.** 进行文档的修改和完善，如果您想对项目的设置进行改动，或者添加新的 page 来更新 sitemap，或更新 CI&CD 工作流代码，您也可以通过 `http://localhost:8000` 来查看您的修改是否有效。  

**7.** 确认修改无误后，使用 `git add .` 和 `git commit` 命令在本地提交修改，并推送至您 Fork 的远程仓库 `matrixorigin.io` 与 `matrixorigin.io.cn`。  
我们建议您推送至远程仓库的新分支：

```
git push origin main:NEW_BRANCH
```

**8.** 在 Github 上相应仓库的 `NEW_BRANCH` 分支提交 Pull Request。

**9.** 一旦您的修改通过，CI 工作流将开始运行并更新文档网站，这可能需要一些时间。

**10.** 最后，还有一些操作可以帮助保持您的远端仓库和本地仓库均保持一致。  

覆盖本地提交历史：

```
git pull --force upstream main:main
```

更新 Github 上的 `main` 分支：

```
git push --force origin main:main
```

!!! info 注意
    若您在中英文两个仓库都做了修改，那么以上大部分操作都需要分别针对中英文两个仓库都执行一遍。  

## **写一篇博文**

如果您有意写一篇关于 MatrixOne 的博文，请在 GitHub 上提出 [Issue](https://github.com/matrixorigin/matrixone/issues/new/choose)，或者将您的想法发送到 [dengnan@matrixorigin.io](mailto:dengnan@matrixorigin.io)，无论是简单的 Idea 还是完整的草案，我们统统接受。我们会尽快审查所有内容，如果您的文章或想法很契合我们的博客，我们会直接联系您。
