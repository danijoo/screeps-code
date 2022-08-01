import {Task} from "../os/Task";
import {PRIORITY_ROOM_CONTROL, PRIORITY_SYSTEM_FREE_CREEPS} from "./taskPriorities";
import {TASK_SYSTEM_FREE_CREEPS, TASK_INIT, TASK_ROOM_CONTROL} from "./taskNames";

export class Init extends Task {
    type = TASK_INIT

    _run(): boolean {
        if (Game.time % 10 === 0) {
            this.fork(
                TASK_SYSTEM_FREE_CREEPS,
                "freecreeps",
                PRIORITY_SYSTEM_FREE_CREEPS,
                null)
        }

        for (const room of Object.values(Game.rooms)) {
            this.fork(
                TASK_ROOM_CONTROL,
                "roomctrl-" + room.name,
                PRIORITY_ROOM_CONTROL,
                {"roomName": room.name})
        }

        return true
    }
}