/**
 * Minimal typings for `qrcode` (client-side `toDataURL` only).
 * Keeps `tsc` happy when workspace install / lockfile is out of sync; aligns with `qrcode` + @types/qrcode at runtime.
 */
declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }

  const QRCode: {
    toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
  };

  export default QRCode;
}
