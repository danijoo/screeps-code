// tslint:disable-next-line:no-empty-interface
interface Memory {
}

interface CreepMemory {
    owner: string | null
}

interface RoomMemory {
    sources: {
        [sourceId: string]: {
            position: [number, number],
            ignored: boolean,
            harvesterPosition: [number, number],
        }
    }
}