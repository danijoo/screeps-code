import {CreepController} from "../../creeps/creepController";
import {Task} from "../../os/Task";
import {TASK_CREEP_ROLE_FILLER, TASK_ROOM_STORAGE} from "../taskNames";
import CreepRequest = CreepController.CreepRequest;
import requestCreep = CreepController.requestCreep;

const MAX_NUM_FILLER = 3
const MAX_NUM_FILLER_PER_STRUCTURE = 3

export class Storage extends Task {
    type = TASK_ROOM_STORAGE

    _run(): boolean {
        const room = this.data? Game.rooms[this.data.roomName] : null
        if (!room)
            return true

        // get list of unfilled spawns, extensions and towers
        const storageStructures = room.find<StructureSpawn>(FIND_MY_STRUCTURES,
            {filter: s => {
               return s.structureType === STRUCTURE_SPAWN
                || s.structureType === STRUCTURE_EXTENSION
                || s.structureType === STRUCTURE_TOWER}
            }).filter(spawn => spawn.store[RESOURCE_ENERGY] !== spawn.store.getCapacity(RESOURCE_ENERGY))


        // already running filler tasks
        const runningFillerTasks: Task[] = _.range(0, MAX_NUM_FILLER)
            .map(i => this.kernel.findTaskById(this.getFillerTaskId(i)))
            .filter(t => t !== undefined)
            .map(t => t as Task)

        for (const spawn of storageStructures) {
            if (spawn.store[RESOURCE_ENERGY] !== spawn.store.getCapacity()) {
                for (let i = 0; i < MAX_NUM_FILLER; i++) {
                    const taskId = this.getFillerTaskId(i)
                    // check if there is already a running filler task with this id
                    // because the taskIds are unique, this take care MAX_NUM_FILLER is not exceeded
                    if (runningFillerTasks.filter(t => t.id === taskId).length > 0) {
                        continue
                    }

                    // Check max number of tasks for this single structure is also not exceeded
                    if (runningFillerTasks.filter(t => t.data?.structureId ?? null === spawn.id).length
                        >= MAX_NUM_FILLER_PER_STRUCTURE) {
                        break
                    }

                    // Get a creep and create a new filler task wth it
                    const creepRequest = new CreepRequest([MOVE, CARRY, CARRY], this.priority,
                        undefined, false)
                    const creep = requestCreep(creepRequest, taskId)
                    if (creep) {
                        const task = this.fork(
                            TASK_CREEP_ROLE_FILLER,
                            this.getFillerTaskId(i),
                            this.priority,
                            {structureId: spawn.id, creepId: creep.id})
                        if (task) {
                            runningFillerTasks.push(task)
                        }
                    }
                }
            }
        }

        return true
    }

    getFillerTaskId(counter: number): string {
        return "filler-" + counter
    }
}