import {mockGlobal, mockInstanceOf} from "screeps-jest"
import {Kernel} from "../../../..//src/os/Kernel"
import {TowerControl} from "../../../..//src/tasks/room/TowerControl"

let mockTower: StructureTower
let task: TowerControl
let mockCreep: Creep
let mockStructure: Structure
beforeEach(() => {
    mockStructure = mockInstanceOf<StructureRoad>({
        hits: 10,
        hitsMax: 100
    })
    mockTower = mockInstanceOf<StructureTower>({
        attack: jest.fn(),
        heal: jest.fn(),
        repair: jest.fn(),
        room: {}
    })
    mockCreep = mockInstanceOf<Creep>({
        name: "creepName",
        hits: 10,
        hitsMax: 100,
        room: {
            name: "roomName"
        }
    })
    mockGlobal<Game>("Game", {
        rooms: {
            roomName: {
                name: "roomName"
            }
        },
        creeps: {
            creepName: mockCreep
        }
    })
    task = new TowerControl(
        "myid",
        null,
        0,
        {roomName: "roomName"},
        new Kernel()
    )
})

describe("With hostile creeps", () => {
    beforeEach(() => {
        Game.rooms.roomName.find = jest.fn()
            .mockReturnValueOnce([mockTower])  // towers
            .mockReturnValueOnce([mockCreep])  // hostile creeps
            .mockReturnValueOnce([])  // friendly creeps
            .mockReturnValueOnce([mockStructure])  // repairable structures
            .mockReturnValueOnce([mockStructure])  // neutral structures
            .mockReturnValueOnce([mockStructure])  // defense structures
    })

    it("Should shoot at enemies", () => {
        mockTower.attack = jest.fn().mockReturnValue(OK)
        task.run()
        expect(mockTower.attack).toBeCalledTimes(1)
        expect(mockTower.attack).toBeCalledWith(mockCreep)
        expect(mockTower.heal).not.toBeCalled()
        expect(mockTower.repair).not.toBeCalled()
    })

})

describe("With friendly creeps", () => {
    beforeEach(() => {
        Game.rooms.roomName.find = jest.fn()
            .mockReturnValueOnce([mockTower])  // towers
            .mockReturnValueOnce([])  // hostile creeps
            .mockReturnValueOnce([mockCreep])  // friendly creeps
            .mockReturnValueOnce([mockStructure])  // repairable structures
            .mockReturnValueOnce([mockStructure])  // neutral structures
            .mockReturnValueOnce([mockStructure])  // defense structures
    })

    it("Should heal creeps", () => {
        mockTower.heal = jest.fn().mockReturnValue(OK)
        task.run()
        expect(mockTower.heal).toBeCalledTimes(1)
        expect(mockTower.heal).toBeCalledWith(mockCreep)
        expect(mockTower.attack).not.toBeCalled()
        expect(mockTower.repair).not.toBeCalled()
    })

})

describe("With repairable structures", () => {
    beforeEach(() => {
        Game.rooms.roomName.find = jest.fn()
            .mockReturnValueOnce([mockTower])  // towers
            .mockReturnValueOnce([])  // hostile creeps
            .mockReturnValueOnce([])  // friendly creeps
            .mockReturnValueOnce([mockStructure])  // repairable structures
            .mockReturnValueOnce([mockStructure])  // neutral structures
            .mockReturnValueOnce([mockStructure])  // defense structures
    })

    it("Should repair structure", () => {
        mockTower.repair = jest.fn().mockReturnValue(OK)
        task.run()
        expect(mockTower.repair).toBeCalledTimes(1)
        expect(mockTower.repair).toBeCalledWith(mockStructure)
        expect(mockTower.attack).not.toBeCalled()
        expect(mockTower.heal).not.toBeCalled()
    })

})

describe("With repairable neutral structures", () => {
    beforeEach(() => {
        Game.rooms.roomName.find = jest.fn()
            .mockReturnValueOnce([mockTower])  // towers
            .mockReturnValueOnce([])  // hostile creeps
            .mockReturnValueOnce([])  // friendly creeps
            .mockReturnValueOnce([])  // repairable structures
            .mockReturnValueOnce([mockStructure])  // neutral structures
            .mockReturnValueOnce([mockStructure])  // defense structures
    })

    it("Should repair structure", () => {
        mockTower.repair = jest.fn().mockReturnValue(OK)
        task.run()
        expect(mockTower.repair).toBeCalledTimes(1)
        expect(mockTower.repair).toBeCalledWith(mockStructure)
        expect(mockTower.attack).not.toBeCalled()
        expect(mockTower.heal).not.toBeCalled()
    })

})

describe("With repairable walls", () => {
    beforeEach(() => {
        Game.rooms.roomName.find = jest.fn()
            .mockReturnValueOnce([mockTower])  // towers
            .mockReturnValueOnce([])  // hostile creeps
            .mockReturnValueOnce([])  // friendly creeps
            .mockReturnValueOnce([])  // repairable structures
            .mockReturnValueOnce([])  // neutral structures
            .mockReturnValueOnce([mockStructure])  // defense structures
    })

    it("Should repair structure", () => {
        mockTower.repair = jest.fn().mockReturnValue(OK)
        task.run()
        expect(mockTower.repair).toBeCalledTimes(1)
        expect(mockTower.repair).toBeCalledWith(mockStructure)
        expect(mockTower.attack).not.toBeCalled()
        expect(mockTower.heal).not.toBeCalled()
    })

})
