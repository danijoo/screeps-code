import { mockGlobal } from "screeps-jest"
import {getSurroundingPositions, isBuildablePosition} from "../../..//src/utils/positionUtils"

describe("getSurroundingPositions", () => {
    /**
     * x x x
     * x 0 x
     * x x x
     */
    it("Should return surrounding positions", () => {
        const pos = new RoomPosition(5, 5, "roomName")
        const positions = getSurroundingPositions(pos)
        expect(positions.length).toBe(8)
        for (const x of [4, 5, 6]) {
            for (const y of [4, 5, 6]) {
                if (x === pos.x && y === pos.y)
                    continue

                expect(positions.filter(p => p.x === x && p.y === y).length).toBe(1)
            }
        }
    })

    /**
     * | _ _
     * | o x
     * | x x
     */
    it("Should omit edge positions", () => {
        const pos = new RoomPosition(1, 1, "roomName")
        const positions = getSurroundingPositions(pos)
        expect(positions.length).toBe(3)
        for (const x of [1, 2]) {
            for (const y of [1, 2]) {
                if (x === pos.x && y === pos.y)
                    continue

                expect(positions.filter(p => p.x === x && p.y === y).length).toBe(1)
            }
        }
    })

    /**
     * x x |
     * x o |
     * _ _ |
     */
    it("Should omit edge positions 2", () => {
        const pos = new RoomPosition(48, 48, "roomName")
        const positions = getSurroundingPositions(pos)
        expect(positions.length).toBe(3)
        for (const x of [47, 48]) {
            for (const y of [47, 48]) {
                if (x === pos.x && y === pos.y)
                    continue

                expect(positions.filter(p => p.x === x && p.y === y).length).toBe(1)
            }
        }
    })
})

describe("isBuildablePosition", () => {
    beforeEach(() => {
        const terrain = {
            get: (x: number, y: number) => {
                if (x === 1)
                    return TERRAIN_MASK_WALL
                else
                    return 0
            }
        }
        mockGlobal<Game>("Game", {
            rooms: {
                roomName: {
                    getTerrain: () => terrain
                }
            }
        })
    })

    it("should be false if there is a wall", () => {
        const result = isBuildablePosition(
            new RoomPosition(1, 1, "roomName")
        )
        expect(result).not.toBeTruthy()
    })

    it("should be true if the space is free", () => {
        const pos = new RoomPosition(2, 2, "roomName")
        pos.lookFor = jest.fn().mockReturnValue(TERRAIN_MASK_WALL).mockReturnValue([]).mockReturnValue([])
        const result = isBuildablePosition(
            pos
        )
        expect(result).toBeTruthy()
    })

    it("should be false if there is a building on the site", () => {
        const pos = new RoomPosition(2, 2, "roomName")
        pos.lookFor = (type: string) => {
            if (type === LOOK_STRUCTURES) {
                return [{structureType: STRUCTURE_SPAWN}]
            } else {
                return []
            }
        }
        const result = isBuildablePosition(
            pos
        )
        expect(result).not.toBeTruthy()
    })

    it("should be false if there is a construction site on the site", () => {
        const pos = new RoomPosition(2, 2, "roomName")
        pos.lookFor = (type: string) => {
            if (type === LOOK_CONSTRUCTION_SITES) {
                return [{}]
            } else {
                return []
            }
        }
        const result = isBuildablePosition(
            pos
        )
        expect(result).not.toBeTruthy()
    })

    it("should not be false if there is a road on the site", () => {
        const pos = new RoomPosition(2, 2, "roomName")
        pos.lookFor = (type: string) => {
            if (type === LOOK_STRUCTURES) {
                return [{structureType: STRUCTURE_ROAD}]
            } else {
                return []
            }
        }
        const result = isBuildablePosition(
            pos
        )
        expect(result).toBeTruthy()
    })
})
