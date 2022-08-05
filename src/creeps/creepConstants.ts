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
        maxNumExpand: Infinity,
        mustMatchExactly: true
    },
    [CREEP_ROLE_FILLER]: {
        template: [MOVE, CARRY, CARRY],
        maxNumExpand: Infinity,
        mustMatchExactly: true
    },
    [CREEP_ROLE_BUILDER]: {
        template: [MOVE, WORK, CARRY],
        maxNumExpand: Infinity,
        mustMatchExactly: true
    }
}

export interface CreepRequest {
    // construction priority
    priority: number
    // base body parts
    template: BodyPartConstant[],
    // max number to expand this template before construction
    maxNumExpand: number
    // whether an idle creep can fill this role when it has every body part
    // once or requires the exact number of parts
    mustMatchExactly: boolean
}

export function createCreepRequest(role: creepRole,
                            priority: number = 50,
                            maxNumExpand?: number,
                            mustMatchExactly?: boolean): CreepRequest {
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