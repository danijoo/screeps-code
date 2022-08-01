import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {CreepController} from "../../../..//src/creeps/creepController";
import {Kernel} from "../../../..//src/os/Kernel";
import {GetEnergy} from "../../../..//src/tasks/creeps/actions/GetEnergy"
import {UpgradeController} from "../../../..//src/tasks/creeps/actions/UpgradeController"
import {UpgraderRole} from "../../../..//src/tasks/creeps/UpgraderRole"

let mockCreep: Creep
let mockController: StructureController
let task: UpgraderRole
let kernel: Kernel
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
    task = new UpgraderRole(
        "myid",
        null,
        0,
        {
            "creepId": "creepId",
            "controllerId": "structureId",
        },
        kernel,
    )
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
    expect(kernel.taskTable.length).toBe(1)
    const childTask = kernel.findTaskById("upgrader-upgrade-myid")!
    expect(childTask).toBeInstanceOf(UpgradeController)
    expect(childTask.parent).toBe(task)
    expect(childTask.wakeParent).toBeTruthy()
})

it("Should create a get energy action if creep is not full", () => {
    mockCreep.store[RESOURCE_ENERGY] = 0
    task.run()
    expect(task.finished).not.toBeTruthy()
    expect(task.suspended).toBeTruthy()
    expect(kernel.taskTable.length).toBe(1)
    const childTask = kernel.findTaskById("upgrader-getenergy-myid")!
    expect(childTask).toBeInstanceOf(GetEnergy)
    expect(childTask.parent).toBe(task)
    expect(childTask.wakeParent).toBeTruthy()
})
