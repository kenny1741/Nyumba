"use client";
import { useState } from "react";

interface Props { images: string[]; title: string; }

export default function ImageGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const imgs = images?.length > 0 ? images : ["/placeholder.jpg"];

  return (
    <div>
      {/* Main image */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-zoom-in"
        style={{ height: 420 }}
        onClick={() => setLightbox(true)}
      >
        <img src={imgs[active]} alt={title} className="w-full h-full object-cover" />
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
          {active + 1} / {imgs.length}
        </div>
        {imgs.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setActive(p => (p - 1 + imgs.length) % imgs.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
            >‹</button>
            <button
              onClick={e => { e.stopPropagation(); setActive(p => (p + 1) % imgs.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
            >›</button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {imgs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 rounded-xl overflow-hidden transition-all ${
                i === active ? "ring-2 ring-offset-2 opacity-100" : "opacity-60 hover:opacity-80"
              }`}
              style={{ width: 80, height: 60, ringColor: "var(--terracotta)" }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center">✕</button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl w-12 h-12 flex items-center justify-center"
            onClick={e => { e.stopPropagation(); setActive(p => (p - 1 + imgs.length) % imgs.length); }}
          >‹</button>
          <img
            src={imgs[active]} alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl w-12 h-12 flex items-center justify-center"
            onClick={e => { e.stopPropagation(); setActive(p => (p + 1) % imgs.length); }}
          >›</button>
        </div>
      )}
    </div>
  );
}
