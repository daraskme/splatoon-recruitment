# インクマーレ／スプラトゥーンマルチ募集

Splatoon 3のオープン、サーモンラン、イベントマッチ、フェスの募集ができるWebアプリケーションです。

## 主な機能

- Discord OAuth認証
- 募集ルームの作成・参加・退出
- Discord ボイスチャンネル自動作成
- ワンクリックでVCに参加可能
- 全員退出時のVC自動削除
- リアルタイム募集一覧更新
- モード別フィルタリング（オープン/サーモンラン/イベント/フェス）

## 技術スタック

- Next.js 14 (App Router + Pages Router)
- TypeScript
- Tailwind CSS
- NextAuth.js (Discord OAuth)
- Discord.js (Bot機能)
- Vercel (デプロイ)

## セットアップ

### 1. Discord Application の作成

1. [Discord Developer Portal](https://discord.com/developers/applications) にアクセス
2. "New Application" をクリックして新しいアプリケーションを作成
3. OAuth2 セクションで以下を設定:
   - Redirects: `http://localhost:3000/api/auth/callback/discord` (開発環境)
   - Redirects: `https://your-domain.vercel.app/api/auth/callback/discord` (本番環境)
4. Client ID と Client Secret をコピー

### 2. Discord Bot の作成

1. 同じアプリケーションの "Bot" セクションに移動
2. "Add Bot" をクリック
3. Bot Token をコピー（Reset Token でトークンを再生成できます）
4. Bot Permissions で以下を有効化:
   - Manage Channels
   - Create Instant Invite
   - View Channels
5. OAuth2 > URL Generator で以下を選択:
   - Scopes: `bot`
   - Bot Permissions: `Manage Channels`, `Create Instant Invite`
6. 生成されたURLでBotをDiscordサーバーに招待

### 3. Discord サーバーの準備

1. Discordサーバーで開発者モードを有効化（設定 > 詳細設定 > 開発者モード）
2. サーバーIDをコピー（サーバー名を右クリック > IDをコピー）
3. VCを作成するカテゴリーを作成し、カテゴリーIDをコピー

### 4. プロジェクトのセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
```

`.env` ファイルを編集:

```env
# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_GUILD_ID=your_discord_server_id
DISCORD_CATEGORY_ID=your_category_id

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

`NEXTAUTH_SECRET` は以下のコマンドで生成できます:

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセス

## Vercelへのデプロイ

### 1. Vercelプロジェクトの作成

```bash
npm install -g vercel
vercel
```

### 2. 環境変数の設定

Vercel Dashboardで以下の環境変数を設定:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `DISCORD_GUILD_ID`
- `DISCORD_CATEGORY_ID`
- `NEXTAUTH_URL` (例: `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET`
- `CRON_SECRET` (Cron Job用のランダムな文字列)

`CRON_SECRET` は以下のコマンドで生成できます:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Discord Redirectの更新

Discord Developer Portalで本番環境のRedirect URLを追加:
- `https://your-app.vercel.app/api/auth/callback/discord`

### 4. デプロイ

```bash
vercel --prod
```

## 使い方

1. Discordでログイン
2. "新規募集作成" ボタンをクリック
3. タイトルとモードを選択して募集を作成
4. 他のユーザーは "VCに参加" ボタンでワンクリック参加
5. Discord VCへの招待リンクが自動的に開きます
6. 全員が退出すると、5分後にVCと募集が自動削除されます

## 自動クリーンアップ

- **Vercel Cron Jobs** により5分ごとに自動クリーンアップが実行されます
- 全員が退出したルームは5分後に自動的に削除されます
- 空のDiscord VCも同時に削除されます
- Cron Jobは `vercel.json` で設定されており、Vercelにデプロイすると自動的に有効化されます

### ローカル環境でのテスト

ローカル環境ではCron Jobは動作しないため、以下のコマンドで手動でクリーンアップをテストできます:

```bash
curl -X POST http://localhost:3000/api/cron/cleanup \
  -H "Authorization: Bearer your_cron_secret"
```

## ライセンス

MIT
