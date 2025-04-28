<template>
  <div class="file-actions-container">
    <div class="button-group">
      <input type="file" ref="fileInput" @change="handleFileUpload" accept=".csv" style="display: none;">
      <ion-button class="import-button" @click="triggerFileInput">
        <ion-icon :icon="cloudUploadOutline" />
        Імпорт CSV
      </ion-button>
      <ion-button class="export-button" @click="exportToCSV">
        <ion-icon :icon="downloadOutline" />
        Експорт CSV
      </ion-button>
    </div>
    <div v-if="selectedFileName" class="file-name">
      <ion-text color="primary">{{ selectedFileName }}</ion-text>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { cloudUploadOutline, downloadOutline } from 'ionicons/icons';
import { postToStaffTable, getAllFromStaffTable } from '@/compasables/useDatabase.js';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { isPlatform } from '@ionic/vue';

interface StaffData {
  rank?: string;
  name?: string;
  nickname?: string;
  phone?: string;
  birthday?: string;
  workPosition?: string;
  unit?: string;
  unit2?: string;
  unit3?: string;
  unit4?: string;
  unit5?: string;
  [key: string]: string | undefined;
}

export default defineComponent({
  emits: ['show-toast'],
  setup(props, { emit }) {
    const selectedFileName = ref('');
    const fileInput = ref<HTMLInputElement | null>(null);

    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (!target || !target.files) return;
      
      const file = target.files[0];
      if (!file) return;
      
      selectedFileName.value = file.name;

      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (!e.target?.result) return;
        const text = e.target.result as string;
        const data = parseCSV(text);
        try {
          await saveDataToIndexedDB(data);
          emit('show-toast', 'Файл успішно завантажено!', false);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          emit('show-toast', 'Помилка завантаження файлу: ' + errorMessage, true);
          console.error(error);
        }
      };

      reader.onerror = () => {
        emit('show-toast', 'Помилка читання файлу', true);
        console.error(reader.error);
      };

      reader.readAsText(file);
    };

    const wrapForCSV = (value: string | undefined): string => {
      if (!value) return '';
      const needsQuoting = value.includes(',') || value.includes('"') || value.includes('\n');
      if (needsQuoting) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const exportToCSV = async () => {
      try {
        const staffList = await getAllFromStaffTable();
        const headers = ['Звання', 'ПІБ', 'Позивний', 'Телефон', 'Дата народження', 'Посада', 
                      'Відділення', 'Взвод', 'Рота', 'Батальйон', 'Бригада'];
        
        const csvData = staffList.map((staff: any) => {
          return [
            wrapForCSV(staff.rank),
            wrapForCSV(staff.name),
            wrapForCSV(staff.nickname),
            wrapForCSV(staff.phone),
            wrapForCSV(staff.birthday),
            wrapForCSV(staff.workPosition),
            wrapForCSV(staff.unit),
            wrapForCSV(staff.unit2),
            wrapForCSV(staff.unit3),
            wrapForCSV(staff.unit4),
            wrapForCSV(staff.unit5)
          ].join(',');
        });

        const csvContent = [headers.join(','), ...csvData].join('\n');
        const fileName = `staff_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        if (isPlatform('mobile')) {
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: csvContent,
              directory: Directory.Documents,
              encoding: Encoding.UTF8
            });
            
            emit('show-toast', 'Файл збережено у Documents', false);
          } catch (err) {
            console.error('Filesystem error:', err);
            emit('show-toast', 'Помилка збереження файлу', true);
          }
        } else {
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          
          link.setAttribute('href', url);
          link.setAttribute('download', fileName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          emit('show-toast', 'Файл успішно експортовано', false);
        }
      } catch (error) {
        console.error('Export error:', error);
        emit('show-toast', 'Помилка при експорті файлу', true);
      }
    };

    const parseCSV = (text: string): StaffData[] => {
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      if (!lines.length) return [];

      // Parse a single line respecting quoted fields
      const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur);
        return result.map(r => r.trim());
      };

      const headers = parseLine(lines[0]);
      const fieldMap: Record<string, string> = {
        'звання': 'rank',
        'піб': 'name',
        'позивний': 'nickname',
        'телефон': 'phone',
        'дата народження': 'birthday',
        'посада': 'workPosition',
        'відділення': 'unit',
        'взвод': 'unit2',
        'рота': 'unit3',
        'батальйон': 'unit4',
        'бригада': 'unit5'
      };

      return lines.slice(1).map(line => {
        const values = parseLine(line);
        const obj: StaffData = {};
        headers.forEach((header, idx) => {
          const key = fieldMap[header.toLowerCase()] || header.toLowerCase();
          obj[key] = values[idx];
        });
        return obj;
      });
    };

    const saveDataToIndexedDB = async (data: StaffData[]) => {
      for (const item of data) {
        await postToStaffTable(item);
      }
    };

    return {
      handleFileUpload,
      exportToCSV,
      selectedFileName,
      cloudUploadOutline,
      downloadOutline,
      fileInput,
      triggerFileInput
    };
  }
});
</script>

<style scoped lang="scss">
  @import "./FileUploader.scss";
</style>