import {mockGlobal, mockInstanceOf, mockStructure} from "screeps-jest";
import {Kernel} from "../../../../..//src/os/Kernel";
import {UpgradeController} from "../../../../..//src/tasks/creeps/actions/UpgradeController";

describe("Upgrade Controller", () => {
    let mockController: StructureController
    let mockCreep: Creep
    let task: UpgradeController
    beforeEach(() => {
        mockController = mockStructure(STRUCTURE_CONTROLLER)
        mockCreep = mockInstanceOf<Creep>({
            moveTo: () => OK,
            upgradeController: () => OK,
            store: {
                getUsedCapacity: () => 0
            }
        })
        mockGlobal<Game>("Game", {
            getObjectById: (id: string): any => {
                if (id === "creepId") {
                    return mockCreep
                } else if (id === "controllerId") {
                    return mockController
                }
            },
            creeps: {
                "creepId": mockCreep
            }
        })
        task = new UpgradeController(
            "myid",
            null,
            0,
            {creepId: "creepId", "controllerId": "controllerId"},
            mockInstanceOf<Kernel>(),
        )
    })

    it("should stop if controller is not found",() => {
        // @ts-ignore
        Game._getObjectById = Game.getObjectById
        Game.getObjectById = (id: string) => {
            if (id === "controllerId") {
                return undefined
            } else {
                // @ts-ignore
                return Game._getObjectById(id)
            }
        }
        task.run()
        expect(mockCreep.upgradeController).toHaveBeenCalledTimes(0)
        expect(task.finished).toBeTruthy()
    })

    it("should stop if creep is not found",() => {
        // @ts-ignore
        Game._getObjectById = Game.getObjectById
        Game.getObjectById = (id: string) => {
            if (id === "creepId") {
                return undefined
            } else {
                // @ts-ignore
                return Game._getObjectById(id)
            }
        }
        task.run()
        expect(mockCreep.upgradeController).toHaveBeenCalledTimes(0)
        expect(task.finished).toBeTruthy()
    })

    it("should stop if upgrade was OK but no energy is left",() => {
        task.run()
        // @ts-ignore
        expect(mockCreep.upgradeController).toHaveBeenCalledTimes(1)
        expect(task.finished).toBeTruthy()
    })

    it("should stop if creep has no energy",() => {
        mockCreep.upgradeController = jest.fn((controller) => ERR_NOT_ENOUGH_RESOURCES)
        task.run()
        expect(mockCreep.upgradeController).toHaveBeenCalledTimes(1)
        expect(task.finished).toBeTruthy()
    })

    it("should move to controller if more than one step away and not stop",() => {
        mockCreep.upgradeController = jest.fn((controller) => ERR_NOT_IN_RANGE)
        task.run()
        expect(mockCreep.upgradeController).toHaveBeenCalledTimes(1)
        expect(mockCreep.moveTo).toHaveBeenCalledTimes(1)
        expect(mockCreep.moveTo).toHaveBeenCalledWith(mockController, expect.anything())
        expect(task.finished).not.toBeTruthy()
    })

    it("should stop on error",() => {
        mockCreep.upgradeController = jest.fn((controller) => ERR_NOT_OWNER)
        task.run()
        expect(mockCreep.upgradeController).toHaveBeenCalledTimes(1)
        expect(task.finished).toBeTruthy()
    })

    it("should continue if upgrade was OK and energy is left",() => {
        mockCreep.upgradeController = jest.fn((controller) => OK)
        // @ts-ignore
        mockCreep.store.getUsedCapacity = () => 10
        task.run()
        expect(mockCreep.upgradeController).toHaveBeenCalledTimes(1)
        expect(task.finished).not.toBeTruthy()
    })


})
