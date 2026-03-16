# QARAQUTU Deployment Discipline

## Amaç

Production deploy sürecini karıştırmadan yürütmek, `qaraqutu-web` ve `qaraqutu-api` ayrımını net tutmak, production'da gerçekten hangi commit'in çalıştığını doğrulamadan acceptance yapmamak.

## Proje ayrımı

- `qaraqutu-web` ve `qaraqutu-api` ayrı Vercel project'lerdir.
- Web deploy kontrolü API deploy kontrolünün yerine geçmez.
- API deploy kontrolü web deploy kontrolünün yerine geçmez.
- Her deploy adımında önce doğru project seçildiği doğrulanır.

## Normal akış

1. Implement
2. Commit
3. Push to `main`
4. Vercel auto deploy

Kural:

- Normal yol budur.
- Production için varsayılan beklenti: `main` push sonrası auto deploy.

## Promote to Production ne zaman kullanılır

- Sadece istisna / kurtarma yolu olarak kullanılır.
- Yanlış project, yanlış branch, yanlış commit veya eski preview deployment varsa önce durum netleştirilir.
- Promote, auto deploy yerine rutin yayın yöntemi olarak kullanılmaz.

## Deploy öncesi zorunlu kontrol listesi

1. Doğru proje
   - `qaraqutu-web` mi, `qaraqutu-api` mi?
2. Doğru branch
   - Production branch gerçekten `main` mi?
3. Doğru commit SHA
   - Deploy edilecek commit, local ve origin ile eşleşiyor mu?
4. Deployment READY
   - Promote veya acceptance öncesi deployment durumu `READY` olmalı.
5. Doğru domain/alias
   - Production domain gerçekten doğru deployment'a mı bakıyor?

## Acceptance öncesi production check

- Production URL açılmadan acceptance verilmez.
- Production'da görülen surface, beklenen commit ile eşleşmeden acceptance verilmez.
- Preview sonucu ile production sonucu aynı varsayılmaz.
- Route bazlı görünür kontrol yapılır.
- Web ve API ayrı ayrı doğrulanır.

## Web smoke check

- Doğru project: `qaraqutu-web`
- Doğru branch: `main`
- Doğru commit SHA deploy ekranında görünüyor
- Deployment `READY`
- Production URL doğru alias'a bağlı
- Kritik visible route'lar production'da kontrol edildi
- Preview URL ile production URL karıştırılmadı

## API smoke check

- Doğru project: `qaraqutu-api`
- Doğru branch: `main`
- Doğru commit SHA deploy ekranında görünüyor
- Deployment `READY`
- Production API domain'i doğru deployment'a bağlı
- Health / diagnostics / gerekli smoke endpoint'ler beklenen yanıtı veriyor
- Preview deployment production sanılmıyor

## Kural

- Deploy listesinde commit görünmüyorsa promote etme.

## Teslim raporu standardı

Her deploy/verification teslim raporunda şu alanlar zorunludur:

- `project`
- `branch`
- `local HEAD SHA`
- `origin SHA`
- `preview URL`
- `production URL`
- `auto deploy mi promote mu`
- `live-visible check yapıldı mı`
