var Observ = require("observ")
var ObservHash = require("observ-hash")
var ObservStruct = require("observ-struct")
var ObservVarHash = require("observ-varhash")
var ObservArray = require("./index.js")

var applyPatch = require("./apply-patch.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js")

module.exports = sort

function sort(compare) {
    var obs = this
    var list = obs._list.slice()
    var unpacked = unpack(list)
    var sorted = valueList(unpacked).sort(compare)
    var packed = repack(sorted, unpacked)

    var changes = [ [ 0, packed.length ].concat(packed) ]

    var valueChanges = changes.map(applyPatch.bind(obs, sorted))

    setNonEnumerable(sorted, "_diff", valueChanges)

    obs._observSet(sorted)
    return changes
}

function unpack(list) {
    var unpacked = []

    for(var i = 0; i < list.length; i++) {
        var it = list[i]
        var type = getObservType(it)
        unpacked.push({
            type: type,
            val: (type) ? it() : it,
            cv: ("function" == typeof it.createValue)
                ? it.createValue : false
        })

    }

    return unpacked
}

function repack(sorted, unpacked) {
  var packed = []
  for(var i = 0; i < sorted.length; i++) {
      var val = sorted[i]
      var fnd = pluck(val, unpacked)
      packed.push(packObj(fnd))
  }
  return packed
}

function valueList(list) {
    var vals = []

    for(var i = 0; i < list.length; i++) {
        vals.push(list[i].val)
    }

    return vals
}

function pluck(needle, haystack) {
    var f = false
    for(var i = 0; i < haystack.length; i++) {
        if(needle === haystack[i].val) {
            f = haystack[i]
            break
        }
    }
    return f
}

function getObservType(obj) {
    return ("function" !== typeof obj)
        ? false : (obj._type)
        ? obj._type : (obj.put)
        ? "observ-varhash"
        : "observ"
}


function packObj(it) {
    if(it.type === 'observ') return Observ(it.val)
    if(it.type === 'observ-struct') return ObservStruct(it.val)
    if(it.type === 'observ-varhash')
        return ObservVarHash(it.val, it.cv)
    if(it.type === 'observ-hash') return ObservHash(it.val)
    if(it.type === 'observ-array') return ObservArray(it.val)
    return it.val
}

