# 密码管理

为了保护用户密码的安全，MatrxiOne 支持密码管理能力：

- 密码复杂度策略：要求用户设置强密码，以防止出现空密码、弱密码。

## 密码复杂度策略

- 复杂度：大写字母、小写字母、数字与特殊符号。
- 长度：不少于 12 位。

## 修改密码权限

- 系统管理员用户（即 root 用户）：拥有最高权限。可以修改 root 用户自己的密码以及 root 用户所创建的租户的密码。
- 租户：拥有仅次于系统管理员的权限。可以修改租户自己的密码以及租户所创建的的普通用户的密码。
- 其他普通用户：仅可以修改普通用户自己的密码。

有关权限级别的更多信息，可参考 [MatrixOne 权限分类](../Reference/access-control-type.md)。

## 修改密码教程

### root 用户修改密码

#### root 用户修改自己的密码

启动的 MatrixOne 并使用 root 账号登录成功后，你可以使用下面的命令修改密码：

```sql
mysql> alter user root identified by '${your password}'
```

修改完成后，退出当前会话，再次登录 MatrixOne 新密码生效。

!!! note
    由于 root 账号默认是具有最高权限的用户，请使用初始账号密码登录后及时修改密码。

#### root 用户修改租户的密码

参考 [ALTER ACCOUNT](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)

### 其他用户修改密码

#### 租户修改自己的密码

参考 [ALTER ACCOUNT](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)

#### 租户修改自己创建的其他用户的密码

参考 [ALTER USER](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)

#### 普通用户修改自己的密码

参考 [ALTER USER](../Reference/SQL-Reference/Data-Control-Language/alter-account.md)
