.PHONY: verify gov spec dev storybook build test lint

## 一键运行本地全量验证门禁（Agent 提交前必跑）
verify:
	./scripts/verify.sh

## 仅运行架构与工程治理检查（无需依赖安装，毫秒级）
gov:
	./scripts/check-governance.sh

## 创建新的可执行特性规格书: make spec title="user-auth"
spec:
	@if [ -z "$(title)" ]; then echo "Usage: make spec title=<kebab-case-name>"; exit 1; fi
	./.agents/skills/spec-driven-feature/scripts/new-spec.sh "$(title)"

## 并行启动 NestJS 后端与 React 前端
dev:
	pnpm dev

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint
