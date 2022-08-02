import {
    TASK_CREEP_ACTION_BUILD_STRUCTURE,
    TASK_CREEP_ACTION_GET_ENERGY,
    TASK_CREEP_ROLE_BUILDER,
} from "../taskNames"
import {CreepTask} from "./CreepTask"

export class BuilderRole extends CreepTask {
    type = TASK_CREEP_ROLE_BUILDER

    _runWithCreep(creep: Creep): boolean {
        console.log("Builder role started")
        const constructionSite = Game.getObjectById<ConstructionSite>(this.data.constructionSiteId)
        if (!constructionSite) {
            console.log(`${this.id} aborted: structure ${this.data.constructionSiteId} not found or already full.`)
            return true
        }

        if (creep.store[RESOURCE_ENERGY] !== creep.store.getCapacity()) {
            // Find closest source with energy available
            this.forkAndSuspend(
                TASK_CREEP_ACTION_GET_ENERGY,
                "builder-getenergy-" + this.id.split("-").pop(),
                this.priority,
                { creepId: creep.id},
                true)
        } else {
            this.forkAndSuspend(
                TASK_CREEP_ACTION_BUILD_STRUCTURE,
                "builder-build-" + this.id.split("-").pop(),
                this.priority,
                { creepId: creep.id, constructionSiteId: constructionSite.id },
                true)
        }

        return false
    }

}