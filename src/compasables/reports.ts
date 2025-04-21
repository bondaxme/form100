import { toRaw } from 'vue';
import db from './database';

export const postToReports = async (data: any) => {
    try {
        const rawData = toRaw(data);
        rawData.createdAt = new Date().toString();
        const id = await db.reportsTable.add(rawData);
        console.log('Data added with ID:', id);
        return id;
    } catch (error) {
        console.error('Failed to add data:', error);
    }
};

export const updateByIdInReports = async (id: number, data: any) => {
    console.log('Updating data by ID:', id);
    try {
        const rawData = toRaw(data);
        await db.reportsTable.update(id, rawData);
        console.log('Data updated by ID:', id);
    } catch (error) {
        console.error('Failed to update data:', error);
    }
};

export const getByIdFromReports = async (id: number) => {
    try {
        console.log('Getting data by ID:', id);
        const data = await db.reportsTable.get(id);
        console.log('Data retrieved by ID:', data);
        return data;
    } catch (error) {
        console.error('Failed to retrieve data:', error);
    }
};

export const getAllFromReports = async () => {
    try {
        const allData = await db.reportsTable.toArray();
        console.log('All data:', allData);
        return allData;
    } catch (error) {
        console.error('Failed to retrieve data:', error);
    }
};

export const getReportsByNameAndNickname = async (name: string, nickname: string) => {
    try {
        const reports = await db.reportsTable
            .where('name')
            .equals(name)
            .and(report => report.nickname === nickname)
            .toArray();
        console.log('Reports for name and nickname:', name, nickname, reports);
        return reports;
    } catch (error) {
        console.error('Failed to retrieve reports for name and nickname:', error);
    }
};

export const deleteFromReports = async (id: number) => {
    try {
        await db.reportsTable.delete(id);
        console.log('Report deleted with ID:', id);
        return true;
    } catch (error) {
        console.error('Failed to delete report:', error);
        throw error;
    }
};