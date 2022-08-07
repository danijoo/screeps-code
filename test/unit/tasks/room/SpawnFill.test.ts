import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {CreepController} from "../../../../src/creeps/creepController"
import {Kernel} from "../../../../src/os/Kernel"
import {MAX_NUM_FILLER, SpawnFill} from "../../../../src/tasks/room/SpawnFill"

let mockSpawns: StructureSpawn[]
let mockExtensions: StructureExtension[]
let mockTower: StructureTower
let mockCreeps: Creep[]
let task: SpawnFill
beforeEach(() => {
    let mockRoom = mockInstanceOf<Room>({
        name: "roomName",
        find: () => {
            return (mockSpawns as (StructureSpawn|StructureExtension|StructureTower)[])
                .concat(mockExtensions).concat([mockTower])
        },
        energyCapacityAvailable: 10000,
        energyAvailable: 10000
    })
    mockSpawns = []
    for (let i = 0; i < 2; i++) {
       mockSpawns.push(mockInstanceOf<StructureSpawn>({
           id: "Spawn" + i,
           structureType: STRUCTURE_SPAWN,
           store: {getFreeCapacity: () => 0},
           spawning: () => false,
           room: mockRoom,
       }),)
    }
    mockExtensions = []
    for (let i = 0; i < 5; i++) {
        mockExtensions.push(mockInstanceOf<StructureExtension>({
            id: "Extension" + i,
            structureType: STRUCTURE_EXTENSION,
            store: {getFreeCapacity: () => 0}
        }))
    }
    mockTower = mockInstanceOf<StructureTower>({
        id: "tower1",
        structureType: STRUCTURE_TOWER,
        store: {getFreeCapacity: () => 0}
    })
    mockCreeps = []
    for (let i = 0; i < 5; i++) {
        mockCreeps.push(
            mockInstanceOf<Creep>({
                id: "Creep" + i,
                getActiveBodyparts: () => 5,
                spawning: false,
                memory: {owner: undefined,}
            })
        )
    }
    mockGlobal<Game>("Game", {
        creeps: {
        },
        spawns: {
            spawnN: mockSpawns[0]
        },
        rooms: {
            roomName: mockRoom
        },
    })
    for (let i = 0; i < mockCreeps.length; i++) {
        Game.creeps["Creep" + i] = mockCreeps[i]
    }
    task = new SpawnFill(
        "myid",
        null,
        0,
        {roomName: "roomName"},
        new Kernel()
    )
    CreepController.init()
})

it("should do nothing if everything is filled", () => {
    task.run()
    expect(task.kernel.taskTable.length).toBe(0)
})

it ("should spawn at least one filler task if there is an unfilled extension", () => {
    mockExtensions[0].store.getFreeCapacity = jest.fn().mockReturnValue(10)
    task.run()
    expect(task.kernel.taskTable.length).toBeGreaterThan(0)
    expect(task.kernel.taskTable.nextByPriority()!.id).toContain("ext")
})

it ("should spawn at least one filler task if there is an unfilled spawn", () => {
    mockSpawns[0].store.getFreeCapacity = jest.fn().mockReturnValue(10)
    task.run()
    expect(task.kernel.taskTable.length).toBeGreaterThan(0)
    expect(task.kernel.taskTable.nextByPriority()!.id).toContain("spa")
})

it ("should spawn at least one filler task if there is an unfilled tower", () => {
    mockTower.store.getFreeCapacity = jest.fn().mockReturnValue(10)
    task.run()
    expect(task.kernel.taskTable.length).toBeGreaterThan(0)
    expect(task.kernel.taskTable.nextByPriority()!.id).toContain("tow")
})

it ("should not spawn a filler task if there are no available creeps", () => {
    Game.creeps = {}
    CreepController.init()
    mockSpawns[0].store.getFreeCapacity = jest.fn().mockReturnValue(10)
    task.run()
    expect(task.kernel.taskTable.length).toBe(0)
})

it ("should return a creep if task could not be spawnd", () => {
    const numCreeps = CreepController.getNumFreeCreeps()
    mockSpawns[0].store.getFreeCapacity = jest.fn().mockReturnValue(10)
    task.kernel.createTaskIfNotExists = jest.fn().mockReturnValue(undefined)
    task.run()
    expect(task.kernel.taskTable.length).toBe(0)
    expect(CreepController.getNumFreeCreeps()).toBe(numCreeps)
})

it ("should never spawn more filler tasks than max number", () => {
    mockSpawns.forEach(s => s.store.getFreeCapacity = jest.fn().mockReturnValue(1000))
    mockExtensions.forEach(s => s.store.getFreeCapacity = jest.fn().mockReturnValue(1000))
    task.run()
    expect(task.kernel.taskTable.length).toBe(MAX_NUM_FILLER)
})

it ("should spawn only one task for extensions", () => {
    mockExtensions.forEach(s => s.store.getFreeCapacity = jest.fn().mockReturnValue(1000))
    task.run()
    expect(task.kernel.taskTable.length).toBe(1)
})