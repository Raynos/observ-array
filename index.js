var Observ = require("observ")

var slice = Array.prototype.slice

var ARRAY_METHODS = [
    "concat", "slice", "every", "filter", "forEach", "indexOf",
    "join", "lastIndexOf", "map", "reduce", "reduceRight",
    "some", "toString", "toLocaleString"
]

var methods = ARRAY_METHODS.map(function (name) {
    return [name, function () {
        var res = this.list[name].apply(this.list, arguments)

        if (res && Array.isArray(res)) {
            res = ObservArray(res)
        }

        return res
    }]
})

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
                valueList._diff = [index, 1, value]

                obs.set(valueList)
            })
        }
    })

    return ArrayMethods(obs, list)
}

// `obs.splice` is a mutable implementation of `splice()`
// that mutates both `list` and the internal `valueList` that
// is the current value of `obs` itself
function splice(index, amount) {
    var args = slice.call(arguments, 0)
    var valueList = this().slice()

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
    var removed = this.list.splice.apply(this.list, args)

    valueList._diff = valueArgs

    this.set(valueList)
    return removed
}

function get(index) {
    return this.list[index]
}

function getLength() {
    return this.list.length
}

function observArrayPush() {
    var args = slice.call(arguments)
    args.unshift(this.list.length, 0)
    this.splice.apply(this, args)

    return this.list.length
}
function observArrayPop() {
    return this.splice(this.list.length - 1, 1)[0]
}
function observArrayShift() {
    return this.splice(0, 1)[0]
}
function observArrayUnshift() {
    var args = slice.call(arguments)
    args.unshift(0, 0)
    this.splice.apply(this, args)

    return this.list.length
}

function ArrayMethods(obs) {
    // TODO: optimize these closures
    obs.push = observArrayPush
    obs.pop = observArrayPop
    obs.shift = observArrayShift
    obs.unshift = observArrayUnshift
    obs.reverse = notImplemented
    obs.sort = notImplemented

    methods.forEach(function (tuple) {
        obs[tuple[0]] = tuple[1]
    })
    return obs
}

function notImplemented() {
    throw new Error("Pull request welcome")
}
