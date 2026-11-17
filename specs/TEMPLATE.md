# Spec {{SPEC_ID}}: {{FEATURE_NAME}}

- **Status**: Draft | Approved | Implemented
- **Created**: {{DATE}}

## 1. 背景与业务目标 (Problem & Goals)

- **解决什么问题**：
- **核心目标**：

## 2. 明确不做什么 (Non-Goals)

- 

## 3. 共享契约设计 (`@repo/contracts`)

- **新增/变更 Schema**：
- **请求/响应示例**：
- **业务错误码 (`ErrorCode`)**：

## 4. 全栈分层实现方案

### 4.1 后端 (`@repo/api` - NestJS)
- **路由与权限**：
- **核心业务不变量 (Service)**：
- **存储/仓储变更 (Repository)**：

### 4.2 前端 (`@repo/web` - React)
- **组件与状态拆分 (`features/<domain>/`)**：
- **交互三态（Loading / Empty / Error）**：

## 5. 边界条件与异常矩阵 (Edge Cases)

| 场景 | 预期行为 / HTTP 状态码 | 错误码 (`ErrorCode`) |
| :--- | :--- | :--- |
| 非法入参 / 空字符串 | `400 Bad Request` | `VALIDATION_ERROR` |
| 资源不存在 | `404 Not Found` | `<DOMAIN>_NOT_FOUND` |

## 6. 验收标准与验证计划 (Acceptance Criteria)

- [ ] `@repo/contracts` Schema 单测覆盖合法与非法边界输入
- [ ] `@repo/api` Service 单测覆盖正常流转与领域错误码
- [ ] `@repo/web` 组件测试覆盖渲染与关键用户交互
- [ ] `./scripts/verify.sh` 全绿通过
