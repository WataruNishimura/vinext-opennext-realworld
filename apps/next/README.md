# `apps/next`

`apps/vinext` と同じ RealWorld コマースデモを、素の Next.js 16.5 canary（Turbopack）で作り直したものです。Vercel へのデプロイを想定しています。ページ構成、`features/`、`lib/routing.ts`、e2e テストは `apps/vinext` からの移植で、違いは下の「`apps/vinext` との違い」にまとめています。

Vercel には D1 バインディングがないため、既存の Cloudflare D1 データベース（`apps/vinext` と同じもの）を **D1 の REST API** 経由で読み書きします。アダプターは `@realworld/db/d1-http` の `createD1HttpBinding()` で、`D1Database` と同じインターフェースを持つので、`@realworld/core` と Drizzle はそのまま動きます。

## コマンド

```bash
pnpm dev        # next dev
pnpm build      # next build（Cache Components の静的シェルをビルド時に D1 から描画する）
pnpm start      # next start
pnpm test       # Vitest（アプリのヘルパー）
pnpm test:e2e   # 本番ビルド（next build && next start, ポート 3100）に対して Playwright を実行
PLAYWRIGHT_BASE_URL=https://<デプロイ先> pnpm test:e2e
PLAYWRIGHT_BASE_URL=https://<Preview の URL> VERCEL_AUTOMATION_BYPASS_SECRET=<シークレット> pnpm test:e2e
```

Vercel の Preview は Vercel Authentication で保護されています。`VERCEL_AUTOMATION_BYPASS_SECRET` に「Protection Bypass for Automation」のシークレット（Vercel の Deployment Protection 設定、または `vercel project protection`）を渡すと、Playwright が `x-vercel-protection-bypass` ヘッダーを付けてアクセスします。

`dev` / `build` / `start` は `scripts/with-d1.ts` を通して実行します。

- 環境変数か `.env.local` に `CLOUDFLARE_D1_API_TOKEN` がある場合、または Vercel 上（`VERCEL` が設定されている）では、そのまま Next.js のコマンドを実行し、設定された D1 に REST API で接続します。
- それ以外では、Miniflare でマイグレーションとシード済みのローカル D1 を起動し、D1 REST API のエミュレーター（`@realworld/db/testing`）を立てて、そこに向けて Next.js を実行します。リモートのリソースには一切触れません。ビルドと `start` はそれぞれ新しいデータベースを使いますが、シードが決定的なので内容は同じです。

## 環境変数

すべてサーバー専用です（`NEXT_PUBLIC_` は付けません）。雛形は [`.env.example`](.env.example) にあります。

| 変数                        | 内容                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`     | D1 データベースを持つ Cloudflare アカウントの ID                                                    |
| `CLOUDFLARE_D1_DATABASE_ID` | D1 データベースの ID（`apps/vinext` と共有する `7c6d99ba-4407-484b-8fd8-4fb8dbf07bbc`）             |
| `CLOUDFLARE_D1_API_TOKEN`   | そのアカウントの **D1 Edit** 権限を持つ API トークン（カート、保存、プロフィールで書き込むため）    |
| `CLOUDFLARE_API_BASE_URL`   | 任意。API のベース URL（既定は `https://api.cloudflare.com/client/v4`）。ローカルのエミュレーター用 |

`lib/d1-env.ts` が変数を読み、足りないものがあれば名前を並べた `MissingD1EnvError` を投げます。D1 のクライアントは最初のクエリで作るので、エラーはそのクエリ（ビルド時なら静的シェルの描画）で出ます。

### Vercel の設定

Vercel プロジェクト `realworld-next` で Preview にデプロイし、e2e がすべて通ることを確認済みです（Production にはまだデプロイしていません）。

1. リポジトリを Vercel にインポートし、**Root Directory** を `apps/next` にします。Framework Preset は Next.js が自動で選ばれ、ルートの `packageManager` から pnpm が使われます。`packages/*` を読むため、「Include files outside of the Root Directory in the Build Step」は有効のままにします。
2. **Node.js Version** を 24.x にします（ルートの `engines` が `>=24`）。
3. Cloudflare ダッシュボードの「API Tokens」で、対象アカウントの **D1: Edit** 権限だけを持つカスタムトークンを作ります。
4. Vercel の **Environment Variables** に `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_D1_DATABASE_ID`、`CLOUDFLARE_D1_API_TOKEN`（Sensitive）を、Production と Preview の両方に設定します。`next build` が静的シェルを D1 から描画するので、ビルド時にも必要です。足りない場合はビルドが `MissingD1EnvError` で失敗します（Vercel 上ではローカルのエミュレーターは起動しません）。
5. ビルドは Turborepo（`turbo run build`）で実行され、strict モードでは `turbo.json` に書かれていない環境変数がタスクに渡りません。ルートの `turbo.json` の `@realworld/next#build` に `CLOUDFLARE_*` を列挙しています。
6. CLI から `vercel deploy` するときは、ルートの `.vercelignore` で `node_modules`、ビルド結果、`.env*` などをアップロードから外しています。

## 設定のポイント

