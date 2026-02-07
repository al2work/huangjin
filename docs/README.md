# huangjin.xin - 实时黄金价格展示网站

本项目旨在构建一个面向中国市场的实时黄金价格查询平台。

## 文档导航

本文档目录包含项目的核心需求和技术设计：

- [产品需求文档 (PRD)](./product-requirements.md): 详细描述了产品功能、用户角色、界面设计和核心流程。
- [技术架构文档 (Technical Architecture)](./technical-architecture.md): 阐述了技术栈选择、系统架构、API 设计及数据策略。

## 快速开始 (计划中)

项目将采用 Next.js + React + Tailwind CSS 构建。

1. **环境准备**: 确保已安装 Node.js 18+。
2. **安装依赖**: `npm install`
3. **启动开发服务器**: `npm run dev`

更多开发细节请参考技术架构文档。

## 部署

### Vercel 部署 (推荐)
本项目已针对 Vercel 进行优化，直接连接 GitHub 仓库即可自动部署。

### Docker 部署

我们支持两种 Docker 网络模式部署：

1.  **Bridge 模式 (默认)**: 使用 Docker 默认网桥，通过端口映射访问。
    ```bash
    # 一键部署 (端口映射 3000:3000)
    make deploy
    ```

2.  **Host 模式**: 直接使用宿主机网络栈 (性能更好，无需端口映射)。
    ```bash
    # 一键部署 (Host 网络模式)
    make deploy-host
    ```

**常用命令：**

*   `make build`: 仅构建镜像
*   `make run`: 运行容器 (Bridge)
*   `make run-host`: 运行容器 (Host)
*   `make stop`: 停止并移除容器
*   `make logs`: 查看实时日志
*   `make clean`: 停止容器并删除镜像

**手动部署**
如果不使用 Make，也可以手动运行 Docker 命令：

1. **构建镜像**
   ```bash
   docker build -t huangjin-xin .
   ```

2. **运行容器**
   ```bash
   docker run -d -p 3000:3000 --name huangjin-xin huangjin-xin
   ```

## 开发环境

## 测试

### 端到端测试 (E2E Test)

我们提供了一个自动化的端到端测试脚本，用于验证构建、部署和 API 接口的健康状态。

```bash
# 运行测试脚本
./scripts/e2e-test.sh
```

该脚本会自动执行以下步骤：
1.  **构建** Docker 镜像。
2.  **启动** 容器服务。
3.  **等待** 服务就绪。
4.  **校验** 核心 API 接口 (首页, `/api/prices`, `/api/history`) 的连通性和数据格式。
5.  **清理** 测试容器。

## 许可证
