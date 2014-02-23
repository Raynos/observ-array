var slice = Array.prototype.slice

module.exports = splice

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
