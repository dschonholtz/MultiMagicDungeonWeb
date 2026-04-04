# Skill: Deploy to Hetzner

Use this skill to deploy MultiMagicDungeonWeb server changes to the Hetzner VPS.

## Prerequisites
- `HETZNER_API_KEY` is in `~/.zshrc` — load with `source ~/.zshrc`
- SSH key at `~/.ssh/id_rsa` or `~/.ssh/id_ed25519`
- Server IP: fetch via API (Step 1)

## Step 1: Get the server IP

```bash
source ~/.zshrc
curl -s -H "Authorization: Bearer $HETZNER_API_KEY" \
  https://api.hetzner.cloud/v1/servers \
  | python3 -c "import sys,json; servers=json.load(sys.stdin)['servers']; [print(s['name'], s['public_net']['ipv4']['ip']) for s in servers]"
```

If no servers exist, provision one (see Provisioning section below).

## Step 2: Deploy

```bash
SERVER_IP="<ip from step 1>"

# Rsync server files
rsync -avz --exclude='node_modules' --exclude='.git' \
  /Users/douglasschonholtz/repos/MultiMagicDungeonWeb/server/ \
  root@$SERVER_IP:/opt/mmd/server/

# SSH in and restart
ssh root@$SERVER_IP '
  cd /opt/mmd/server
  npm install --silent
  pm2 restart mmd-server 2>/dev/null || pm2 start index.js --name mmd-server
  pm2 save
'
```

## Step 3: Verify

```bash
ssh root@$SERVER_IP 'pm2 status mmd-server'
ssh root@$SERVER_IP 'lsof -i :8080 | grep LISTEN'
```

## Step 4: Update client WS_URL (if new server)

In `index.html`:
```javascript
const WS_URL = 'ws://<SERVER_IP>:8080'; // or wss:// with TLS
```

Then push `index.html` to GitHub.

## Provisioning a new server

```bash
source ~/.zshrc
curl -X POST https://api.hetzner.cloud/v1/servers \
  -H "Authorization: Bearer $HETZNER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "mmd-server",
    "server_type": "cx22",
    "location": "ash",
    "image": "ubuntu-22.04",
    "ssh_keys": []
  }'
```

`ash` = Ashburn VA. `cx22` = 2 vCPU, 4GB RAM, ~€4/mo.

## Gotchas
- **SSH key not in Hetzner**: add public key to Hetzner console → Security → SSH Keys
- **Firewall**: `ufw allow 8080/tcp` on server
- **pm2 not installed**: `npm install -g pm2` on server first
- **Node version**: needs Node 16+ for ESM (`"type": "module"`)
- **wss vs ws**: production needs TLS; use nginx or Caddy as SSL terminator
