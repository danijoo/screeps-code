import {TASK_CREEP_ACTION_HARVEST_ENERGY, TASK_CREEP_ROLE_PIONEER, TASK_CREEP_ACTION_UPGRADE_CONTROLLER} from "../taskNames";
import {CreepTask} from "./CreepTask";

export class PioneerRole extends CreepTask {
    type = TASK_CREEP_ROLE_PIONEER

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
            // Find closest source with energy available
            const sources: Source[] = controller.room.find(FIND_SOURCES)
            const closestSource = sources.filter(s => s.energy > 0)
                .sort((a, b) => {
                    return a.pos.getRangeTo(controller) - b.pos.getRangeTo(controller)
                })[0]
            this.forkAndSuspend(
                TASK_CREEP_ACTION_HARVEST_ENERGY,
                "pioneer-harvest-" + this.id.split("-").pop(),
                this.priority,
                { creepId: creep.id, sourceId: closestSource.id },
                true)
        } else {
            this.forkAndSuspend(
                TASK_CREEP_ACTION_UPGRADE_CONTROLLER,
                "pioneer-upgrade-" + this.id.split("-").pop(),
                this.priority,
                { creepId: creep.id, controllerId: controller.id },
                true)
            this.data.upgradeStarted = true
        }

        return false
    }

}