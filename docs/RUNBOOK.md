# Deploy runbook — seo.pet-sy.com on the existing DigitalOcean droplet

> Nothing here has been run yet. Each step needs the owner's go-ahead; it touches production DNS
> and the server that hosts pet-sy.com.

The droplet (1 vCPU / 1 GB) already runs nginx, PM2, PostgreSQL and the Pet-sy API. This product
adds two small Node processes (API ≈ 60 MB, worker ≈ 60–120 MB while crawling) and one database.

## 1. Database (separate DB and user — never share Pet-sy's)

```bash
sudo -u postgres psql -c "CREATE ROLE petsy_seo LOGIN PASSWORD '<generate-a-long-random-password>';"
sudo -u postgres psql -c "CREATE DATABASE petsy_seo OWNER petsy_seo;"
```

Keep PostgreSQL listening on localhost for this database. (Note: the Pet-sy notes say Postgres
listens on 0.0.0.0 with md5 from any host — review that separately; it is a security risk.)

## 2. Code

```bash
cd /var/www && git clone https://github.com/michaelmaged222/SEO-Agent petsy-seo && cd petsy-seo
git checkout <released-commit>
npm install --omit=dev
cp .env.example .env   # NODE_ENV=production, APP_ORIGIN=https://seo.pet-sy.com, DATABASE_URL=..., TRUST_PROXY=true, PORT=5100
chmod 600 .env
npm run migrate
```

## 3. Processes

```bash
pm2 start "npm start" --name seo-api
pm2 start "npm run worker" --name seo-worker
pm2 save
```

## 4. DNS + nginx + TLS

- GoDaddy: `A  seo  142.93.63.29`
- nginx server block for `seo.pet-sy.com` → `proxy_pass http://127.0.0.1:5100;` with
  `proxy_set_header X-Forwarded-For $remote_addr;` and `client_max_body_size 64k;`
- `sudo certbot --nginx -d seo.pet-sy.com`

## 5. Smoke test (record the output as evidence)

```bash
curl -s https://seo.pet-sy.com/api/health        # {"ok":true}
```
Then in the browser: create the **Puppyfy UAE** account → add `puppyfyuae.com` → quick check runs.
To unlock full crawls, add the verification meta tag to the website (a change to puppyfyuae.com
that the owner approves and deploys) or the DNS TXT record at GoDaddy.

## Backups and rollback

- Before every migration: `pg_dump -Fc petsy_seo > /var/backups/petsy_seo-$(date +%F-%H%M).dump`
- Roll back the code: `git checkout <previous-commit> && pm2 restart seo-api seo-worker`
- Roll back the latest migration: `npm run migrate:down` (destructive for that migration's data —
  restore from the dump if needed: `pg_restore -c -d petsy_seo <file>`)
- Restore rehearsal has **not** been done yet (Phase 11).

## Monitoring (minimum)

- `pm2 logs seo-worker` — failed jobs print `[worker] job … failed`
- Failed checks are visible to tenants in their check history with the real error.
