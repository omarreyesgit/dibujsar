const $ = (selector) => document.querySelector(selector)
      const $$ = (selector) => document.querySelectorAll(selector)
      //elements
      const $canvas = $('#canvas')
      const $colorPicker = $('#color-picker')
      const context = canvas.getContext('2d')

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

      //events
      $canvas.addEventListener('mousedown', startDrawing)
      $canvas.addEventListener('mousemove', draw)
      $canvas.addEventListener('mouseup', stopDrawing)
      $canvas.addEventListener('mouseleave', stopDrawing)
      $colorPicker.addEventListener('change', handleChangeColor)

      //functions
      function startDrawing(event) {
        isDrawing = true
        const { offsetX, offsetY } = event
        ;[startX, startY] = [offsetX, offsetY]
        ;[lastX, lastY] = [offsetX, offsetY]
      }
      function draw(e) {
        if (!isDrawing) return
        const { offsetX, offsetY } = e
        //comenzar un trazado
        console.log(e)
        //inicializar el trazado
        context.beginPath()
        //mover el trazado a la posición del mouse
        context.moveTo(lastX, lastY)
        //dibujar una linea entre coordenadas actuales y las nuevas
        context.lineTo(offsetX, offsetY)
        //dibujar el trazado
        context.stroke()
        //actualizar las coordenadas actuales
        ;[lastX, lastY] = [offsetX, offsetY]
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