# Backend Local Run Guide

This backend now runs locally with:

- Java 17
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
- The current runnable code persists to `t_order`, so `init-local-db.sh` creates the minimal table shape required by the existing `Order` entity and mapper.

## Start the backend

Use the local startup script so the repo always runs with JDK 17:

```bash
cd backend
./run-local.sh
```

The script:

- exports `JAVA_HOME` to Homebrew `openjdk@17`
- prepends JDK 17 and Homebrew binaries to `PATH`
- runs `mvn spring-boot:run`

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