- **D1**: `lib/database.ts` で `configureDatabase()` に、`createD1HttpBinding(d1HttpOptionsFromEnv(process.env))` を返すリゾルバーを登録しています。ルートレイアウトと `instrumentation.ts` の両方がこのファイルを import します。サーバーが起動直後に Server Function を受けた場合、レイアウトのモジュールはまだ読み込まれていないことがあるので、`register()` でも設定しています。
- **D1 REST API**: アダプターはすべての文を `POST /accounts/:account_id/d1/database/:database_id/raw` に送ります。`/raw` は行を配列で返し列名も付くので、結合で列名が重複しても値が失われません（Drizzle の `select()` は配列で結果を受け取ります）。`batch()` は `{ batch: [...] }` の 1 リクエストで送り、D1 のバインディングと同じく 1 つのトランザクションで実行されます。リクエストとレスポンスの形は `cf schema d1 raw` と [API リファレンス](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/raw/)で確認しました。
- **キャッシュ**: `cacheHandlers` は設定していません。Vercel では `'use cache: remote'` が Vercel の既定のキャッシュハンドラー（インスタンス間で共有される）に保存されます。`'use cache'` は既定のインメモリ LRU（インスタンスごと）です。ローカルの `next start` では、Next.js の既定どおり両方ともインメモリ LRU です。
- **レンダーステージ**: `@realworld/core/render-stages` は `default` の export condition で解決され、`next/cache` の本物の `prefetch()` / `navigation()` を使います。
- **ワークスペースパッケージ**: `transpilePackages` で `@realworld/core`、`@realworld/ui`、`@realworld/db` の TypeScript と `'use cache'` / `'use server'` を Next.js にコンパイルさせています。

## `apps/vinext` との違い

| 項目                                  | `apps/vinext`                                              | `apps/next`                                                                                                                                                                                 |
| ------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実行環境                              | vinext（Vite）on Cloudflare Workers                        | Next.js 16.5 canary（Turbopack）、Vercel を想定                                                                                                                                             |
| D1 への接続                           | `cloudflare:workers` の `env.DB` バインディング            | D1 REST API（`@realworld/db/d1-http`）。`lib/d1-env.ts` で環境変数を読む。`instrumentation.ts` を追加                                                                                       |
| 設定ファイル                          | `vite.config.ts`、`cloudflare.config.ts`、`next.config.ts` | `next.config.ts`（`cacheComponents`、`partialPrefetching`、`reactCompiler`、`transpilePackages`）、`postcss.config.mjs`                                                                     |
| React Compiler                        | `vinext({ react: { compiler: true } })`                    | `reactCompiler: true` と `babel-plugin-react-compiler`                                                                                                                                      |
| Tailwind CSS                          | `@tailwindcss/vite`                                        | `@tailwindcss/postcss`                                                                                                                                                                      |
| `prefetch()` / `navigation()`         | `vinext` export condition で何もしない関数                 | `next/cache` の本物                                                                                                                                                                         |
| `'use cache'` / `'use cache: remote'` | どちらも Workers KV（`kvDataAdapter`）                     | `'use cache'` はインメモリ、`'use cache: remote'` は Vercel の既定のキャッシュハンドラー                                                                                                    |
| ビルド時の D1                         | 使わない                                                   | 使う（静的シェルと `generateStaticParams` の商品 1〜4 をプリレンダリング）。ローカルでは `scripts/with-d1.ts` がエミュレーターを起動                                                        |
| 商品ページの境界                      | 通常の `<Suspense>`（vinext の SSR エラーの回避）          | 共有の `AnimatedSuspense`（`<ViewTransition>` 付き）                                                                                                                                        |
| `/about` の `ensureStatic`            | `'navigation'`（vinext は無視する）                        | `'prefetch'`。`'navigation'` はレイアウトを含むルート全体の静的化を求めるが、共有ヘッダーがセッションごとのカートバッジとアカウントメニューを遷移時に描画するため、Next.js はビルドを止める |
| e2e の `instant()`                    | 動的な内容がスコープ内でも表示されることを確認             | スコープ内ではリアルタイムの在庫が表示されず、スコープを抜けると表示されることを確認                                                                                                        |
| e2e のエラー表示                      | `getByRole('alert')`                                       | `getByRole('main').getByRole('alert')`。Next.js のルートアナウンサー（`role="alert"`）が `<main>` の外にあるため                                                                            |
| e2e のサーバー                        | `vite preview`（ポート 4173）、ローカルの D1 と KV         | `next build && next start`（ポート 3100）、Miniflare のローカル D1 と REST API エミュレーター                                                                                               |
| 文言                                  | 「rendered by vinext on Cloudflare Workers」               | 「rendered by Next.js on Vercel」。ページタイトル、フッター、紹介ページ                                                                                                                     |
| アカウントメニューのコメント          | vinext で `router.push()` を避ける理由                     | 削除（動作は同じ。Server Function のレスポンスで再描画する）                                                                                                                                |

`typedRoutes` は有効にしていません。共有の `@realworld/ui/link` は `apps/vinext` と共通で、`catalogHref()` が実行時に組み立てる文字列の URL を受け取るためです。

## D1 REST API を使うときの注意

- クエリ 1 回（`batch()` は 1 回にまとまる）ごとに `api.cloudflare.com` への HTTPS リクエストが発生します。Vercel のリージョンと D1 のリージョンの距離がそのまま遅延になるので、キャッシュの階層（ルートの README の表）がそのぶん効きます。
- Cloudflare API のレート制限の対象になります。
- API リファレンスでは `params` は文字列の配列と書かれていますが、アダプターは D1 バインディングと同じく数値と `null` をそのまま JSON で送ります（真偽値は 1 / 0）。drizzle-kit の `d1-http` ドライバーも同じ送り方です。ローカルのエミュレーターとバインディングの比較テスト（`packages/db/test/d1-http.test.ts`）で一致を確認し、Vercel の Preview（本物の API）でも読み書きを含む e2e がすべて通りました。
- REST API にはリードレプリカのセッションがないので、`withSession()` はブックマークを持たず（`getBookmark()` は `null`）、すべてプライマリに送ります。`dump()` は使えません。
