test("addition", ()=>{
    expect(2+6).toBe(8)
})

test("nullFunction", ()=>{
    const i = null


    expect.assertions(2)  //assertions means how many expect you are assuming to have or run from one test.
    expect(i).toBe(null)
    expect(i).toBeDefined()
})