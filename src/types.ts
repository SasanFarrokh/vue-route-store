import type { RouteLocation } from 'vue-router'

export interface RouteStoreOptions {
    key?: (route: RouteLocation) => string;
    makeRoute?: ((route: RouteLocation) => RouteLocation) | null;
    storage?: {
        getItem(key: string): Promise<StoreData | string | null> | StoreData | string | null;
        setItem(key: string, value: string): Promise<void> | void;
    } | null;
    onError?: (err: Error) => StoreData | void,
    readonly?: boolean
}

export type StoreData = Record<string, unknown>

