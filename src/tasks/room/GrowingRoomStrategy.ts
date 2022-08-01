import {Task} from "../../os/Task"
import {
    TASK_ROOM_STORAGE,
    TASK_ROOM_CONTROLLER_UPGRADE,
    TASK_ROOM_SOURCE_HARVEST,
    TASK_ROOM_STRATEGY_GROWING,
    TASK_TOWER_CONTROL
} from "../taskNames"
import {
    PRIORITY_ROOM_STORAGE,
    PRIORITY_ROOM_CONTROLLER_UPGRADE,
    PRIORITY_ROOM_SOURCE_HARVEST,
    PRIORITY_TOWER_CONTROL
} from "../taskPriorities"

export class GrowingRoomStrategy extends Task {
    readonly type: string = TASK_ROOM_STRATEGY_GROWING

    _run(): boolean {
        const room = Game.rooms[this.data?.roomName]
        if (!room) {
            console.log("Room not found")
            return true
        }

        if (room.controller && room.controller.level >= 3) {
            this.fork(
                TASK_TOWER_CONTROL,
                "towerCtrl",
                PRIORITY_TOWER_CONTROL,
                {roomName: room.name}
            )
        }

        this.fork(
            TASK_ROOM_SOURCE_HARVEST,
            "srcHarvest",
            PRIORITY_ROOM_SOURCE_HARVEST,
            {roomName: room.name}
        )
        this.fork(
            TASK_ROOM_CONTROLLER_UPGRADE,
            "ctrlUpgrade",
            PRIORITY_ROOM_CONTROLLER_UPGRADE,
            {roomName: room.name}
        )
        this.fork(
            TASK_ROOM_STORAGE,
            "strgeFiller",
            PRIORITY_ROOM_STORAGE,
            {roomName: room.name}
        )
        // building creep -> get requests for buildings and chooses to create construction sites + recruits builder creeps
        // Room upgrades -> planning for extensions, towers, walls, streets, ...

        return true;
    }

}