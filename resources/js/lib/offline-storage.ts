/**
 * Offline Storage Utility for Adoul SaaS Platform
 * Enables 100% offline-first operation in courtroom basements and remote locations.
 */

export interface ActDraft {
    dossierId: number | string;
    content: string;
    metadata: Record<string, any>;
    customStyles?: Record<string, any>;
    savedAt: string; // ISO timestamp
}

export interface SyncQueueItem {
    id: string;
    action: string;
    url: string;
    payload: any;
    queuedAt: string;
}

const DRAFT_PREFIX = 'adoul_draft_dossier_';
const SYNC_QUEUE_KEY = 'adoul_sync_queue';
const INHERITANCE_KEY = 'adoul_offline_inheritance_latest';

export const offlineStorage = {
    /**
     * Save an act draft to local browser storage
     */
    saveActDraft(dossierId: number | string, content: string, metadata: Record<string, any> = {}, customStyles: Record<string, any> = {}): void {
        try {
            const draft: ActDraft = {
                dossierId,
                content,
                metadata,
                customStyles,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(`${DRAFT_PREFIX}${dossierId}`, JSON.stringify(draft));
        } catch (e) {
            console.warn('Unable to save draft locally:', e);
        }
    },

    /**
     * Retrieve a saved act draft
     */
    getActDraft(dossierId: number | string): ActDraft | null {
        try {
            const raw = localStorage.getItem(`${DRAFT_PREFIX}${dossierId}`);
            if (!raw) return null;
            return JSON.parse(raw) as ActDraft;
        } catch (e) {
            return null;
        }
    },

    /**
     * Remove an act draft once synced to server
     */
    clearActDraft(dossierId: number | string): void {
        try {
            localStorage.removeItem(`${DRAFT_PREFIX}${dossierId}`);
        } catch (e) {
            // ignore
        }
    },

    /**
     * Save inheritance calculator state locally
     */
    saveInheritance(data: any): void {
        try {
            localStorage.setItem(INHERITANCE_KEY, JSON.stringify({
                data,
                savedAt: new Date().toISOString(),
            }));
        } catch (e) {
            // ignore
        }
    },

    /**
     * Get saved inheritance calculator state
     */
    getInheritance(): any | null {
        try {
            const raw = localStorage.getItem(INHERITANCE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    },

    /**
     * Queue an action for when connection is restored
     */
    queueAction(action: string, url: string, payload: any): void {
        try {
            const queue: SyncQueueItem[] = this.getSyncQueue();
            queue.push({
                id: Math.random().toString(36).substring(2, 9),
                action,
                url,
                payload,
                queuedAt: new Date().toISOString(),
            });
            localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
        } catch (e) {
            // ignore
        }
    },

    /**
     * Get pending sync items
     */
    getSyncQueue(): SyncQueueItem[] {
        try {
            const raw = localStorage.getItem(SYNC_QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    },

    /**
     * Clear sync queue
     */
    clearSyncQueue(): void {
        try {
            localStorage.removeItem(SYNC_QUEUE_KEY);
        } catch (e) {
            // ignore
        }
    },
};
