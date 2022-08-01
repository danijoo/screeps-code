declare global {
    namespace NodeJS {
        interface Global {
            _global_context_version: number
        }
    }

    interface Memory {
        _global_context_version: number
    }
}

function hasGlobalContextChanged(): boolean {
    return global._global_context_version === undefined ||
        Memory._global_context_version === undefined ||
        global._global_context_version !== Memory._global_context_version
}

export function onGlobalContextChangeDetected(fn: () => void): void {
    if (hasGlobalContextChanged()) {
        fn()
        global._global_context_version = Game.time
        Memory._global_context_version = global._global_context_version
    }
}