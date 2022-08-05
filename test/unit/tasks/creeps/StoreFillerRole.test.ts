import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {CreepController} from "../../../../src/creeps/creepController";
import {Kernel} from "../../../../src/os/Kernel";
import {GetEnergy} from "../../../../src/tasks/creeps/actions/GetEnergy"
import {TransferEnergy} from "../../../../src/tasks/creeps/actions/TransferEnergy";
import {StoreFillerRole} from "../../../../src/tasks/creeps/StoreFillerRole";

let mockCreep: Creep
let mockStructure: StructureSpawn
let task: StoreFillerRole
let kernel: Kernel
const mockSource: Source = mockInstanceOf<Source>({id: "sourceId", energy: 100})
beforeEach(() => {
    mockCreep = mockInstanceOf<Creep>({
        id: "creepId",
        store: {
            [RESOURCE_ENERGY]: 0,
            getCapacity: () => 300
        },
        memory: {owner: "myid"},
        spawning: false
    })
    mockStructure = mockInstanceOf<StructureSpawn>({
        id: "structureId",
        store: {
            getFreeCapacity: () => 300
        },
        room: {find: () => [mockSource]}
    })
    mockGlobal<Game>("Game", {
        time: 10,
        creeps: {
            creepId: mockCreep
        },
        spawns: {
            spawnid: {
                room: {
                    energyAvailable: 300
                }
            }
        },
        getObjectById: (id: string) => {
            if (id === "creepId") {
                return mockCreep
            } else {
                return mockStructure
            }
        }
    })
    kernel = new Kernel()
    task = new StoreFillerRole(
        "myid",
        null,
        0,
        {
            "creepId": "creepId",
            "structureId": "structureId",
        },
        kernel,
    )
    kernel.addTaskIfNotExists(task)
    CreepController.init()
})

it("should return when structure not found", () => {
    // @ts-ignore
    Game._getObjectById = Game.getObjectById
    Game.getObjectById = (id: string) => {
        if (id === "creepId") {
            // @ts-ignore
            return Game._getObjectById(id)
        } else {
            return null
        }
    }
    task.run()
    expect(task.finished).toBeTruthy()
})

it("Should return when structure is full", () => {
    // @ts-ignore
    mockStructure.store.getFreeCapacity = () => {return 0}
    task.run()
    expect(task.finished).toBeTruthy()
})

it("Should create a filler action if creep is full", () => {
    mockCreep.store[RESOURCE_ENERGY] = 300
    task.run()
    expect(task.finished).not.toBeTruthy()
    expect(task.suspended).toBeTruthy()
    expect(kernel.taskTable.length).toBe(2)
    const childTask = kernel.findTaskById("filler-transfer-myid")!
    expect(childTask).toBeInstanceOf(TransferEnergy)
    expect(childTask.parent).toBe(task)
    expect(childTask.wakeParent).toBeTruthy()
})

it("Should create a get energy action if creep is not full", () => {
    mockCreep.store[RESOURCE_ENERGY] = 0
    task.run()
    expect(task.finished).not.toBeTruthy()
    expect(task.suspended).toBeTruthy()
    expect(kernel.taskTable.length).toBe(2)
    const childTask = kernel.findTaskById("filler-getenergy-myid")!
    expect(childTask).toBeInstanceOf(GetEnergy)
    expect(childTask.parent).toBe(task)
    expect(childTask.wakeParent).toBeTruthy()
})