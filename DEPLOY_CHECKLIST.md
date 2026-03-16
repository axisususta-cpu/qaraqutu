# QARAQUTU Deploy Checklist

- Önce doğru project'i seç: `qaraqutu-web` veya `qaraqutu-api`.
- Branch gerçekten `main` mi kontrol et.
- Deploy edeceğin commit SHA deploy ekranında görünüyor mu kontrol et.
- Commit deploy ekranında görünmüyorsa promote etme.
- Deployment durumu `READY` olmadan production kararı verme.
- Doğru domain/alias doğru deployment'a mı bağlı kontrol et.
- Web ve API'yi birbirinin yerine doğrulanmış sayma.
- Acceptance'tan önce production URL'yi gerçekten kontrol et.
- Teslim raporunda şunları yaz:
  - project
  - branch
  - local HEAD SHA
  - origin SHA
  - preview URL
  - production URL
  - auto deploy mi promote mu
  - live-visible check yapıldı mı
