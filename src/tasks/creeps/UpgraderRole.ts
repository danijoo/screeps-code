import {
    TASK_CREEP_ACTION_GET_ENERGY,
    TASK_CREEP_ACTION_UPGRADE_CONTROLLER,
    TASK_CREEP_ROLE_UPGRADER
} from "../taskNames"
import {CreepTask} from "./CreepTask"

export class UpgraderRole extends CreepTask {
    readonly type: string = TASK_CREEP_ROLE_UPGRADER

    _runWithCreep(creep: Creep): boolean {
        if (this.data.upgradeStarted) {
            return true
        }

        const controller = Game.getObjectById<StructureController>(this.data.controllerId)
        if (!controller) {
            console.log(`${this.id} aborted: controller ${this.data.controllerId} not found.`)
            return true
        }

        if (creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity()) {
            this.forkAndSuspend(
                TASK_CREEP_ACTION_GET_ENERGY,
                "upgrader-getenergy-" + this.id.split("-").pop(),
                this.priority,
            { creepId: creep.id },
                true)
        } else {
            this.forkAndSuspend(
                TASK_CREEP_ACTION_UPGRADE_CONTROLLER,
                "upgrader-upgrade-" + this.id.split("-").pop(),
                this.priority,
                { creepId: creep.id, controllerId: controller.id },
                true)
            this.data.upgradeStarted = true
        }

        return false
    }


}