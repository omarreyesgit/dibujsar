const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)
//elements
const $canvas = $('#canvas')
const $colorPicker = $('#color-picker')
const context = canvas.getContext('2d')
const $clearButton = $('#trash-btn')
const $drawBtn = $('#draw-btn')
const $rectangleBtn = $('#rectangle-btn')
const $eraseBtn = $('#erase-btn')
const $lineWidth = $('#line-width')
const $pickerBtn = $('#dropper-btn')
const $saveBtn = $('#save-btn')
const $elipseBtn = $('#elipse-btn')

//constants
const MODES = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  LINE: 'line',
  PICKER: 'picker'
}

//STATES
let isDrawing = false
let startX, startY
let lastX = 0
let lastY = 0
let mode = MODES.DRAW
let canvasSnapShot
let isShiftPressed = false

//events
//$canvas.addEventListener('click', startDrawing)
$canvas.addEventListener('mousedown', startDrawing)
$canvas.addEventListener('mousemove', draw)
$canvas.addEventListener('mouseup', stopDrawing)
$canvas.addEventListener('mouseleave', stopDrawing)
$colorPicker.addEventListener('change', handleChangeColor)
$clearButton.addEventListener('click', clearCanvas)
$eraseBtn.addEventListener('click', eraseCanvas)
$pickerBtn.addEventListener('click', () => {
  setMode(MODES.PICKER)
})
$drawBtn.addEventListener('click', () => {
  setMode(MODES.DRAW)
})
$rectangleBtn.addEventListener('click', () => {
  setMode(MODES.RECTANGLE)
})

$elipseBtn.addEventListener('click', () => {
  setMode(MODES.ELLIPSE)
})

$lineWidth.addEventListener('change', handleChangeLineWidth)

$saveBtn.addEventListener('click', savePicture)

document.addEventListener('keydown', handleKeyDown)
document.addEventListener('keyup', handleKeyUp)

//functions
function startDrawing(event) {
  isDrawing = true
  const { offsetX, offsetY } = event
  ;[startX, startY] = [offsetX, offsetY]
  ;[lastX, lastY] = [offsetX, offsetY]
  canvasSnapShot = context.getImageData(0, 0, canvas.width, canvas.height)
}
function draw(e) {
  if (!isDrawing) return
  const { offsetX, offsetY } = e
  if (mode === MODES.DRAW || mode === MODES.ERASE) {
    //inicializar el trazado
    context.beginPath()
    //mover el trazado a la posición del mouse
    context.moveTo(lastX, lastY)
    //dibujar una linea entre coordenadas actuales y las nuevas
    context.lineTo(offsetX, offsetY)
    //dibujar el trazado
    context.stroke()
    //context.closePath()
    //actualizar las coordenadas actuales
    ;[lastX, lastY] = [offsetX, offsetY]
    return
  }
  if (mode === MODES.RECTANGLE) {
    //recuperamos la imagen del canvas
    context.putImageData(canvasSnapShot, 0, 0)
    //recuperar el ancho y alto del rectangulo
    //startX -> coordenada x donde se hizo click
    let width = offsetX - startX
    let height = offsetY - startY
    if (isShiftPressed) {
      const sideLength = Math.min(Math.abs(width), Math.abs(height))
      width = width > 0 ? sideLength : -sideLength
      height = height > 0 ? sideLength : -sideLength
    }
    context.beginPath()
    context.rect(startX, startY, width, height)
    context.stroke()
    return
  }

  if (mode === MODES.ELLIPSE) {
    context.putImageData(canvasSnapShot, 0, 0)
    const radiusX = (offsetX - startX) / 2
    const radiusY = (offsetY - startY) / 2
    const centerX = startX + radiusX
    const centerY = startY + radiusY
    context.beginPath()
    context.ellipse(
      centerX,
      centerY,
      Math.abs(radiusX),
      Math.abs(radiusY),
      0,
      0,
      2 * Math.PI
    )
    context.stroke()
    context.closePath()
    return
  }
}

function stopDrawing(e) {
  isDrawing = false

  console.log(e)
}

function handleChangeColor(event) {
  //recuperar el color seleccionado
  const { value } = $colorPicker
  context.strokeStyle = value
}

function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height)
}

async function setMode(newMode) {
  let prevMode = mode
  mode = newMode
  $('button.active').classList.remove('active')
  switch (mode) {
    case MODES.DRAW:
      context.globalCompositeOperation = 'source-over'
      $drawBtn.classList.add('active')
      $canvas.style.cursor = 'url(./img/pencil-write.svg) 0 32, auto'
      break

    case MODES.RECTANGLE:
      context.globalCompositeOperation = 'source-over'
      $rectangleBtn.classList.add('active')
      $canvas.style.cursor = 'crosshair'
      break

    case MODES.ERASE:
      $eraseBtn.classList.add('active')
      $canvas.style.cursor = 'url(./img/circle.svg) 16 16, auto'
      context.globalCompositeOperation = 'destination-out'
      break

    case MODES.PICKER:
      $pickerBtn.classList.add('active')
      const eyeDropper = new EyeDropper()
      try {
        const { sRGBHex } = await eyeDropper.open()
        context.strokeStyle = sRGBHex
        $colorPicker.value = sRGBHex
        console.log('🚀 ~ setMode ~ color:', sRGBHex)
        setMode(prevMode)
      } catch (error) {}
      break

    case MODES.ELLIPSE:
      $elipseBtn.classList.add('active')
      $canvas.style.cursor = 'crosshair'
      break
    default:
      break
  }
}

//erase
function eraseCanvas() {
  setMode(MODES.ERASE)
}

function handleChangeLineWidth(event) {
  const { value } = $lineWidth
  context.lineWidth = value
  context.lineCap = 'round'
  context.lineJoin = 'round'
}

//motrar pickerBtn si el navegador soporta la funcionalidad
if (window.EyeDropper) {
  $pickerBtn.style.display = 'block'
}

function handleKeyUp({ key }) {
  if (key === 'Shift') {
    isShiftPressed = false
  }
}

function handleKeyDown({ key }) {
  isShiftPressed = key === 'Shift'
}

function savePicture(event) {
  import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm').then(
    ({ default: html2canvas }) => {
      html2canvas($canvas).then((canvas) => {
        context.drawImage(canvas, 0, 0)
        const imgURL = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.href = imgURL
        downloadLink.download = 'dibujo.png'
        downloadLink.click()
      })
    }
  )
}

//-----------------
canvas.addEventListener('touchstart', handleStart)
$canvas.addEventListener('touchmove', handleMove)
$canvas.addEventListener('touchend', handleEnd)

// Funciones para manejar eventos touch
function handleStart(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  isDrawing = true
  ;[startX, startY] = [x, y]
  ;[lastX, lastY] = [x, y]
  canvasSnapShot = context.getImageData(0, 0, canvas.width, canvas.height)
}

function handleMove(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top

  draw({ offsetX: x, offsetY: y })
}

function handleEnd(e) {
  e.preventDefault()
  isDrawing = false
}
//-----------------

setMode(MODES.DRAW)
