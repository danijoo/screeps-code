import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {CreepRequest} from "../../../../src/creeps/creepConstants"
import {CreepController} from "../../../../src/creeps/creepController"
import {Kernel} from "../../../../src/os/Kernel"
import {UpgraderRole} from "../../../../src/tasks/creeps/UpgraderRole"
import {ControllerUpgrade} from "../../../../src/tasks/room/ControllerUpgrade"

let task: ControllerUpgrade
let kernel: Kernel
let mockCreep: Creep
const mockController = mockInstanceOf<StructureController>({
    id: "controllerId",
    my: true
})
beforeEach(() => {
    const mockRoom = mockInstanceOf<Room>({
        name: "roomId",
        controller: mockController
    })
    mockCreep = mockInstanceOf<Creep>({
        id: "creepId",
        spawning: false,
        memory: {
            owner: "CreepController"
        },
        getActiveBodyparts: () => 2,
        room: {
            energyCapacityAvailable: 300
        }
    })
    mockGlobal<Game>("Game", {
        rooms: {
            roomId: mockRoom,
        },
        spawns: { spawnId: mockInstanceOf<StructureSpawn>({
                spawning: () => true
            })},
        creeps: {
            creepId: mockCreep
        }
    })
    kernel = new Kernel()
    task = new ControllerUpgrade(
        "myid",
        null,
        0,
        {roomName: "roomId"},
        kernel
    )
    CreepController.init()
})

it("Should return if room is not found", () => {
    Game.rooms = {}
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})

it("Should spawn at least one upgrader task", () => {
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBeGreaterThan(0)
    const childTask = kernel.findTaskById("upgrader-0")
    expect(childTask).toBeInstanceOf(UpgraderRole)
})

it("Should spawn additional tasks for idle creeps", () => {
    CreepController.getNumFreeCreeps = () => 1
    CreepController.requestCreep = (request: CreepRequest, taskId: string, build?: boolean) => {
        if (build) {
            return null
        } else {
            return mockInstanceOf<Creep>({
                memory: {owner: taskId}
            })
        }
    }
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBeGreaterThan(0)
    const childTask = kernel.taskTable.nextByPriority()
    expect(childTask).toBeInstanceOf(UpgraderRole)
})

it("Should not spawn a task if no creep is available", () => {
    mockCreep.spawning = true
    task.run()
    expect(task.finished).toBeTruthy()
})

it("Should not spawn a task if the controller is owned by someone else", () => {
    mockController.my = false
    task.run()
    expect(task.finished).toBeTruthy()
    expect(kernel.taskTable.length).toBe(0)
})