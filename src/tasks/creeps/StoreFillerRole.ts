import {
    TASK_CREEP_ROLE_FILLER,
    TASK_CREEP_ACTION_TRANSFER_ENERGY,
    TASK_CREEP_ACTION_GET_ENERGY
} from "../taskNames";
import {CreepTask} from "./CreepTask";

export class StoreFillerRole extends CreepTask {
    type = TASK_CREEP_ROLE_FILLER

    _runWithCreep(creep: Creep): boolean {
        const structure = Game.getObjectById<Structure>(this.data.structureId);
        // @ts-ignore
        if (!structure || structure.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            console.log(`${this.id} aborted: structure ${this.data.structureId} not found or already full.`)
            return true
        }

        // @ts-ignore
        if (structure.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            return true
        }

        if (creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity()) {
            this.forkAndSuspend(
                TASK_CREEP_ACTION_GET_ENERGY,
                "filler-getenergy-" + this.id.split("-").pop(),
                this.priority,
                { creepId: creep.id },
                true)
        } else {
            this.forkAndSuspend(
                TASK_CREEP_ACTION_TRANSFER_ENERGY,
                "filler-transfer-" + this.id.split("-").pop(),
                this.priority,
                { creepId: creep.id, structureId: structure.id },
                true)
        }

        return false
    }

}