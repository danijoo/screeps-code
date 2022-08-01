import { ErrorMapper } from "utils/ErrorMapper";
import {Kernel} from "./os/Kernel";
import {PRIORITY_INIT} from "./tasks/taskPriorities";
import {TASK_INIT} from "./tasks/taskNames";
import {initMemory} from "./utils/initMemory"
import {onRespawn} from "./utils/onRespawn"
import {buryTheDead} from "./creeps/buryTheDead"
import { onGlobalContextChangeDetected } from "utils/onGlobalContextChange";
import { CreepController } from "creeps/creepController";

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
    kernel.suspend()
});