import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {CreepController} from "../../../../src/creeps/creepController"
import {Kernel} from "../../../../src/os/Kernel"
import {ConstructionSiteBuild} from "../../../../src/tasks/room/ConstructionSiteBuild"

let task: ConstructionSiteBuild
let kernel: Kernel
let mockCreeps: {[key: string]: Creep}
beforeEach(() => {
    mockCreeps = {
        "one": mockInstanceOf<Creep>({
            id: "one",
            spawning: false,
            memory: {
                owner: undefined,
            },
            getActiveBodyparts: () => 2
        }),
        "two": mockInstanceOf<Creep>({
            id: "two",
            spawning: false,
            memory: {
                owner: undefined,
            },
            getActiveBodyparts: () => 2
        }),
        "three": mockInstanceOf<Creep>({
            id: "three",
            spawning: false,
            memory: {
                owner: undefined,
            },
            getActiveBodyparts: () => 2
        }),
        "four": mockInstanceOf<Creep>({
            id: "four",
            spawning: false,
            memory: {
                owner: undefined,
            },
            getActiveBodyparts: () => 2
        }),
        "five": mockInstanceOf<Creep>({
            id: "five",
            spawning: false,
            memory: {
                owner: undefined,
            },
            getActiveBodyparts: () => 2
        }),
        "six": mockInstanceOf<Creep>({
            id: "six",
            spawning: false,
            memory: {
                owner: undefined,
            },
            getActiveBodyparts: () => 2
        }),
    }
    mockGlobal<Game>("Game", {
        rooms: {
            roomName: {
                find: () => [mockInstanceOf<ConstructionSite>({
                    id: "mysiteid"
                })]
            }
        },
        creeps: mockCreeps,
        spawns: {
            "Spawn1": mockInstanceOf<StructureSpawn>({
                spawning: () => false
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
    expect(kernel.taskTable.length).toBe(2)
})

it ("Should not exceed max number of builders", () => {
    Game.rooms.roomName.find = () => [
        mockInstanceOf<ConstructionSite>({
            id: "mysiteid"
        }),
        mockInstanceOf<ConstructionSite>({
            id: "mysiteid2"
        }),
        mockInstanceOf<ConstructionSite>({
            id: "mysiteid3"
        })
    ]
    task.run()
    expect(kernel.taskTable.length).toBe(5)
})

it ("Should finish if no creep is available", () => {
    Game.creeps = {}
    CreepController.init()
    task.run()
    expect(kernel.taskTable.length).toBe(0)
})