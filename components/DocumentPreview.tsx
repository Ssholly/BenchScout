"use client";
import { useEffect, useState } from "react";

export default function DocumentPreview({ url, name }: { url: string; name: string }) {
  const [preview, setPreview] = useState<{ source: string; image: boolean } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    fetch(url, { credentials: "same-origin", cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("This document could not be opened. Please close and try again.");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        if (!["application/pdf", "image/png", "image/jpeg"].includes(blob.type)) throw new Error("Unsupported document format.");
        objectUrl = URL.createObjectURL(blob);
        setPreview({ source: objectUrl, image: blob.type.startsWith("image/") });
      }).catch(reason => { if (!controller.signal.aborted) setError(reason.message); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [url]);
  if (error) return <p role="alert">{error}</p>;
  if (!preview) return <p role="status">Loading document…</p>;
  return preview.image ? (
    // Authenticated Blob URLs cannot be optimized by the remote image loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={preview.source} alt={name} style={{ width: "100%", height: "55vh", objectFit: "contain" }} />
  ) : <iframe src={preview.source} title={name} style={{ width: "100%", height: "55vh", border: "none", borderRadius: "12px", background: "white" }} />;
}
