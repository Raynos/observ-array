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

    ])

    assert.end()
})

test("works with nested arrays")

test("can call array methods on value inside")

test("can call array methods on ObservArray")
