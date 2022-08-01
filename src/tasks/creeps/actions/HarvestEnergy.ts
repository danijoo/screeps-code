import {Task} from "../../../os/Task";
import {TASK_CREEP_ACTION_HARVEST_ENERGY} from "../../taskNames";

export class HarvestEnergy extends Task {
    type = TASK_CREEP_ACTION_HARVEST_ENERGY

    _run(): boolean {
        const source = Game.getObjectById<Source>(this.data.sourceId)
        if (!source) {
            console.log("Failed to harvest energy: source not found")
            return true
        }
        const creep = Game.getObjectById<Creep>(this.data.creepId)
        if (!creep) {
            console.log("Failed to harvest energy: creep not found")
            return true
        }

        const result = creep.harvest(source)
        switch (result) {
            case OK:
                return creep.store.getFreeCapacity() === 0
            case ERR_NOT_IN_RANGE:
                creep.moveTo(source, {visualizePathStyle: {}})
                return false
            default:
                console.log("Failed to harvest energy: " + result)
                return true
        }
    }
}