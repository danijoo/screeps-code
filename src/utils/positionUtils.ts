export function getSurroundingPositions(pos: RoomPosition): RoomPosition[] {
    const positions =  [
        new RoomPosition(pos.x-1, pos.y-1, pos.roomName),
        new RoomPosition(pos.x, pos.y-1, pos.roomName),
        new RoomPosition(pos.x+1, pos.y-1, pos.roomName),
        new RoomPosition(pos.x-1, pos.y, pos.roomName),
        new RoomPosition(pos.x+1, pos.y, pos.roomName),
        new RoomPosition(pos.x-1, pos.y+1, pos.roomName),
        new RoomPosition(pos.x, pos.y+1, pos.roomName),
        new RoomPosition(pos.x+1, pos.y+1, pos.roomName)
    ]
    return positions.filter(p => isInsideRoom(p))
}

export function getSurroundingBuildablePositions(pos: RoomPosition): RoomPosition[] {
    return getSurroundingPositions(pos).filter(p => isBuildablePosition(p))
}

function isInsideRoom(pos: RoomPosition): boolean {
    return !(pos.x < 1 || pos.x > 48 || pos.y < 1 || pos.y > 48);
}

export function isBuildablePosition(pos: RoomPosition): boolean {
    const room = Game.rooms[pos.roomName]
    if (room.getTerrain().get(pos.x, pos.y) === TERRAIN_MASK_WALL)
        return false
    if (pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType !== STRUCTURE_ROAD).length > 0)
        return false
    if (pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0)
        return false
    return true
}