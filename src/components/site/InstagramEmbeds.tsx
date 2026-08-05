"use client";

import Script from "next/script";
import { useEffect } from "react";
import type { InstagramPost } from "@/types/database";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramEmbeds({ posts }: { posts: InstagramPost[] }) {
  useEffect(() => {
    window.instgrm?.Embeds.process();
  }, [posts]);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex justify-center overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-2 shadow-[0_1px_2px_rgba(16,22,46,0.04)]"
            dangerouslySetInnerHTML={{ __html: post.embed_code }}
          />
        ))}
      </div>
      <Script
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onLoad={() => window.instgrm?.Embeds.process()}
      />
    </>
  );
}
