# Backend Local Run Guide

This backend now runs locally with:

- Java 8+ (compiled with `--release 8`)
- Maven
- MySQL
- Redis
- RabbitMQ

## One-time setup

Install dependencies with Homebrew:

```bash
brew install openjdk@17 maven mysql redis rabbitmq
brew services start mysql
brew services start redis
brew services start rabbitmq
```

The current backend config expects these local defaults from `src/main/resources/application.yml`:

- MySQL: `localhost:3306`, database `simtrade`, user `root`, password `password`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672`, user `guest`, password `guest`

If your local MySQL root user still has no password, set it first:

```bash
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'password';"
```

## Initialize the database

For the current runnable backend, initialize the minimal order table with:

```bash
cd backend
./init-local-db.sh
```

Notes:

- The repository also contains `schema.sql`, which models a broader target schema.
- The current runnable code persists to `t_order` and `t_user_profile`, so `init-local-db.sh` creates the minimal table shape required by the existing entities and mappers.

## Start the backend

Use the local startup script so the repo runs with JDK 8+:

```bash
cd backend
./run-local.sh
```

The script:

- exports `JAVA_HOME` to Homebrew `openjdk@17`
- prepends JDK and Homebrew binaries to `PATH`
- runs `mvn spring-boot:run`

Note: The project is compiled with `--release 8`, so it's compatible with any JDK 8 or above.

## Verify

Run tests:

```bash
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:/opt/homebrew/bin:$PATH"
mvn test
```

Check that the app is listening on port `8080`:

```bash
lsof -nP -iTCP:8080 -sTCP:LISTEN
```

Smoke test the order endpoint:

```bash
curl --noproxy '*' -X POST http://127.0.0.1:8080/api/orders/place \
  -H 'Content-Type: application/json' \
  -d '{"userId":"u1001","stockCode":"00700","type":1,"price":300.00,"quantity":100}'
```

Why `--noproxy '*'`:

- This machine currently sets `http_proxy` / `https_proxy`
- local requests to `127.0.0.1:8080` may otherwise be intercepted and return `502`

Verify data reached MySQL:

```bash
mysql -u root -ppassword -D simtrade -e "SELECT id,user_id,stock_code,type,status,create_time FROM t_order ORDER BY create_time DESC LIMIT 5;"
```

## Demo deployment

This repository now supports two demo paths:

- primary: `Vercel frontend + local backend + HTTPS tunnel`
- fallback: single-host Docker deployment on a VPS

### Included files

- `../frontend/Dockerfile`
- `backend/Dockerfile`
- `src/main/resources/application-prod.yml`
- `../deploy/docker-compose.demo.yml`
- `../deploy/env/backend.demo.env.example`
- `../deploy/nginx/demo.conf`
- `../deploy/sql/init-demo.sql`
- `../deploy/scripts/deploy-demo.sh`
- `../deploy/scripts/smoke-test.sh`

### Primary demo path

```bash
cd backend
./run-local.sh
```

Expose local `8080` through an HTTPS tunnel, then set Vercel env vars:

```bash
NEXT_PUBLIC_API_BASE_URL=https://<your-https-tunnel-domain>
NEXT_PUBLIC_DEMO_USER_ID=u_10001
```

### Fallback VPS path

```bash
cp deploy/env/backend.demo.env.example deploy/env/backend.demo.env
chmod +x deploy/scripts/deploy-demo.sh deploy/scripts/smoke-test.sh
./deploy/scripts/deploy-demo.sh
```

`deploy/env/backend.demo.env` 建议保留以下严格模式配置，避免 DB 或 Redis 关键链路异常被静默回退：

```bash
APP_LEDGER_DB_STRICT_MODE=true
APP_USER_PROFILE_DB_STRICT_MODE=true
APP_ORDER_REDIS_STRICT_MODE=true
```

### Smoke tests

```bash
curl --noproxy '*' http://127.0.0.1:8080/api/v1/home/overview
API_BASE_URL=http://<your-server-public-ip> ./deploy/scripts/smoke-test.sh
```

### Demo notes

- Vercel pages are HTTPS, so the backend must be exposed through an HTTPS tunnel
- `NEXT_PUBLIC_API_BASE_URL` must be an absolute `https://...` URL when using Vercel
- The single-host Docker path is kept as a fallback for later Tencent Cloud or VPS deployment

## Current API status

The backend currently exposes these first-batch competition APIs:

- `GET /api/v1/account/profile`
- `GET /api/v1/account/positions`
- `GET /api/v1/home/overview`
- `GET /api/v1/leaderboard/star-traders`
- `GET /api/v1/leaderboard/top-holdings`
- `GET /api/v1/leaderboard/top-turnover`
- `GET /api/v1/leaderboard/rankings`
- `GET /api/v1/trade/search`
- `GET /api/v1/trade/quote/{stockCode}`
- `GET /api/v1/trade/orders/active`
- `GET /api/v1/trade/orders/history`
- `GET /api/v1/trade/orders/{orderId}`
- `POST /api/v1/trade/orders`
- `POST /api/v1/trade/orders/preview`
- `POST /api/v1/trade/orders/{orderId}/cancel`
- `POST /api/v1/trade/orders/{orderId}/amend`
- compatibility path: `POST /api/orders/place`

## Current simplifications

This repository is still a runnable prototype rather than a production trading engine.

- Order persistence falls back to in-memory/local store behavior when database operations fail.
- T+2 is still simplified and does not yet use a full Hong Kong business-day calendar.
- Leaderboard and overview responses currently use mock/view-model-friendly data.
- Real AOB market data ingestion and RabbitMQ-driven matching are not completed in this local prototype.
