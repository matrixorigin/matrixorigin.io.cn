---
title: "CURTIME()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "CURTIME 及其同义词 CURRENT_TIME 返回当前服务器时间作为 TIME 值，可选择最高微秒精度的小数秒位数。"
---

# **CURTIME()**

> `CURTIME([fsp])` 及其同义词 `CURRENT_TIME([fsp])` 将当前服务器时间作为
> `TIME` 值返回，可选择指定 `fsp` 位小数秒（最高微秒精度）。

## 函数说明

`CURTIME()` 返回当前时间作为 `TIME` 值。`CURRENT_TIME()` 是 `CURTIME()`
的同义词。

如果给出了可选的小数秒精度 `fsp`，则结果以 `fsp` 位小数秒返回；否则不
返回小数部分。在绑定时未指定精度的情况下，默认结果类型使用标度 6。

## 函数语法

```
> CURTIME([fsp])
> CURRENT_TIME([fsp])
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| fsp | 可选。范围 `0` 到 `6` 的整数，指定结果中保留的小数秒位数。 |

## 示例

<!-- validator-ignore-exec -->
```sql
mysql> SELECT CURTIME();
+-----------+
| curtime() |
+-----------+
| 09:30:17  |
+-----------+

mysql> SELECT CURRENT_TIME(3);
+-----------------+
| current_time(3) |
+-----------------+
| 09:30:17.412    |
+-----------------+
```
