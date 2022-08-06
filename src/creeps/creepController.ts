import {CreepRequest} from "./creepConstants"

declare global {
    interface CreepMemory {
        owner: string | null
    }
}

export namespace CreepController {
    const NAME = "CreepController"
    const CREEP_MATCH_GOOD = "good"
    const CREEP_MATCH_APPROX = "approximate"
    const CREEP_MATCH_NO = "no"

    type creepMatch = typeof CREEP_MATCH_GOOD | typeof CREEP_MATCH_APPROX | typeof CREEP_MATCH_NO

    let spawn: StructureSpawn
    let creeps: Creep[]
    let creepCount: number
    let ownedCreeps: Creep[]
    let maxSpawnCapacity: number

    export function init(): void {
        creeps = Object.values(Game.creeps).filter(c => !c.spawning)
        creepCount = creeps.length
        ownedCreeps = creeps.filter(c => !c.memory.owner || c.memory.owner === NAME )
        spawn = Object.values(Game.spawns)[0]
        maxSpawnCapacity = creeps.length > 3 ? spawn.room.energyCapacityAvailable : spawn.room.energyAvailable
        console.log("Unused creeps: " + ownedCreeps.length + "/" + creepCount)
    }

    export function requestCreep(request: CreepRequest, requesterName: string, build: boolean = true): Creep | null {
        // console.log(`Creep request from ${requesterName} received.`)
        const matches: [Creep, creepMatch][] = ownedCreeps.filter(c => !c.spawning)
            .map(c => [c, matchCreepToRequest(c, request)])

        // find good matches
        for (const [creep, match] of matches) {
            if (match === CREEP_MATCH_GOOD) {
                creep.memory.owner = requesterName
                ownedCreeps = _.without(ownedCreeps, creep)
                return creep
            }
        }

        if (!request.mustMatchExactly) {
            for (const [creep, match] of matches) {
                if (match === CREEP_MATCH_APPROX) {
                    creep.memory.owner = requesterName
                    ownedCreeps = _.without(ownedCreeps, creep)
                    return creep
                }
            }
        }

        // No creep found to give out, build one
        if (!spawn.spawning && build) {
            const success = spawnCreep(request)
            if (success) {
                console.log("No creep matches request, building a new creep")
            }
        }
        return null
    }

    function spawnCreep(req: CreepRequest): boolean {
        const bodyParts = expandBodyParts(req)
        const cost = _.sum(bodyParts.map((part: BodyPartConstant) => BODYPART_COST[part]))
        if (cost <= maxSpawnCapacity) {
            return spawn.spawnCreep(bodyParts, "CreepyCreep" + Game.time,
                {memory: {owner: NAME}}) === 0
        } else {
            return false
        }
    }

    export function getMaxSpawnCapacity(): number {
        return maxSpawnCapacity
    }

    export function returnCreep(creep: Creep): void {
        creep.memory.owner = NAME
        ownedCreeps.push(creep)
    }

    export function findAssignedCreeps(ownerName: string): Creep[] {
        return creeps.filter(creep => creep.memory.owner === ownerName)
    }

    export function getNumFreeCreeps(): number {
        return ownedCreeps.length
    }


    function expandBodyParts(request: CreepRequest): BodyPartConstant[] {
        let expandedParts: BodyPartConstant[] = []

        // make sure the resulting creep has at least one move part
        if (!request.template.includes(MOVE)) {
            expandedParts.push(MOVE)
        }
        expandedParts = expandedParts.concat(request.template)
        let cost = _.sum(expandedParts.map(part => BODYPART_COST[part]))

        // add the template as many times as it fits
        let pointer = 0
        let numExpands = 0
        while(numExpands < request.maxNumExpand) {
            const part = request.template[pointer]
            const partCost = BODYPART_COST[part]
            if (cost + partCost <= maxSpawnCapacity) {
                expandedParts.push(part)
                cost += partCost
            } else {
                break
            }
            pointer += 1
            if (pointer === request.template.length) {
                pointer = 0
                numExpands += 1
            }
        }
        return expandedParts
    }

    /**
     * Checks if a creep matches the given creep request
     * Performs a bodypart expansion before matching
     */
    function matchCreepToRequest(creep: Creep, request: CreepRequest): creepMatch {
        const expandedParts = expandBodyParts(request)
        const bodyPartCounts = _.countBy(expandedParts)
        let match: creepMatch = CREEP_MATCH_GOOD
        for (const bodyPart of Object.keys(bodyPartCounts)) {
            const expectedCount = bodyPartCounts[bodyPart]
            if (creep.getActiveBodyparts(bodyPart as BodyPartConstant) === 0) {
                return CREEP_MATCH_NO
            } else if (creep.getActiveBodyparts(bodyPart as BodyPartConstant) < expectedCount) {
                match = CREEP_MATCH_APPROX
            }
        }
        return match
    }
}