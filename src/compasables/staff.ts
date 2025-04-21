import { toRaw } from 'vue';
import db from './database';

export const postToStaffTable = async (data: any) => {
    try {
        const rawData = toRaw(data);
        // Check if record with this name already exists
        const existingEntry = await db.staffTable
            .where('name')
            .equals(rawData.name)
            .first();

        if (existingEntry) {
            console.log('Record already exists with ID:', existingEntry.id);
            return existingEntry.id;
        }
        const id = await db.staffTable.add(rawData);
        console.log('Data added to staffTable with ID:', id, rawData.nickname);
        return id;
    } catch (error) {
        console.error('Failed to add data to staffTable:', error);
    }
};

export const getByIdFromStaffTable = async (id: number) => {
    try {
        console.log('Getting data by ID:', id);
        const data = await db.staffTable.get(id);
        console.log('Data retrieved by ID:', data);
        return data;
    } catch (error) {
        console.error('Failed to retrieve data from staffTable:', error);
    }
};

export const getAllFromStaffTable = async () => {
    try {
        const allData = await db.staffTable.toArray();
        console.log('All data from staffTable:', allData);
        return allData;
    } catch (error) {
        console.error('Failed to retrieve data from staffTable:', error);
    }
};

export const searchInStaffTable = async (value: string) => {
    try {
        console.log('Searching data by name:', value);
        if (value === '') return [];
        const result = await db.staffTable.filter(staff =>
            staff['name'].toLowerCase().startsWith(value.toLowerCase()) ||
            staff['nickname'].toLowerCase().startsWith(value.toLowerCase())
        ).toArray();
        console.log('Search result:', result);
        return result;
    } catch (error) {
        console.error('Failed to search data:', error);
        throw error;
    }
};