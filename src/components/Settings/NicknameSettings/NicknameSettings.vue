<template>
  <div class="input-container">
    <ion-input 
      v-model="nickname" 
      class="ion-margin-bottom"
      label="Введіть ваш нікнейм"
      label-placement="floating"
      :auto-grow="true"
      fill="outline"
      mode="md"
    ></ion-input>
    <ion-button class="save-button" fill="clear" @click="saveNickname">
      <ion-icon :icon="saveOutline"></ion-icon>
    </ion-button>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from 'vue';
import db from '@/compasables/database';
import { IonInput, IonButton, IonIcon } from '@ionic/vue';
import { saveOutline } from 'ionicons/icons';

export default defineComponent ({
  components: {
    IonInput,
    IonButton,
    IonIcon
  },
  emits: ['show-toast'],
  setup(props, { emit }) {
    const nickname = ref('');

    const getNickname = async () => {
      try {
        const settings = await db.settingsTable.where('key').equals('userNickname').first();
        if (settings) {
          nickname.value = settings.value;
        }
      } catch (error) {
        console.error('Failed to get nickname from settings:', error);
      }
    };

    const saveNickname = async () => {
      try {
        if (!nickname.value.trim()) {
          emit('show-toast', 'Нікнейм не може бути порожнім', true);
          return;
        }

        // Check if the nickname already exists in the settings table
        const existingSettings = await db.settingsTable.where('key').equals('userNickname').first();
        
        if (existingSettings) {
          // Update existing entry
          await db.settingsTable.update(existingSettings.key, { value: nickname.value });
        } else {
          // Add new entry
          await db.settingsTable.add({ key: 'userNickname', value: nickname.value });
        }
        
        emit('show-toast', 'Нікнейм успішно збережено', false);
      } catch (error) {
        console.error('Failed to save nickname to settings:', error);
        emit('show-toast', 'Помилка при збереженні нікнейму', true);
      }
    };

    onMounted(() => {
      getNickname();
    });

    return {
      nickname,
      saveNickname,
      saveOutline
    };
  }
});
</script>

<style scoped lang="scss">
@import './NicknameSettings.scss';
</style>