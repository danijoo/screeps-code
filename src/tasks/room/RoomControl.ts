import {Task} from "../../os/Task";
import {PRIORITY_ROOM_STRATEGY} from "../taskPriorities"
import {TASK_ROOM_CONTROL, TASK_ROOM_STRATEGY_GROWING, TASK_ROOM_STRATEGY_PIONEER} from "../taskNames"

/**
 * Room Control decides on the strategy used for the development of the given room.
 */
export class RoomControl extends Task {
    type = TASK_ROOM_CONTROL

    _run(): boolean {
        const room = this.data ? Game.rooms[this.data.roomName] : null
        if (!room)
            return true

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

        return true
    }
}