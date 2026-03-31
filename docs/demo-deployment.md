# 演示环境部署说明

当前**推荐主方案**：

- 前端：`Vercel`
- 后端：本地运行 `Spring Boot`
- 暴露方式：`HTTPS` 穿透到本地 `8080`

这个方案最适合你现在“先跑起来做演示”的目标，因为：

- 上线最快
- 不需要先买云服务器
- 前端已经天然适合部署到 Vercel
- 只要后端暴露出来的是 `https://...`，浏览器就不会拦 mixed content

## 1. 总体结构

- 浏览器访问 `https://<your-project>.vercel.app`
- 前端通过 `NEXT_PUBLIC_API_BASE_URL` 请求 `https://<your-tunnel-domain>`
- HTTPS 穿透服务把公网请求转发到你本机的 `http://127.0.0.1:8080`

## 2. 本地启动后端

### 启动 Java 17 环境

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

### 启动后端

```bash
cd backend
./run-local.sh
```

### 如果本地数据库还没初始化

```bash
cd backend
./init-local-db.sh
```

## 3. 把本地后端暴露为 HTTPS 地址

关键要求：

- 必须是 `https://` 地址
- 不能填 `http://localhost:8080`
- 不能填 `http://127.0.0.1:8080`
- 不能填普通 `http://<本地IP>:8080`

你可以使用任意支持 HTTPS 公网暴露的工具，例如：

- `Cloudflare Tunnel`
- `ngrok`
- `pinggy`

目标是得到类似这样的地址：

```text
https://your-demo-backend.example-tunnel.com
```

并让它转发到：

```text
http://127.0.0.1:8080
```

## 4. 部署前端到 Vercel

### 本地先验证构建

```bash
cd frontend
npm install
npm run build
```

### 在 Vercel 配置环境变量

进入 Vercel 项目设置，配置：

```bash
NEXT_PUBLIC_API_BASE_URL=https://<你的 HTTPS 穿透地址>
NEXT_PUBLIC_DEMO_USER_ID=u_10001
```

### 注意

- 每次穿透域名变化后，都要更新 Vercel 环境变量并重新部署
- 如果你的穿透工具不稳定，SSE 行情流可能断开
- 当前前端部署在 HTTPS 域名下，所以后端也必须对外表现为 HTTPS

## 5. 演示验证

### 后端本地验证

```bash
curl --noproxy '*' http://127.0.0.1:8080/api/v1/home/overview
```

### 穿透地址验证

```bash
curl https://<你的 HTTPS 穿透地址>/api/v1/home/overview
curl -H 'X-User-Id: u_10001' https://<你的 HTTPS 穿透地址>/api/v1/account/profile
```

### 前端验证

- 打开 `https://<your-project>.vercel.app`
- 查看首页是否能拉到概览
- 打开交易详情页，确认 SSE 报价流无 mixed content 报错

## 6. 常见问题

### 为什么不能直接填 `http://localhost:8080`

因为 Vercel 页面是 `HTTPS`，浏览器会拦截从 `HTTPS` 页面请求 `HTTP` 后端，这就是 mixed content。

### 为什么不推荐“只部署前端 + 后端裸本地 IP”

因为公网浏览器不能直接访问你的 `localhost`，而且 HTTP 也会被 mixed content 拦截。

### 这个方案适合长期使用吗

不适合。

它适合：

- 你自己快速演示
- 临时发给少量同事看
- 功能验证

如果后面要更稳定，建议再切到云服务器同机部署或正式前后端分离部署。

## 7. 备选方案：服务器同机部署

仓库里保留了同机容器化备选方案，适合后续你想把前后端都放到一台服务器：

- `frontend/Dockerfile`
- `backend/Dockerfile`
- `deploy/docker-compose.demo.yml`
- `deploy/nginx/demo.conf`
- `deploy/scripts/deploy-demo.sh`
- `deploy/scripts/smoke-test.sh`

这条路径当前不是首选，但以后你要上腾讯云轻量服务器时可以直接复用。
