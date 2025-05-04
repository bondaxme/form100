import { ref, Ref } from 'vue';
import { 
  BluetoothLowEnergy
} from '@capawesome-team/capacitor-bluetooth-low-energy';

// Define a service and characteristic for our application
const REPORT_SERVICE_UUID = '00001800-0000-1000-8000-00805f9b34fb';
const REPORT_CHARACTERISTIC_UUID = '00002a00-0000-1000-8000-00805f9b34fb';

export function useBluetoothTransfer() {
  const isSending: Ref<boolean> = ref(false);
  const isReceiving: Ref<boolean> = ref(false);
  const errorMessage: Ref<string> = ref('');
  const transferSuccess: Ref<boolean> = ref(false);
  const successMessage: Ref<string> = ref('');
  const devicesList: Ref<any[]> = ref([]);
  const selectedDevice: Ref<any | null> = ref(null);
  const transferProgress: Ref<number> = ref(0);

  // Initialize BLE functionality
  const initialize = async (): Promise<boolean> => {
    try {
      const permissionsResult = await BluetoothLowEnergy.requestPermissions();
      
      if (permissionsResult.location !== 'granted' || 
          permissionsResult.bluetooth !== 'granted') {
        errorMessage.value = 'Дозволи на Bluetooth не надано';
        return false;
      }
      
      const isEnabledResult = await BluetoothLowEnergy.isEnabled();
      if (!isEnabledResult.enabled) {
        errorMessage.value = 'Bluetooth не увімкнено на пристрої';
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Error initializing BLE:', err);
      errorMessage.value = `Помилка ініціалізації Bluetooth: ${err.message || 'Невідома помилка'}`;
      return false;
    }
  };

  // Start advertising this device (acting as a peripheral)
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
                  writeWithoutResponse: false,
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
      console.error('Error starting advertising:', err);
      errorMessage.value = `Помилка при запуску сервера: ${err.message || 'Невідома помилка'}`;
      return false;
    }
  };

  // Stop advertising
  const stopAdvertising = async (): Promise<void> => {
    try {
      await BluetoothLowEnergy.stopAdvertising();
      isReceiving.value = false;
    } catch (err: any) {
      console.error('Error stopping advertising:', err);
    }
  };

  // Start scanning for devices
  const startScan = async (): Promise<void> => {
    devicesList.value = [];
    
    try {
      // Add event listener for discovered devices
      await BluetoothLowEnergy.addListener('deviceScanned', (event) => {
        // Transform the event to have a consistent deviceId property
        const deviceInfo = {
          ...event,
          deviceId: event.id // Add deviceId for consistency
        };
        
        // Only add devices that are not already in the list
        if (!devicesList.value.some(d => d.deviceId === event.id)) {
          devicesList.value.push(deviceInfo);
        }
      });
      
      await BluetoothLowEnergy.startScan();
    } catch (err: any) {
      console.error('Error starting scan:', err);
      errorMessage.value = `Помилка при скануванні пристроїв: ${err.message || 'Невідома помилка'}`;
    }
  };

  // Stop scanning for devices
  const stopScan = async (): Promise<void> => {
    try {
      await BluetoothLowEnergy.stopScan();
      BluetoothLowEnergy.removeAllListeners();
    } catch (err: any) {
      console.error('Error stopping scan:', err);
    }
  };

  // Connect to a device
  const connectToDevice = async (deviceId: string): Promise<boolean> => {
    if (!deviceId) {
      errorMessage.value = 'Помилка підключення до пристрою: ID пристрою не вказано';
      return false;
    }
    
    try {
      console.log(`Connecting to device with ID: ${deviceId}`);
      await BluetoothLowEnergy.connect({ deviceId });
      await BluetoothLowEnergy.discoverServices({ deviceId });
      
      // Find the device in our list
      selectedDevice.value = devicesList.value.find(d => d.deviceId === deviceId);
      if (!selectedDevice.value) {
        // If device not found in our list, create a minimal representation
        selectedDevice.value = { deviceId, name: 'Невідомий пристрій' };
      }
      
      return true;
    } catch (err: any) {
      console.error('Error connecting to device:', err);
      errorMessage.value = `Помилка підключення до пристрою: ${err.message || 'Невідома помилка'}`;
      return false;
    }
  };

  // Disconnect from a device
  const disconnectFromDevice = async (): Promise<void> => {
    if (!selectedDevice.value || !selectedDevice.value.deviceId) return;
    
    try {
      await BluetoothLowEnergy.disconnect({ deviceId: selectedDevice.value.deviceId });
      selectedDevice.value = null;
    } catch (err: any) {
      console.error('Error disconnecting from device:', err);
    }
  };

  // Send data to a device
  const sendData = async (data: any): Promise<boolean> => {
    if (!selectedDevice.value || !selectedDevice.value.deviceId) {
      errorMessage.value = 'Пристрій не вибрано';
      return false;
    }
    
    try {
      isSending.value = true;
      
      // Convert the data to a string and then to a byte array
      const dataString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBytes = Array.from(encoder.encode(dataString));
      
      // Due to BLE packet size limitations, we may need to chunk the data
      const chunkSize = 512; // This can be adjusted based on MTU
      const chunks = [];
      
      for (let i = 0; i < dataBytes.length; i += chunkSize) {
        chunks.push(dataBytes.slice(i, i + chunkSize));
      }
      
      // Send each chunk
      for (let i = 0; i < chunks.length; i++) {
        await BluetoothLowEnergy.writeCharacteristic({
          deviceId: selectedDevice.value.deviceId,
          serviceId: REPORT_SERVICE_UUID,
          characteristicId: REPORT_CHARACTERISTIC_UUID,
          value: chunks[i],
        });
        
        // Update progress
        transferProgress.value = Math.round(((i + 1) / chunks.length) * 100);
      }
      
      transferSuccess.value = true;
      successMessage.value = 'Звіт успішно відправлено!';
      isSending.value = false;
      return true;
    } catch (err: any) {
      console.error('Error sending data:', err);
      errorMessage.value = `Помилка при відправці даних: ${err.message || 'Невідома помилка'}`;
      isSending.value = false;
      return false;
    }
  };

  // Set up event listeners for receiving data
  const setupDataReceiver = async (): Promise<void> => {
    // Listen for characteristic write requests (when someone writes to us)
    BluetoothLowEnergy.addListener('characteristicWriteRequest', async (event) => {
      if (event.characteristicId === REPORT_CHARACTERISTIC_UUID) {
        try {
          // Convert the byte array to a string
          const decoder = new TextDecoder();
          const dataString = decoder.decode(new Uint8Array(event.value));
          
          // Try to parse the data
          const data = JSON.parse(dataString);
          
          transferSuccess.value = true;
          successMessage.value = 'Звіт успішно отримано!';
          
          // Return the received data
          return data;
        } catch (err: any) {
          console.error('Error processing received data:', err);
          errorMessage.value = 'Помилка при обробці отриманих даних';
        }
      }
    });
  };

  // Reset error messages
  const resetError = (): void => {
    errorMessage.value = '';
  };

  // Clean up listeners and connections when done
  const cleanup = async (): Promise<void> => {
    await stopScan();
    await disconnectFromDevice();
    await stopAdvertising();
    BluetoothLowEnergy.removeAllListeners();
    
    isSending.value = false;
    isReceiving.value = false;
    transferProgress.value = 0;
    devicesList.value = [];
    selectedDevice.value = null;
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
    cleanup
  };
}