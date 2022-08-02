import {CreepController} from "../../../src/creeps/creepController";
import {mockGlobal, mockInstanceOf, mockStructure} from "screeps-jest";
import CreepRequest = CreepController.CreepRequest;

describe("With some free creeps", () => {

    beforeEach(() => {
        // @ts-ignore
        mockGlobal<Game>("Game", {
            creeps: {
                free: mockInstanceOf<Creep>({
                    spawning: false,
                    memory: {owner: null},
                    room: {
                        energyCapacityAvailable: 300
                    }
                }),
                free2: mockInstanceOf<Creep>({
                    spawning: false,
                    memory: {owner: "CreepController"},
                    room: {
                        energyCapacityAvailable: 300
                    }
                }),
                owned: mockInstanceOf<Creep>({
                    spawning: false,
                    memory: {owner: "qwerty"},
                    room: {
                        energyCapacityAvailable: 300
                    }
                })
            },
            spawns: {
                SpawnN: mockStructure(STRUCTURE_SPAWN, {
                    // @ts-ignore
                    spawning: true
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
        const creep = CreepController.requestCreep(new CreepController.CreepRequest([MOVE, WORK, CARRY, MOVE], 75, undefined, false), "name")
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
        const creep = CreepController.requestCreep(new CreepController.CreepRequest(["move"], 75), "name")
        expect(creep).toBeNull()
    })

    it("Should not return a creep if it is a bad match (2)", () => {
        Object.values(Game.creeps).forEach(c => {
            c.getActiveBodyparts = () => {
                return 1
            }
        })
        const creep = CreepController.requestCreep(new CreepController.CreepRequest([MOVE, WORK, WORK], 75), "name")
        expect(creep).toBeNull()
    })

    it("Should return a creep if it is a bad match but no exact match was requested", () => {
        Object.values(Game.creeps).forEach(c => {
            c.getActiveBodyparts = () => {
                return 1
            }
        })
        const creep = CreepController.requestCreep(new CreepController.CreepRequest([MOVE, WORK, WORK],
            75, undefined, false), "name")
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
                        energyCapacityAvailable: 300
                    }
                })
            }
        })

        CreepController.init()
    })

    it("Should spawn a new creep if no match is available", () => {
        const creepRequest = new CreepRequest([MOVE, CARRY, WORK], 75)
        const response = CreepController.requestCreep(creepRequest, "somebody")
        expect(response).toBeNull()
        // @ts-ignore
        expect(Game.spawns.SpawnN.spawnCreep.mock.calls.length).toBe(1)
    })

    it("Should not spawn a creep if build is set to false", () => {
        const creepRequest = new CreepRequest([MOVE, CARRY, WORK], 75)
        const response = CreepController.requestCreep(creepRequest, "somebody", false)
        expect(response).toBeNull()
        // @ts-ignore
        expect(Game.spawns.SpawnN.spawnCreep.mock.calls.length).toBe(0)
    })

    it("Should not expand bodyparts if not requested", () => {
        const creepRequest = new CreepRequest([MOVE, CARRY, WORK], 75, 0)
        const response = CreepController.requestCreep(creepRequest, "somebody")
        expect(response).toBeNull()
        // @ts-ignore
        const mockFn = Game.spawns.SpawnN.spawnCreep.mock;
        expect(mockFn.calls.length).toBe(1)
        expect(mockFn.calls[0][0]).toStrictEqual([MOVE, CARRY, WORK])
    })

    it("Should expand creep bodyparts if requested", () => {
        const creepRequest = new CreepRequest([MOVE, CARRY], 75)
        const response = CreepController.requestCreep(creepRequest, "somebody")
        expect(response).toBeNull()
        // @ts-ignore
        const mockFn = Game.spawns.SpawnN.spawnCreep.mock;
        expect(mockFn.calls.length).toBe(1)
        expect(mockFn.calls[0][0]).toStrictEqual([MOVE, CARRY, MOVE, CARRY, MOVE, CARRY])
    })
})