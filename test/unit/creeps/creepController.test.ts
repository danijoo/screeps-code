import {createCreepRequest, CREEP_ROLE_HARVESTER, CREEP_ROLE_PIONEER} from "../../../src/creeps/creepConstants"
import {CreepController} from "../../../src/creeps/creepController";
import {mockGlobal, mockInstanceOf, mockStructure} from "screeps-jest";

describe("With some free creeps", () => {

    beforeEach(() => {
        // @ts-ignore
        mockGlobal<Game>("Game", {
            creeps: {
                free: mockInstanceOf<Creep>({
                    spawning: false,
                    memory: {owner: null},
                    room: {
                        energyCapacityAvailable: 300,
                    }
                }),
                free2: mockInstanceOf<Creep>({
                    spawning: false,
                    memory: {owner: "CreepController"},
                    room: {
                        energyCapacityAvailable: 300,
                    }
                }),
                owned: mockInstanceOf<Creep>({
                    spawning: false,
                    memory: {owner: "qwerty"},
                    room: {
                        energyCapacityAvailable: 300,
                    }
                })
            },
            spawns: {
                SpawnN: mockStructure(STRUCTURE_SPAWN, {
                    // @ts-ignore
                    spawning: true,
                    room: {
                        energyAvailable: 300,
                        energyCapacityAvailable: 300
                    }
                })
            }
        })

        CreepController.init()
    })

    it("Should initialize with free creeps", () => {
        expect(CreepController.getNumFreeCreeps()).toBe(2)
    })

    it("Should find assigned creeps", () => {
        expect(CreepController.findAssignedCreeps("qwerty").length).toBe(1)
    })

    it("Should allow to return a creep", () => {
        expect(CreepController.getNumFreeCreeps()).toBe(2)
        const newCreep = {memory: {owner: "Old owner"}}
        // @ts-ignore
        CreepController.returnCreep(newCreep)
        expect(newCreep.memory.owner).toBe("CreepController")
        expect(CreepController.getNumFreeCreeps()).toBe(3)
    })

    it("Should return a matching creep if available", () => {
        Object.values(Game.creeps).forEach(c => {
            c.getActiveBodyparts = (bodyPart: string) => {
                if (bodyPart === MOVE)
                    return 2
                return 1
            }
        })
        const creep = CreepController.requestCreep(createCreepRequest(CREEP_ROLE_PIONEER, 75), "name")
        expect(creep).not.toBeNull()
        expect(creep!.memory.owner).toBe("name")
        expect(CreepController.getNumFreeCreeps()).toBe(1)
    })

    it("Should not return a creep if it is a bad match", () => {
        Object.values(Game.creeps).forEach(c => {
            c.getActiveBodyparts = () => {
                return 0
            }
        })
        const creep = CreepController.requestCreep(createCreepRequest(CREEP_ROLE_HARVESTER, 75), "name")
        expect(creep).toBeNull()
    })

    it("Should return a creep if it is a bad match but no exact match was requested", () => {
        Object.values(Game.creeps).forEach(c => {
            c.getActiveBodyparts = () => {
                return 1
            }
        })
        const creep = CreepController.requestCreep(createCreepRequest(CREEP_ROLE_PIONEER, 75), "name")
        expect(creep).not.toBeNull()
    })
})

describe("Without Creeps", () => {

    beforeEach(() => {
        // @ts-ignore
        mockGlobal<Game>("Game", {
            time: 100,
            creeps: {},
            spawns: {
                SpawnN: mockStructure(STRUCTURE_SPAWN, {
                    // @ts-ignore
                    spawning: false,
                    spawnCreep: jest.fn(),
                    room: {
                        energyCapacityAvailable: 300,
                        energyAvailable: 300
                    }
                })
            }
        })

        CreepController.init()
    })

    it("Should spawn a new creep if no match is available", () => {
        const creepRequest = createCreepRequest(CREEP_ROLE_PIONEER, 75, true)
        const response = CreepController.requestCreep(creepRequest, "somebody")
        expect(response).toBeNull()
        // @ts-ignore
        expect(Game.spawns.SpawnN.spawnCreep.mock.calls.length).toBe(1)
    })

    it("Should not spawn a creep if build is set to false", () => {
        const creepRequest = createCreepRequest(CREEP_ROLE_PIONEER, 75)
        const response = CreepController.requestCreep(creepRequest, "somebody", false)
        expect(response).toBeNull()
        // @ts-ignore
        expect(Game.spawns.SpawnN.spawnCreep.mock.calls.length).toBe(0)
    })

    it("Should not expand bodyparts if not requested", () => {
        const creepRequest = createCreepRequest(CREEP_ROLE_PIONEER, 75, undefined, 0)
        const response = CreepController.requestCreep(creepRequest, "somebody")
        expect(response).toBeNull()
        // @ts-ignore
        const mockFn = Game.spawns.SpawnN.spawnCreep.mock;
        expect(mockFn.calls.length).toBe(1)
        expect(mockFn.calls[0][0]).toStrictEqual([MOVE, WORK, CARRY])
    })

    it("Should expand creep bodyparts if requested", () => {
        const creepRequest = createCreepRequest(CREEP_ROLE_HARVESTER, 75)
        const response = CreepController.requestCreep(creepRequest, "somebody")
        expect(response).toBeNull()
        // @ts-ignore
        const mockFn = Game.spawns.SpawnN.spawnCreep.mock;
        expect(mockFn.calls.length).toBe(1)
        expect(mockFn.calls[0][0]).toStrictEqual([MOVE, WORK, WORK])
    })

    it("Should use available energy if there are less than 3 creeps in the room", () => {
        Game.creeps = {}
        Game.spawns.SpawnN.room.energyCapacityAvailable = 1000
        Game.spawns.SpawnN.room.energyAvailable = 300
        CreepController.init()
        expect(CreepController.getMaxSpawnCapacity()).toBe(300)
    })

    it ("should use full energy capacity if there are more than 3 creeps in the room", () => {
        Game.creeps = {
            a: mockInstanceOf<Creep>({spawning: false, memory: {owner: "CreepController"}}),
            b: mockInstanceOf<Creep>({spawning: false, memory: {owner: "CreepController"}}),
            c: mockInstanceOf<Creep>({spawning: false, memory: {owner: "CreepController"}}),
            d: mockInstanceOf<Creep>({spawning: false, memory: {owner: "CreepController"}}),
        }
        expect(Object.values(Game.creeps).length).toBe(4)
        Game.spawns.SpawnN.room.energyCapacityAvailable = 1000
        Game.spawns.SpawnN.room.energyAvailable = 300
        CreepController.init()
        expect(CreepController.getMaxSpawnCapacity()).toBe(1000)
    })
})