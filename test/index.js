var test = require("tape")
var Observ = require("observ")

var ObservArray = require("../index")

test("ObservArray is a function", function (assert) {
    assert.equal(typeof ObservArray, "function")
    assert.end()
})

test("ObservArray contains correct initial value", function (assert) {
    var arr = ObservArray([
        Observ("foo"),
        Observ("bar"),
        Observ("baz"),
        "foobar"
    ])
    var initial = arr()

    assert.equal(typeof arr.filter, "function")
    assert.equal(typeof arr.splice, "function")
    assert.equal(initial.length, 4)
    assert.deepEqual(initial, ["foo", "bar", "baz", "foobar"])

    assert.equal(arr[0], undefined)
    assert.equal(arr[1], undefined)
    assert.notEqual(arr.length, 4)

    assert.end()
})

test("ObservArray emits change", function (assert) {
    var arr = ObservArray([
        Observ("foo"),
        Observ("bar")
    ])
    var initArr = arr()
    var changes = []

    arr(function (state) {
        changes.push(state)
    })

    arr.get(0).set("foo2")
    arr.get(1).set("bar2")

    assert.equal(changes.length, 2)
    assert.deepEqual(initArr, ["foo", "bar"])
    assert.notEqual(initArr, changes[0])
    assert.notEqual(changes[0], changes[1])
    assert.deepEqual(changes[0], ["foo2", "bar"])
    assert.deepEqual(changes[1], ["foo2", "bar2"])

    assert.end()
})

test("works with nested arrays", function (assert) {
    var arr = ObservArray([
        Observ("foo"),
        ObservArray([
            Observ("bar"),
            Observ("baz")
        ])
    ])
    var initArr = arr()
    var changes = []
    var innerChanges = []

    arr(function (state) {
        changes.push(state)
    })

    arr.get(1)(function (state) {
        innerChanges.push(state)
    })

    arr.get(1).get(0).set("bar2")
    arr.get(0).set("foo2")
    arr.get(1).get(1).set("baz2")

    assert.equal(changes.length, 3)
    assert.equal(innerChanges.length, 2)

    assert.notEqual(changes[0], initArr)
    assert.notEqual(changes[1], changes[0])
    assert.notEqual(changes[2], changes[1])

    assert.notEqual(innerChanges[0], initArr[1])
    assert.notEqual(innerChanges[1], innerChanges[0])

    assert.deepEqual(initArr, [
        "foo",
        ["bar", "baz"]
    ])
    assert.deepEqual(changes[0], [
        "foo",
        ["bar2", "baz"]
    ])
    assert.deepEqual(changes[1], [
        "foo2",
        ["bar2", "baz"]
    ])
    assert.deepEqual(changes[2], [
        "foo2",
        ["bar2", "baz2"]
    ])

    assert.deepEqual(initArr[1], ["bar", "baz"])
    assert.deepEqual(innerChanges[0], ["bar2", "baz"])
    assert.deepEqual(innerChanges[1], ["bar2", "baz2"])

    assert.equal(changes[0][1], changes[1][1],
        "unchanged properties are the same value")

    assert.end()
})

test("can call array methods on value inside")

test("can call array methods on ObservArray")
