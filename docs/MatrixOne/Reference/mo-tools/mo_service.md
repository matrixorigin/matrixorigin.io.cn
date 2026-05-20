---
title: "mo-service profiling 参数"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: true
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "mo-service 暴露 --block-profile-rate 和 --mutex-profile-fraction 命令行参数，驱动 Go runtime 的 block 和 mutex profiler，用于对 /debug/pprof 端点进行持续性能分析。"
---

# **mo-service profiling 参数**

> 从 v3.0.12 开始，`mo-service` 接受 `--block-profile-rate` 和
> `--mutex-profile-fraction` 命令行参数，驱动 Go runtime 的 block 和 mutex
> profiler，可通过 `--debug-http` 暴露的 `/debug/pprof/block` 和
> `/debug/pprof/mutex` 端点获取数据。

`mo-service` 是运行 MatrixOne 节点的可执行文件。从 v3.0.12 开始，
`mo-service` 接受两个命令行参数来启用 Go runtime 的 block 和 mutex
profiler。它们适用于持续性能分析方案（例如通过 `--debug-http` 暴露的
`/debug/pprof/block` 和 `/debug/pprof/mutex` 端点进行 Pyroscope 或
`go tool pprof` 收集）。

传入 `0` 可以禁用任意参数。

## 参数

| 参数 | 默认值 | 作用 |
| ---- | ---- | ---- |
| `--block-profile-rate` | `5` | 控制报告在 block profile 中的 goroutine 阻塞事件比例。内部调用 Go 的 `runtime.SetBlockProfileRate(rate)`。`0` 禁用 block profile。推荐值：生产环境 `100`，调试环境 `1`。 |
| `--mutex-profile-fraction` | `100` | 控制报告在 mutex profile 中的互斥锁竞争事件比例。内部调用 Go 的 `runtime.SetMutexProfileFraction(rate)`。`0` 禁用 mutex profile。推荐值：生产环境 `100`，调试环境 `1`。 |

在启动时设置正值后，`mo-service` 会记录类似 `Block profiling enabled with
rate: 5` 或 `Mutex profiling enabled with fraction: 100` 的日志行。

## 示例

```bash
# 启用两种 profiler，使用调试级别的粒度，同时保持 HTTP
# debug server 可用以进行 pprof 收集。
mo-service \
  --cfg etc/launch-with-dnservice/cn.toml \
  --debug-http 0.0.0.0:12345 \
  --block-profile-rate 1 \
  --mutex-profile-fraction 1
```

## 参考

- `--debug-http`：Go pprof HTTP 处理器的监听地址。
- `--profile-interval`：周期性 profile 轮换的时间间隔。
