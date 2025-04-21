export { default } from './database';

export {
    savePassword,
    getPassword,
    createSession,
    checkSession,
    clearSession
} from './auth';

export {
    postToReports,
    updateByIdInReports,
    getByIdFromReports,
    getAllFromReports,
    getReportsByNameAndNickname,
    deleteFromReports
} from './reports';

export {
    postToStaffTable,
    getByIdFromStaffTable,
    getAllFromStaffTable,
    searchInStaffTable
} from './staff';

export {
    countHealthStatus,
    countTodayReports
} from './statistics';
