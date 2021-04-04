import { RouteStoreOptions } from './types';

export const defaultOptions: RouteStoreOptions = {
    key: (route) => route.query.s as string,
    makeRoute: (route) => {
        route.query.s = Math.random().toString(36).substring(7);
        return route
    },
    storage: typeof window !== 'undefined' ? window.sessionStorage || window.localStorage : null,
    onError: () => ({}),
    readonly: true
}

export const setDefaultOptions = (options: RouteStoreOptions): void => {
    if (options.key) {
        defaultOptions.makeRoute = null
    }
    Object.assign(defaultOptions, options)
}
