import {Task} from "../../../os/Task";
import {TASK_CREEP_ACTION_BUILD_STRUCTURE} from "../../taskNames";

export class BuildStructure extends Task {
    type = TASK_CREEP_ACTION_BUILD_STRUCTURE

    _run(): boolean {
        const site = Game.getObjectById<ConstructionSite>(this.data.constructionSiteId)
        if (!site) {
            console.log("Failed to build structure: site not found")
            return true
        }
        const creep = Game.getObjectById<Creep>(this.data.creepId)
        if (!creep) {
            console.log("Failed to harvest energy: creep not found")
            return true
        }

        const result = creep.build(site)
        switch (result) {
            case OK:
                const siteAvailable = Game.getObjectById(this.data.constructionSiteId) === undefined
                const creepCapacity = creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0
                return siteAvailable || creepCapacity
            case ERR_NOT_IN_RANGE:
                creep.moveTo(site, {visualizePathStyle: {}})
                return false
            default:
                console.log("Failed to build structure: " + result)
                return true
        }
    }
}