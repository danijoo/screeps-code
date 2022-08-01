import {Task} from "../../../os/Task";
import {TASK_CREEP_ACTION_UPGRADE_CONTROLLER} from "../../taskNames";

export class UpgradeController extends Task {
    type = TASK_CREEP_ACTION_UPGRADE_CONTROLLER

    _run(): boolean {
        const controller = Game.getObjectById<StructureController>(this.data?.controllerId)
        if (!controller) {
            console.log("Failed to upgrade controller: controller not found")
            return true
        }
        const creep = Game.getObjectById<Creep>(this.data?.creepId)
        if (!creep) {
            console.log("Failed to upgrade controller: creep not found")
            return true
        }

        const result = creep.upgradeController(controller)
        switch (result) {
            case OK:
                return creep.store.getUsedCapacity() === 0
            case ERR_NOT_IN_RANGE:
                creep.moveTo(controller, {visualizePathStyle: {}})
                return false
            case ERR_NOT_ENOUGH_RESOURCES:
                return true
            default:
                console.log("Failed to upgrade controller: " + result)
                return true
        }
    }

}