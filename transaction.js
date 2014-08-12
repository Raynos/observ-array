var ObservArray = require("./index.js")
var addListener = require("./add-listener.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js")

module.exports = transaction

function transaction (func) {
    var obs = this
    var array = ObservArray(obs().slice())

    var changes = []
    var objectChanges = []

    array(function(value){
        if (value._diff) {
            Array.prototype.push.apply(changes, value._diff)
            value._diff.forEach(function (valueArgs) {
                objectChanges.push(getObjectArgs(array, valueArgs))
            })  
        }
    })

    if (func(array) !== false && changes.length){ // allow cancel
        var valueList = obs().slice()

        changes.forEach(applyValueChanges.bind(valueList))
        objectChanges.forEach(applyObjectChanges.bind(obs))

        setNonEnumerable(valueList, "_diff", changes)

        obs.set(valueList)
        return changes
    }

}

function getObjectArgs (array, valueArgs){
    return valueArgs.map(function (value, i) {
        if (i < 2){
            return value
        }
        return array.get(i+valueArgs[0]-2)
    })
}

function applyValueChanges (valueArgs) {
    var valueList = this
    if (valueArgs[0] > valueList.length){ 
        valueArgs.slice(2).forEach(function(value, i){
            var index = valueArgs[0]+i
            valueList[index] = value
        })
    } else {
        Array.prototype.splice.apply(valueList, valueArgs)
    }
}

function applyObjectChanges (args) {
    var obs = this
    if (args[0] > obs._list.length){

        args.slice(2).forEach(function(value, i){
            var index = args[0]+i
            var listener = typeof value === "function" ?
                addListener(obs, value) :
                null

            if (obs._removeListeners[index]){
                obs._removeListeners[index]()
            }

            obs._removeListeners[index] = listener
            obs._list[index] = value
        })

    } else {

        obs._list.splice.apply(obs._list, args)
        var extraRemoveListeners = args.slice(2).map(function (observ) {
            return typeof observ === "function" ?
                addListener(obs, observ) :
                null
        })
        extraRemoveListeners.unshift(args[0], args[1])
        var removedListeners = obs._removeListeners.splice
            .apply(obs._removeListeners, extraRemoveListeners)

        removedListeners.forEach(function (removeObservListener) {
            if (removeObservListener) {
                removeObservListener()
            }
        })

    }
}