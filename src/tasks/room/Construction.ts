import {TASK_ROOM_CONSTRUCTION} from "../taskNames"
import {RoomTask} from "./RoomTask"

const MAX_NUM_CONSTRUCTION_SITES = 5

export class ConstructionRequest {
    position: [number, number]
    structureType: BuildableStructureConstant
    priority: number
    name?: string

    constructor(position: [number, number], structureType: BuildableStructureConstant, priority: number, name?: string) {
        this.position = position
        this.structureType = structureType
        this.priority = priority
        this.name = name
    }
}

export class Construction extends RoomTask {
    readonly type: string = TASK_ROOM_CONSTRUCTION

    runWithRoom(room: Room): boolean {
        const presentSites = room.find(FIND_MY_CONSTRUCTION_SITES)
        let availableSiteSlots = MAX_NUM_CONSTRUCTION_SITES - presentSites.length
        while (availableSiteSlots > 0 && this.queueLength() > 0) {
            const request = this.getNextFromQueue()!
            let result: number
            if (request.structureType === STRUCTURE_SPAWN) {
                result = room.createConstructionSite(
                    request.position[0],
                    request.position[1],
                    request.structureType,
                    request.name
                )
            } else {
                result = room.createConstructionSite(
                    request.position[0],
                    request.position[1],
                    request.structureType,
                )
            }
            if (result !== OK) {
                console.log(`Failed to create construction site for {request.structureType} at {request.position}: ${result}`)
            }

            availableSiteSlots -= 1
        }

        return true
    }

    addToQueue(request: ConstructionRequest) {
        this.room = Game.rooms[this.data.roomName]
        if (!this.room) {
            console.log("Failed to add construction site to queue: room not found")
            return
        }
        for (let i = 0; i < this.room?.memory.constructionQueue.length; i++) {
            if (this.room.memory.constructionQueue[i].priority < request.priority) {
                this.room.memory.constructionQueue.splice(i, 0, request)
                return
            }
        }
        this.room.memory.constructionQueue.push(request)
    }

    peekQueue(): ConstructionRequest | undefined {
        if (this.queueLength() === 0)
            return undefined
        return this.room?.memory.constructionQueue[0]
    }

    getNextFromQueue(): ConstructionRequest | undefined {
        return this.room?.memory.constructionQueue.shift()
    }

    queueLength(): number {
        return this.room?.memory.constructionQueue.length ?? 0
    }

    ipcReceive(senderId: string, message: ConstructionRequest): boolean {
        if (!(message instanceof ConstructionRequest)) {
            console.log(this.type + ": Received invalid message.")
            return false
        }
        this.addToQueue(message)
        return true
    }

}