import { createMemoryHistory, createRouter as _createRouter } from 'vue-router';
import { createRouteStore, setDefaultOptions } from '../../src';

const storage = {}

export function createRouter({ routes } = { routes: [] as any[] }) {
    const router = _createRouter({
        history: createMemoryHistory(),
        routes: [
            {
                path: '/',
                component: () => 'HOME'
            },
            ...routes
        ],
    })

    createRouteStore({
        router
    })

    setDefaultOptions({
        storage: {
            setItem(key: string, value: string) {
                storage[key] = value
            },
            getItem(key: string) {
                return storage[key] || null
            }
        }
    })

    router.push('/')

    return router
}
