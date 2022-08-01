import {CreepController} from "../../creeps/creepController";
import {Task} from "../../os/Task";
import returnCreep = CreepController.returnCreep;

/**
 * Creep tasks usually have a lifetime of their corresponding creep.
 */
export abstract class CreepTask extends Task {

    /**
     * Abstract run method to run a task with the given creep.
     * @param creep
     */
    abstract _runWithCreep(creep: Creep): boolean

    _run(): boolean {
        const creep = this.getCreep();
        if (!creep) {
            console.log(`${this.getName()} finished (no creep).`)
            return true
        }
        return this._runWithCreep(creep)
    }

    getCreep(): Creep | null {
        return Game.getObjectById<Creep>(this.data.creepId)
    }


    onFinish(killed: boolean = false): void {
        const creep = this.getCreep();
        if (creep) {
            returnCreep(creep)
        }
    }
}