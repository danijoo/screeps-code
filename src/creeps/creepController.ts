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

    export function init(): void {
        creeps = Object.values(Game.creeps).filter(c => !c.spawning)
        creepCount = creeps.length
        ownedCreeps = creeps.filter(c => !c.memory.owner || c.memory.owner === NAME )
        spawn = Object.values(Game.spawns)[0]
        console.log("Unused creeps: " + ownedCreeps.length + "/" + creepCount)
    }

    export function requestCreep(request: CreepRequest, requesterName: string, build: boolean = true): Creep | null {
        console.log(`Creep request from ${requesterName} received.`)
        const matches: [Creep, creepMatch][] = ownedCreeps.filter(c => !c.spawning)
            .map(c => [c, matchCreep(c, request)])

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
        const bodyParts = expandTemplate(req.bodyParts, spawn.room.energyCapacityAvailable, req.numExpands)
        const cost = _.sum(bodyParts.map(part => getPartCost(part)))
        if (cost <= spawn.room.energyCapacityAvailable) {
            return spawn.spawnCreep(bodyParts, "CreepyCreep" + Game.time,
                {memory: {owner: NAME}}) === 0
        } else {
            return false
        }
    }

    function getPartCost(bodyPart: BodyPartConstant): number {
        switch (bodyPart) {
            case MOVE:
            case CARRY:
                return 50
            case WORK:
                return 100
            case ATTACK:
                return 80
            case RANGED_ATTACK:
                return 150
            case HEAL:
                return 250
            case CLAIM:
                return 600
            default:
                return 10
        }
    }

    /**
     * Checks if a creep matches the given creep crequest
     * @param creep
     * @param request
     * @private
     */
    function matchCreep(creep: Creep, request: CreepRequest): creepMatch {
        const bodyPartCounts = _.countBy(request.bodyParts)
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

    function expandTemplate(template: BodyPartConstant[], maxCapacity: number,
                            maxNumExpands: number): BodyPartConstant[] {
        let expandedTemplate: BodyPartConstant[] = []

        // make sure the resulting creep has at least one move part
        if (!template.includes(MOVE)) {
            expandedTemplate.push(MOVE)
        }
        expandedTemplate = expandedTemplate.concat(template)
        let cost = _.sum(expandedTemplate.map(part => BODYPART_COST[part]))

        // add the template as many times as it fits
        let pointer = 0
        let numExpands = 0
        while(numExpands < maxNumExpands) {
            const part = template[pointer]
            const partCost = BODYPART_COST[part]
            if (cost + partCost <= maxCapacity) {
                expandedTemplate.push(part)
                cost += partCost
            } else {
                break
            }
            pointer += 1
            if (pointer === template.length) {
                pointer = 0
                numExpands += 1
            }
        }

        return expandedTemplate
    }

    export class CreepRequest {
        priority: number
        numExpands: number
        bodyParts: BodyPartConstant[]
        mustMatchExactly: boolean

        constructor(bodyParts: BodyPartConstant[], priority: number, numExpands: number = Infinity,
                    mustMatchExactly = true) {
            this.priority = priority
            this.numExpands = numExpands
            this.bodyParts = bodyParts
            this.mustMatchExactly = mustMatchExactly
        }
    }


}