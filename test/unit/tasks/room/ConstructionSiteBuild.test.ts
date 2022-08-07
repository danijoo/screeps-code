import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {CreepController} from "../../../../src/creeps/creepController"
import {Kernel} from "../../../../src/os/Kernel"
import {ConstructionSiteBuild, MAX_NUM_BUILDERS} from "../../../../src/tasks/room/ConstructionSiteBuild"

let task: ConstructionSiteBuild
let kernel: Kernel
let mockCreeps: Creep[]
beforeEach(() => {
    const mockRoom = mockInstanceOf<Room>({
        name: "roomName",
        find: () => [mockInstanceOf<ConstructionSite>({
            id: "mysiteid"
        })],
        energyCapacityAvailable: 300,
        energyAvailable: 300
    })

    mockCreeps = []
    for (let i=0; i<6; i++) {
        mockCreeps.push(mockInstanceOf<Creep>({
            id: String(i),
            spawning: false,
            memory: {
                owner: undefined,
            },
            getActiveBodyparts: () => 2,
            room: mockRoom
        }))
    }

    mockGlobal<Game>("Game", {
        rooms: {
            [mockRoom.name]: mockRoom
        },
        creeps: {
            "0": mockCreeps[0],
            "1": mockCreeps[1],
            "2": mockCreeps[2],
            "3": mockCreeps[3],
            "4": mockCreeps[4],
            "5": mockCreeps[5],
        },
        spawns: {
            "Spawn1": mockInstanceOf<StructureSpawn>({
                spawning: () => false,
                room: mockRoom
            })
        }
    })
    kernel = new Kernel()
    task = new ConstructionSiteBuild(
        "myid",
        null,
        0,
        {roomName: "roomName"},
        kernel
    )
    CreepController.init()
})

it ("Should spawn builder tasks for a construction site", () => {
    task.run()
    expect(kernel.taskTable.length).toBeGreaterThan(0)
})

it ("Should never exceed max number of builders", () => {
    Game.rooms.roomName.find = () => {
        let sites = []
        for (let i = 0; i < 10; i++) {
            sites.push(
                mockInstanceOf<ConstructionSite>({
                    id: "mysiteid" + i
                }),
            )
        }
        return sites
    }
    task.run()
    expect(kernel.taskTable.length).not.toBeGreaterThan(MAX_NUM_BUILDERS)
})

it ("Should finish if no creep is available", () => {
    Game.creeps = {}
    CreepController.init()
    task.run()
    expect(kernel.taskTable.length).toBe(0)
})

it ("Should return creep if task spawning failed", () => {
    kernel.createTaskIfNotExists = jest.fn().mockReturnValue(undefined)
    const creepsAvailable = CreepController.getNumFreeCreeps()
    task.run()
    expect(kernel.createTaskIfNotExists).toBeCalled()
    expect(CreepController.getNumFreeCreeps()).toBe(creepsAvailable)
})