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
    var list = initialList
    var initialState = []

    // copy state out of initialList into initialState
    list.forEach(function (observ, index) {
        initialState[index] = typeof observ === "function" ?
            observ() : observ
    })

    var obs = Observ(initialState)
    obs.splice = function (index, amount) {
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

        currentList.splice.apply(currentList, valueArgs)
        // we remove the observs that we remove
        var removed = list.splice.apply(list, args)

        // re-apply the `splice()` algorithm on the `obs` object
        // so that we can access values directly
        for (var i = args[0]; i < args[0] + args[1]; i++) {
            obs[i] = undefined
        }
        for (var i = args[0]; i < args.length - 2; i++) {
            obs[i] = args[i + 2]
        }

        currentList._diff = valueArgs

        obs.set(currentList)
        return removed
    }

    list.forEach(function (index) {
        obs[index] = list[index]
    })

    return ArrayMethods(obs, list)
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
