<template>
  <ion-select
    v-model="selectedValue"
    class="ion-margin-bottom"
    :class="{ 'last-input': isLastInput }"
    :label="label"
    interface="popover"
    :interfaceOptions="{ mode: 'ios', side: 'top' }"
    mode="md"
    label-placement="floating"
    fill="outline"
  >
    <ion-select-option v-if="userNickname" :value="userNickname">
      {{ userNickname }}
    </ion-select-option>
    <ion-select-option value="Силами підрозділу">
      Силами підрозділу
    </ion-select-option>
  </ion-select>
</template>

<script lang="js">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import db from '@/compasables/database';

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: 'Ким евакуйований'
    },
    isLastInput: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'create'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const userNickname = ref('');
    const selectedValue = ref(props.modelValue);
    const route = useRoute();

    watch(() => props.modelValue, (newValue) => {
      selectedValue.value = newValue;
    });

    watch(() => selectedValue.value, (newValue) => {
      emit('update:modelValue', newValue);
    });

    const getNickname = async () => {
      try {
        const settings = await db.settingsTable.where('key').equals('userNickname').first();
        if (settings) {
          userNickname.value = settings.value;
          
          if (props.type === 'create' && selectedValue.value) {
            if (selectedValue.value !== 'Силами підрозділу') {
              selectedValue.value = userNickname.value;
              emit('update:modelValue', userNickname.value);
            }
          }
        }
      } catch (error) {
        console.error('Failed to get nickname from settings:', error);
      }
    };

    watch(() => route.fullPath, async (newValue) => {
      if (newValue === '/tabs/tab2') {
        await getNickname();
      }
    }, { immediate: true });

    onMounted(async () => {
      await getNickname();
    });

    return {
      userNickname,
      selectedValue
    };
  },
});
</script>

<style scoped lang="scss">
.last-input {
  margin-bottom: 78.4px;
}
</style>