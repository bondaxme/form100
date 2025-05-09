import { ref, Ref } from 'vue';
import { 
  BluetoothLowEnergy
} from '@capawesome-team/capacitor-bluetooth-low-energy';

const REPORT_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const REPORT_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

const isSending: Ref<boolean> = ref(false);
const isReceiving: Ref<boolean> = ref(false);
const errorMessage: Ref<string> = ref('');
const transferSuccess: Ref<boolean> = ref(false);
const successMessage: Ref<string> = ref('');
const devicesList: Ref<any[]> = ref([]);
const selectedDevice: Ref<any | null> = ref(null);
const transferProgress: Ref<number> = ref(0);

export function useBluetoothTransfer() {
  const initialize = async (): Promise<boolean> => {
    try {
      const permissionsResult = await BluetoothLowEnergy.requestPermissions();
      
      // if (permissionsResult.location !== 'granted' || 
      //     permissionsResult.bluetooth !== 'granted') {
      //   errorMessage.value = 'Дозволи на Bluetooth не надано';
      //   return false;
      // }
      
      const isEnabledResult = await BluetoothLowEnergy.isEnabled();
      if (!isEnabledResult.enabled) {
        await BluetoothLowEnergy.openBluetoothSettings();
        return false;
      }
      
      return true;
    } catch (err: any) {
      errorMessage.value = `Помилка ініціалізації Bluetooth: ${err.message || 'Невідома помилка'}`;
      return false;
    }
  };

  const startForegroundService = async () => {
    await BluetoothLowEnergy.startForegroundService({
      body: 'Bluetooth передача активна',
      id: 1,
      smallIcon: 'smallIcon',
      title: 'Bluetooth передача',
    });
  };

  const stopForegroundService = async () => {
    await BluetoothLowEnergy.stopForegroundService();
  }

  const startAdvertising = async (): Promise<boolean> => {
    try {
      await BluetoothLowEnergy.startAdvertising({
        services: [
          {
            id: REPORT_SERVICE_UUID,
            characteristics: [
              {
                id: REPORT_CHARACTERISTIC_UUID,
                descriptors: [],
                permissions: {
                  read: true,
                  write: true,
                },
                properties: {
                  read: true,
                  write: true,
                  notify: true,
                  indicate: true,
                  broadcast: false,
                  writeWithoutResponse: true,
                  authenticatedSignedWrites: false,
                  extendedProperties: false,
                  notifyEncryptionRequired: false,
                  indicateEncryptionRequired: false
                },
              },
            ],
          },
        ],
      });
      
      isReceiving.value = true;
      return true;
    } catch (err: any) {
      errorMessage.value = `Помилка при запуску сервера: ${err.message || 'Невідома помилка'}`;
      return false;
    }
  };

  const stopAdvertising = async (): Promise<void> => {
    try {
      await BluetoothLowEnergy.stopAdvertising();
      isReceiving.value = false;
    } catch (err: any) {
      console.error('Error stopping advertising:', err);
    }
  };

  const startScan = async (): Promise<void> => {
    devicesList.value = [];
    
    try {
      await BluetoothLowEnergy.addListener('deviceScanned', (event) => {
        if (!devicesList.value.some(d => d.deviceId === event.id)) {
          devicesList.value.push({
            deviceId: event.id,
            name: event.name || 'Невідомий пристрій'});
        }
      });
      
      await BluetoothLowEnergy.startScan();
    } catch (err: any) {
      errorMessage.value = `Помилка при скануванні пристроїв: ${err.message || 'Невідома помилка'}`;
    }
  };

  const stopScan = async (): Promise<void> => {
    try {
      await BluetoothLowEnergy.stopScan();
    } catch (err: any) {
      console.error('Error stopping scan:', err);
    }
  };

  const connectToDevice = async (deviceId: string): Promise<boolean> => {
    if (!deviceId) {
      errorMessage.value = 'Помилка підключення до пристрою: ID пристрою не вказано';
      return false;
    }
    
    try {
      await BluetoothLowEnergy.connect({ deviceId });
      console.log(`Connected to device with ID: ${deviceId}`);
      await BluetoothLowEnergy.discoverServices({ deviceId });
      
      console.log(`Devices list:`, devicesList.value);
      selectedDevice.value = devicesList.value.find(d => d.deviceId === deviceId);
      
      if (!selectedDevice.value) {
        selectedDevice.value = { deviceId, name: 'Невідомий пристрій' };
      }
      
      console.log(`Selected device:`, selectedDevice.value);
      
      await BluetoothLowEnergy.addListener('deviceDisconnected', async (event) => {
        if (event.deviceId === deviceId && selectedDevice.value && !transferSuccess.value) {
          console.log(`Device with ID ${deviceId} disconnected unexpectedly`);
          errorMessage.value = 'Пристрій відключено несподівано';
          selectedDevice.value = null;
        }
      });
      
      return true;
    } catch (err: any) {
      errorMessage.value = `Помилка підключення до пристрою: ${err.message || 'Невідома помилка'}`;
      return false;
    }
  };

  const disconnectFromDevice = async (): Promise<void> => {
    if (!selectedDevice.value || !selectedDevice.value.deviceId) return;
    
    try {
      await BluetoothLowEnergy.disconnect({ deviceId: selectedDevice.value.deviceId });
      selectedDevice.value = null;
    } catch (err: any) {
      console.error('Error disconnecting from device:', err);
    }
  };

  const sendData = async (data: any): Promise<boolean> => {
    if (!selectedDevice.value || !selectedDevice.value.deviceId) {
      errorMessage.value = 'Пристрій не вибрано';
      return false;
    }
    
    try {
      isSending.value = true;
      transferProgress.value = 0;
      
      const dataString = JSON.stringify(data) + '\0';
      console.log('Data to send:', dataString);
      
      const encoder = new TextEncoder();
      const dataBytes = Array.from(encoder.encode(dataString));
      console.log('Data bytes:', dataBytes);
      
      const chunkSize = 20;
      const chunks = [];
      
      for (let i = 0; i < dataBytes.length; i += chunkSize) {
        chunks.push(dataBytes.slice(i, i + chunkSize));
      }
      console.log('Data chunks:', chunks);
      
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Sending chunk ${i + 1}/${chunks.length}`);
        
        console.log(selectedDevice.value.deviceId, REPORT_SERVICE_UUID, REPORT_CHARACTERISTIC_UUID, chunks[i]);
        
        await BluetoothLowEnergy.writeCharacteristic({
          deviceId: selectedDevice.value.deviceId,
          serviceId: REPORT_SERVICE_UUID,
          timeout: 10000,
          type: 'withoutResponse',
          characteristicId: REPORT_CHARACTERISTIC_UUID,
          value: chunks[i],
        });
        console.log(`Sent chunk ${i + 1}/${chunks.length}`);
        
        transferProgress.value = Math.round(((i + 1) / chunks.length) * 100);
        
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      console.log('All chunks sent successfully!');
      
      transferSuccess.value = true;
      successMessage.value = 'Звіт успішно відправлено!';
      isSending.value = false;
      return true;
    } catch (err: any) {
      errorMessage.value = `Помилка при відправці даних: ${err.message || 'Невідома помилка'}`;
      isSending.value = false;
      return false;
    }
  };

  const setupDataReceiver = async (onDataReceived?: (data: any) => void): Promise<void> => {
    console.log('Setting up data receiver...');
    let receivedChunks: Uint8Array[] = [];
    const data: any = { value: null };

    BluetoothLowEnergy.addListener('characteristicWriteRequest', async (event) => {
      if (event.characteristicId === REPORT_CHARACTERISTIC_UUID) {
        console.log('Received data:', event.value);
        try {
          receivedChunks.push(new Uint8Array(event.value));
          console.log('Received chunks:', receivedChunks);
          
          const combined = new Uint8Array(receivedChunks.flatMap(a => [...a]));
          const endIndex = combined.findIndex(v => v === 0);
          
          console.log('Combined data:', combined);
          if (endIndex !== -1) {
            console.log('End index:', endIndex);
            const completeData = combined.slice(0, endIndex);
            const decoder = new TextDecoder('utf-8');
            const dataString = decoder.decode(completeData);
            console.log('Complete data string:', dataString);
            
            try {
              data.value = JSON.parse(dataString);
              receivedChunks = [];
              
              transferSuccess.value = true;
              successMessage.value = 'Звіт успішно отримано!';
              
              await stopAdvertising();
              
              if (onDataReceived && data.value) {
                onDataReceived(data.value);
              }
            } catch (parseErr) {
              console.error('Error parsing received data:', parseErr);
              errorMessage.value = 'Отримані пошкоджені дані. Спробуйте знову.';
            }
          }
        } catch (err: any) {
          errorMessage.value = 'Помилка при обробці отриманих даних';
        }
      }
    });
  };

  const resetError = (): void => {
    errorMessage.value = '';
  };

  const cleanup = async (): Promise<void> => {
    try {
      console.log('Cleaning up Bluetooth resources...');
      await stopScan();
      await disconnectFromDevice();
      await stopAdvertising();
      await BluetoothLowEnergy.removeAllListeners();
      await stopForegroundService();
      
      isSending.value = false;
      isReceiving.value = false;
      transferProgress.value = 0;
      devicesList.value = [];
      selectedDevice.value = null;
      
      console.log('Bluetooth resources cleaned up successfully');
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  };

  return {
    isSending,
    isReceiving,
    errorMessage,
    transferSuccess,
    successMessage,
    devicesList,
    selectedDevice,
    transferProgress,
    initialize,
    startAdvertising,
    stopAdvertising,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromDevice,
    sendData,
    setupDataReceiver,
    resetError,
    cleanup,
    startForegroundService,
    stopForegroundService,
  };
}