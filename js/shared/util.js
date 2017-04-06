function randfloat(min, max) {
  return Math.random() * (max - min) + min
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function xdeg(deg) { return Math.cos(deg*Math.PI/180) }
function ydeg(deg) { return Math.sin(deg*Math.PI/180) }

String.prototype.hashCode = function() {
  var hash = 0, i, chr
  if (this.length === 0) return hash
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i)
    hash  = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash
}

Array.prototype.shuffle = function () {
  this.forEach(
    function (v, i, a) {
      let j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  );
  return this;
}