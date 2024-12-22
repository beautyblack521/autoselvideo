class WebSocketService {
  constructor() {
    this.ws = null
    this.messageQueue = []
    this.connected = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.messageId = 0
    this.pendingMessages = new Map()
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket...')
        const wsUrl = process.env.NODE_ENV === 'production' 
          ? import.meta.env.VITE_WS_URL_PROD
          : import.meta.env.VITE_WS_URL
        console.log('WebSocket URL:', wsUrl)
        
        this.ws = new WebSocket(wsUrl)

        // 设置连接超时
        const connectionTimeout = setTimeout(() => {
          if (!this.connected) {
            console.error('WebSocket connection timeout')
            this.ws?.close()
            reject(new Error('Connection timeout'))
          }
        }, 10000)

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully')
          clearTimeout(connectionTimeout)
          this.connected = true
          this.reconnectAttempts = 0
          this.processPendingMessages()
          resolve()
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason)
          this.connected = false
          clearTimeout(connectionTimeout)
          this.handleReconnect()
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          this.connected = false
          clearTimeout(connectionTimeout)
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data)
            console.log('WebSocket message received:', response)
            
            if (response.id && this.pendingMessages.has(response.id)) {
              const { resolve, reject } = this.pendingMessages.get(response.id)
              this.pendingMessages.delete(response.id)
              
              if (response.error) {
                reject(new Error(response.error))
              } else {
                resolve(response)
              }
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error)
          }
        }
      } catch (error) {
        console.error('WebSocket connection error:', error)
        reject(error)
      }
    })
  }

  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    try {
      await this.connect()
    } catch (error) {
      console.error('Reconnection failed:', error)
      setTimeout(() => this.handleReconnect(), this.reconnectInterval)
    }
  }

  send(type, data = {}) {
    return new Promise((resolve, reject) => {
      const message = {
        id: ++this.messageId,
        type,
        data
      }

      console.log('Sending WebSocket message:', message)

      const messageHandler = { resolve, reject }
      this.pendingMessages.set(message.id, messageHandler)

      if (this.connected && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message))
      } else {
        console.log('WebSocket not connected, queueing message')
        this.messageQueue.push(message)
        if (!this.connected) {
          this.connect().catch(error => {
            reject(error)
          })
        }
      }

      // 设置超时处理
      setTimeout(() => {
        if (this.pendingMessages.has(message.id)) {
          this.pendingMessages.delete(message.id)
          reject(new Error('WebSocket request timeout'))
        }
      }, 30000)
    })
  }

  processPendingMessages() {
    console.log(`Processing ${this.messageQueue.length} pending messages`)
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      this.ws.send(JSON.stringify(message))
    }
  }

  close() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

export const wsService = new WebSocketService() 