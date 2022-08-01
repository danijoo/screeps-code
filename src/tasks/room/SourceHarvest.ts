import {CreepController} from "../../creeps/creepController"
import {Task} from "../../os/Task"
import {TASK_CREEP_ROLE_HARVESTER, TASK_ROOM_SOURCE_HARVEST} from "../taskNames"
import {PRIORITY_ROLE_HARVESTER} from "../taskPriorities"
import requestCreep = CreepController.requestCreep
import CreepRequest = CreepController.CreepRequest

const MAX_RESOURCE_PILE_WITHOUT_CONTAINER = 1500

export class SourceHarvest extends Task {
    readonly type: string = TASK_ROOM_SOURCE_HARVEST

    _run(): boolean {
        const room = Game.rooms[this.data.roomName]
        if (!room) {
            console.log("Room not found")
            return true
        }

        const sources = room.find(FIND_SOURCES).filter(s => !room.memory.sources[s.id].ignored)
        const spawns = room.find(FIND_MY_STRUCTURES)
        if (spawns.length > 0) {
            const spawn = spawns[0]
            sources.sort((a, b) => {
                return a.pos.getRangeTo(spawn.pos) - b.pos.getRangeTo(spawn.pos)
            })
        }

        for (const source of sources) {
            if (!this.shouldSkipSource(room, source)) {
                this.spawnTaskForSource(room, source)
            }
        }

        return true
    }

    shouldSkipSource(room: Room, source: Source): boolean {
        const harvesterPosition = room.getPositionAt(...room.memory.sources[source.id].harvesterPosition)
        const resources = harvesterPosition?.lookFor(LOOK_RESOURCES) ?? []
        return resources.length > 0 && resources[0].resourceType === RESOURCE_ENERGY
            && resources[0].amount > MAX_RESOURCE_PILE_WITHOUT_CONTAINER
    }

    spawnTaskForSource(room: Room, source: Source): void {
        const taskId = "harvester-" + source.id
        const task = this.kernel.findTaskById(taskId)
        if (!task) {
            const creep = requestCreep(new CreepRequest([WORK], this.priority), taskId)
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

}