function randfloat(min, max) {
  return Math.random() * (max - min) + min
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function xdeg(deg) { return Math.cos(deg*Math.PI/180) }
function ydeg(deg) { return Math.sin(deg*Math.PI/180) }

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0
    return this.indexOf(searchString, position) === position
  }
}

function checkimgurl(url) {
  return (url.match(/https?:\/\/.+\.(jpeg|jpg|gif|png|bmp|JPEG|JPG|GIF|PNG|BMP)$/) != null)
}

function isJSON(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function randcolor() {
  function c() {
    var hex = Math.floor(Math.random()*256).toString(16);
    return ("0"+String(hex)).substr(-2); // pad with zero
  }
  return "#"+c()+c()+c();
}

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