import {createCreepRequest, CREEP_ROLE_FILLER} from "../../creeps/creepConstants"
import {CreepController} from "../../creeps/creepController";
import {Task} from "../../os/Task";
import {TASK_CREEP_ROLE_FILLER, TASK_ROOM_STORAGE} from "../taskNames";
import {PRIORITY_ROLE_FILLER} from "../taskPriorities"
import {RoomTask} from "./RoomTask"
import requestCreep = CreepController.requestCreep;
import returnCreep = CreepController.returnCreep

export const MAX_NUM_FILLER = 3
export const MAX_NUM_FILLER_PER_STRUCTURE = 1
export const MAX_NUM_FILLER_FOR_EXTENSIONS = 1

export class SpawnFill extends RoomTask {
    type = TASK_ROOM_STORAGE

    runWithRoom(room: Room): boolean {
        // get list of unfilled spawns, extensions and towers
        let storageStructures: Structure[] = room.find<StructureSpawn | StructureExtension | StructureTower>(FIND_MY_STRUCTURES,
            {filter: s => {
               return s.structureType === STRUCTURE_SPAWN
                || s.structureType === STRUCTURE_EXTENSION
                || s.structureType === STRUCTURE_TOWER}
            }).filter(s => s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            .sort((a, b) => {
                function structToNum(s: Structure): number {
                    if (s.structureType === STRUCTURE_SPAWN)
                        return 2
                    if (s.structureType === STRUCTURE_EXTENSION)
                        return 1
                    return 0
                }
                return structToNum(b) - structToNum(a)
            })
        // already running filler tasks
        const runningFillerTasks: Task[] = this.kernel.findTasksByPrefix("filler-")
        let numExtensionFillerTasks = runningFillerTasks.filter(t => t.id.includes("ext")).length


        // Loop over structures and for each structure, check the number of running filler tasks
        // Spawn new filler tasks until the max number of tasks for this structure is reached
        // BReak the loop if the global maximum of tasks is exceeded
        structloop: for (const struct of storageStructures) {
            if (struct.structureType === STRUCTURE_EXTENSION
                && numExtensionFillerTasks >= MAX_NUM_FILLER_FOR_EXTENSIONS) {
                continue
            }
            let numTasksForStruct = runningFillerTasks.filter(task => task.id.includes(struct.id)).length
            for (let i = numTasksForStruct; i < MAX_NUM_FILLER_PER_STRUCTURE; i++) {

                // never spawn more tasks than global max
                if (runningFillerTasks.length >= MAX_NUM_FILLER) {
                    break structloop
                }

                const task = this.spawnFillerTask(struct, i)
                if (task) {
                    runningFillerTasks.push(task)
                    if (struct.structureType === STRUCTURE_EXTENSION)
                        numExtensionFillerTasks += 1
                }
            }
        }

        return true
    }

    spawnFillerTask(structure: Structure, postfix: any): Task | undefined {
        const taskId = this.getFillerTaskId(structure.structureType, structure.id, postfix)
        // Get a creep and create a new filler task wth it
        const creepRequest = createCreepRequest(CREEP_ROLE_FILLER, this.priority)
        const creep = requestCreep(creepRequest, taskId)
        if (creep) {
            const task = this.fork(
                TASK_CREEP_ROLE_FILLER,
                taskId,
                PRIORITY_ROLE_FILLER,
                {structureId: structure.id, creepId: creep.id})
            if (task)
                return task
            else
                returnCreep(creep)
        }
        return undefined
    }

    getFillerTaskId(structureType: string, structureId: Id<Structure>, postfix: any): string {
        return `filler-${structureType.slice(0, 3)}-${structureId}-${postfix}`
    }
}