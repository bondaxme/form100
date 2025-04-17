<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="login-container">
        <img src="@/assets/medicred.png" alt="Logo" class="logo"/>
        <h2>{{ isFirstTime ? 'Створення паролю' : 'Вхід' }}</h2>
        
        <ion-item>
          <ion-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Пароль"
            label-placement="floating"
            fill="outline"
            :placeholder="isFirstTime ? 'Створіть пароль' : 'Введіть пароль'"
          ></ion-input>
          <ion-icon
            :icon="showPassword ? eyeOffOutline : eyeOutline"
            slot="end"
            class="password-toggle"
            @click="togglePasswordVisibility"
          ></ion-icon>
        </ion-item>

        <ion-item v-if="isFirstTime">
          <ion-input
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Підтвердження паролю"
            label-placement="floating"
            fill="outline"
            placeholder="Підтвердіть пароль"
          ></ion-input>
          <ion-icon
            :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
            slot="end"
            class="password-toggle"
            @click="toggleConfirmPasswordVisibility"
          ></ion-icon>
        </ion-item>

        <ion-button expand="block" @click="handleSubmit">
          {{ isFirstTime ? 'Створити' : 'Увійти' }}
        </ion-button>
      </div>
    </ion-content>

    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :duration="2000"
      position="top"
      :color="toastColor"
      @didDismiss="showToast = false"
    ></ion-toast>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { useIonRouter } from '@ionic/vue';
import { savePassword, getPassword, createSession } from '@/compasables/useDatabase';

export default defineComponent({
  setup() {
    const password = ref('');
    const confirmPassword = ref('');
    const isFirstTime = ref(true);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const showToast = ref(false);
    const toastMessage = ref('');
    const toastColor = ref('danger');
    const ionRouter = useIonRouter();

    onMounted(async () => {
      // Check if password exists
      const hashedPassword = await getPassword();
      isFirstTime.value = !hashedPassword;
    });

    const showError = (message: string) => {
      toastMessage.value = message;
      toastColor.value = 'danger';
      showToast.value = true;
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const toggleConfirmPasswordVisibility = () => {
      showConfirmPassword.value = !showConfirmPassword.value;
    };

    const handleSubmit = async () => {
      if (isFirstTime.value) {
        if (password.value.length < 4) {
          showError('Пароль повинен містити мінімум 4 символи');
          return;
        }
        if (password.value !== confirmPassword.value) {
          showError('Паролі не співпадають');
          return;
        }
        
        // Hash password and save
        const hashedPassword = await hashPassword(password.value);
        await savePassword(hashedPassword);
        await createSession(); // Create new session
        
        ionRouter.push('/tabs/tab1');
      } else {
        // Verify password
        const hashedPassword = await getPassword();
        const inputHashedPassword = await hashPassword(password.value);
        
        if (hashedPassword === inputHashedPassword) {
          await createSession(); // Create new session
          ionRouter.push('/tabs/tab1');
        } else {
          showError('Невірний пароль');
        }
      }
    };

    const hashPassword = async (pwd: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(pwd);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    };

    return {
      password,
      confirmPassword,
      isFirstTime,
      showPassword,
      showConfirmPassword,
      showToast,
      toastMessage,
      toastColor,
      eyeOutline,
      eyeOffOutline,
      handleSubmit,
      togglePasswordVisibility,
      toggleConfirmPasswordVisibility
    };
  }
});
</script>

<style scoped>
.login-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto;
}

.logo {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
}

ion-item {
  width: 100%;
  margin-bottom: 16px;
}

.password-toggle {
  cursor: pointer;
  font-size: 1.2rem;
  margin-right: 8px;
}

ion-button {
  margin-top: 20px;
  width: 100%;
}
</style>