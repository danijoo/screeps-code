export const CREEP_ROLE_PIONEER = "Pioneer"
export const CREEP_ROLE_HARVESTER = "Harvester"
export const CREEP_ROLE_UPGRADER = "Upgrader"
export const CREEP_ROLE_FILLER = "Filler"
export const CREEP_ROLE_BUILDER = "Builder"

export type creepRole = typeof CREEP_ROLE_PIONEER |
    typeof CREEP_ROLE_HARVESTER |
    typeof CREEP_ROLE_UPGRADER |
    typeof CREEP_ROLE_FILLER |
    typeof CREEP_ROLE_BUILDER

const REQUEST_TEMPLATES = {
    [CREEP_ROLE_PIONEER]: {
        template: [MOVE, WORK, CARRY],
        maxNumExpand: 0,
        mustMatchExactly: false
    },
    [CREEP_ROLE_HARVESTER]: {
        template: [WORK],
        maxNumExpand: 4,
        mustMatchExactly: true
    },
    [CREEP_ROLE_UPGRADER]: {
        template: [MOVE, WORK, CARRY],
        maxNumExpand: 6,
        mustMatchExactly: false
    },
    [CREEP_ROLE_FILLER]: {
        template: [MOVE, CARRY, CARRY],
        maxNumExpand: 6,
        mustMatchExactly: false
    },
    [CREEP_ROLE_BUILDER]: {
        template: [MOVE, WORK, CARRY],
        maxNumExpand: 6,
        mustMatchExactly: false
    }
}

export interface CreepRequest {
    // construction priority
    priority: number
    // base body parts
    template: BodyPartConstant[],
    // whether an idle creep can fill this role when it has every body part
    // once or requires the exact number of parts
    mustMatchExactly: boolean
    // max number to expand this template before construction
    maxNumExpand: number

}

export function createCreepRequest(role: creepRole,
                            priority: number = 50,
                            mustMatchExactly?: boolean,
                            maxNumExpand?: number,
                            ): CreepRequest {
    const req = {
        ...REQUEST_TEMPLATES[role],
        priority: priority,
    }
    if (maxNumExpand) {
        req.maxNumExpand = maxNumExpand
    }
    if (mustMatchExactly) {
        req.mustMatchExactly = mustMatchExactly
    }
    return req
}