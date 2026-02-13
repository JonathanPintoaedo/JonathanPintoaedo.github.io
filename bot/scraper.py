# bot/scraper.py
import json
from datetime import datetime, timezone
from pathlib import Path

RUTA_JSON = Path("data/ofertas.json")

def upsert_oferta(title: str, price: float, url: str, image_url: str, source: str):
    now = datetime.now(timezone.utc).isoformat()

    data = {"updated_at": now, "items": []}
    if RUTA_JSON.exists():
        data = json.loads(RUTA_JSON.read_text(encoding="utf-8"))

    items = data.get("items", [])

    # reemplaza si ya existe por URL
    for i, it in enumerate(items):
        if it.get("url") == url:
            items[i] = {
                "title": title,
                "price": int(price),
                "url": url,
                "image": image_url,
                "source": source,
                "date": now
            }
            break
    else:
        items.insert(0, {
            "title": title,
            "price": int(price),
            "url": url,
            "image": image_url,
            "source": source,
            "date": now
        })

    data["updated_at"] = now
    data["items"] = items[:50]

    RUTA_JSON.parent.mkdir(parents=True, exist_ok=True)
    RUTA_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    # TODO: aquí va tu scraping real
    # Ejemplo dummy:
    upsert_oferta(
        title="Producto demo",
        price=29990,
        url="https://ejemplo.cl/producto",
        image_url="https://sportandfitness.cl/assets/placeholder.jpg",
        source="ejemplo.cl"
    )

if __name__ == "__main__":
    main()
