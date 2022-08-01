import {Task} from "../../os/Task"
import {TASK_ROOM_TOWER_CONTROL} from "../taskNames"

export class TowerControl extends Task {
    readonly type: string = TASK_ROOM_TOWER_CONTROL

    // @ts-ignore
    hostileCreeps: Creep[]
    // @ts-ignore
    repairableFriendlyCreeps: Creep[]
    // @ts-ignore
    repairableStructures: Structure[]
    // @ts-ignore
    repairableNeutralStructures: Structure[]
    // @ts-ignore
    repairableDefense: Structure[]

    _run(): boolean {
        const room = Game.rooms[this.data.roomName]
        if (!room) {
            console.log("Room not found")
            return true
        }

        const towers: StructureTower[] = room.find<StructureTower>(FIND_MY_STRUCTURES,
            {filter: s => s.structureType === STRUCTURE_TOWER})

        // find creeps, structures, ...
        this.hostileCreeps = room.find(FIND_HOSTILE_CREEPS)
        this.repairableFriendlyCreeps = room.find(FIND_MY_CREEPS, {filter: c => c.hits < c.hitsMax})
        this.repairableStructures = room.find(FIND_MY_STRUCTURES,
            {filter: c => c.hits < c.hitsMax && c.structureType === STRUCTURE_RAMPART})
        this.repairableNeutralStructures = room.find(FIND_STRUCTURES,
            {filter: c => c.hits < c.hitsMax
                    && (c.structureType === STRUCTURE_ROAD || c.structureType === STRUCTURE_CONTAINER)})
        this.repairableDefense = room.find(FIND_STRUCTURES,
            {filter: c => c.hits < c.hitsMax
                    && (c.structureType === STRUCTURE_WALL || c.structureType === STRUCTURE_RAMPART)})

        for (const tower of towers) {
            // tslint:disable-next-line:no-unused-expression
            this.shootEnemies(tower) || this.repairCreeps(tower) || this.repairStructures(tower)
        }

        return false
    }

    shootEnemies(tower: StructureTower): boolean {
        if (this.hostileCreeps.length > 0) {
            tower.attack(this.hostileCreeps[0])
            return true
        }
        return false
    }

    repairCreeps(tower: StructureTower): boolean {
        if (this.repairableFriendlyCreeps.length > 0) {
            tower.heal(this.repairableFriendlyCreeps[0])
            return true
        }
        return false
    }

    repairStructures(tower: StructureTower): boolean {
        for (const struct of this.repairableStructures) {
            if (struct.hits < struct.hitsMax) {
                tower.repair(struct)
                return true
            }
        }
        for (const struct of this.repairableNeutralStructures) {
            if (struct.hits < struct.hitsMax) {
                tower.repair(struct)
                return true
            }
        }
        for (const struct of this.repairableDefense) {
            if (struct.hits < struct.hitsMax) {
                tower.repair(struct)
                return true
            }
        }
        return false
    }

}