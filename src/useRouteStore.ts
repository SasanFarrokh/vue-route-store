import { RouteStoreOptions, StoreData } from './types';
import { RouteLocation, useRouter } from 'vue-router';
import { defaultOptions } from './defaultOptions';
import { reactive, readonly } from 'vue';
import { stores } from './stores';

type RouteStoreInitOptions = Pick<RouteStoreOptions, 'storage' | 'onError'>

function resolveStore(_store: string | StoreData, key: string) {
    if (!_store) {
        const error = new Error('Route store not found: ' + key) as Error & { __rs: true }
        error.__rs = true
        throw error
    }
    const store = typeof _store === 'string' ? JSON.parse(_store) : _store
    stores[key] = store
    return store
}

export function useRouteStore(keyFn?: string | ((route: RouteLocation) => string), options: RouteStoreInitOptions = {}) {
    const mergedOptions: RouteStoreOptions = {
        ...defaultOptions,
        ...options
    }
    const router = useRouter()

    const key = typeof keyFn === 'string' ? keyFn : (keyFn || mergedOptions.key)(router.currentRoute.value)

    const _readonly = (x: StoreData) => mergedOptions.readonly ? readonly(x) : x

    let store = stores[key]
    try {
        if (!store) {
            const storeData = mergedOptions.storage.getItem('route-store_' + key) || 'null'

            if (storeData instanceof Promise) {
                const store = reactive({
                    PENDING: true
                })
                storeData
                    .then(newStore => resolveStore(newStore, key))
                    .catch(err => {
                        delete store.PENDING
                        return mergedOptions.onError(err) || {
                            ERROR: true
                        };
                    }).then(newStore => {
                        delete store.PENDING
                        Object.assign(store, newStore)

                    })

                return _readonly(store)
            }
            store = resolveStore(storeData, key)
        }
        return _readonly(reactive(store))
    } catch (err) {
        return mergedOptions.onError(err) || {
            ERROR: true
        };
    }
}
