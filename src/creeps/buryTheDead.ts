// clear memory of dead creeps
export function buryTheDead(): void {
    for (const creepName in Memory.creeps) {
        if (!(creepName in Game.creeps)) {
            console.log(`Burying ${creepName}`)
            delete Memory.creeps[creepName]
        }
    }
}