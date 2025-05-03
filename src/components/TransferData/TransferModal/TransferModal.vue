<template>
  <ion-modal :is-open="isOpen" @didDismiss="closeModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ mode === 'send' ? 'Відправити звіт' : 'Отримати звіт' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <method-selector 
        v-if="!selectedMethod" 
        :is-receive-mode="mode === 'receive'"
        @select-method="selectMethod"
      />
      
      <qr-code-generator 
        v-if="selectedMethod === 'qr' && mode === 'send'" 
        :data="reportData"
        @back="backToMethodSelection"
        @error="handleError"
      />
      
      <qr-code-scanner 
        v-if="selectedMethod === 'qr' && mode === 'receive'" 
        @back="backToMethodSelection"
        @data-received="handleDataReceived"
        @error="handleError"
      />
      
      <status-message 
        v-if="showStatus"
        :is-error="!!errorMessage"
        :message="statusMessage"
        @close="closeModal"
        @retry="resetError"
      />
    </ion-content>
  </ion-modal>
</template>

<script lang="ts">
import { defineComponent, ref, computed, Ref } from 'vue';
import { closeOutline } from 'ionicons/icons';
import { IonModal } from '@ionic/vue';
import MethodSelector from '../components/MethodSelector/MethodSelector.vue';
import QrCodeGenerator from '../components/QrCodeGenerator/QrCodeGenerator.vue';
import QrCodeScanner from '../components/QrCodeScanner/QrCodeScanner.vue';
import StatusMessage from '../components/StatusMessage/StatusMessage.vue';
import { useQrTransfer } from '../composables/useQrTransfer';

interface ReportData {
  [key: string]: any;
}

export default defineComponent({
  components: {
    IonModal,
    MethodSelector,
    QrCodeGenerator,
    QrCodeScanner,
    StatusMessage
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    mode: {
      type: String,
      required: true,
      validator: (value: string) => ['send', 'receive'].includes(value)
    },
    reportData: {
      type: Object as () => ReportData,
      default: () => ({})
    }
  },
  emits: ['close', 'report-received'],
  setup(_, { emit }) {
    const selectedMethod: Ref<string | null> = ref(null);
    const errorMessage: Ref<string> = ref('');
    const transferSuccess: Ref<boolean> = ref(false);
    const successMessage: Ref<string> = ref('');
    const { resetError } = useQrTransfer();
    
    const selectMethod = (method: string): void => {
      selectedMethod.value = method;
    };

    const backToMethodSelection = (): void => {
      selectedMethod.value = null;
    };

    const handleDataReceived = (data: any): void => {
      transferSuccess.value = true;
      successMessage.value = 'Звіт успішно отримано!';
      emit('report-received', data);
    };

    const handleError = (error: string): void => {
      errorMessage.value = error;
    };
    
    const resetErrorState = (): void => {
      errorMessage.value = '';
      resetError();
    };
    
    const closeModal = (): void => {
      selectedMethod.value = null;
      errorMessage.value = '';
      transferSuccess.value = false;
      emit('close');
    };
    
    const showStatus = computed(() => transferSuccess.value || !!errorMessage.value);
    
    const statusMessage = computed(() => {
      if (errorMessage.value) {
        return errorMessage.value;
      }
      return successMessage.value;
    });
    
    return {
      selectedMethod,
      errorMessage,
      transferSuccess,
      statusMessage,
      showStatus,
      selectMethod,
      backToMethodSelection,
      handleDataReceived,
      handleError,
      resetError: resetErrorState,
      closeModal,
      closeOutline
    };
  }
});
</script>