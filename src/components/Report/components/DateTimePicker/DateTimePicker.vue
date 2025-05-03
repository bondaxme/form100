<template>
  <ion-input
    v-model="formattedDate"
    class="ion-margin-bottom"
    :label="label"
    label-placement="floating"
    fill="outline"
    mode="md"
    readonly
    @click.prevent="openDatePicker"
  >
    <ion-icon
      v-if="modelValue"
      slot="end"
      :icon="closeCircle"
      class="clear-icon"
      @click.stop="clearDate"
    />
  </ion-input>
  <ion-modal
    :is-open="isDatePickerOpen"
    @didDismiss="isDatePickerOpen = false"
    :initial-breakpoint="1"
    :breakpoints="[0, 1]"
    class="date-picker-modal"
  >
    <ion-content class="ion-padding">
      <ion-datetime
        v-model="tempDateValue"
        presentation="date-time"
        hour-cycle="h23"
        locale="uk-UA"
        :show-default-buttons="true"
        done-text="Готово"
        cancel-text="Відміна"
        :max="maxDate"
        @ionChange="onDateChange"
      />
    </ion-content>
  </ion-modal>
</template>

<script lang="js">
import { defineComponent, ref, computed, watch } from 'vue';
import { IonDatetime, IonModal, IonContent, IonInput, IonIcon } from '@ionic/vue';
import { closeCircle } from 'ionicons/icons';

export default defineComponent({
  components: {
    IonDatetime,
    IonModal,
    IonContent,
    IonInput,
    IonIcon
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Дата та час'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isDatePickerOpen = ref(false);
    const dateValue = ref(props.modelValue);
    const tempDateValue = ref('');
    
    watch(() => props.modelValue, (newValue) => {
      dateValue.value = newValue;
    });

    const formattedDate = computed(() => {
      if (!dateValue.value) return '';
      const date = new Date(dateValue.value);
      return date.toLocaleString('uk-UA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    const maxDate = computed(() => {
      const now = new Date();
      return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, -1);
    });

    const openDatePicker = () => {
      if (!dateValue.value) {
        const now = new Date();
        const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, -1);
        tempDateValue.value = localISO;
      } else {
        tempDateValue.value = dateValue.value;
      }
      isDatePickerOpen.value = true;
    };

    const onDateChange = (event) => {
      dateValue.value = event.detail.value;
      emit('update:modelValue', event.detail.value);
      isDatePickerOpen.value = false;
    };

    const clearDate = (event) => {
      event.preventDefault();
      dateValue.value = '';
      emit('update:modelValue', '');
    };

    return {
      isDatePickerOpen,
      dateValue,
      tempDateValue,
      formattedDate,
      maxDate,
      openDatePicker,
      onDateChange,
      clearDate,
      closeCircle
    };
  }
});
</script>

<style scoped lang="scss">
  @import "@/components/Report/Report.scss";
  @import "@/components/Report/components/DateTimePicker/DateTimePicker.scss";
</style>