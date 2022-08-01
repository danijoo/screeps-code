import {TASK_CREEP_ROLE_HARVESTER} from "../taskNames"
import {CreepTask} from "./CreepTask"

export class HarvesterRole extends CreepTask {
    readonly type: string = TASK_CREEP_ROLE_HARVESTER

    _runWithCreep(creep: Creep): boolean {
        const source = Game.getObjectById<Source>(this.data?.sourceId)
        if (!source) {
            console.log("Source not found")
            return true
        }

        let harvesterPosition: RoomPosition
        if (this.data?.harvesterPosition) {
            // @ts-ignore
            harvesterPosition = source.room.getPositionAt(...this.data?.harvesterPosition)
        } else {
            console.log("No harvest position given!")
            return true
        }

        if (!creep.pos.isEqualTo(harvesterPosition)) {
            creep.moveTo(harvesterPosition, {visualizePathStyle: {}})
            return false
        } else {
            return creep.harvest(source) !== OK
        }
    }

}