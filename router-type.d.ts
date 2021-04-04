import { Router as BaseRouter } from 'vue-router'

declare module 'vue-router' {
    import { RouteStoreOptions, StoreData } from './dist';

    export declare interface Router {
        push(name: Parameters<BaseRouter['push']>[0], data?: StoreData, options?: RouteStoreOptions): ReturnType<BaseRouter>['push'];
        replace(name: Parameters<BaseRouter['replace']>[0], data?: StoreData, options?: RouteStoreOptions): ReturnType<BaseRouter>['replace'];
    }
}
