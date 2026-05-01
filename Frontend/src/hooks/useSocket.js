import { useEffect, useCallback, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { showSuccess, showError, showInfo } from '../store/notificationStore'

let socket = null

/**
 * useSocket Hook
 * Manages WebSocket connections and real-time updates
 */
export const useSocket = (autoConnect = true) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const callbacksRef = useRef({})

  /**
   * Initialize socket connection
   */
  const connect = useCallback(() => {
    if (socket?.connected) {
      return
    }

    setIsConnecting(true)
    const socketURL =
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
    const token = localStorage.getItem('token')

    socket = io(socketURL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      auth: {
        token,
      },
      query: {
        token,
      },
    })

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
      setIsConnecting(false)
      showSuccess('Connected to server')
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnecting(false)
      showError('Connection error: ' + error.message)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      setIsConnected(false)
    })

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error)
      showError('Server error: ' + error)
    })

    return socket
  }, [])

  /**
   * Disconnect socket
   */
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      socket = null
      setIsConnected(false)
    }
  }, [])

  /**
   * Emit event to server
   */
  const emit = useCallback((event, data) => {
    if (!socket?.connected) {
      console.warn('Socket not connected. Event:', event)
      return
    }

    socket.emit(event, data, (response) => {
      if (response?.success === false) {
        showError(response.message || 'Server error')
      }
    })
  }, [])

  /**
   * Listen to event from server
   */
  const on = useCallback((event, callback) => {
    if (!socket) {
      console.warn('Socket not initialized')
      return
    }

    if (!callbacksRef.current[event]) {
      callbacksRef.current[event] = []
    }

    callbacksRef.current[event].push(callback)
    socket.on(event, callback)

    // Return unsubscribe function
    return () => {
      socket.off(event, callback)
      callbacksRef.current[event] = callbacksRef.current[event].filter(
        cb => cb !== callback
      )
    }
  }, [])

  /**
   * Listen to event once
   */
  const once = useCallback((event, callback) => {
    if (!socket) {
      console.warn('Socket not initialized')
      return
    }

    socket.once(event, callback)
  }, [])

  /**
   * Join a room
   */
  const joinRoom = useCallback((roomName) => {
    emit('join_room', { room: roomName })
  }, [emit])

  /**
   * Leave a room
   */
  const leaveRoom = useCallback((roomName) => {
    emit('leave_room', { room: roomName })
  }, [emit])

  /**
   * Broadcast to room
   */
  const broadcastToRoom = useCallback((roomName, event, data) => {
    emit('broadcast_to_room', { room: roomName, event, data })
  }, [emit])

  /**
   * Send direct message to user
   */
  const sendDirectMessage = useCallback((userId, message) => {
    emit('direct_message', { to: userId, message })
  }, [emit])

  /**
   * Subscribe to real-time updates
   */
  const subscribeToUpdates = useCallback(
    (type, id, callback) => {
      const eventName = `${type}:${id}:update`
      return on(eventName, callback)
    },
    [on]
  )

  /**
   * Unsubscribe from all events
   */
  const unsubscribeAll = useCallback(() => {
    if (socket) {
      socket.removeAllListeners()
    }
    callbacksRef.current = {}
  }, [])

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect && !socket?.connected) {
      connect()
    }

    return () => {
      // Cleanup
    }
  }, [autoConnect, connect])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return {
    // State
    socket,
    isConnected,
    isConnecting,

    // Methods
    connect,
    disconnect,
    emit,
    on,
    once,
    joinRoom,
    leaveRoom,
    broadcastToRoom,
    sendDirectMessage,
    subscribeToUpdates,
    unsubscribeAll,
  }
}

/**
 * useSocketListener Hook
 * Simple hook to listen to socket events
 */
export const useSocketListener = (event, callback, enabled = true) => {
  const { on } = useSocket()

  useEffect(() => {
    if (enabled && callback) {
      return on(event, callback)
    }
  }, [event, callback, enabled, on])
}

/**
 * useSocketRoom Hook
 * Auto-join and leave room on mount/unmount
 */
export const useSocketRoom = (roomName) => {
  const { joinRoom, leaveRoom, on } = useSocket()

  useEffect(() => {
    if (roomName) {
      joinRoom(roomName)

      return () => {
        leaveRoom(roomName)
      }
    }
  }, [roomName, joinRoom, leaveRoom])

  return { on }
}