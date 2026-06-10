"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface HeartQRCodeProps {
  url: string;
  color: string;
  size?: number;
}

export default function HeartQRCode({ url, color, size = 180 }: HeartQRCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    // Heart SVG path to use as image in center
    const heartSvgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path fill="${color}" d="M50 85 C10 60 5 35 20 20 C30 10 45 15 50 25 C55 15 70 10 80 20 C95 35 90 60 50 85Z"/>
      </svg>
    `)}`;

    qrRef.current = new QRCodeStyling({
      width: size,
      height: size,
      type: "svg",
      data: url,
      image: heartSvgDataUrl,
      dotsOptions: {
        color: color,
        type: "extra-rounded",
      },
      backgroundOptions: {
        color: "transparent",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        imageSize: 0.3,
        margin: 4,
      },
      cornersSquareOptions: {
        color: color,
        type: "extra-rounded",
      },
      cornersDotOptions: {
        color: color,
        type: "dot",
      },
      qrOptions: {
        errorCorrectionLevel: "H",
      },
    });

    if (ref.current) {
      ref.current.innerHTML = "";
      qrRef.current.append(ref.current);
    }
  }, [url, color, size]);

  return <div ref={ref} style={{ width: size, height: size }} />;
}
