var applyPatch = require("./apply-patch.js")
var setNonEnumerable = require("./lib/set-non-enumerable.js")

module.exports = sort

function sort(compare) {
    var obs = this
    var list = obs._list.slice()
    var unpacked = unpack(list)
    var sorted = getValueList(unpacked).sort(compare)
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
        unpacked.push({
            val: ("function" == typeof list[i]) ? list[i]() : list[i],
            obj: list[i]
        })
    }
    return unpacked
}

function repack(sorted, unpacked) {
  var packed = []
  for(var i = 0; i < sorted.length; i++) {
      var val = sorted[i]
      var fnd = pluck(val, unpacked)
      packed.push(fnd.obj)
  }
  return packed
}

function getValueList(list) {
    var vals = []
    for(var i = 0; i < list.length; i++) {
        vals.push(list[i].val)
    }
    return vals
}

function pluck(needle, haystack) {
    var fnd = false
    for(var i = 0; i < haystack.length; i++) {
        if(needle === haystack[i].val) {
            fnd = haystack[i]
            break
        }
    }
    return fnd
}
