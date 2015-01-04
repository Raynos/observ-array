var test  = require('tape')
var Observ = require("observ")
var computed = require("observ/computed")
var ObservStruct   = require('observ-struct')
var ObservHash = require("observ-hash")
var ObservVarHash = require("observ-varhash")
var ObservArray = require("../index")

test("ObservArray.sort() should work", function (assert) {
    var arr = ObservArray([
        Observ(3),
        Observ(2),
        Observ(1),
        Observ(0)
    ])

    var changes = []

    arr(function(state) {
        changes.push(state)
    })

    arr.sort()

    assert.equal(changes.length, 1)
    assert.deepEqual(changes[0].slice(), [ 0, 1, 2, 3 ])
    assert.deepEqual(changes[0]._diff, [ [ 0, 4, 0, 1, 2, 3 ] ])

    assert.end()
})

test("ObservArray.sort(cmp_fn) should work", function (assert) {
    var arr = ObservArray([
        Observ(0),
        Observ(1),
        Observ(2),
        Observ(3)
    ])

    var changes = []

    arr(function(state) {
        changes.push(state)
    })

    arr.sort(function(a, b) {
        return a < b
    })

    assert.equal(changes.length, 1)
    assert.deepEqual(changes[0].slice(), [ 3, 2, 1, 0 ])
    assert.deepEqual(changes[0]._diff, [ [ 0, 4, 3, 2, 1, 0 ] ])

    assert.end()
})

test("ObservArray.sort raw values", function (assert) {
    var arr = ObservArray([
        0, 1, 2, 3
    ])

    var changes = []

    arr(function(state) {
        changes.push(state)
    })

    arr.sort(function(a, b) {
        return a < b
    })

    assert.equal(changes.length, 1)
    assert.deepEqual(changes[0].slice(), [ 3, 2, 1, 0 ])
    assert.deepEqual(changes[0]._diff, [ [ 0, 4, 3, 2, 1, 0 ] ])

    assert.end()
})

test("can sort by struct key", function(assert) {
    var arr = ObservArray([
        ObservStruct({ foo: "a" }),
        ObservStruct({ foo: "b" }),
        ObservStruct({ foo: "c" })
    ])

    var changes = []

    arr(function(state) {
        changes.push(state)
    })

    arr.sort(function(a, b) {
        return a.foo < b.foo
    })

    assert.equal(changes.length, 1)

    assert.deepEqual(changes[0].slice(), [
        { foo: "c" },
        { foo: "b" },
        { foo: "a" }
    ])

    assert.deepEqual(changes[0]._diff, [
        [ 0, 3,
        { foo: "c" },
        { foo: "b" },
        { foo: "a" }
        ]
    ])

    assert.end()
})

test("can sort by observ-hash key", function(assert) {
    var arr = ObservArray([
        ObservHash({ foo: "a" }),
        ObservHash({ foo: "b" }),
        ObservHash({ foo: "c" })
    ])

    var changes = []

    arr(function(state) {
        changes.push(state)
    })

    arr.sort(function(a, b) {
        return a.foo < b.foo
    })

    assert.equal(changes.length, 1)

    assert.deepEqual(changes[0].slice(), [
        { foo: "c" },
        { foo: "b" },
        { foo: "a" }
    ])

    assert.deepEqual(changes[0]._diff, [
        [ 0, 3,
        { foo: "c" },
        { foo: "b" },
        { foo: "a" }
        ]
    ])

    assert.end()
})

test("can sort by observ-varhash key", function(assert) {
    var arr = ObservArray([
        ObservVarHash({ foo: "a" }, function(obj, key) {
            return Observ(obj)
        }),
        ObservVarHash({ foo: "b" }, function(obj, key) {
            return Observ(obj)
        }),
        ObservVarHash({ foo: "c" }, function(obj, key) {
            return Observ(obj)
        })
    ])

    var changes = []

    arr(function(state) {
        changes.push(state)
    })

    arr.sort(function(a, b) {
        return a.foo < b.foo
    })

    arr.get(0).put('foo', 'a2')

    assert.equal(changes.length, 2)

    assert.deepEqual(changes[0].slice(), [
        { foo: "c" },
        { foo: "b" },
        { foo: "a" }
    ])

    assert.deepEqual(changes[0]._diff, [
        [ 0, 3,
        { foo: "c" },
        { foo: "b" },
        { foo: "a" }
        ]
    ])

    assert.deepEqual(changes[1].slice(), [

    ])

    assert.deepEqual(changes[1]._diff, [

    ])

    assert.end()
})




