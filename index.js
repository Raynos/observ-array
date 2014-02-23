var Observ = require("observ")

var slice = Array.prototype.slice

module.exports = ObservArray

/*  ObservArray := (Array<T>) => Observ<
        Array<T> & { _diff: Array }
    > & {
        splice: (index: Number, amount: Number, rest...: T) =>
            Array<T>,
        push: (values...: T) => Number,
        filter: (lambda: Function, thisValue: Any) => Array<T>,
        indexOf: (item: T, fromIndex: Number) => Number
    }

    Fix to make it more like ObservHash.

    I.e. you write observables into it. 
        reading methods take plain JS objects to read
        and the value of the array is always an array of plain
        objsect.

        The observ array instance itself would have indexed 
        properties that are the observables
*/
function ObservArray(initialList) {
    // list is the internal mutable list observ instances that
    // all methods on `obs` dispatch to.
    var list = initialList
    var initialState = []

    // copy state out of initialList into initialState
    list.forEach(function (observ, index) {
        initialState[index] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    obs.splice = splice

    obs.get = get
    obs.getLength = getLength

    // you better not mutate this list directly
    obs.list = list

    list.forEach(function (observ) {
        if (typeof observ === "function") {
            observ(function (value) {
                var valueList =  obs().slice()
                var index = list.indexOf(observ)

                // This code path should never hit. If this happens
                // there's a bug in the cleanup code
                if (index === -1) {
                    var message = "observ-array: Unremoved observ listener"
                    var err = new Error(message)
                    err.list = list
                    err.index = index
                    err.observ = observ
                    throw err
                }

                valueList.splice(index, 1, value)
                obs.set(valueList)
            })
        }
    })

    return ArrayMethods(obs, list)

    // `obs.splice` is a mutable implementation of `splice()`
    // that mutates both `list` and the internal `valueList` that
    // is the current value of `obs` itself
    function splice(index, amount) {
        var args = slice.call(arguments, 0)
        var valueList = obs().slice()

        // generate a list of args to mutate the internal
        // list of only values
        var valueArgs = args.map(function (value, index) {
            if (index === 0 || index === 1) {
                return value
            }

            // must unpack observables that we are adding
            return typeof value === "function" ? value() : value
        })

        valueList.splice.apply(valueList, valueArgs)
        // we remove the observs that we remove
        var removed = list.splice.apply(list, args)

        valueList._diff = valueArgs

        obs.set(valueList)
        return removed
    }

    function get(index) {
        return list[index]
    }

    function getLength() {
        return list.length
    }
}

function ArrayMethods(obs, list) {
    obs.push = function () {
        var args = slice.call(arguments)
        args.unshift(list.length, 0)
        obs.splice.apply(null, args)

        return list.length
    }
    obs.pop = function () {
        return obs.splice(list.length - 1, 1)[0]
    }
    obs.shift = function () {
        return obs.splice(0, 1)[0]
    }
    obs.unshift = function () {
        var args = slice.call(arguments)
        args.unshift(0, 0)
        obs.splice.apply(null, args)

        return list.length
    }
    obs.reverse = function () {
        throw new Error("Pull request welcome")
    }
    obs.sort = function () {
        throw new Error("Pull request welcome")
    }

    obs.concat = method(obs, list, "concat")
    obs.slice = method(obs, list, "slice")
    obs.every = method(obs, list, "every")
    obs.filter = method(obs, list, "filter")
    obs.forEach = method(obs, list, "forEach")
    obs.indexOf = method(obs, list, "indexOf")
    obs.join = method(obs, list, "join")
    obs.lastIndexOf = method(obs, list, "lastIndexOf")
    obs.map = method(obs, list, "map")
    obs.reduce = method(obs, list, "reduce")
    obs.reduceRight = method(obs, list, "reduceRight")
    obs.some = method(obs, list, "some")
    obs.toString = method(obs, list, "toString")
    obs.toLocaleString = method(obs, list, "toLocaleString")

    return obs
}

function method(obs, list, name) {
    return function () {
        return list[name].apply(list, arguments)
    }
}
