import {CreepController} from "../creeps/creepController"
import {Kernel} from "../os/Kernel"

declare global {
    interface Memory {
        stats: {
            time: number
            roomStats: {[roomName: string]: {
                    energyAvailable: number
                    energyCapacityAvailable: number
                    energyStored: number
                    controllerProgress: number
                    controllerProgressTotal: number
                    controllerLevel: number,
                    creepsTotal: number,
                    creepsUsed: number,
                }
            }
            gcl: {
                progress: number
                progressTotal: number
                level: number
            }
            cpu: {
                bucket: number
                limit: number
                used: number
            }
            kernel: {
                tasksTotal: number
                tasksExecuted: number
                tasksSuspended: number
                tasksAdded: number
                tasksFinished: number
            }
        }
    }
}

export function collectStats(kernel: Kernel) {
    Memory.stats = {
        time: Game.time,
        roomStats: {},
        gcl: {
            progress: Game.gcl.progress,
            progressTotal: Game.gcl.progressTotal,
            level: Game.gcl.level
        },
        cpu: {
            bucket: Game.cpu.bucket,
            limit: Game.cpu.limit,
            used: Game.cpu.getUsed()
        },
        kernel: {
            tasksTotal: kernel.tickTasksTotal,
            tasksExecuted: kernel.tickTasksExecuted,
            tasksSuspended: kernel.tickTasksSuspended,
            tasksAdded: kernel.tickTasksAdded,
            tasksFinished: kernel.tickTasksFinished
        },
    }

    for (const room of Object.values(Game.rooms)) {
        if (! (room.controller ? room.controller.my : false))
            continue
        Memory.stats.roomStats[room.name] = {
            energyAvailable: room.energyAvailable,
            energyCapacityAvailable: room.energyCapacityAvailable,
            energyStored: room.memory.energyStored,
            controllerProgress: room.controller!.progress,
            controllerProgressTotal: room.controller!.progressTotal,
            controllerLevel: room.controller!.level,
            creepsTotal: room.find(FIND_MY_CREEPS).length,
            creepsUsed: room.find(FIND_MY_CREEPS, {filter: c => !c.memory.owner || c.memory.owner === "CreepController"}).length
        }
    }
}