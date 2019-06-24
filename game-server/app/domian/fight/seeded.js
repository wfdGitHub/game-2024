var seeded = function(seededNum) {
    this.seededNum = seededNum
    this.random = function() {
        this.seededNum = (this.seededNum * 9301 + 49297) % 233280
        var rnd = this.seededNum / 233280
        // console.log("seeded : ",rnd)
        return rnd
    }
}
module.exports = seeded