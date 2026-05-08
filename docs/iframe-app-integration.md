# iframe 应用接入指南

## 概述

扬光AI商城支持通过 **iframe 内嵌** 方式接入第三方 Web 应用。商城会将用户身份令牌传递给应用，应用可自行验证身份并调用商城后端 API。

---

## 接入流程

### 1. 在商城后台添加应用

管理员在应用管理中创建应用，接入模式选择 **iframe**，填写应用访问地址（`access_url`）。

### 2. 用户打开应用

用户在「我的应用」中点击应用图标，商城前端会在 iframe 中加载该地址，并自动附加认证参数：

```
{access_url}?token={JWT_TOKEN}&app_id={APP_ID}
```

示例：

```
https://myapp.example.com/dashboard?token=eyJhbGciOiJIUzI1NiIs...&app_id=5
```

---

## 身份认证

### Token 解码

商城使用 **JWT (HS256)** 签发 token，应用收到后需解码验证。

**JWT 配置：**

| 参数 | 值 |
|------|-----|
| 算法 | HS256 |
| 密钥 | `ygkj-ai-market-secret-key-2026` |
| 过期时间 | 24 小时 |

**Token Payload 结构：**

```json
{
  "user_id": 1,
  "role": "admin",
  "exp": 1778251230
}
```

### Token 验证示例

```python
import jwt

SECRET_KEY = "ygkj-ai-market-secret-key-2026"

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload  # {"user_id": 1, "role": "admin"}
    except jwt.ExpiredSignatureError:
        raise Exception("Token 已过期")
    except jwt.InvalidTokenError:
        raise Exception("Token 无效")
```

```javascript
// 前端验证示例
function parseToken(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}
```

---

## API 对接

iframe 应用可通过商城后端 API 获取用户信息等数据。

### 基础地址

```
http://localhost:12402/api/v1
```

### 请求头

所有 API 请求需在 Header 中携带 token：

```
Authorization: Bearer {JWT_TOKEN}
```

### 可用接口

#### 获取当前用户信息

```
GET /auth/me
```

**响应：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "display_name": "系统管理员",
    "department": "IT部",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-05-07T13:12:23"
  }
}
```

#### 获取应用市场列表

```
GET /market/apps
```

#### 获取已安装应用

```
GET /market/installed
```

#### 安装应用

```
POST /market/apps/{app_id}/install
```

#### 卸载应用

```
DELETE /market/apps/{app_id}/install
```

#### 获取 AI 对话列表

```
GET /ai/sessions
```

所有接口响应结构一致：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

错误时：

```json
{
  "code": 401,
  "message": "未登录",
  "data": null
}
```

---

## 开发注意事项

1. **跨域问题**：商城后端已配置 CORS，允许 `http://localhost:12400` 和 `http://127.0.0.1:12400` 来源。生产环境需调整 `CORS_ORIGINS`。
2. **Token 刷新**：Token 有效期为 24 小时。应用若收到 401 响应，应提示用户重新登录。
3. **iframe 高度**：商城将 iframe 设置为 `calc(100vh - 200px)`，自适应剩余空间。
4. **安全性**：密钥 `JWT_SECRET_KEY` 生产环境应通过环境变量配置，勿硬编码。
