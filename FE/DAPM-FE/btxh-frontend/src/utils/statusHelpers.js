import { REQUEST_STATUS } from './constants';

export const STATUS = {
    CREATED: 'created',

    // lowercase
    pending: REQUEST_STATUS?.PENDING || 'pending',
    reviewing: REQUEST_STATUS?.REVIEWING || 'reviewing',
    missing_info: REQUEST_STATUS?.MISSING_INFO || 'missing_info',
    approved: REQUEST_STATUS?.APPROVED || 'approved',
    rejected: REQUEST_STATUS?.REJECTED || 'rejected',
    processing: REQUEST_STATUS?.PROCESSING || 'processing',
    completed: REQUEST_STATUS?.COMPLETED || 'completed',

    // uppercase backward-compat
    PENDING: 'PENDING',
    REVIEWING: 'REVIEWING',
    MISSING_INFO: 'MISSING_INFO',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
};

export function normalizeStatus(status) {
    if (!status) return STATUS.CREATED;

    const statusMap = {
        created: STATUS.CREATED,

        pending: 'pending',
        reviewing: 'reviewing',
        missing_info: 'missing_info',
        approved: 'approved',
        rejected: 'rejected',
        processing: 'processing',
        completed: 'completed',

        PENDING: 'pending',
        REVIEWING: 'reviewing',
        MISSING_INFO: 'missing_info',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        PROCESSING: 'processing',
        COMPLETED: 'completed',
    };

    return statusMap[status] || status;
}

export function getCurrentStep(status) {
    const normalized = normalizeStatus(status);

    switch (normalized) {
        case STATUS.CREATED:
        case 'pending':
            return 1;
        case 'reviewing':
            return 2;
        case 'missing_info':
        case 'rejected':
            return 3;
        case 'approved':
        case 'completed':
            return 4;
        default:
            return 1;
    }
}

export function getProgressWidth(step) {
    if (step <= 1) return '0%';
    if (step === 2) return '33.33%';
    if (step === 3) return '66.66%';
    return '100%';
}

export function canUpdateStatus(status) {
    const normalized = normalizeStatus(status);
    return [STATUS.CREATED, 'pending', 'missing_info'].includes(normalized);
}