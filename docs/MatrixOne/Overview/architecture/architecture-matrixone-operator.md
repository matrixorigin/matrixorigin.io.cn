# Matrixone-Operator 设计与实现详解

MatrixOne 是一款云原生分布式数据库，天然适应云基础设施并面向云的成本模型进行优化。而与一般的 SaaS 服务不同，出于对性能和数据安全的需求，在严肃场景下数据库往往需要跟着应用走，与应用运行在相同的基础设施上。为了服务尽可能多的用户，MatrixOne 需要适配各类公有云、私有云乃至混合云。而其中的最大公约数正是 Kubernetes（下文简称 K8S）。因此，MatrixOne 将 K8S 作为分布式部署时的默认运行环境，以统一方式适配不同的云。
MatrixOne-Operator 正是 MatrixOne 在 K8S 上的自动化部署运维软件，它扩展 K8S，以 K8S 风格的声明式 API 对外提供 MatrixOne 集群的运维管理能力。

这篇文章将解读 MatrixOne-Operator 的设计与实现，并分享我们的经验思考。

## MatrixOne-Operator 设计

尽管 K8S 原生提供了 StatefulSet API 来服务有状态应用的编排，但由于不同有状态应用的应用层状态难以进行统一抽象，因此 K8S 原生并不支持管理应用状态。为了解决这一问题，Operator 模式应运而生。一个典型的 K8S Operator 由 API 和控制器 (Controller) 两部分构成：

- API

通常通过 K8S 的 CustomResourceDefinition（CRD）对象进行声明，在提交一个 K8S CRD 到 K8S 的 api-server 后，api-server 就会在自身注册一个对应的 Restful API。所有的 K8SClient 都能以类似操作原生资源的方式对这个新声明的 API 进行 GET,LIST, POST, DELETE 等操作。按照惯例，每个 API 对象内的，`.spec` 结构由用户管理，用于声明对象的期望状态，`.status` 结构则由下文的控制器管理，用于对外暴露对象的实际状态。

- 控制器

控制器是一段持续运行的代码，它监视 (watch) 一系列 K8S 对象，包括我们刚刚定义的 API 对象。然后，根据这些对象的期望状态和从现实中收集到的实际状态（注意：这里的实际状态是从现实中收集到再写进 `.status` 的，而不是直接来自 `.status`）执行自动化操作，驱动实际状态向期望状态转移。这个过程会持续循环进行，被形象地称作“控制循环”（control loop），有些地方也会用一个更具古典乐风味的词“调谐循环”(reconciliation loop)，巧妙地和 K8S 的“编排”(Orchestration) 一词保持了风味统一。

下图以简化后的 MatrixOneCluster API 作为例子，概括性地描述了这个过程：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/mo-op-1.png width=70% heigth=70%/>
</div>

MatrixOne-Operator 不仅提供 MatrixOneCluster 这样用于管理 MO 集群的负载型 API，还提供备份恢复这样的任务型 API 和对象存储桶这样的资源型 API。每种 API 和它们的控制器在设计时都有独特的考量，但万变不离其宗，所有的 API 和控制器都是以上述模式进行构建的。接下来，我们将继续探索每个 API 设计中的取舍。

## 集群 API 设计

一个分布式 MO 集群由日志服务、事务节点、计算节点和 Proxy 等多个组件组成，其中计算节点还有明确的异构需求来实现针对负载的机型优化和跨云、云边一体等能力。将整个集群的管理都集中到一个 API 对象中声明再使用一个控制器进行管理虽然便于使用，但却是代码维护的噩梦。因此，MatrixOne-Operator 在设计之初就明确了**松耦合的细粒度 API** 这一原则，设计了 LogSet,CNSet,ProxySet,BucketClaim 等职责明确的 API 和彼此独立的控制器。为了保持易用性，又引入了 MatrixOneCluster API。负责 MatrixOneCluster 控制器不重复其他控制器的工作——当一套集群需要一个 LogSet 提供日志服务时，MatrixOneCluster 控制器仅仅是创建一个 LogSet 对象，其余的工作则委托给 LogSet 控制器。

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/mo-op-2.png width=60% heigth=60%/>
</div>

在这样的设计下，虽然 API 很多，但用户始终只需要关心 MatrixOneCluster API，而 MatrixOne-Operator 的开发者也在添加特性或解决问题时，问题域也往往不大于一个细粒度的 API 和控制器。

当然，多个 API 对象间会有某些依赖关系，比如事务节点和计算节点都依赖运行于日志服务中的 HAKeeper 来获取集群信息进行服务发现。这要求部署集群时首先启动日志服务并完成 HAKeeper 的 bootstrap 才能继续启动事务节点和计算节点。这类逻辑固然可以由 MatrixOneCluster 控制器实现，但这也意味着泄露了其他控制器的业务知识，各个控制的实现仍然产生了耦合。因此，在 mo-operator 中，我们将所有组件间产生依赖的业务逻辑都在依赖方进行实现，被依赖方仅仅通过约定俗成的 `.status` 字段对外暴露自身状态。举例来说，控制器在调谐一个 CNset 时，会主动等待 CNSet 指向的 LogSet 就绪再进行后续操作，而 LogSet 控制器和上层的 MatrixOneCluster 控制器都不需要感知到这件事。

