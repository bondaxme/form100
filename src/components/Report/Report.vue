<template>
  <ion-content class="ion-padding">

    <ion-segment v-model="form.healthStatus" class="ion-segment">
      <ion-segment-button class="ion-segment-button" value="200">
        <ion-label>200</ion-label>
      </ion-segment-button>
      <ion-segment-button class="ion-segment-button" value="300">
        <ion-label>300</ion-label>
      </ion-segment-button>
      <ion-segment-button class="ion-segment-button" value="Хвороба">
        <ion-label>Хвороба</ion-label>
      </ion-segment-button>
    </ion-segment>

    <div style="display: flex">
      <div class="input-wrapper">
        <ion-input
            v-model="form.nickname"
            class="ion-margin-bottom"
            label="Позивний (ПІБ)"
            label-placement="floating"
            fill="outline"
            mode="md"
            :debounce="500"
            @ionFocus="onFocus"
            @ionBlur="onBlur"
            @ionInput="onNameChange(form.nickname, 'nickname')"
        />
        <div v-if="isFocused && searchedStaffByNickame.length" class="autocomplete-tooltip">
          <ion-list>
            <ion-item
                v-for="staff in searchedStaffByNickame"
                :key="staff.id"
                @click="selectStaff(staff)"
                button
            >
              <ion-label class="ion-text-wrap">
                <div style="font-weight: bold;">{{ staff.nickname }}</div>
                <div>{{ staff.name }}</div>
              </ion-label>
            </ion-item>
          </ion-list>
        </div>
      </div>
      <new-staff-modal
          v-if="type === 'create' && showNewStaffModal && form.nickname?.length > 3"
        @new-staff="setStaffData"
      />
    </div>
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
        maxlength="10"
        placeholder="ДД.ММ.РРРР"
        @ionInput="formatBirthdate"
    />
    <div v-if="birthdateError" class="error-message">
      {{ birthdateError }}
    </div>
    <ion-textarea
        v-model="form.unit"
        class="ion-margin-bottom"
        label="Підрозділ"
        label-placement="floating"
        :auto-grow="true"
        fill="outline"
        mode="md"
    />
    <ion-input
        v-model="form.rank"
        class="ion-margin-bottom"
        label="Звання, посада"
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
    <date-time-picker
        v-model="form.date"
        label="Дата та час події"
    />
    <autocomplete-picker
        v-model="form.location"
        class="ion-margin-bottom"
        label="Місце події"
        search-type="locations"
    />
    <autocomplete-picker
        v-model="form.situation"
        class="ion-margin-bottom"
        label="Обставини"
        search-type="situations"
    />
    <ion-input
        v-model="form.witnesses"
        class="ion-margin-bottom"
        label="Свідки"
        label-placement="floating"
        fill="outline"
        mode="md"
    />
    <ion-textarea
        v-model="form.diagnosis"
        class="ion-margin-bottom"
        label="Попередній діагноз"
        label-placement="floating"
        :auto-grow="true"
        fill="outline"
        mode="md"
    />
    <ion-textarea
        v-model="form.help"
        class="ion-margin-bottom"
        label="Надана допомога"
        label-placement="floating"
        :auto-grow="true"
        fill="outline"
        mode="md"
    />
    <tourniquet-picker
        v-model="form.tq"
        label="Турнікет (TQ)"
    />
    <ion-textarea
        v-model="form.state"
        class="ion-margin-bottom"
        label="Стан в динаміці"
        label-placement="floating"
        :auto-grow="true"
        fill="outline"
        mode="md"
    />
    <ion-select
        v-model="form.additional"
        class="ion-margin-bottom"
        label="В засобах індивідуального захисту"
        label-placement="floating"
        interface="popover"
        :interfaceOptions="{ mode: 'ios', side: 'bottom' }"
        fill="outline"
        mode="md"
    >
      <ion-select-option value="Без ознак алкогольного/наркотичного сп’яніння">
        Без ознак алкогольного/наркотичного сп’яніння
      </ion-select-option>
      <ion-select-option value="В стані наркотичного сп'яніння">
        В стані наркотичного сп'яніння
      </ion-select-option>
    </ion-select>
    <ion-textarea
        v-model="form.lost"
        class="ion-margin-bottom"
        label="Втрачене майно"
        label-placement="floating"
        :auto-grow="true"
        fill="outline"
        mode="md"
    />
    <date-time-picker
        v-model="form.timePass.time"
        label="Час передачі"
    />
    <ion-select
        v-model="form.timePass.place"
        class="ion-margin-bottom"
        label="Місце передачі"
        label-placement="floating"
        interface="popover"
        :interfaceOptions="{ mode: 'ios', side: 'bottom' }"
        fill="outline"
        mode="md"
    >
      <ion-select-option value="МП батальйону">
        МП батальйону
      </ion-select-option>
      <ion-select-option value="МП бригади">
        МП бригади
      </ion-select-option>
      <ion-select-option value="СП бригади">
        СП бригади
      </ion-select-option>
    </ion-select>
    <evacuated-by-picker
        v-model="form.evacuatedBy"
        :type="type"
        :is-last-input="true"
    />
    <div class="buttons-block" slot="fixed">
      <ion-button
        expand="block"
        color="light"
        shape="round"
        class="reset-button"
        @click="resetForm"
      >
        <ion-icon :icon="closeOutline"></ion-icon>
      </ion-button>
      <ion-button
        expand="block"
        color="primary"
        shape="round"
        class="save-button"
        @click="saveReport"
      >
        Зберегти
      </ion-button>
    </div>
  </ion-content>
  <ion-toast
    :is-open="isOpenAlert"
    position="top"
    color="primary"
    :message="toastMessage"
    :duration="2000"
    @didDismiss="setOpenAlert(false)"
    ></ion-toast>
