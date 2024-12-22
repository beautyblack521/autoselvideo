class WebSocketService {
  constructor() {
    this.ws = null
    this.callbacks = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  connect() {
    return new Promise((resolve, reject) => {
      const wsUrl = 'ws://localhost:3001/ws'
      
      console.log('Attempting to connect to WebSocket:', wsUrl)
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully')
        this.reconnectAttempts = 0
        resolve()
      }

      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data)
          console.log('WebSocket received:', response)
          const callback = this.callbacks.get(response.type)
          
          if (callback) {
            callback(response)
            this.callbacks.delete(response.type)
          }
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.handleReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      }
    })
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts})...`)
      setTimeout(() => this.connect(), 3000)
    }
  }

  send(type, payload) {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'))
        return
      }

      this.callbacks.set(type, resolve)
      
      this.ws.send(JSON.stringify({
        type,
        payload
      }))
    })
  }

  close() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export const wsService = new WebSocketService() 