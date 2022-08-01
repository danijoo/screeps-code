import {mockGlobal, mockInstanceOf} from "screeps-jest";
import {Kernel} from "../../../../..//src/os/Kernel";
import {BuildStructure} from "../../../../..//src/tasks/creeps/actions/BuildStructure";

describe("Build Structure", () => {
    let mockSite: ConstructionSite
    let mockCreep: Creep
    let task: BuildStructure
    beforeEach(() => {
        mockSite = mockInstanceOf<ConstructionSite>()
        mockCreep = mockInstanceOf<Creep>({
            moveTo: () => OK,
            build: () => OK,
            store: {
                getUsedCapacity: () => 0
            }
        })
        mockGlobal<Game>("Game", {
            getObjectById: (id: string): any => {
                if (id === "creepId") {
                    return mockCreep
                } else if (id === "constructionSiteId") {
                    return mockSite
                }
            },
            creeps: {
                "creepId": mockCreep
            }
        })
        task = new BuildStructure(
            "myid",
            null,
            0,
            {creepId: "creepId", "constructionSiteId": "constructionSiteId"},
            mockInstanceOf<Kernel>(),
        )
    })

    it("should stop if site is not found",() => {
        // @ts-ignore
        Game._getObjectById = Game.getObjectById
        Game.getObjectById = (id: string) => {
            if (id === "constructionSiteId") {
                return undefined
            } else {
                // @ts-ignore
                return Game._getObjectById(id)
            }
        }
        task.run()
        expect(mockCreep.build).toHaveBeenCalledTimes(0)
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
        expect(mockCreep.build).toHaveBeenCalledTimes(0)
        expect(task.finished).toBeTruthy()
    })

    it("should stop if build was OK but no energy is left",() => {
        task.run()
        // @ts-ignore
        expect(mockCreep.build).toHaveBeenCalledTimes(1)
        expect(task.finished).toBeTruthy()
    })

    it("should stop if creep has no energy",() => {
        mockCreep.build = jest.fn(() => ERR_NOT_ENOUGH_RESOURCES)
        task.run()
        expect(mockCreep.build).toHaveBeenCalledTimes(1)
        expect(task.finished).toBeTruthy()
    })

    it("should move to site if more than one step away and not stop",() => {
        mockCreep.build = jest.fn(() => ERR_NOT_IN_RANGE)
        task.run()
        expect(mockCreep.build).toHaveBeenCalledTimes(1)
        expect(mockCreep.moveTo).toHaveBeenCalledTimes(1)
        expect(mockCreep.moveTo).toHaveBeenCalledWith(mockSite, expect.anything())
        expect(task.finished).not.toBeTruthy()
    })

    it("should stop on error",() => {
        mockCreep.build = jest.fn(() => ERR_NOT_OWNER)
        task.run()
        expect(mockCreep.build).toHaveBeenCalledTimes(1)
        expect(task.finished).toBeTruthy()
    })

    it("should stop if build is finished",() => {
        Game.getObjectById = jest.fn().mockReturnValue(mockCreep)
            .mockReturnValue(mockSite).mockReturnValue(undefined)
        task.run()
        expect(task.finished).toBeTruthy()
    })

    it("should continue if build was OK and energy is left",() => {
        mockCreep.build = jest.fn(() => OK)
        // @ts-ignore
        mockCreep.store.getUsedCapacity = () => 10
        task.run()
        expect(mockCreep.build).toHaveBeenCalledTimes(1)
        expect(task.finished).not.toBeTruthy()
    })


})
