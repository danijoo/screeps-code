import {Task} from "../../../os/Task"
import {TASK_CREEP_ACTION_GET_ENERGY} from "../../taskNames"

type StorageStructure = Structure<STRUCTURE_CONTAINER> | Structure<STRUCTURE_STORAGE>
type EnergySource = Resource<RESOURCE_ENERGY> | StorageStructure

export class GetEnergy extends Task {
    readonly type: string = TASK_CREEP_ACTION_GET_ENERGY

    _run(): boolean {
        const creep = Game.getObjectById<Creep>(this.data.creepId)
        if (!creep) {
            console.log("Failed to get energy: creep not found")
            return true
        }

        let energySource: EnergySource | null = Game.getObjectById<EnergySource>(this.data.resourceId)
        if (!energySource) {
            energySource = this.findBestEnergySource(creep) ?? null
            if (energySource)
                this.data.resourceId = energySource.id
            else {
                console.log("Failed to get energy: no resources found")
                return true
            }
        }

        if (!energySource) {
            console.log("Failed to get energy: no resources found")
            return true
        } else {
            // @ts-ignore
            const result = (energySource.structureType)?
                // @ts-ignore
                creep.withdraw(energySource, RESOURCE_ENERGY) : creep.pickup(energySource)
            switch (result) {
                case OK:
                case ERR_FULL:
                    return creep.store.getFreeCapacity() === 0
                case ERR_NOT_IN_RANGE:
                    creep.moveTo(energySource, {visualizePathStyle: {}})
                    return false
                default:
                    console.log("Failed to get energy: " + result)
                    return true
            }
        }
    }

    // find the closest energy source that matches the requested amount
    // if no source is big enough, return a smaller one
    // tries to find the best as well as closest match
    findBestEnergySource(creep: Creep): EnergySource | undefined {
        const energyDrops: Resource<RESOURCE_ENERGY>[] = creep.room.find(FIND_DROPPED_RESOURCES,
            { filter: r => r.resourceType === RESOURCE_ENERGY })
        const storageStructures: Structure[] = creep.room.find(FIND_STRUCTURES,
            { filter: s => {
                    return (s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_STORAGE)
                    && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0
                }})
        let energySources = (energyDrops as EnergySource[]).concat(storageStructures as EnergySource[])
        // @ts-ignore


        // if there are multiple energy sources, check if we can find one that is big enough
        // otherwise, go on with all sources
        const getAmount = (src: EnergySource) => (src.structureType)? src.store.getUsedCapacity(RESOURCE_ENERGY): src.amount
        energySources = energySources.sort((a, b) => getAmount(a) - getAmount(b))
        if (energySources.length > 1) {
            let requiredSize = creep.store.getFreeCapacity()
            if (getAmount(energySources[0]) < requiredSize) {
                let largestEnergySources = energySources.filter(src => getAmount(src) >= requiredSize)
                if (largestEnergySources.length > 0) {
                    energySources = largestEnergySources
                }
            }
        }

        // return the closest source
        energySources = energySources.sort((a, b) => a.pos.getRangeTo(creep.pos) - b.pos.getRangeTo(creep.pos))
        if (energySources.length > 0)
            return energySources[0]
        return undefined
    }

}