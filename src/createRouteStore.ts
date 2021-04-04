import { RouteStoreOptions, StoreData } from './types'
import { watch, reactive, readonly } from 'vue'
import { RouteLocation, RouteLocationRaw, Router, useRouter } from 'vue-router'
import { defaultOptions } from './defaultOptions';

const stores: Record<string, StoreData> = {}

export function createRouteStore ({
    router
}: {
    router: Router
}): void {
    const _router = router as Omit<Router, 'push'> & {
        push: (route: RouteLocationRaw, data: Record<string, unknown>, options: RouteStoreOptions) => Promise<unknown>
    }

    ['push', 'replace'].forEach(method => {
        const _method = router[method as 'push']
        _router.push = async (route, data, options = {}) => {
            const mergedOptions: RouteStoreOptions = {
                ...defaultOptions,
                ...options
            }

            if (!data || typeof data !== 'object') {
                return _method.call(_router, route)
            }
            const routeNormalized = _router.resolve(route)

            const keyFn = mergedOptions.key
            mergedOptions.makeRoute && !options.key && mergedOptions.makeRoute(routeNormalized)


            const currentRouteKey = keyFn(routeNormalized)
            stores[currentRouteKey] = reactive(data)

            const unwatchStorage = watch(stores[currentRouteKey], (t) => {
                mergedOptions.storage.setItem('route-store_' + currentRouteKey, JSON.stringify(data))
            }, {
                immediate: true
            })

            await _method.call(_router, routeNormalized)
            const unwatch = watch(() => keyFn(_router.currentRoute.value), (t, f) => {
                delete stores[f]
                unwatch()
                unwatchStorage()
            })
        }
    })
}

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
