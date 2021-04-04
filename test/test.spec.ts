import { createRouter } from './utils/createRouter';
import { Router } from 'vue-router';
import { useRouteStore } from '../src';

let router: Router;

beforeEach(() => {
    router = createRouter()
})

describe('vue-route-store', () => {
    test('test useRouteStore', async () => {
        const storeData = {
            foo: 'bar',
            bar: 'baz'
        }
        router.addRoute({
            path: '/product',
            component: () => {
                const store = useRouteStore()
                expect(store).toBeTruthy()
            }
        })

        await router.push('/product', storeData)
    })
});
