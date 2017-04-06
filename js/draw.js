var currentTime = new Date().getHours()
var canvasbackgroundcolor = (6 <= currentTime&&currentTime < 22) ? "#fff" : "#000"

var customBoard = new DrawingBoard.Board('drawingboard', {
  background: canvasbackgroundcolor,
  color: "#0ff",
  size: 5,
  fillTolerance: 15,
  controls: [
    { Size: { type: "range", min: 1, max: 42 } },
    "Navigation",
    'DrawingMode',
    "Color",
    "Download"
  ],
  webStorage: 'local',
  droppable: false,
  enlargeYourContainer: true
});