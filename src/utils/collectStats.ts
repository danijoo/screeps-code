import {Kernel} from "../os/Kernel"

declare global {
    interface Memory {
        stats: {
            time: number
            creepCount: number
            roomStats: {[roomName: string]: {
                    energyAvailable: number
                    energyCapacityAvailable: number
                    controllerProgress: number
                    controllerProgressTotal: number
                    controllerLevel: number
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
    // reset
    Memory.stats = {
        time: Game.time,
        creepCount: Object.keys(Game.creeps).length,
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
        }
    }

    for (const room of Object.values(Game.rooms)) {
        if (! (room.controller ? room.controller.my : false))
            continue
        Memory.stats.roomStats[room.name] = {
            energyAvailable: room.energyAvailable,
            energyCapacityAvailable: room.energyCapacityAvailable,
            controllerProgress: room.controller!.progress,
            controllerProgressTotal: room.controller!.progressTotal,
            controllerLevel: room.controller!.level
        }
    }
}