</template>

<script lang="js">
import { defineComponent, ref, watch } from 'vue';
import { IonSegment, IonSegmentButton, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { postToReports, updateByIdInReports, searchInStaffTable } from '@/compasables/useDatabase.js';
import NewStaffModal from "@/components/newStaff/newStaffModal.vue";
import { formatBirthdateInput, validateBirthdate } from './composables/useDateValidation.ts';
import DateTimePicker from './components/DateTimePicker/DateTimePicker.vue';
import TourniquetPicker from './components/TourniquetPicker/TourniquetPicker.vue';
import EvacuatedByPicker from './components/EvacuatedByPicker/EvacuatedByPicker.vue';
import AutocompletePicker from './components/AutocompletePicker/AutocompletePicker.vue';
import { addLocation, addSituation } from '@/compasables/useDatabase.js';
import { closeOutline } from 'ionicons/icons';

export default defineComponent({
  props: {
    report: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'create'
    }
  },
  components: {
    NewStaffModal,
    IonSegment,
    IonSegmentButton,
    IonButton,
    DateTimePicker,
    TourniquetPicker,
    EvacuatedByPicker,
    AutocompletePicker
  },
  setup(props) {
    const router = useRouter();
    const isFocused = ref(false);
    const birthdateError = ref('');
    const toastMessage = ref('');
    const isOpenAlert = ref(false);
    
    const setOpenAlert = (state) => {
      isOpenAlert.value = state;
    };

    const form = ref({
      date: '',
      name: '',
      nickname: '',
      birthday: '',
      unit: '',
      rank: '',
      phone: '',
      location: '',
      situation: '',
      witnesses: '',
      diagnosis: '',
      help: '',
      tq: {
        leftArm: '',
        rightArm: '',
        leftLeg: '',
        rightLeg: ''
      },
      state: '',
      additional: 'Без ознак алкогольного/наркотичного сп’яніння',
      lost: '',
      timePass: {
        time: '',
        place: ''
      },
      evacuatedBy: '',
      healthStatus: ''
    });

    watch(() => props.report, (value) => {
      if (value) {
        form.value = value;
        if (!form.value.additional) {
          form.value.additional = 'Без ознак алкогольного/наркотичного сп’яніння';
        }
        if (!form.value.timePass) {
          form.value.timePass = { time: '', place: '' };
        } else if (typeof form.value.timePass !== 'object') {
          form.value.timePass = { time: '', place: '' };
        }
      }
    }, { deep: true, immediate: true });

    // const searchedStaffByName = ref([]);
    const searchedStaffByNickame = ref([]);
    const showNewStaffModal = ref(false);
    let searchTimeout = null;

    const setStaffData = (data) => {
      form.value.name = data.name;
      form.value.nickname = data.nickname;
      form.value.phone = data.phone;
      
      const unitArray = [data.unit, data.unit2, data.unit3, data.unit4, data.unit5]
        .filter(item => item && item.trim());
      form.value.unit = unitArray.join(', ');

      const rankArray = [data.rank, data.workPosition]
        .filter(item => item && item.trim());
      form.value.rank = rankArray.join(', ');

      form.value.birthday = data.birthday;
    };
    // const isDebounce = ref(false);
    const onNameChange = async (value) => {
      if (value?.length > 2) {
        searchedStaffByNickame.value = await searchInStaffTable(value);
        clearTimeout(searchTimeout);
        if (searchedStaffByNickame.value.length === 0) {
          searchTimeout = setTimeout(() => {
            if (searchedStaffByNickame.value.length === 0) {
              showNewStaffModal.value = true;
            }
          }, 2000);
        } else {
          showNewStaffModal.value = false;
        }
      } else {
        clearTimeout(searchTimeout);
        showNewStaffModal.value = false;
        searchedStaffByNickame.value = [];
      }
    };

    const onFocus = () => {
      isFocused.value = true;
    };

    const onBlur = () => {
      setTimeout(() => {
        isFocused.value = false;
      }, 150);
    };

    const selectStaff = (staff) => {
      setStaffData(staff);
      // searchedStaffByName.value = [];
      searchedStaffByNickame.value = [];
    };

    const formatBirthdate = (event) => {
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

    const resetForm = () => {
      try {
        form.value = {
          date: '',
          name: '',
          nickname: '',
          birthday: '',
          unit: '',
          rank: '',
          phone: '',
          location: '',
          situation: '',
          witnesses: '',
          diagnosis: '',
          help: '',
          tq: {
          leftArm: '',
          rightArm: '',
          leftLeg: '',
          rightLeg: ''
          },
          state: '',
          additional: 'Без ознак алкогольного/наркотичного сп’яніння',
          lost: '',
          timePass: {
          time: '',
          place: ''
          },
          evacuatedBy: '',
          healthStatus: ''
        };
        birthdateError.value = '';
        searchedStaffByNickame.value = [];
        toastMessage.value = 'Форма очищена';
        setOpenAlert(true);
      } catch (error) {
        console.error(error);
      }
    };

    const saveReport = async () => {
      try {
        birthdateError.value = '';
        
        const birthdateValidation = validateBirthdate(form.value.birthday);
        
        if (birthdateValidation !== true && !birthdateValidation.valid) {
          birthdateError.value = birthdateValidation.message;
          setTimeout(() => {
            document.querySelector('.error-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          return;
        }
        
        if (form.value.location && form.value.location.trim() !== '') {
          await addLocation(form.value.location);
        }
        if (form.value.situation && form.value.situation.trim() !== '') {
          await addSituation(form.value.situation);
        }
        
        if (props.type === 'edit') {
          await updateByIdInReports(form.value.id, form.value);
          // alert('Репорт успішно збережено');
          // router.push('/tabs/tab1');
          window.location.href = '/tabs/report/' + form.value.id;
        } else {
          await postToReports(form.value);
          // alert('Репорт успішно збережено');
          // router.push('/tabs/tab1');
          window.location.href = '/tabs/tab1';
        }
      } catch (e) {
        alert('Помилка збереження репорту');
        console.log(e);
      }
    };

    return {
      form,
      // searchedStaffByName,
      searchedStaffByNickame,
      closeOutline,
      onNameChange,
      showNewStaffModal,
      setOpenAlert,
      isOpenAlert,
      toastMessage,
      selectStaff,
      setStaffData,
      saveReport,
      resetForm,
      isFocused,
      onFocus,
      onBlur,
      formatBirthdate,
      validateBirthdate,
      birthdateError,
    };
  },
});
</script>

<style scoped lang="scss">
  @import "@/components/Report/Report.scss";
</style>
