import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {CreepController} from "../../../..//src/creeps/creepController";
import {Kernel} from "../../../..//src/os/Kernel";
import {HarvestEnergy} from "../../../..//src/tasks/creeps/actions/HarvestEnergy";
import {UpgradeController} from "../../../..//src/tasks/creeps/actions/UpgradeController"
import {PioneerRole} from "../../../..//src/tasks/creeps/PioneerRole"

let mockCreep: Creep
let mockController: StructureController
let task: PioneerRole
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
    mockController = mockInstanceOf<StructureController>({
        id: "controllerId",
        room: {find: () => [mockSource]}
    })
    mockGlobal<Game>("Game", {
        time: 10,
        creeps: {
            "creepId": mockCreep
        },
        spawns: {"Spawn1": mockInstanceOf<StructureSpawn>()},
        getObjectById: (id: string) => {
            if (id === "creepId") {
                return mockCreep
            } else {
                return mockController
            }
        }
    })
    kernel = new Kernel()
    task = new PioneerRole(
        "myid",
        null,
        0,
        {
            "creepId": "creepId",
            "controllerId": "structureId",
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

it("Should return after upgrading the controller", () => {
    // @ts-ignore
    mockCreep.store[RESOURCE_ENERGY] = 300
    task.run()
    expect(task.suspended).toBeTruthy()
    task.executed = false
    task.suspended = false
    task.run()
    expect(task.finished).toBeTruthy()
})

it("Should create an upgrade energy action if creep is full", () => {
    mockCreep.store[RESOURCE_ENERGY] = 300
    task.run()
    expect(task.finished).not.toBeTruthy()
    expect(task.suspended).toBeTruthy()
    expect(kernel.taskTable.length).toBe(2)
    const childTask = kernel.findTaskById("pioneer-upgrade-myid")!
    expect(childTask).toBeInstanceOf(UpgradeController)
    expect(childTask.parent).toBe(task)
    expect(childTask.wakeParent).toBeTruthy()
})

it("Should create a harvest action if creep is not full", () => {
    mockCreep.store[RESOURCE_ENERGY] = 0
    task.run()
    expect(task.finished).not.toBeTruthy()
    expect(task.suspended).toBeTruthy()
    expect(kernel.taskTable.length).toBe(2)
    const childTask = kernel.findTaskById("pioneer-harvest-myid")!
    expect(childTask).toBeInstanceOf(HarvestEnergy)
    expect(childTask.parent).toBe(task)
    expect(childTask.wakeParent).toBeTruthy()
})