松耦合细粒度的 API 能够很好地适应 CN 的异构编排场景。在 MatrixOne-Operator 中，除了在 MatrixOneCluster 中声明多个 CN 组来进行异构编排这种便捷用法之外，还能直接创建一个 CNSet 来加入现有集群，这意味着新的 CNSet 可以部署在另一套 K8S 集群中，配合网络层面的支持，就能进行跨云或云边场景下的 MO 编排。

在各个控制器的迭代过程中，MatrixOne-Operator 也倾向于通过添加新的 API 对象来添加新特性。比如，在实现对象存储管理时，MatrixOne-Operator 需要保证不同集群使用的对象存储路径之间没有交集并且在集群销毁后自动清理。MatrixOne-Operator 的解决方案就是新增一个 BucketClaim API，参考 K8S PersistentVolumeClaim 的控制逻辑，在独立的控制器中完成一个对象存储路径的生命周期管理，避免复杂的竞态条件处理和代码耦合问题。

## 控制器实现

K8S 提供了 controller-runtime 包帮助开发者实现自己的控制器，但为了通用性，接口设计是相对底层的：

```
Reconcile(ctx context.Context, req Request)(Result, error)
```

控制器需要实现 Reconcile 接口，再通过 controller-runtime 的接口进行注册，声明要监听的对象以及一些监听的过滤规则，controller-runtime 就会在每次对象发生变化或者重试 Reconcile 时调用控制器的 Reconcile 方法，并在 req 参数中传入目标对象的标识符。这个接口内会存在不少模板代码，用伪代码来表示通常是：

```
func 调谐(对象 A 的 Namespace+Name) {
  获取对象 A 的Spec
  if 对象 A 正在被删除 {
    执行清理逻辑
    更新清理进度到 A.status
    移除对象 A 上的 finalizer
  } else {
    为 A 添加 finalizer
    执行调谐逻辑
    更新调谐进度到 A.status
  }
}
```

类似的逻辑在各种社区控制器实现中反复出现，并且开发者需要关心很多业务之外的内容：正确地处理 finalizer 以确保资源不会泄露、将进度和错误及时更新到 status 中来提升可见度以及更细节的 logger 需要带 context 和 kubeClient 需要带 cache 等问题。

由于不需要考虑通用性，MatrixOne-Operator 内进行了更特化的抽象，设计了 Actor 接口：

```
type Actor[T client.Object] interface {  
    Observe(*Context[T]) (Action[T], error)  
    Finalize(*Context[T]) (done bool, err error)  
}

type Action[T client.Object] func(*Context[T]) error
```

在背后，通用的控制器框架逻辑会处理好所有类似上文模板代码的逻辑和细节，在 Context[T] 内准备好当前需要 reconcile 的对象和已经处理好上下文的 Logger, EventRecorder, KubeClient 对象。最后：

- 在调谐一个未被删除的对象时，调用 Actor.Observe 让真正的业务逻辑执行调谐；

- 在调谐一个删除中对象时，调用 Actor.Finalize 执行业务逻辑内的资源清理行为，不断重试，直到 Finalize 返回完成，才移除对象的 finalizer。

一个对象的状态机如下：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/mo-op-3.png width=70% heigth=70%/>
</div>

在这个流程下，一个控制器对 API 对象生命周期管理中的创建和销毁两部分的实现非常直白。无非是结合 MO 的运维知识，调用 K8S 的 API 申请存储、部署工作负载、配置服务发现；或是反过来，在 API 处于删除阶段时，将创建的外部资源全部销毁。对象的更新后的调谐操作也是常规的 diff 逻辑，以 MatrixOneCluster 的。cnSets 字段为例，调谐流程可以用下面的伪代码表示：

```
func sync(c MatrixOneCluster) {
  existingCNSets := 收集这个集群的所有CNSet
  for _, desired := range c.spec.CNSets {
    cnSet := 构建CNSet(desired)
    if _, ok := existingCNSets[cnSet.Name]; ok {
      // 1. CNSet 存在，更新 CNSet
      ....
      // 2. 标记这个 cnSet 是期望状态中需要的
      delete(existingCNSets, cnSet.Name)
    } else {
      // CNSet 不存在，创建
      ....
    }
  }
  for _, orphan := range existingCNSets {
    // 对于实际存在但期望状态中不存在的 CNSet，进行清理
  }
}
```

