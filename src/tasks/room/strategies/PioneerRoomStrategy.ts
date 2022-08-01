import {CreepController} from "../../../creeps/creepController";
import {Task} from "../../../os/Task";
import {TASK_CREEP_ROLE_PIONEER, TASK_ROOM_STRATEGY_PIONEER} from "../../taskNames";
import {PRIORITY_ROLE_PIONEER} from "../../taskPriorities";
import requestCreep = CreepController.requestCreep;
import CreepRequest = CreepController.CreepRequest;

const MAX_NUM_PIONEERS = 3

/**
 * PioneerRole strategy for a room.
 * Following this strategy, the room will spawn simple creeps to feed the controller
 * and reach RCL 2 asap
 */
export class PioneerRoomStrategy extends Task {
    type = TASK_ROOM_STRATEGY_PIONEER

    _run(): boolean {
        const room = Game.rooms[this.data?.roomName]
        const controller = room.controller
        const sources: Source[] = room.find(FIND_SOURCES)
        if (!controller || sources.length === 0) {
            console.log(`Room ${room.name} has either no controller or no sources!`)
            return true
        }

        // spawn pioneers
        for (let i = 0; i < MAX_NUM_PIONEERS; i++) {
            const taskId = "pioneer-" + i
            if (!this.kernel.findTaskById(taskId)) {
                const creepRequest = new CreepRequest([MOVE, WORK, CARRY], 50)
                const creep = requestCreep(creepRequest, taskId)
                if (creep) {
                    this.fork(
                        TASK_CREEP_ROLE_PIONEER,
                        "pioneer-" + i,
                        PRIORITY_ROLE_PIONEER,
                        { controllerId: controller.id, creepId: creep.id })
                }
            }
        }
        return true
    }
}
