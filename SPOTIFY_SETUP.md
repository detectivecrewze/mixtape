# Panduan Setup Spotify Developer App

Berikut langkah-langkah untuk mendapatkan `SPOTIFY_CLIENT_ID` dan `SPOTIFY_CLIENT_SECRET` yang dibutuhkan Cloudflare Worker untuk fitur pencarian lagu.

---

## 1. Buat Akun Spotify Developer

1. Buka [https://developer.spotify.com](https://developer.spotify.com)
2. Login dengan akun Spotify kamu (akun gratis sudah cukup)
3. Klik nama kamu di pojok kanan atas → **Dashboard**

---

## 2. Buat App Baru

1. Di Dashboard, klik tombol **Create app**
2. Isi form berikut:
   - **App name**: `Mixtape for You`
   - **App description**: `Digital mixtape gift platform`
   - **Website**: `https://mixtape.for-you-always.my.id`
   - **Redirect URI**: `https://mixtape.for-you-always.my.id` *(wajib diisi tapi tidak dipakai karena kita pakai Client Credentials flow)*
   - **APIs used**: centang **Web API**
3. Centang kotak Terms of Service
4. Klik **Save**

---

## 3. Ambil Credentials

1. Di halaman app yang baru dibuat, klik tab **Settings**
2. Kamu akan melihat:
   - **Client ID** — copy ini
   - **Client Secret** — klik **View client secret**, lalu copy

---

## 4. Set Secrets di Cloudflare Worker

Masuk ke folder `worker/` lalu jalankan perintah berikut **satu per satu** di terminal:

```bash
cd worker
npm install

# Set Client ID
npx wrangler secret put SPOTIFY_CLIENT_ID
# → Paste Client ID kamu, tekan Enter

# Set Client Secret
npx wrangler secret put SPOTIFY_CLIENT_SECRET
# → Paste Client Secret kamu, tekan Enter
```

Secrets ini **tidak** tersimpan di file apapun — langsung masuk ke Cloudflare dashboard secara terenkripsi.

---

## 5. Buat KV Namespace

```bash
# Masih di folder worker/
npx wrangler kv namespace create MIXTAPE_KV
```

Output-nya akan berisi `id = "xxxx"`. Copy ID tersebut, lalu paste ke `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "MIXTAPE_KV"
id = "PASTE_ID_DISINI"
```

---

## 6. Deploy Worker

```bash
npx wrangler deploy
```

Setelah berhasil, kamu akan dapat URL Worker seperti:
```
https://mixtape-worker.aldoramadhan16.workers.dev
```

Copy URL ini, lalu buat file `.env.local` di root project Next.js:

```bash
# Di root folder mixtape-love/
NEXT_PUBLIC_WORKER_URL=https://mixtape-worker.aldoramadhan16.workers.dev
```

---

## 7. Verifikasi

Test endpoint search dari browser atau terminal:

```bash
curl "https://mixtape-worker.aldoramadhan16.workers.dev/mixtape/spotify/search?q=coldplay"
```

Jika berhasil, kamu akan melihat array JSON berisi lagu-lagu Coldplay.

---

## Catatan Penting

- Client Credentials flow **tidak membutuhkan login user** — cocok untuk server-side search
- Token Spotify dicache otomatis di KV selama ~55 menit (expire_in - 1 menit buffer)
- Quota Spotify Developer gratis: **25 requests/second**, lebih dari cukup untuk produk ini
- Jangan commit `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` ke Git — selalu gunakan `wrangler secret`
