"""Read-only public City context capture. Run in requirements-scraping.txt env.

Only GET public HTML and discovered static JS; never execute scripts, authenticate,
or call world APIs. Range requests bound requested bytes; servers can ignore Range,
so the accepted-body cap is also checked. Scrapling buffers each HTTP response.
"""
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlparse
import hashlib
import json
import re
import signal
import time

from scrapling.fetchers import Fetcher

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "research/qdl-v1/city-evidence.json"
ORIGIN = "https://midnight.city"
MAX_REQUESTS = 9
MAX_BODY = 2_000_000
MAX_TOTAL = 5_000_000
MAX_TEXT_WORDS = 25
records = []
total = 0
started = time.monotonic()


def deadline(_signum, _frame):
    raise TimeoutError("120-second total retrieval deadline reached")


def retrieve(path, kind):
    global total
    url = urljoin(ORIGIN + "/", path)
    if urlparse(url).path.startswith("/docs/") and not url.endswith("/"):
        url += "/"
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "midnight.city":
        raise ValueError("Only official same-origin public URLs are allowed")
    if not (parsed.path == "/" or parsed.path.startswith(("/docs/", "/assets/"))):
        raise ValueError("Not a public document or static asset")
    if parsed.query or len(records) >= MAX_REQUESTS or total >= MAX_TOTAL:
        raise ValueError("Request budget or URL policy exceeded")
    remaining = min(MAX_BODY, MAX_TOTAL - total)
    record = {"url": url, "kind": kind,
              "retrievedAt": datetime.now(timezone.utc).isoformat()}
    records.append(record)
    response = Fetcher.get(url, timeout=12, retries=0, follow_redirects=False,
                           headers={"Range": f"bytes=0-{remaining - 1}"})
    body = bytes(response.body)
    record.update(status=response.status, bytes=len(body),
                  sha256=hashlib.sha256(body).hexdigest())
    total += len(body)
    if len(body) > remaining:
        record["error"] = "Server ignored requested byte limit; body excluded"
        raise ValueError(record["error"])
    if response.status not in (200, 206):
        record["error"] = "Non-success status; content excluded"
        return None
    if kind == "static-code":
        source = body.decode("utf-8", errors="replace")
        terms = ("How completion is checked", "No decision reason has been recorded",
                 "Latest confirmed result", "Agent-reported progress",
                 "No next step shared", "The City can show confirmed activity",
                 "Prices show possible uses", "Embedded App SDK is active")
        excerpts = []
        for term in terms:
            hit = source.find(term)
            if hit >= 0:
                excerpts.append({"term": term, "offset": hit,
                                 "excerpt": source[max(0, hit - 30):hit + 280]})
        record["excerpts"] = excerpts
        record["discoveredPublicDocs"] = sorted(set(re.findall(r"/docs/[a-z0-9/-]+", source)))[:30]
        record["discoveredActivityScripts"] = sorted(set(re.findall(r"assets/ActivityPage-[A-Za-z0-9_-]+\.js", source)))[:2]
    else:
        full_text = response.get_all_text(separator=" ", strip=True)
        words = full_text.split()
        record["text"] = " ".join(words[:MAX_TEXT_WORDS])
        record["textTruncated"] = len(words) > MAX_TEXT_WORDS
        record["extractedTextChars"] = len(full_text)
        record["links"] = list(dict.fromkeys(response.css("a::attr(href)").getall()))[:90]
        record["scripts"] = response.css("script::attr(src)").getall()[:12]
    return record


def main():
    signal.signal(signal.SIGALRM, deadline)
    signal.alarm(120)
    failure = None
    try:
        home = retrieve("/", "homepage-shell")
        bundle = None
        if home:
            for path in home["scripts"][:1]:
                bundle = retrieve(path, "static-code")
        if bundle:
            for path in bundle["discoveredActivityScripts"][:1]:
                retrieve(path, "static-code")
        docs = retrieve("/docs/", "official-documentation")
        wanted = ("/docs/connect-to-midnight-city/first-night",
                  "/docs/gameplay/gathering-and-resources",
                  "/docs/gameplay/crafting-and-workstations",
                  "/docs/gameplay/economy-and-needs")
        if docs:
            for path in wanted:
                if path in docs["links"]:
                    retrieve(path, "official-documentation")
    except Exception as error:
        failure = str(error)
    finally:
        signal.alarm(0)
        OUT.parent.mkdir(parents=True, exist_ok=True)
        result = {"fetcher": "Scrapling Fetcher 0.4.15", "scope": "public read-only documentation/static code; no live thought feed",
                  "limits": {"requests": MAX_REQUESTS, "acceptedBodyBytesEach": MAX_BODY,
                             "acceptedBodyBytesTotal": MAX_TOTAL, "seconds": 120,
                             "httpTimeoutSeconds": 12, "rangeMayBeIgnored": True,
                             "storedDocumentExcerptWords": MAX_TEXT_WORDS},
                  "elapsedSeconds": round(time.monotonic() - started, 3),
                  "receivedBytes": total, "failure": failure, "records": records}
        OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
        print(json.dumps({"output": str(OUT.relative_to(ROOT)), "requests": len(records),
                          "receivedBytes": total, "failure": failure}))
    if failure:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
