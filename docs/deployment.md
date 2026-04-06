# 生产环境部署指南

本文档介绍两种部署方式：

1. **前后端分离部署** — 前后端部署在不同服务器
2. **同机 Docker Compose 部署** — 前后端部署在同一台服务器

---

## 方式一：前后端分离部署

适合：前端部署到 Vercel/Netlify，后端部署到云服务器。

### 1. 后端部署

#### 环境要求

- Java 8+ (compiled with `--release 8`)
- MySQL 8.x
- Redis 7.x
- RabbitMQ 3.x

#### 构建与运行

```bash
cd backend
./mvnw clean package -DskipTests

java -jar target/*.jar \
  --spring.datasource.url=jdbc:mysql://your-mysql:3306/simtrade \
  --spring.datasource.username=simtrade \
  --spring.datasource.password=your-password \
  --spring.redis.host=your-redis \
  --spring.rabbitmq.host=your-rabbitmq
```

#### 关键配置

| 配置项 | 说明 |
|--------|------|
| `server.port` | 默认 8080 |
| `spring.datasource.*` | MySQL 连接配置 |
| `spring.redis.*` | Redis 连接配置 |
| `spring.rabbitmq.*` | RabbitMQ 连接配置 |
| `app.cors.allowed-origin-patterns` | 允许的前端域名，逗号分隔 |

#### CORS 配置

在 `application.yml` 中添加前端域名：

```yaml
app:
  cors:
    allowed-origin-patterns: https://your-frontend.com,https://www.your-frontend.com
```

### 2. 前端部署

#### 构建与运行

```bash
cd frontend

# 创建环境变量文件
cat > .env.production << EOF
NEXT_PUBLIC_API_BASE_URL=https://your-backend-server:8080
EOF

# 构建
npm install
npm run build

# 运行 (默认端口 3000)
npm run start
```

#### 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | 是 | 后端 API 地址，需包含协议和端口 |

#### 部署到 Vercel

1. 连接 GitHub 仓库到 Vercel
2. 设置环境变量 `NEXT_PUBLIC_API_BASE_URL`
3. 自动部署

---

## 方式二：同机 Docker Compose 部署

适合：单台云服务器部署全套服务。

### 1. 目录结构

```
deploy/
├── docker-compose.demo.yml
├── env/
│   └── backend.demo.env.example
├── nginx/
│   └── demo.conf
├── scripts/
│   ├── deploy-demo.sh
│   └── smoke-test.sh
└── sql/
    └── init-demo.sql
```

### 2. 配置环境变量

```bash
cd deploy

# 复制环境变量模板
cp env/backend.demo.env.example env/backend.demo.env

# 编辑配置
vim env/backend.demo.env
```

### 3. 一键部署

```bash
cd deploy
./scripts/deploy-demo.sh
```

该脚本会：

- 启动 MySQL、Redis、RabbitMQ
- 构建并启动后端
- 构建并启动前端
- 启动 Nginx 反向代理

### 4. 验证部署

```bash
./scripts/smoke-test.sh
```

### 5. 服务端口

| 服务 | 端口 |
|------|------|
| Nginx | 80 |
| 后端 | 8080 (容器内部) |
| 前端 | 3000 (容器内部) |
| MySQL | 3306 (容器内部) |
| Redis | 6379 (容器内部) |
| RabbitMQ | 5672, 15672 (容器内部) |

### 6. 常用命令

```bash
# 查看日志
docker compose -f docker-compose.demo.yml logs -f backend
docker compose -f docker-compose.demo.yml logs -f frontend

# 重启服务
docker compose -f docker-compose.demo.yml restart backend

# 停止所有服务
docker compose -f docker-compose.demo.yml down

# 停止并删除数据卷
docker compose -f docker-compose.demo.yml down -v
```

---

## 数据库初始化

首次部署需要初始化数据库：

```bash
# 使用 Docker Compose 时自动执行
# 手动初始化
mysql -u root -p simtrade < deploy/sql/init-demo.sql
```

---

## 生产环境检查清单

- [ ] 修改默认数据库密码
- [ ] 修改 RabbitMQ 默认用户密码
- [ ] 配置 HTTPS (建议使用 Nginx + Let's Encrypt)
- [ ] 配置防火墙，仅开放必要端口
- [ ] 配置日志收集
- [ ] 配置监控告警
