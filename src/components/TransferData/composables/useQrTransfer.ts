import { ref, Ref } from 'vue';
import QRCode from 'qrcode';
import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';

interface DeviceSupportResults {
  permissionsGranted: boolean;
  isModuleAvailable: boolean;
  isCameraSupported: boolean;
  passed: boolean;
  errors: string[];
}

export function useQrTransfer() {
  const isScanning: Ref<boolean> = ref(false);
  const errorMessage: Ref<string> = ref('');
  const transferSuccess: Ref<boolean> = ref(false);
  const successMessage: Ref<string> = ref('');

  const generateQRCode = async (container: HTMLElement, data: any): Promise<void> => {
    if (!container) return;
    
    try {
      const dataString = JSON.stringify(data);
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, dataString, {
        width: 250,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      container.innerHTML = '';
      container.appendChild(canvas);
    } catch (err) {
      console.error('Error generating QR code:', err);
      errorMessage.value = 'Помилка при генерації QR-коду';
    }
  };

  const testDeviceSupport = async (): Promise<DeviceSupportResults> => {
    const results: DeviceSupportResults = {
      permissionsGranted: false,
      isModuleAvailable: false,
      isCameraSupported: false,
      passed: false,
      errors: [],
    };

    try {
      const { camera } = await BarcodeScanner.checkPermissions();
      if (camera !== 'granted') {
        const permissionResult = await BarcodeScanner.requestPermissions();
        if (permissionResult.camera !== 'granted') {
          results.errors.push('Доступ до камери не надано');
          return results;
        }
      }
      results.permissionsGranted = true;

      // check if the Google Barcode Scanner module is available
      const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
      if (!available) {
        results.errors.push('Модуль Google Barcode Scanner недоступний');
        await BarcodeScanner.installGoogleBarcodeScannerModule();
        return results;
      }
      results.isModuleAvailable = true;

      // check if the camera is supported
      try {
        await BarcodeScanner.setZoomRatio({ zoomRatio: 1.0 });
        results.isCameraSupported = true;
      } catch (e) {
        results.errors.push('Камера не підтримується або не працює');
        return results;
      }

      results.passed = true;
      return results;
    } catch (err: any) {
      results.errors.push(`Неочікувана помилка: ${err.message || err}`);
      return results;
    }
  };

  const checkDeviceSupport = async (): Promise<boolean> => {
    const result = await testDeviceSupport();
    if (!result.passed) {
      console.log('Помилки:', result.errors);
      alert('Цей пристрій не підтримує сканування: ' + result.errors.join(', '));
      return false;
    }
    return true;
  };

  const startScan = async (): Promise<any | null> => {
    try {
      isScanning.value = true;
      document.body.classList.add('barcode-scanner-active');

      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode]
      });

      document.body.classList.remove('barcode-scanner-active');
      isScanning.value = false;

      if (barcodes.length > 0) {
        const data = barcodes[0].rawValue;
        if (data) {
          try {
            const parsed = JSON.parse(data);
            transferSuccess.value = true;
            successMessage.value = 'Звіт успішно отримано!';
            return parsed;
          } catch (e) {
            errorMessage.value = 'Некоректний формат даних у QR-коді.';
            return null;
          }
        } else {
          errorMessage.value = 'QR-код не містить даних.';
          return null;
        }
      } else {
        errorMessage.value = 'QR-код не знайдено.';
        return null;
      }
    } catch (err: any) {
      console.error('Помилка під час сканування:', err);
      isScanning.value = false;
      document.body.classList.remove('barcode-scanner-active');
      errorMessage.value = `Помилка сканування: ${err.message || 'Невідома помилка'}`;
      return null;
    }
  };
  
  const stopScan = async (): Promise<void> => {
    document.body.classList.remove('barcode-scanner-active');
    isScanning.value = false;
    await BarcodeScanner.stopScan();
    await BarcodeScanner.removeAllListeners();
  };

  const resetError = (): void => {
    errorMessage.value = '';
  };

  return {
    isScanning,
    errorMessage,
    transferSuccess,
    successMessage,
    generateQRCode,
    checkDeviceSupport,
    startScan,
    stopScan,
    resetError
  };
}