import Dexie, { Table } from 'dexie';

interface IReport {
    id?: number;
    name: string;
    nickname: string;
    birthday?: string;
    unit: string;
    rank: string;
    phone: string;
    location: string;
    situation: string;
    witnesses: string;
    diagnosis: string;
    help: string;
    tq: string;
    state: string;
    additional: string;
    lost: string;
    timePass: string;
    evacuatedBy: string;
    healthStatus: string;
    createdAt: string;
}

interface IStaff {
    id?: number;
    rank: string;
    name: string;
    nickname: string;
    phone: string;
    birthday: string;
    workPosition: string;
    unit: string;
    unit2?: string;
    unit3?: string;
    unit4?: string;
    unit5?: string;
}

interface ISettings {
    key: string;
    value: any;
}

class AppDatabase extends Dexie {
    reportsTable!: Table<IReport>;
    staffTable!: Table<IStaff>;
    settingsTable!: Table<ISettings>;

    constructor() {
        super('Form100');
        this.version(3).stores({
            reportsTable: '++id, name, nickname, birthday, unit, rank, phone, location, situation, witnesses, diagnosis, help, tq, state, additional, lost, timePass, evacuatedBy, healthStatus, createdAt',
            staffTable: '++id, rank, name, nickname, phone, birthday, workPosition, unit, unit2, unit3, unit4, unit5',
            // staffTable: '++id, Звання, ПІБ, Позивний, телефон, дата народження, Посада, Відділення, Взвод, Рота, Батальйон, Бригада'
            settingsTable: 'key, value'
        });
    }
}

const db = new AppDatabase();

export default db;