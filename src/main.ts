import { ErrorMapper } from "utils/ErrorMapper";
import {Kernel} from "./os/Kernel";
import {ConstructionRequest} from "./tasks/room/Construction"
import {PRIORITY_INIT} from "./tasks/taskPriorities";
import {TASK_INIT} from "./tasks/taskNames";
import {initMemory} from "./utils/initMemory"
import {onRespawn} from "./utils/onRespawn"
import {buryTheDead} from "./creeps/buryTheDead"
import { onGlobalContextChangeDetected } from "utils/onGlobalContextChange";
import { CreepController } from "creeps/creepController";
import { collectStats } from "utils/collectStats";

declare global {
    interface CreepMemory {
        owner: string | null
    }

    interface RoomMemory {
        sources: {
            [sourceId: string]: {
                position: [number, number],
                ignored: boolean,
                harvesterPosition: [number, number],
            }
        }
        constructionQueue: ConstructionRequest[],
        energyStored: number
    }
}

// reset stuff on Respawn
onRespawn(() => {
    console.log("RESPAWNED")
})


// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
    console.log(`----------- Tick ${Game.time} ------------`);
    onGlobalContextChangeDetected(() => console.log("GLOBAL RESET DETECTED !"))

    initMemory()
    buryTheDead() // remove dead creeps memory
    CreepController.init()

    const kernel = new Kernel()
    kernel.init()
    kernel.createTaskIfNotExists(TASK_INIT, "init", null, PRIORITY_INIT)
    kernel.runTasks()
    kernel.report()
    collectStats(kernel)
    kernel.suspend()
});