// components/Photo360Viewer.tsx
"use client";
import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

type Props = {
  imageUrl: string;
};

/** Force a URL to https. The API returns http:// URLs but the page is served
 *  over https, so the browser blocks http image fetches as mixed content. */
function toHttps(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}

export default function Photo360Viewer({ imageUrl }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = new Viewer({
      container: viewerRef.current,
      panorama: toHttps(imageUrl),
    });

    return () => {
      viewer.destroy();
    };
  }, [imageUrl]);

  return <div ref={viewerRef} style={{ width: "100%", height: "100%" }} />;
}
