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

        let resourceDrop: Resource | null = Game.getObjectById<Resource>(this.data?.resourceId)
        if (!resourceDrop) {
            resourceDrop = this.findResource(creep) ?? null
            if (resourceDrop)
                this.data!.resourceId = resourceDrop.id
            else {
                console.log("Failed to get energy: no resources found")
                return true
            }
        }

        if (!resourceDrop) {
            console.log("Failed to get energy: no resources found")
            return true
        } else {
            const result = creep.pickup(resourceDrop)
            switch (result) {
                case OK:
                case ERR_FULL:
                    return creep.store.getFreeCapacity() === 0
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(resourceDrop, {visualizePathStyle: {}})
                    return false
                default:
                    console.log("Failed to get energy: " + result)
                    return true
            }
        }
    }

    findResource(creep: Creep): Resource | undefined {
        const resourceDrops = creep.room.find(FIND_DROPPED_RESOURCES,
            { filter: r => r.resourceType === RESOURCE_ENERGY })
            .sort((a, b) => a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos))
        if (resourceDrops.length > 0)
            return resourceDrops[0]
        return undefined
    }

}