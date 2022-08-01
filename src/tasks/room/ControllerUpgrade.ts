import {CreepController} from "../../creeps/creepController"
import {Task} from "../../os/Task"
import {uuid} from "../../utils/uuid"
import {TASK_CREEP_ROLE_UPGRADER, TASK_ROOM_CONTROLLER_UPGRADE} from "../taskNames"
import {PRIORITY_ROLE_UPGRADER} from "../taskPriorities"
import CreepRequest = CreepController.CreepRequest
import requestCreep = CreepController.requestCreep

const MAX_NUM_UPGRADER_CREEPS = 1

export class ControllerUpgrade extends Task {
    readonly type: string = TASK_ROOM_CONTROLLER_UPGRADE

    _run(): boolean {
        const room = Game.rooms[this.data.roomName]
        if (!room) {
            console.log("Room not found")
            return true
        }

        const controller = room.controller
        if (!controller) {
            console.log("Controller not found")
            return true
        } else if (!controller.my) {
            console.log("Controller not owned")
            return true
        }

        // Spawn set number of upgrade tasks
        for (let i = 0; i < MAX_NUM_UPGRADER_CREEPS; i++) {
            const taskId = "upgrader-" + i
            if (!this.kernel.findTaskById(taskId)) {
                const creepRequest = new CreepRequest([MOVE, WORK, CARRY], 50)
                const creep = requestCreep(creepRequest, taskId)
                if (creep)
                    this.spawnUpgraderTask(taskId, controller.id, creep)
            }
        }

        // Also use idle creeps
        while (CreepController.getNumFreeCreeps() > 0) {
            const taskId = "upgrader-" + uuid()
            const creepRequest = new CreepRequest([MOVE, WORK, CARRY], 50,
                undefined, false)
            const creep = requestCreep(creepRequest, taskId, false)
            if (creep)
                this.spawnUpgraderTask(taskId, controller.id, creep)
            else
                break
        }
        return true
    }

    spawnUpgraderTask(taskId: string, controllerId: Id<StructureController>, creep: Creep): void {
        this.fork(
            TASK_CREEP_ROLE_UPGRADER,
            taskId,
            PRIORITY_ROLE_UPGRADER,
            { controllerId, creepId: creep.id })
    }

}