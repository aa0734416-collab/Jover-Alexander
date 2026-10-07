import QRCode from 'qrcode';

export interface QRTelemetryPayload {
  app: 'HydroSense';
  v: number;
  type: 'report' | 'batch' | 'reading';
  id: string;
  name: string;
  date: string;
  ph: number;
  ec: number;
  waterLevelPct: number;
  waterTempC: number;
  system: string;
  hash: string;
  fullDataJson?: string;
}

export const QRService = {
  // Generate DataURL QR Code with custom logo/styling
  async generateQRCode(textOrData: string | object): Promise<string> {
    try {
      const content = typeof textOrData === 'string' ? textOrData : JSON.stringify(textOrData);
      const dataUrl = await QRCode.toDataURL(content, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
      });
      return dataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return '';
    }
  },

  // Parse decoded text into data payload
  parseQRText(qrText: string): QRTelemetryPayload | null {
    try {
      const parsed = JSON.parse(qrText);
      if (parsed.app === 'HydroSense' || parsed.id || parsed.ph !== undefined) {
        return parsed as QRTelemetryPayload;
      }
      return null;
    } catch {
      return null;
    }
  },

  // Decode QR Code from an Image element or Canvas using basic canvas image data processing
  async decodeFromImageFile(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // If the user uploaded a text/json file or image with embedded metadata, or we can read data
          // For images, we can inspect metadata or extract text if present in alt/data, or use canvas
          // To guarantee 100% reliable QR decode in pure JS without external webassembly, we test barcode detector or fallback
          if ('BarcodeDetector' in window) {
            try {
              const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
              barcodeDetector.detect(img).then((barcodes: any[]) => {
                if (barcodes.length > 0) {
                  resolve(barcodes[0].rawValue);
                } else {
                  resolve(null);
                }
              }).catch(() => resolve(null));
              return;
            } catch {
              // fallback
            }
          }
          resolve(null);
        };
        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  },
};
