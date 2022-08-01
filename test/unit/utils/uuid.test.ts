import {uuid} from "../../..//src/utils/uuid";

it("should return a string of length 36", () => {
    const id = uuid()
    expect(id.length).toBe(36)
})

it("should not return the same id twice", () => {
    const id = uuid()
    const id2 = uuid()
    expect(id).not.toEqual(id2)
})
