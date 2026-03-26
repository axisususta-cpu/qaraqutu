# Canonical UI Targets

Bu klasördeki iki HTML dosyası QARAQUTU için canonical UI target'tır.

- `qaraqutu-landing.html`
- `qaraqutu_incident_inspection_station.html`

Kurallar:
- Bunlar inspiration değildir.
- Bunlar approximate reference değildir.
- Bunlar exact shell target'tır.
- Home / landing yüzeyi `qaraqutu-landing.html` dosyasına göre kurulacaktır.
- Verifier yüzeyi `qaraqutu_incident_inspection_station.html` dosyasına göre kurulacaktır.

Uygulama kuralı:
- Mevcut sayfaları sadece sıkılaştırmak yeterli değildir.
- Gerekirse mevcut shell kırılacak ve bu target HTML’lerin layout iskeleti doğrudan port edilecektir.
- Ancak QARAQUTU doctrine, canlı veri akışı, incident spine, bounded replay ve verification state machine korunacaktır.

Öncelik sırası:
1. Exact visual/layout fidelity
2. Doctrine continuity
3. Existing working logic integration

Kısa hüküm:
Bu iki dosya görsel referans değil, ürün yüzeyinin exact hedefidir.