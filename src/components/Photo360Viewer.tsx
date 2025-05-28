// components/Photo360Viewer.tsx
"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
type Props = {
  imageUrl: string;
};

export default function Photo360Viewer({ imageUrl }: Props) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = new Viewer({
      container: viewerRef.current,
      panorama: imageUrl,
    });

    return () => {
      viewer.destroy();
    };
  }, [imageUrl]);

  return <div ref={viewerRef} style={{ width: "100%", height: "100%" }} />;
}
