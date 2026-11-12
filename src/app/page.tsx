"use client";

import { useCallback, useEffect, useState } from "react";

interface LinkItem {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch("/api/links", {
        cache: "no-store",
      });

      const result: ApiResponse<LinkItem[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch links");
      }

      setLinks(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCreatedUrl("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ originalUrl: url }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to shorten URL");
      }

      setCreatedUrl(result.data.shortUrl);
      setUrl("");
      await fetchLinks();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function copyUrl(shortUrl: string, code: string) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError("Unable to copy URL");
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Header */}
        <header className="mb-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
              ↗
            </div>
            <span className="text-xl font-semibold tracking-tight">
              tiny<span className="text-blue-500">url</span>
            </span>
          </a>

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            ● System operational
          </span>
        </header>

        {/* Hero */}
        <section className="mb-12">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            Link management, simplified
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Shorten your links.
            <br />
            <span className="text-zinc-500">Keep it simple.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
            Turn long URLs into short, shareable links.
            Track clicks without the unnecessary complexity.
          </p>
        </section>

        {/* URL Form */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-2xl shadow-black/20 sm:p-7">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="url"
              className="mb-3 block text-sm font-medium text-zinc-300"
            >
              Destination URL
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="url"
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/your/long/url"
                className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="submit"
                disabled={submitting || !url.trim()}
                className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Shortening..." : "Shorten URL ↗"}
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          {createdUrl && (
            <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 text-xs text-emerald-400">
                  Your short URL is ready!
                </p>
                <a
                  href={createdUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm font-medium text-zinc-100 hover:text-blue-400"
                >
                  {createdUrl}
                </a>
              </div>

              <button
                type="button"
                onClick={() =>
                  copyUrl(createdUrl, "created")
                }
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800"
              >
                {copiedCode === "created" ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </section>

        {/* Links Section */}
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your links</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Manage and track your shortened URLs.
              </p>
            </div>

            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">
              {links.length} total
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center text-sm text-zinc-500">
              Loading your links...
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
              <p className="text-lg font-medium text-zinc-300">
                No links yet
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Your shortened URLs will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-800">
              <div className="hidden grid-cols-[1fr_1fr_100px_120px] gap-4 border-b border-zinc-800 bg-zinc-900/80 px-5 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500 sm:grid">
                <span>Original URL</span>
                <span>Short URL</span>
                <span>Clicks</span>
                <span>Created</span>
              </div>

              <div className="divide-y divide-zinc-800">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="grid gap-3 bg-zinc-950/40 px-5 py-5 transition hover:bg-zinc-900/60 sm:grid-cols-[1fr_1fr_100px_120px] sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="mb-1 text-xs text-zinc-500 sm:hidden">
                        Original URL
                      </p>
                      <p
                        title={link.originalUrl}
                        className="truncate text-sm text-zinc-300"
                      >
                        {link.originalUrl}
                      </p>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-xs text-zinc-500 sm:hidden">
                          Short URL
                        </p>

                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={link.shortUrl}
                          className="block truncate text-sm font-medium text-blue-400 hover:text-blue-300"
                        >
                          {link.shortUrl}
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyUrl(link.shortUrl, link.shortCode)}
                        title="Copy short URL"
                        className="shrink-0 whitespace-nowrap rounded-lg border border-zinc-800 px-3 py-2 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                      >
                        {copiedCode === link.shortCode ? "Copied" : "Copy"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <span className="text-xs text-zinc-500 sm:hidden">
                        Clicks:
                      </span>
                      {link.clicks}
                    </div>

                    <p className="text-xs text-zinc-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
          Built with Next.js, Prisma & SQLite.
        </footer>
      </div>
    </main>
  );
}
