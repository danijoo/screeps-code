import {Task} from "../../../os/Task";
import {TASK_CREEP_ACTION_TRANSFER_ENERGY} from "../../taskNames";

export class TransferEnergy extends Task {
    type = TASK_CREEP_ACTION_TRANSFER_ENERGY

    _run(): boolean {
        const structure = Game.getObjectById<Structure>(this.data?.structureId)
        if (!structure) {
            console.log("Failed to upgrade controller: controller not found")
            return true
        }
        const creep = Game.getObjectById<Creep>(this.data?.creepId)
        if (!creep) {
            console.log("Failed to upgrade controller: creep not found")
            return true
        }

        const result = creep.transfer(structure, RESOURCE_ENERGY)
        switch (result) {
            case OK:
                // @ts-ignore
                return structure.store[RESOURCE_ENERGY] === structure.store.getCapacity(RESOURCE_ENERGY)
                    || creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
            case ERR_NOT_IN_RANGE:
                creep.moveTo(structure, {visualizePathStyle: {}})
                return false
            case ERR_NOT_ENOUGH_RESOURCES:
                return true
            default:
                console.log("Failed to upgrade controller: " + result)
                return true
        }
    }

}