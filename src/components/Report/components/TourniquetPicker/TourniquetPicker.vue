<template>
  <div class="tourniquet-container">
    <div class="tourniquet-label">{{ label }}</div>
    <div class="tourniquet-grid">
      <div class="tourniquet-position left-arm" :class="{ active: hasLeftArm }">
        <div class="position-label">ЛР</div>
        <div class="time-control">
          <ion-button 
            class="time-select-button" 
            expand="block" 
            fill="outline"
            size="small"
            id="leftArmTrigger"
            @click="openTimePicker('leftArm')"
          >
            {{ getFormattedTime('leftArm') || 'Вибрати час' }}
          </ion-button>
          <ion-icon 
            v-if="hasLeftArm" 
            :icon="closeCircle" 
            class="clear-icon" 
            @click.stop="clearPosition('leftArm')"
          />
        </div>
      </div>
      <div class="tourniquet-position right-arm" :class="{ active: hasRightArm }">
        <div class="position-label">ПР</div>
        <div class="time-control">
          <ion-button 
            class="time-select-button" 
            expand="block" 
            fill="outline"
            size="small"
            id="rightArmTrigger"
            @click="openTimePicker('rightArm')"
          >
            {{ getFormattedTime('rightArm') || 'Вибрати час' }}
          </ion-button>
          <ion-icon 
            v-if="hasRightArm" 
            :icon="closeCircle" 
            class="clear-icon" 
            @click.stop="clearPosition('rightArm')"
          />
        </div>
      </div>
      <div class="tourniquet-position left-leg" :class="{ active: hasLeftLeg }">
        <div class="position-label">ЛН</div>
        <div class="time-control">
          <ion-button 
            class="time-select-button" 
            expand="block" 
            fill="outline"
            size="small"
            id="leftLegTrigger"
            @click="openTimePicker('leftLeg')"
          >
            {{ getFormattedTime('leftLeg') || 'Вибрати час' }}
          </ion-button>
          <ion-icon 
            v-if="hasLeftLeg" 
            :icon="closeCircle" 
            class="clear-icon" 
            @click.stop="clearPosition('leftLeg')"
          />
        </div>
      </div>
      <div class="tourniquet-position right-leg" :class="{ active: hasRightLeg }">
        <div class="position-label">ПН</div>
        <div class="time-control">
          <ion-button 
            class="time-select-button" 
            expand="block" 
            fill="outline"
            size="small"
            id="rightLegTrigger"
            @click="openTimePicker('rightLeg')"
          >
            {{ getFormattedTime('rightLeg') || 'Вибрати час' }}
          </ion-button>
          <ion-icon 
            v-if="hasRightLeg" 
            :icon="closeCircle" 
            class="clear-icon" 
            @click.stop="clearPosition('rightLeg')"
          />
        </div>
      </div>
    </div>
  </div>

  <ion-popover 
    :trigger="popoverTrigger" 
    :is-open="isTimePickerOpen"
    @didDismiss="isTimePickerOpen = false"
    side="bottom"
    alignment="center"
    class="time-picker-popover"
  >
    <ion-content class="ion-padding">
      <ion-datetime
        v-model="tempTimeValue"
        presentation="time"
        hour-cycle="h23"
        locale="uk-UA"
        :show-default-buttons="true"
        done-text="Готово"
        cancel-text="Відміна"
        @ionChange="onTimeChange"
      ></ion-datetime>
    </ion-content>
  </ion-popover>
</template>

<script lang="js">
import { defineComponent, ref, computed, watch } from 'vue';
import { IonDatetime, IonPopover, IonContent, IonIcon, IonButton } from '@ionic/vue';
import { closeCircle } from 'ionicons/icons';

export default defineComponent({
  name: 'TourniquetPicker',
  components: {
    IonDatetime,
    IonPopover,
    IonContent,
    IonIcon,
    IonButton
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({
        leftArm: '',
        rightArm: '',
        leftLeg: '',
        rightLeg: ''
      })
    },
    label: {
      type: String,
      default: 'Турнікет (TQ)'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const isTimePickerOpen = ref(false);
    const tempTimeValue = ref('');
    const currentPosition = ref(null);
    const popoverTrigger = ref('');
    
    const tqData = ref({
      leftArm: '',
      rightArm: '',
      leftLeg: '',
      rightLeg: ''
    });
    
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        if (typeof newValue === 'string') {
          const oldData = newValue.trim();
          if (oldData) {
            tqData.value = {
              leftArm: '',
              rightArm: '',
              leftLeg: '',
              rightLeg: '',
              note: oldData
            };
          }
        } else {
          tqData.value = { ...newValue };
        }
      }
    }, { deep: true, immediate: true });
    
    const hasLeftArm = computed(() => !!tqData.value.leftArm);
    const hasRightArm = computed(() => !!tqData.value.rightArm);
    const hasLeftLeg = computed(() => !!tqData.value.leftLeg);
    const hasRightLeg = computed(() => !!tqData.value.rightLeg);
    
    const getFormattedTime = (position) => {
      if (!tqData.value[position]) return '';
      const time = new Date(`2023-01-01T${tqData.value[position]}`);
      return time.toLocaleTimeString('uk-UA', { 
        hour: '2-digit', 
        minute: '2-digit'
      });
    };
    
    const openTimePicker = (position) => {
      currentPosition.value = position;
      
      if (tqData.value[position]) {
        tempTimeValue.value = `2023-01-01T${tqData.value[position]}`;
      } else {
        tempTimeValue.value = `2023-01-01T00:00`;
      }
      
      // Set the trigger ID based on the position
      popoverTrigger.value = `${position}Trigger`;
      isTimePickerOpen.value = true;
    };
    
    const onTimeChange = (event) => {
      if (!currentPosition.value) return;
      
      const timeValue = event.detail.value;
      const timeOnly = timeValue.split('T')[1].substring(0, 5);
      
      tqData.value[currentPosition.value] = timeOnly;
      emit('update:modelValue', tqData.value);
      isTimePickerOpen.value = false;
    };
    
    const clearPosition = (position) => {
      tqData.value[position] = '';
      emit('update:modelValue', tqData.value);
    };
    
    return {
      isTimePickerOpen,
      tempTimeValue,
      currentPosition,
      popoverTrigger,
      tqData,
      hasLeftArm,
      hasRightArm,
      hasLeftLeg,
      hasRightLeg,
      getFormattedTime,
      openTimePicker,
      onTimeChange,
      clearPosition,
      closeCircle
    };
  }
});
</script>

<style scoped lang="scss">
@import './TourniquetPicker.scss';
</style>