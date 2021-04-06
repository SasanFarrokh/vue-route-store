import { RouteStoreOptions, StoreData } from './types'
import { watch, reactive } from 'vue'
import { RouteLocationRaw, useRouter } from 'vue-router'
import { defaultOptions } from './defaultOptions';
import { stores } from './stores';

function routerMethodFactory (method: 'push' | 'replace') {
    return async (route: RouteLocationRaw, data: StoreData, options: RouteStoreOptions = {}) => {
        const { key: keyFn, makeRoute, storage, router }: RouteStoreOptions = {
            ...defaultOptions,
            ...options
        }

        if (!data || typeof data !== 'object') {
            return router[method](route)
        }
        const routeNormalized = router.resolve(route)

        makeRoute && !options.key && makeRoute(routeNormalized)


        const currentRouteKey = keyFn(routeNormalized)
        stores[currentRouteKey] = reactive(data)

        const unwatchStorage = watch(stores[currentRouteKey], (t) => {
            storage.setItem('route-store_' + currentRouteKey, JSON.stringify(data))
        }, {
            immediate: true
        })

        await router[method](routeNormalized)
        const unwatch = watch(() => keyFn(router.currentRoute.value), (t, f) => {
            delete stores[f]
            unwatch()
            unwatchStorage()
        })
    }
}

export const routerPush = /* #__PURE__ */ routerMethodFactory('push')
export const routerReplace = /* #__PURE__ */ routerMethodFactory('replace')
