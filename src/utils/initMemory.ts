import {getSurroundingBuildablePositions} from "./positionUtils"

export function initMemory(): void {
    for (const room of Object.values(Game.rooms))
        initRoomMemory(room)
}

function initRoomMemory(room: Room): void {
    if (room.memory.sources === undefined) {
        room.memory.sources = {}
        for (const source of room.find(FIND_SOURCES)) {
            const harvesterPosition = getHarvesterPosition(source)
            room.memory.sources[source.id] = {
                position: [source.pos.x, source.pos.y],
                ignored: shouldIgnoreSource(source),
                harvesterPosition: [harvesterPosition.x, harvesterPosition.y]
            }
        }
    }
}

function shouldIgnoreSource(source: Source): boolean {
    // Ignore sources with a keeper's lair nearby
    const keepers = source.room.find(FIND_HOSTILE_STRUCTURES,
        {filter: s => s.structureType === STRUCTURE_KEEPER_LAIR})
    for (const keeper of keepers) {
        const dist = source.pos.getRangeTo(keeper.pos)
        if (dist < 5) {
            return true
        }
    }
    return false
}

function getHarvesterPosition(source: Source): RoomPosition {
    const positions = getSurroundingBuildablePositions(source.pos)
    const accessSpots = positions.map(p => getSurroundingBuildablePositions(p).length)
    const maxAccessSpots = Math.max(...accessSpots)
    return positions[accessSpots.indexOf(maxAccessSpots)]
}