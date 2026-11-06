'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';
import DeleteQrButton from '@/components/business/DeleteQrButton';

export default function QrCard({
  id,
  name,
  publicUrl,
  scanCount,
  isActive,
}: {
  id: string;
  name: string;
  publicUrl: string;
  scanCount: number;
  isActive: boolean;
}) {
  const svgWrapRef = useRef<HTMLDivElement>(null);

  function downloadPng() {
    const svg = svgWrapRef.current?.querySelector('svg');
    if (!svg) return;

    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement('a');
      a.download = `${name.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;base64,${svg64}`;
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-white font-semibold">{name}</p>
          <p className="text-gray-500 text-xs mt-0.5">{scanCount} escaneos</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            isActive ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'
          }`}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div
        ref={svgWrapRef}
        className="bg-white rounded-lg p-3 flex items-center justify-center mx-auto"
      >
        <QRCodeSVG value={publicUrl} size={160} level="M" includeMargin />
      </div>

      <p className="text-gray-500 text-[11px] break-all text-center">{publicUrl}</p>

      <div className="flex flex-wrap gap-2 justify-center pt-1">
        <button
          type="button"
          onClick={downloadPng}
          className="bg-white text-gray-900 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100"
        >
          Descargar
        </button>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="border border-gray-600 text-gray-300 text-sm px-3 py-1.5 rounded-lg hover:border-gray-400"
        >
          Abrir
        </a>
        <DeleteQrButton id={id} />
      </div>
    </div>
  );
}