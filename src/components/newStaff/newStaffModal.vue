<template>
  <ion-button
      id="open-modal"
      style="margin: 0 0 16px 10px"
      expand="block"
      color="primary"
  >
    Створити
  </ion-button>
  <ion-modal ref="modal" trigger="open-modal" @willDismiss="onWillDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button color="primary" @click="cancel()">Cancel</ion-button>
        </ion-buttons>
        <ion-title>Картка бійця</ion-title>
        <ion-buttons slot="end">
          <ion-button color="primary" :strong="true" @click="confirm()">Confirm</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-input
          v-model="form.nickname"
          class="ion-margin-bottom"
          label="Позивний"
          label-placement="floating"
          :auto-grow="true"
          fill="outline"
          mode="md"
      />
      <ion-input
          v-model="form.name"
          class="ion-margin-bottom"
          label="ПІБ"
          label-placement="floating"
          fill="outline"
          mode="md"
      />
      <ion-input
          v-model="form.birthday"
          class="ion-margin-bottom"
          label="Дата народження"
          label-placement="floating"
          fill="outline"
          mode="md"
          :maxlength="10"
          placeholder="ДД.ММ.РРРР"
          @ionInput="formatBirthdate"
      />
      <div v-if="birthdateError" class="error-message">
        {{ birthdateError }}
      </div>
      <ion-input
          v-model="form.rank"
          class="ion-margin-bottom"
          label="Звання"
          label-placement="floating"
          fill="outline"
          mode="md"
      />
      <ion-input
          v-model="form.workPosition"
          class="ion-margin-bottom"
          label="Посада"
          label-placement="floating"
          fill="outline"
          mode="md"
      />
      <ion-input
          v-model="form.phone"
          class="ion-margin-bottom"
          type="number"
          label="Телефон"
          label-placement="floating"
          fill="outline"
          mode="md"
      />
      <ion-textarea
          v-model="form.unit"
          class="ion-margin-bottom"
          label="Відділення"
          label-placement="floating"
          :auto-grow="true"
          fill="outline"
          mode="md"
      />
      <ion-textarea
          v-model="form.unit2"
          class="ion-margin-bottom"
          label="Взвод"
          label-placement="floating"
          :auto-grow="true"
          fill="outline"
          mode="md"
      />
      <ion-textarea
          v-model="form.unit3"
          class="ion-margin-bottom"
          label="Рота"
          label-placement="floating"
          :auto-grow="true"
          fill="outline"
          mode="md"
      />
      <ion-textarea
          v-model="form.unit4"
          class="ion-margin-bottom"
          label="Батальйон"
          label-placement="floating"
          :auto-grow="true"
          fill="outline"
          mode="md"
      />
      <ion-textarea
          v-model="form.unit5"
          class="ion-margin-bottom"
          label="Бригада"
          label-placement="floating"
          :auto-grow="true"
          fill="outline"
          mode="md"
      />
    </ion-content>
  </ion-modal>
</template>

<script lang="ts">
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonInput,
} from '@ionic/vue';
import { OverlayEventDetail } from '@ionic/core/components';
import {defineComponent, ref} from 'vue';
import {postToStaffTable} from "@/compasables/useDatabase";
import { formatBirthdateInput, validateBirthdate } from '@/components/Report/composables/useDateValidation';

export default defineComponent({
  components: {
    IonButtons,
    IonButton,
    IonModal,
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonInput,
  },
  props: {
    initialNickname: {
      type: String,
      default: ''
    }
  },
  setup(props, { emit }) {
    const modal = ref();
    const form = ref({
      nickname: props.initialNickname,
      name: '',
      birthday: '',
      rank: '',
      workPosition: '',
      phone: '',
      unit: '',
      unit2: '',
      unit3: '',
      unit4: '',
      unit5: '',
    });

    const birthdateError = ref('');

    const formatBirthdate = (event: any) => {
      const formatted = formatBirthdateInput(event.target.value);
      
      event.target.value = formatted;
      form.value.birthday = formatted;
      
      if (!formatted) {
        birthdateError.value = '';
        return;
      }

      if (formatted.length === 10) {
        const birthdateValidation = validateBirthdate(formatted);
        if (birthdateValidation !== true && !birthdateValidation.valid) {
          birthdateError.value = birthdateValidation.message;
        } else {
          birthdateError.value = '';
        }
      } else if (formatted.length > 0) {
        birthdateError.value = '';
      }
    };

    const cancel = () => modal.value.$el.dismiss(null, 'cancel');

    const confirm = async () => {
      birthdateError.value = '';
        
      const birthdateValidation = validateBirthdate(form.value.birthday);
      
      if (birthdateValidation !== true && !birthdateValidation.valid) {
        birthdateError.value = birthdateValidation.message;
        setTimeout(() => {
          document.querySelector('.error-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
      await postToStaffTable(form.value);
      emit('new-staff', form.value);
      modal.value.$el.dismiss(name, 'confirm');
    };

    const onWillDismiss = async (ev: CustomEvent<OverlayEventDetail>) => {
      if (ev.detail.role === 'confirm') {
      }
    };

    return {
      modal,
      form,
      cancel,
      confirm,
      onWillDismiss,
      formatBirthdate,
      birthdateError,
    };
  },
});
</script>

<style lang="scss">
  @import "@/components/newStaff/newStaffModal.scss";
</style>