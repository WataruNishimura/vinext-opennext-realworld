# `apps/vinext`

[vinext](https://github.com/cloudflare/vinext) 1.3.1（Vite 上で Next.js の API を提供するフレームワーク）で作った RealWorld コマースデモです。Cloudflare Vite プラグイン（v2 beta）と `cf` CLI で Cloudflare Workers にデプロイしています。

**公開 URL:** https://realworld-vinext.wataru-chame-gon.workers.dev

ページ構成は [next16-commerce](https://github.com/aurorascharff/next16-commerce) に合わせています。

- ホーム（注目商品、カテゴリ、おすすめ）
- 商品一覧（`/all`）: 検索、カテゴリ絞り込み、並び替え、ページ送り
- 商品詳細（`/product/[id]`）: 評価、在庫、レビュー
- カート（`/cart`）、保存した商品（`/saved`）、アカウント（`/account`）、サインイン（`/sign-in`）、紹介ページ（`/about`）

データと Server Function はすべて `@realworld/core` から、コンポーネントは `@realworld/ui` から使います。アプリ側のコードはルート、`features/` の薄い機能コンポーネント、`lib/` だけです。

## コマンド

```bash
pnpm dev               # cf dev   （Vite の開発サーバー。workerd 上でローカルの D1 と KV を使う）
pnpm build             # cf build （vite build → .cloudflare/output）
pnpm preview           # vite preview（本番ビルドを workerd とローカルのバインディングで動かす）
pnpm deploy            # cf deploy
pnpm db:setup:local    # Vite プラグインが使うローカル D1 にマイグレーションとシードを適用
pnpm db:setup:remote   # リモート D1（realworld-vinext）にマイグレーションとシードを適用
pnpm test              # Vitest（アプリのヘルパー）
pnpm test:e2e          # 本番ビルド（vite preview）に対して Playwright を実行
PLAYWRIGHT_BASE_URL=https://realworld-vinext.wataru-chame-gon.workers.dev pnpm test:e2e
```

`cf dev` は `--port` などのフラグを Vite に渡せません。フラグが必要なときは `vite dev` を直接実行してください。

## Cloudflare リソース

| リソース        | ID                                     | バインディング    |
| --------------- | -------------------------------------- | ----------------- |
| D1 データベース | `7c6d99ba-4407-484b-8fd8-4fb8dbf07bbc` | `DB`              |
| KV namespace    | `30c4ae3e5e0e4942bf72e4d72d564c4d`     | `VINEXT_KV_CACHE` |

どちらも `cf d1 create` と `cf kv namespaces create` で作成し、`cloudflare.config.ts` で宣言しています。リモートの D1 には、`@realworld/db` パッケージのスクリプト（`pnpm db:setup:remote`）でマイグレーションとシードを適用しました。Wrangler は使っていません。

## 設定のポイント

- **D1**: `lib/database.ts` で、`cloudflare:workers` の `env` を使って `configureDatabase(() => env.DB)` を呼んでいます。ルートレイアウトがこのファイルを import します。
- **データキャッシュ**: `vite.config.ts` で `@vinext/cloudflare` の `kvDataAdapter()` を vinext のデータキャッシュに登録しています。`'use cache'` のエントリ、`cacheTag` のメタデータ、`updateTag` のマーカーは Workers KV に保存され、isolate やデプロイをまたいで残ります。
- **レンダーステージ**: `vinext` の export condition により、`@realworld/core/render-stages` は何もしない代替実装に解決されます。Vite のトップレベルの `resolve.conditions` はクライアント環境にしか効かないので、`vite.config.ts` では `rsc` と `ssr` 環境にも設定しています。トップレベルだけだと、vinext の `next/cache` シムに対して `"prefetch" / "navigation": Missing export` でビルドが失敗します。
- **ワークスペースパッケージ**: vinext の `"use cache"` / `"use server"` 変換は、`packages/core` のソースに `@vitejs/plugin-rsc` の import を挿入します。pnpm の厳密な依存配置ではそこから解決できない（`Rolldown failed to resolve import "@vitejs/plugin-rsc/react/rsc/server"`）ため、`resolve.dedupe` でアプリ側から解決させています。
- **ローカルの状態**: Cloudflare Vite プラグインは、ローカルの D1 と KV を `cf` の既定（`~/.config/cloudflare/state`）ではなく `apps/vinext/.cloudflare/state` に保存します。そのため `db:setup:local` では `--persist-to` を指定しています。

## vinext でできなかったこと（2026-10-28 時点）

vinext 1.3.1、`@vinext/cloudflare` 1.2.1、`@cloudflare/vite-plugin` 2.0.0-beta.v.5、React 19.3.1 を Cloudflare Workers 上で検証した結果です。以下はどれも Next.js 16.5 canary では動き、このアプリでも使っている機能です。右の列は、vinext での挙動と、アプリで代わりにどうしているかです。

| 機能（Next.js での役割）                                                                                                                             | vinext での挙動と、アプリでの代替                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **静的シェル / Partial Prerendering**（`cacheComponents`）: レイアウトやキャッシュ済みの部分は静的に配信し、動的な部分だけをリクエストごとに描画する | 静的シェルはありません。どこかで Cookie を読むページ（このアプリではヘッダーのカートバッジとアカウントメニュー）は、ページ全体が毎リクエスト描画されます（`cache-control: private, no-store`）。キャッシュ済みのデータは KV から読むので、描画自体は軽いです。                          |
| **Partial Prefetching**（`partialPrefetching`）: `<Link prefetch>` がルートのキャッシュ済みの内容も先読みし、遷移時にすぐ表示する                    | 設定は無視されます。リンクが先読みするのはローディングシェル（レイアウトと Suspense のスケルトン）だけで、キャッシュ済みの商品データは遷移時に届きます（本番で約 250 ms）。                                                                                                             |
| **`prefetch()` / `navigation()` のレンダーステージ**（`next/cache`）: 内容をリンクの先読みに含めるか、遷移まで待たせるかを選ぶ                       | export されていません（ビルド時に `Missing export`）。`@realworld/core` の `vinext` export condition で何もしない関数に置き換えているので、この区切りの後ろの内容も毎リクエスト一緒に描画されます。                                                                                     |
| **`ensureStatic`** セグメント設定: ルートやレイアウトが指定した段階まで静的であることをビルド時に保証する                                            | エラーも警告も出ずに無視されます。Next.js 版と揃えるために export は残しています。                                                                                                                                                                                                      |
| **`instant`** セグメント設定: そのセグメントへの遷移が即座に描画されるかを検証する                                                                   | 何も言わずに無視されます。                                                                                                                                                                                                                                                              |
| **`@next/playwright` の `instant()`**: 動的な内容を止めておき、先読み済みの UI に何が出るかをテストで確認できる                                      | 遷移を止める仕組みがありません。e2e テストでは、スコープ内でも動的な内容が表示されることを確認し、違いを記録しています。                                                                                                                                                                |
| **ブラウザでの `'use cache: private'`**: セッションごとの結果をクライアント側にキャッシュし、ユーザーごとの内容も先読みできる                        | リクエスト単位のキャッシュのみで、ブラウザにも KV にも保存されません。動作としては正しいです。                                                                                                                                                                                          |
| **ストリーミング中の内容を包む `<ViewTransition>`**（共有の `AnimatedSuspense`）: スケルトンが消え、内容がアニメーション付きで現れる                 | SSR が `Element type is invalid … got: undefined` で失敗します。商品ページとカタログでは通常の `<Suspense>` を使っています(View Transitions を止めた画面は OpenNext と同じで、VRT で確認済み)。共有要素の遷移（`<ViewTransition name share>`）と、遷移時の View Transition は動きます。 |
| **`updateTag` を呼ぶ Server Function 直後の `router.push()`**: 最新のデータで遷移する                                                                | 現在の URL に push すると古いクライアントのルートキャッシュが表示されます（サインアウトしたのにヘッダーに名前が残りました）。アプリでは Server Function 自体の再描画に任せています。                                                                                                    |
| **`generateStaticParams` によるビルド時のプリレンダリング**                                                                                          | プリレンダリングされません（`prerender` オプション未設定で、ビルド時には D1 にも接続できないため）。ルートはリクエスト時に描画されます。                                                                                                                                                |

## vinext での Cache Components の動作状況

上記のデプロイ（バージョン `d681b5c3`）とローカルの本番ビルドで、2026-10-28 に確認しました。✅ 動作する、⚠️ 一部のみ、または意味が異なる、❌ 未対応（最も近い代替を使用）。

| 機能                                                 | 状況 | vinext 1.3.1 での挙動（根拠）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cacheComponents: true`                              | ⚠️   | `next.config.ts` から読み込まれ、vinext の「PPR ランタイム」（リンクの先読みに使うフォールバックやローディングシェル）が有効になります。ただし、ページが静的シェルと動的な部分に分かれることはありません。このアプリの HTML レスポンスはすべてリクエストごとに描画されます。`/`、`/about`、`/all`、`/product/17`、`/cart` のいずれも `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` でした。ヘッダーが全ページでセッションの Cookie を読むためです。                                                                                              |
| `'use cache'`                                        | ✅   | `kvDataAdapter` 経由で KV に保存されます。e2e の実行後、`realworld-vinext:cache:use-cache:build:…` に 82 件のエントリがあり、それぞれ KV のメタデータにタグ（`categories`、`products,product:17`、`reviews:17`、`cart:<id>`、`saved:<id>`、`account:<id>`）が付いていました。                                                                                                                                                                                                                                                                                               |
| `'use cache: remote'`                                | ✅   | 共有の `'use cache'` と同じ扱い（同じ KV）です。`stock:<id>`、`featured-products`、商品一覧のページがここに入ります。一度も検索していない `/all?q=…` は、初回 0.80〜0.96 秒、2 回目以降 0.16〜0.41 秒でした。                                                                                                                                                                                                                                                                                                                                                               |
| `'use cache: private'`                               | ⚠️   | リクエスト単位でのみ動きます。vinext のランタイムでも「per-request cache (not shared across requests)」と説明されており、KV に `session` のエントリはありません。Next.js はセッションごとの読み込みを先読みできるようブラウザに保持しますが、vinext は毎リクエスト Cookie を読み直します。サインイン・サインアウトやユーザーごとのデータは正しく動きます（e2e で確認）。                                                                                                                                                                                                    |
| `cacheLife`                                          | ✅   | 各エントリに `revalidateAt` / `expireAt` が保存され、プロファイルどおり stale-while-revalidate で配信されます。KV の TTL は `max(30 日, expire)` です。`cacheLife('max')` のエントリ（カート、保存した商品、アカウント、注目商品）は 365 日、`minutes` / `hours` / `days` のエントリはアダプターの既定の 30 日で、保存されたプロファイルに従って古くなります。                                                                                                                                                                                                              |
| `cacheTag`                                           | ✅   | タグは各 KV エントリのメタデータに書き込まれます（上記参照）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Server Function 内の `updateTag`                     | ✅   | タグのマーカー（`realworld-vinext:__tag:session` と、`cart:<id>`、`saved:<id>`、`account:<id>` をハッシュ化した `__tag:__hash:…`）が書き込まれ、Server Function のレスポンスで現在のルートが再描画されます。本番の e2e で、カートバッジ、カートの中身、保存した商品、プロフィール、サインアウト後のヘッダーがリロードなしに更新されることを確認しました。注意: Server Function の後に現在の URL へ `router.push()` すると、古いクライアントのルートキャッシュが表示されます（サインアウトしたユーザーの名前がヘッダーに残りました）。そのためアプリでは push していません。 |
| Partial Prefetching（`partialPrefetching: true`）    | ❌   | この設定は vinext のどこからも読まれません（警告も出ません）。最も近いのは、`<Link prefetch>` が `prefetch-loading-shell` の RSC ペイロードを取得する動作です（`/product/17` で 6.3 KB、`x-vinext-cache: HIT`、`s-maxage=31536000` でページキャッシュされる）。中身はレイアウトと Suspense のスケルトンだけで、キャッシュ済みの商品名、詳細、在庫、レビューは含まれません。それらは遷移時に届き、本番ではクリックから 254 ms で商品の見出しが表示されました。                                                                                                               |
| `<Link prefetch={true}>`                             | ✅   | 本番ビルドでは、画面に表示されたリンクが先読みされます。`/` では 14 件の先読みリクエストがありました（モードは `prefetch-loading-shell`、`/all` は `prefetch-dynamic-shell`）。`prefetch` を付けていないリンクは、シェルのモードなしで取得されます。                                                                                                                                                                                                                                                                                                                        |
| `ensureStatic`                                       | ❌   | 何も言わずに無視されます。ビルドのエラーも警告もなく、vinext のソースにも参照がありません。`/about`（`ensureStatic = 'navigation'`）も他のページと同じく `private, no-store` で配信されます。Next.js 版と揃えるために export は残しています。                                                                                                                                                                                                                                                                                                                               |
| `prefetch()` / `navigation()`（`next/cache`）        | ❌   | vinext の `next/cache` シムに export がありません（ビルド時に `Missing export`）。`@realworld/core` の `vinext` export condition が何もしない関数を提供するので、区切りの後ろの内容（カート、保存した商品、レビュー、おすすめ）はリクエストと一緒に描画され、キャッシュも効いたままです。                                                                                                                                                                                                                                                                                   |
| `instant` セグメント設定                             | ❌   | `export const instant = true` は受け付けられますが無視されます（検証も警告もありません）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `@next/playwright` の `instant()`                    | ❌   | vinext には遷移を止める仕組みがありません（`next-instant-navigation-testing` の Cookie を読みません）。`e2e/cart.spec.ts` では、`instant()` のスコープ内でもリアルタイムの在庫と、セッションごとの「Add to cart」ボタンが表示されることを確認しています。Next.js ならこれらは止められます。キャッシュ済みの内容が見えることを確かめる他の `instant()` のテストは通ります。                                                                                                                                                                                                  |
| View Transitions（`<ViewTransition>`）               | ⚠️   | 遷移時に `document.startViewTransition` が呼ばれます（商品ページへの遷移ごとに 1 回、計測済み）。表示済みの内容を包む `<ViewTransition name share>`（商品カードの画像から商品ページの画像へ）も動きます。一方、サスペンドする内容を包む `<ViewTransition>` や、Suspense の fallback 内の `<ViewTransition>`（共有の `AnimatedSuspense`）では SSR が `Error: Element type is invalid: expected a string … but got: undefined` で失敗します。そのため商品ページは通常の `<Suspense>` を使っています。                                                                         |
| 共有スケルトンを使った `<Suspense>` のストリーミング | ✅   | セッションごとの読み込みやキャッシュしない読み込みは、それぞれ専用の境界に `@realworld/ui` のスケルトン付きでストリーミングされます（リアルタイムの在庫、カートバッジ、アカウントメニュー、カートに追加、保存）。                                                                                                                                                                                                                                                                                                                                                           |
| `useOptimistic`                                      | ✅   | カートへの追加・削除、商品の保存・解除、カートの数量変更は楽観的に表示され、Server Function の結果で確定します。                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| React Compiler                                       | ✅   | `vinext({ react: { compiler: true } })` と `oxc-transform-react` で有効にしています（vinext は `next.config` の `reactCompiler` を使いません）。クライアントのチャンクにコンパイラのランタイム（`memo_cache_sentinel`）が含まれています。                                                                                                                                                                                                                                                                                                                                   |
| `generateStaticParams`                               | ⚠️   | 受け付けられますが、ビルド時には何もプリレンダリングされません（`prerender` オプション未設定で、ビルド時には D1 に接続できないため）。                                                                                                                                                                                                                                                                                                                                                                                                                                      |

その他の気づき:

- `"use cache"` の KV キーには、ビルドしたマシンのソースの絶対パスが入ります（例: `…:["/Users/…/packages/core/src/product/product-queries.ts:$$hoist_4_getStockStatus",…]`）。そのためビルドするマシンが変わるとキーも変わり、パスも KV 上で見えてしまいます。
- `kvDataAdapter()` の戻り値の型は `options?: … | undefined` で、`exactOptionalPropertyTypes` の下では vinext の `cache.data` の型と合いません。`vite.config.ts` では options を確定させて展開しています。
- vinext のビルド時のルート一覧では、ほとんどのルートが `?`（不明）に分類されます。`cookies()` の使用を静的に検出できないためです。
