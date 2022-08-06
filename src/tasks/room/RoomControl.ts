import {PRIORITY_ROOM_STRATEGY} from "../taskPriorities"
import {TASK_ROOM_CONTROL, TASK_ROOM_STRATEGY_GROWING, TASK_ROOM_STRATEGY_PIONEER} from "../taskNames"
import {RoomTask} from "./RoomTask"

/**
 * Room Control decides on the strategy used for the development of the given room.
 */
export class RoomControl extends RoomTask {
    type = TASK_ROOM_CONTROL

    runWithRoom(room: Room): boolean {
        const rcl = room.controller?.level ?? 0
        const id = "roomstrat-" + room.name
        switch (rcl) {
            case 0:
                console.log("Room control has no valid strategy for rcl 0")
                break
            case 1:
                this.fork(
                    TASK_ROOM_STRATEGY_PIONEER,
                    id,
                    PRIORITY_ROOM_STRATEGY,
                    {roomName: room.name})
                break
            default:
                this.fork(
                    TASK_ROOM_STRATEGY_GROWING,
                    id,
                    PRIORITY_ROOM_STRATEGY,
                    {roomName: room.name})
                break
        }

        this.evalRoomStats(room)

        return true
    }

    evalRoomStats(room: Room) {
        room.memory.energyStored = _.sum(room.find(FIND_STRUCTURES, {filter: s =>
                s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE
            // @ts-ignore
        }).map(s => s.store[RESOURCE_ENERGY]))
        room.memory.energyStored += _.sum(room.find(FIND_DROPPED_RESOURCES, {filter: r => r.resourceType === RESOURCE_ENERGY})
            .map(r => r.amount))

    }
}