import {
    TASK_ROOM_STORAGE,
    TASK_ROOM_CONTROLLER_UPGRADE,
    TASK_ROOM_SOURCE_HARVEST,
    TASK_ROOM_STRATEGY_GROWING,
    TASK_ROOM_TOWER_CONTROL,
    TASK_ROOM_CONSTRUCTION,
    TASK_ROOM_CONSTRUCTIONSITE_BUILD
} from "../../taskNames"
import {
    PRIORITY_ROOM_STORAGE,
    PRIORITY_ROOM_CONTROLLER_UPGRADE,
    PRIORITY_ROOM_SOURCE_HARVEST,
    PRIORITY_ROOM_TOWER_CONTROL,
    PRIORITY_ROOM_CONSTRUCTION,
    PRIORITY_ROOM_CONSTRUCTIONSITE_BUILD,
} from "../../taskPriorities"
import {RoomTask} from "../RoomTask"

export class GrowingRoomStrategy extends RoomTask {
    readonly type: string = TASK_ROOM_STRATEGY_GROWING

    runWithRoom(room: Room): boolean {
        if (room.controller && room.controller.level >= 3) {
            this.fork(
                TASK_ROOM_TOWER_CONTROL,
                "towerCtrl",
                PRIORITY_ROOM_TOWER_CONTROL,
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
        this.fork(
            TASK_ROOM_CONSTRUCTION,
            "construct",
            PRIORITY_ROOM_CONSTRUCTION,
            {roomName: room.name}
        )
        this.fork(
            TASK_ROOM_CONSTRUCTIONSITE_BUILD,
            "StrctBuilder",
            PRIORITY_ROOM_CONSTRUCTIONSITE_BUILD,
            {roomName: room.name}
        )
        // building creep -> get requests for buildings and chooses to create construction sites + recruits builder creeps
        // Room upgrades -> planning for extensions, towers, walls, streets, ...

        return true;
    }

}