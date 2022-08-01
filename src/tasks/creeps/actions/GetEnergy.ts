import {Task} from "../../../os/Task"
import {TASK_CREEP_ACTION_GET_ENERGY} from "../../taskNames"

export class GetEnergy extends Task {
    readonly type: string = TASK_CREEP_ACTION_GET_ENERGY

    _run(): boolean {
        const creep = Game.getObjectById<Creep>(this.data?.creepId)
        if (!creep) {
            console.log("Failed to get energy: creep not found")
            return true
        }

        const resourceDrops = creep.room.find(FIND_DROPPED_RESOURCES,
            { filter: r => r.resourceType === RESOURCE_ENERGY })
            .sort((a, b) => b.pos.getRangeTo(creep.pos) - a.pos.getRangeTo(creep.pos))
        if (resourceDrops.length === 0) {
            console.log("Failed to get energy: no resources found")
            return true
        } else {
            const pile = resourceDrops[0]
            const result = creep.pickup(pile)
            switch (result) {
                case OK:
                case ERR_FULL:
                    return creep.store.getFreeCapacity() === 0
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(pile, {visualizePathStyle: {}})
                    return false
                default:
                    console.log("Failed to get energy: " + result)
                    return true
            }
        }
    }

}