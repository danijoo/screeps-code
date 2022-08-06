import {createCreepRequest, CREEP_ROLE_HARVESTER} from "../../creeps/creepConstants"
import {CreepController} from "../../creeps/creepController"
import {TASK_CREEP_ROLE_HARVESTER, TASK_ROOM_SOURCE_HARVEST} from "../taskNames"
import {PRIORITY_ROLE_HARVESTER} from "../taskPriorities"
import {RoomTask} from "./RoomTask"
import requestCreep = CreepController.requestCreep

const MAX_RESOURCE_PILE_WITHOUT_CONTAINER = 5000

export class SourceHarvest extends RoomTask {
    readonly type: string = TASK_ROOM_SOURCE_HARVEST

    runWithRoom(room: Room): boolean {
        const sources = room.find(FIND_SOURCES).filter(s => !room.memory.sources[s.id].ignored)
        const spawns = room.find(FIND_MY_STRUCTURES)
        if (spawns.length > 0) {
            const spawn = spawns[0]
            sources.sort((a, b) => {
                return a.pos.getRangeTo(spawn.pos) - b.pos.getRangeTo(spawn.pos)
            })
        }

        for (const source of sources) {
            // only mine resources if storage/resource pile allows for more resources
            if (!this.shouldSkipSource(room, source)) {
                this.spawnTaskForSource(room, source)
            } else {
                this.killTaskForSource(source)
            }
        }

        return true
    }

    shouldSkipSource(room: Room, source: Source): boolean {
        const harvesterPosition = room.getPositionAt(...room.memory.sources[source.id].harvesterPosition)

        const container = harvesterPosition?.lookFor(LOOK_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER).pop()
        if (container && (container as StructureContainer).store.getFreeCapacity() === 0) {
            return true
        }

        return (harvesterPosition?.lookFor(LOOK_RESOURCES)
            .filter(r => r.resourceType === RESOURCE_ENERGY).pop()?.amount ?? 0) > MAX_RESOURCE_PILE_WITHOUT_CONTAINER
    }

    spawnTaskForSource(room: Room, source: Source): void {
        const taskId = this.getTaskIdForSource(source)
        const task = this.kernel.findTaskById(taskId)
        if (!task) {
            const creepRequest = createCreepRequest(CREEP_ROLE_HARVESTER, this.priority)
            const creep = requestCreep(creepRequest, taskId)
            if (creep) {
                this.fork(
                    TASK_CREEP_ROLE_HARVESTER,
                    taskId,
                    PRIORITY_ROLE_HARVESTER,
                    {
                        creepId: creep.id,
                        sourceId: source.id,
                        harvesterPosition: room.memory.sources[source.id].harvesterPosition
                    }
                )
            }
        }
    }

    killTaskForSource(source: Source): void {
        const harvesterTask = this.kernel.findTaskById(this.getTaskIdForSource(source))
        if (harvesterTask)
            this.kernel.kill(harvesterTask)
    }

    getTaskIdForSource(source: Source): string {
        return "harvester-" + source.id
    }

}