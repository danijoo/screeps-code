/**
 * Cleanup task: Checks for creeps which are owned by a task that does not exist and frees them
 */
import {Task} from "../../os/Task";
import {TASK_SYSTEM_FREE_CREEPS} from "../taskNames";

export class FreeCreeps extends Task {
    type = TASK_SYSTEM_FREE_CREEPS

    _run(): boolean {
        console.log("Checking for orphan creeps")
        for (const creep of Object.values(Game.creeps)) {
            const owner = creep.memory.owner
            if (owner && owner !== "CreepController") {
                if (!this.kernel.doesTaskExist(owner)) {
                    creep.memory.owner = "CreepController"
                }
            }
        }
        return true
    }
}