比较容易出错的是 ConfigMap / Secret 的更新逻辑，MO 和很多应用一样，需要配置文件并且每次配置更新时需要重启重新读取配置，而配置文件通常用 K8S 原生的 ConfigMap 对象进行存储。有一个容易踩坑的地方在于 ConfigMap 对象的内容是可变的，而大部分应用往往只在启动时读取一次 ConfigMap 内的配置文件，后续不会再 reload。因此，查看 Pod 当前引用的 ConfigMap 内的内容并不能确定 Pod 目前使用的配置（有可能在启动后 ConfigMap 内容发生了变化）。另外，假如想在 ConfigMap 变化后滚动更新应用，一个常见的做法是将 ConfigMap 的内容做一个 Hash 填到 PodTemplate 的 Annotation 中，每次更新 ConfigMap 变化后更新这个 Annotation 触发应用的滚动更新。但这种做法也会因为原地修改 ConfigMap 而出现非预期的情况：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/mo-op-4.png width=70% heigth=70%/>
</div>

以上图为例，假设 Annotation 中的 ConfigMap Hash 从 123 更新成了 321，而 321 启动后因为 ConfigMap 配置有问题而无法 Ready，这时候在合适的策略配置下，滚动更新会卡住避免故障范围扩大。然而，尚未更新的 Pod 内也已经读到了新版本的 ConfigMap，只要发生一次容器重启或 Pod 重建，就会立刻发生问题。这和更新镜像或其他字段的行为显然不一样，更新其他字段时，绿色的 Pod 还属于旧的 ReplicaSet/ControllerRevision，重启或重建都不会使用新版本的配置启动，故障范围是可控的。

问题的根源在于 ConfigMap 的内容并不在 Pod 的 spec 内，直接修改 ConfigMap 的内容和 Pod 的**不可变基础设施**原则是冲突的。

因此，MatrixOne-Operator 中将所有 Pod 内会引用的对象都设计成不可变的，以 ConfigMap 为例，每次通过 CRD 更新某个组件的配置，MatrixOne-Operator 都会生成一个新的 ConfigMap 并将组件的所有副本滚动更新到这个新的 ConfigMap 上：

<div align="center">
<img src=https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/overview/architecture/mo-op-5.png width=70% heigth=70%/>
</div>

基于这个原则，任意时刻我们都可以通过当前的 Pod Spec 明确所有 Pod 内的信息。滚动更新的问题也迎刃而解。

## 应用状态管理

除了应用本身的生命周期管理外，MatrixOne-Operator 还有一个重要职责是管理应用本身的状态。但是，分布式系统通常都会基于心跳或类似的机制管理自身的应用状态，为什么 Operator 中还要多此一举呢？

原因在于 Operator 的代码内拥有关于自动化运维的知识，比如 Operator 明确地知道在滚动更新过程中接下来哪一个 Pod 要被重建/重启了。因此可以提前调整应用内的状态，比如将 Pod 上的负载进行迁移，最小化滚动更新的影响。这类应用状态的管理逻辑有两种常见的实现方式：

- 借助 Pod 本身的各类生命周期钩子，比如 InitContainer、PostStart Hook 和 PreStop Hook，在这些钩子内同步应用状态。

- 在 Operator 的调谐循环内调用应用接口调整应用状态。

方式一实现起来比较简单，方式二更自活自由，能更好地应对复杂场景。举个例子，在缩容 CNSet 时，要先将被缩容的 CN Pod 上的 session 迁移到其他 CN Pod 上再停止 CN Pod。假如这个操作放在 Pod PreStop Hook 中，那就是无法撤销的。而实际场景中，确实存在一组 CN 先被缩容，在缩容完成前又再扩容上去的场景（尤其是在开启了自动伸缩后），这时候，Operator 内的调谐循环就可以计算出此时可以直接复用仍然在下线中的 CN，调用 MO 内部的管理接口将 CN 将这个 CN 重新恢复成服务状态，不再向其他 CN 迁移 session 并且重新向 Proxy 接受新 session，而不需要再扩容出一个新的 CN。

## 总结

作为扩展 K8S 编排能力的主流选项，Operator 模式发展到今天已经拥有成熟的基础库和工具链，社区中也有大量的成熟开源项目可供参考，在 K8S 上开发一个 Operator 已经不再是一个新鲜的话题。但真正的复杂度永远藏在实际业务的细节中，解决这些问题需要对结合对 K8S 和自身业务系统领域知识的充分理解。MatrixOne 作为一款云原生分布式数据库，其中很多设计理念和领域知识与其他云原生系统存在共通之处。希望这篇短文不仅能帮助你了解 mo-operator 的设计实现，也能给你在设计自己的 Operator 时提供经验参考。

## 参考文档

若如想要了解关于 MatrixOne-Operator 的部署运维，请参见章节 [Operator 管理](../../Deploy/MatrixOne-Operator-mgmt.md)
