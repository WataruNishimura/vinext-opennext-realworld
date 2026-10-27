# `apps/opennext`

RealWorld コマースデモを **Next.js 16.5 canary**(App Router、Cache Components、Partial Prefetching、React Compiler)で実装し、[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) と Wrangler で Cloudflare Workers にデプロイするアプリです。

アプリ側のコードは薄く保っています。データ取得・キャッシュ階層・Server Functions は `@realworld/core`、UI コンポーネントは `@realworld/ui` から使います。このパッケージにあるのは次の 3 つです。

- ルート(`app/`)
- レンダリング段階のゲートを置くフィーチャーコンポーネント(`features/`)
- Cloudflare との配線(`lib/`、`wrangler.jsonc`、`open-next.config.ts`)

> **このアプリで使えなかった機能は [OpenNext で使えなかったこと](#opennext-で使えなかったこと) にまとめています。** 使えない公式機能は外して迂回し、使える機能はできるだけ使う方針です。

## ルート

| ルート          | 内容                                                                               | レンダリング                              |
| --------------- | ---------------------------------------------------------------------------------- | ----------------------------------------- |
| `/`             | ヒーロー、注目商品、カテゴリ(件数付き)、サインイン時のおすすめ                     | Partial Prerender、`instant = true`       |
| `/all`          | カタログ: 入力中検索、並び替え、カテゴリ絞り込み、ページング、在庫バッジ           | Partial Prerender、`instant = true`       |
| `/product/[id]` | 商品ヘッダーと評価、リアルタイム在庫、カート追加、保存、注目商品への設定、レビュー | Partial Prerender、`instant = true`       |
| `/cart`         | カート明細(楽観的更新の数量ステッパー、削除)                                       | Partial Prerender、`instant = true`       |
| `/saved`        | 保存した商品(楽観的な保存解除)とおすすめ                                           | Partial Prerender、`instant = true`       |
| `/account`      | プロフィールフォーム(`useActionState`)。未サインインならサインインへリダイレクト   | Partial Prerender、`instant = true`       |
| `/sign-in`      | デモ用サインイン(`jane.smith@example.com`、パスワード不要)                         | Partial Prerender                         |
| `/about`        | キャッシュ階層の説明                                                               | 完全に静的(`ensureStatic = 'navigation'`) |

`(store)` レイアウトは `ensureStatic = 'shell'` です。ヘッダーのセッション依存部分(アカウントメニュー、カートバッジ)は `await prefetch()` の後でしか読まないので、ストアの App Shell はすべて静的なままです。ゲートはルート README の方針どおり、`features/*` の中でクエリを呼ぶ直前に置いています。

## 使っている Cache Components の機能と OpenNext での状態

| 機能                                                          | どこで                                                                                           | OpenNext(workerd)での状態                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `'use cache'` / `cacheLife` / `cacheTag`                      | `@realworld/core` の全クエリ(カテゴリ、商品、カート、保存、アカウント)                           | 動く(KV インクリメンタルキャッシュ)                                                                                                        |
| `'use cache: remote'`                                         | 注目商品、カタログのページ、在庫バッジ                                                           | 動く(`lib/remote-cache-handler.ts` で KV に接続)                                                                                           |
| `'use cache: private'`                                        | セッション(`getSession`)                                                                         | 動く                                                                                                                                       |
| `updateTag`(Server Functions)                                 | カート追加・数量変更・削除、保存、注目商品の設定、プロフィール、サインイン/アウト                | 動く(D1 タグキャッシュ)。ただし静的シェルには載せない([1](#1-静的シェルの実行時再生成))                                                    |
| `prefetch()` / `navigation()`                                 | ヘッダーのセッション部分・カート・保存・アカウント(`prefetch`)、レビュー・おすすめ(`navigation`) | 動く                                                                                                                                       |
| `connection()`                                                | 静的シェルから外したいキャッシュ済みデータ(注目商品、カテゴリ)                                   | 動く(迂回策として使用)                                                                                                                     |
| `<Link prefetch>` / Partial Prefetching                       | 商品カード、カタログ、カテゴリ、カートなど                                                       | プリフェッチ要求は成功する。動的な穴を含むルートへの instant ナビゲーションは不可([2](#2-動的な穴を含むルートへの-instant-ナビゲーション)) |
| `ensureStatic`                                                | `(store)` レイアウト `'shell'`、`(marketing)` レイアウト `'navigation'`                          | 動く                                                                                                                                       |
| `instant`(セグメント設定)と `@next/playwright` の `instant()` | 各ページ、e2e                                                                                    | 完全に静的なルート(`/about`)では動く。動的な穴を含むルートでは不可                                                                         |
| Suspense とスケルトン、`AnimatedSuspense`(View Transitions)   | 各ページ                                                                                         | 動く                                                                                                                                       |
| `useOptimistic` / `useActionState`                            | カート追加、数量ステッパー、保存、注目商品、プロフィール、サインイン                             | 動く                                                                                                                                       |
| React Compiler                                                | `reactCompiler: true`                                                                            | 動く(webpack ビルド。[3](#3-turbopack-ビルド))                                                                                             |

## Cloudflare リソース

| バインディング          | リソース                                | 用途                                                        |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------- |
| `DB`                    | D1 `realworld-opennext`                 | アプリのデータ(`@realworld/core`)                           |
| `NEXT_TAG_CACHE_D1`     | 同じ D1(`revalidations` テーブル)       | OpenNext のタグキャッシュ(`d1NextTagCache`)                 |
| `NEXT_INC_CACHE_KV`     | KV `realworld-opennext-cache`           | OpenNext のインクリメンタルキャッシュ(`kvIncrementalCache`) |
| `NEXT_CACHE_DO_QUEUE`   | Durable Object `DOQueueHandler`(SQLite) | 再検証キュー(`doQueue`)                                     |
| `WORKER_SELF_REFERENCE` | この Worker 自身                        | キューから Worker を呼び戻す                                |
| `ASSETS`                | 静的アセット(`.open-next/assets`)       | `_next/static` など                                         |

リソースは `wrangler.jsonc` で ID 指定しています。最初は `cf` CLI で作成しました。Wrangler で作る場合は次のとおりです。

```bash
wrangler d1 create realworld-opennext
wrangler kv namespace create realworld-opennext-cache
D1_DATABASE_ID=<id> pnpm --filter @realworld/db db:migrate:remote
D1_DATABASE_ID=<id> pnpm --filter @realworld/db db:seed:remote
```

タグキャッシュの `revalidations` テーブルは `opennextjs-cloudflare populateCache`(`deploy` が実行)が作ります。

### キャッシュ構成の理由

- **インクリメンタルキャッシュ: Workers KV**
  - 静的シェルと、すべての `'use cache'` / `'use cache: remote'` のエントリを保存します。永続的で、全アイソレート・全コロで共有されます。
  - OpenNext の推奨は R2 ですが、このアカウントでは R2 が無効です(`[10042] Please enable R2 through the Cloudflare Dashboard`)。
  - 鮮度はタグキャッシュで判断するので、KV の結果整合性で問題ありません。
- **タグキャッシュ: D1(`d1NextTagCache`)**
  - `updateTag` / `revalidateTag` はタグごとに 1 行を書き込みます。読み取りのたびにエントリの時刻とタグの再検証時刻を比べるため、無効化は即時かつ全世界に反映されます。
- **キュー: Durable Object(`doQueue`)**
  - 古くなったルートのバックグラウンド再生成を重複排除します。
- `enableCacheInterception` は、Partial Prerendering では無効にする必要があるため `false` です。

## ビルドとデプロイ

```bash
wrangler login   # 初回のみ
pnpm deploy      # build:worker → opennextjs-cloudflare deploy
```

1. `pnpm build:worker`
   - `opennextjs-cloudflare build` が `pnpm build`(`next build --webpack`)を実行し、`.open-next/worker.js` と `.open-next/assets` を出力します。
   - 続けて `scripts/patch-worker.ts` がサーバーバンドルにパッチを当てます([6](#6-モジュール読み込みシグナルのリクエスト間共有))。
2. `opennextjs-cloudflare deploy`
   - `.open-next/cache` から KV と D1 のタグテーブルを埋めます。
   - その後 `wrangler.jsonc` で `wrangler deploy` を実行します。

`pnpm preview` はローカルでビルドして `opennextjs-cloudflare preview`(`wrangler dev`)で配信します。

## ローカル開発とテスト

```bash
pnpm dev           # next dev。D1 はメモリ上の Miniflare(lib/local-context.ts)
pnpm test          # Vitest(lib/cross-request-timers.ts、scripts/patch-worker.ts)
pnpm e2e:prepare   # e2e ビルド(テスト API 有効)→ ローカル D1 のマイグレーションとシード → populateCache local
pnpm test:e2e      # Playwright。workerd 上の Worker(wrangler dev)に対して実行

# 同じ e2e ビルドを next start(Node)で比較する場合
NEXT_TESTING_API=1 pnpm build && pnpm exec next start -p 3100
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 E2E_INSTANT=1 E2E_RUNTIME=node pnpm test:e2e
```

workerd の外(`next build` のプリレンダー、`next dev`、`next start`)には Worker の `env` がありません。そのため `lib/database.ts` は、デプロイ先と同じマイグレーションと決定的なシードを入れたメモリ上の Miniflare D1 を使います。モジュールは実行時に組み立てた指定子で読み込むので、Miniflare が Worker のバンドルに入ることはありません。

e2e はローカルの Worker(workerd)で 10 件すべて成功しています。内訳は、カタログ、商品ページ、カート、保存、注目商品のキャッシュ無効化、アカウント、`/about` への instant ナビゲーションです。

## OpenNext で使えなかったこと

確認した組み合わせ: Next.js `16.5.0-canary.28`、`@opennextjs/cloudflare` 1.20.13(`@opennextjs/aws` 4.1.12)、Wrangler 4.153.0。すべてローカルの workerd(`wrangler dev`)で再現しています。比較には同じビルドを `next start`(Node)で動かしました。

### 1. 静的シェルの実行時再生成

**状態: 使えない。キャッシュ済みデータをシェルに載せないことで迂回。**

**現象**

ビルド時にプリレンダーした App Shell が古くなると、それを作り直すリクエストが完了しません。古くなるきっかけは次の 2 つです。

- シェルに載っているタグへの `updateTag` / `revalidateTag`
- シェル内の `cacheLife` の期限切れ

workerd はそのリクエストを打ち切り(`The Workers runtime canceled this request because it detected that your Worker's code had hung`)、以後そのルートへのリクエストもハングします。

`NEXT_PRIVATE_DEBUG_CACHE=1` で見ると、再生成そのものは成功し、最後の描画で止まっています。止まった時点で未完了の I/O もタイマーもありません。

```
[D1NextModeTagCache]  hasBeenRevalidated tags=…,featured-products,products,categories … -> true
'use cache: remote' registering as cross-request invocation leader [...]
[KVIncrementalCache]  get / set [...]        ← 両方のキャッシュエントリは再生成・保存される
'use cache: remote' Resume Data Cache entry found [...]
'use cache' Resume Data Cache entry found [...]
✘ Uncaught Error: The Workers runtime canceled this request because … your Worker's code had hung …
GET / 500 Internal Server Error (59ms)
```

Next.js も「現在のランタイムの `setTimeout()` 実装では Cache Components の動作を保証できない」と警告しています。

**迂回策**

- 無効化されうるデータや期限のあるデータは、ビルド時のシェルに入れません。対象は注目商品、カテゴリ一覧、カテゴリ件数で、`features/*` で `connection()` の後に読みます。
  - `prefetch()` / `navigation()` では足りません。ドキュメントのとおり、静的プリレンダーはそれらの後ろの内容もシェルに含めるためです。
- `/product/[id]` から `generateStaticParams` を外し、商品ヘッダーをシェルに焼き込まないようにしました。
- データ自体は引き続き `'use cache'` / `'use cache: remote'` でキャッシュされ、`updateTag` で無効化されます(e2e の「featuring a product invalidates…」で確認)。描画が resume 側(動的部分)に移るだけです。

**失ったもの**

- 注目商品とカテゴリが静的シェル(HTML)に含まれなくなりました。初回表示ではスケルトンの後にストリーミングされます。

### 2. 動的な穴を含むルートへの instant ナビゲーション

**状態: 使えない。e2e ではロックを外して最終状態を確認することで迂回。**

**現象**

`@next/playwright` の `instant()` の中で、動的な穴を含むルートへのリンクをクリックしても、ナビゲーションが確定しません(テストは 30 秒でタイムアウト)。対象は `/all`、`/product/[id]`、`/cart` です。

- 完全に静的な `/about` への instant ナビゲーションは成功します。
- 同じビルドを `next start` で動かすと `/all` への instant ナビゲーションは成功するので、OpenNext 固有の問題です。
- Worker 側のプリフェッチ要求(`RSC`、`Next-Router-Prefetch`)はすべて 200 を返しています。プリフェッチ結果がクライアントで「即時表示に足りる」と判定されていないようです。原因は未特定です。

**迂回策**

- e2e の `instant()`(`e2e/fixtures.ts`)に `{ partial: true }` を付けたルートでは、OpenNext 上だけロックを外してステップを実行し、最終的な UI を確認します。テストには `not-instant-on-opennext` という注記を付けます。
- ロック中にしか成り立たない確認(例: リアルタイム在庫がまだ表示されていないこと)は、`locked` が `true` のときだけ行います。
- `next start` に対して流すとき(`E2E_RUNTIME=node`)は、通常どおり instant を検証します。
- アプリ側の `instant = true` と `<Link prefetch>` はそのまま使っています。

### 3. Turbopack ビルド

**状態: 使えない。webpack でビルドすることで迂回。**

**現象**

Next 16.5 の Turbopack ランタイムには、トップレベルの `function requireChunk(chunkPath, sourceModuleId)` があります。OpenNext は `require(resolved)` を `requireChunk(chunkPath)` に書き換えたうえで、同名のトップレベル関数 `function requireChunk(chunkPath)` を追加します。後から宣言された OpenNext 側が巻き上げで勝つため、`loadChunkAsync` がチャンクの生の exports を返してしまいます。その結果、次のエラーが出ます。

- `TypeError: a3.then is not a function`(クライアントコンポーネントの SSR)
- `Module … was instantiated … but the module factory is not available`

**迂回策**

- `build` スクリプトを `next build --webpack` にしました。
- 本来は OpenNext 側でヘルパー名を変えるべき不具合です。

### 4. `'use cache: remote'` の永続化

**状態: そのままでは使えない。KV ハンドラーを remote に登録することで迂回。**

**現象**

- OpenNext は KV を使う composable cache を `cacheHandlers.default` にしか登録せず、実行時に `next.config.ts` の `cacheHandlers` を上書きします。
- そのため `remote` は Next 組み込みのメモリハンドラーにフォールバックします。OpenNext はこれを `cacheMaxMemorySize: 0` で無効にしているので、remote のエントリは一切保存されません。

**迂回策**

- `instrumentation.ts` から、Next.js がキャッシュハンドラー初期化時に読むプラットフォーム用シンボルを使い、同じ KV ハンドラーを `RemoteCache` として登録します(`lib/remote-cache-handler.ts`)。
- デバッグログで `'use cache: remote'` のキーが `[KVIncrementalCache] get/set` されることを確認しました。

### 5. Resume Data Cache の圧縮

**状態: 使えない。圧縮を無効化することで迂回。**

**現象**

zlib で圧縮された Resume Data Cache が workerd で展開できません(`Failed to parse postponed state { errorName: 'RangeError' … }`)。部分プリレンダーの再開時に、キャッシュ済みの読み取りがすべて捨てられます。

**迂回策**

`experimental.disableResumeDataCacheCompression: true` にしました。

### 6. モジュール読み込みシグナルのリクエスト間共有

**状態: そのままでは使えない。ビルド後パッチで迂回。**

**現象**

Next.js はモジュール読み込みの追跡用に、プロセスで 1 つの `CacheSignal` を持ち、すべての描画がそれを購読します。あるリクエストでのモジュール読み込みが、別のリクエストの描画のタイマーを動かしたり Promise を解決したりします。Node では問題になりませんが、workerd では禁止されています。同時リクエスト(プリフェッチ)で次のエラーが出て、リクエストがハングします。

- `Cannot perform I/O on behalf of a different request`(`clearImmediate`)
- `Cannot call this AsyncLocalStorage bound function outside of the request…`
- `A promise was resolved … from a different request context`

**迂回策**

- `scripts/patch-worker.ts`: ビルド済みバンドル内の `CacheSignal#subscribeToReads` を何もしない関数に置き換えます。呼び出し元はモジュール読み込み追跡だけです。
- `lib/cross-request-timers.ts`: 共有シグナルが別リクエストのタイマーを解除しようとしたときのエラーだけを無視します。
- どちらもテストを書いています。本来は Next.js 側でリクエストごとのシグナルにすべき問題です。

### 7. その他の小さな迂回

- **`instrumentation.ts` からの動的 `import()`**
  - 現象: サーバー起動時に `the module factory is not available` が出ます。
  - 迂回策: `instrumentation.ts` では静的 import だけを使います。
- **ビルド時の `getCloudflareContext()`**
  - 現象: Wrangler の `getPlatformProxy` 経由になるため、ビルドのたびにマイグレーションとシード済みのローカル D1 が必要です。
  - 迂回策: `lib/local-context.ts` のメモリ上の Miniflare D1 を使います。workerd かどうかは `navigator.userAgent === 'Cloudflare-Workers'` で判定します。
- **R2 が使えない**
  - 迂回策: インクリメンタルキャッシュは KV を使います(アカウント設定の問題)。

### `cf` CLI を使わず Wrangler にした理由

最初は `cf` CLI(`cloudflare.config.ts`)でデプロイしましたが、`cf` では OpenNext を扱えないため Wrangler に切り替えました。

- `cf build` / `cf deploy` は Next.js を検出すると vinext 向けに扱い、`npx next build` を実行します。その後 `Build Output Specification: no root config found at …/.cloudflare/output/v0/config.json` で失敗します。
  - デプロイには `wrangler build --experimental-new-config --experimental-cf-build-output` と `cf deploy --prebuilt` の手動実行が必要でした。
- `cf dev` も同じ理由で `next dev` を起動するため、Worker のローカル実行には結局 `wrangler dev` が必要でした。
- OpenNext の `populateCache` と `deploy` は Wrangler を呼びます。`cf` では KV への投入を自前で実装し直す必要がありました(`cf kv bulk put`)。
- `cf` にはライブのログ tail がありません。

### その他

- `next build` / `next dev` / workerd で出る `setTimeout()` に関する警告は想定どおりです。
- `https://realworld-opennext.wataru-chame-gon.workers.dev` は、修正前の Turbopack ビルドを `cf` でデプロイしたもので、全ルートが 500 を返します。修正版の再デプロイには `wrangler login` が必要です。
