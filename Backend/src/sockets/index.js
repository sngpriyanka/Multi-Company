export const registerSocketServer = (io) => {
  io.on('connection', (socket) => {
    socket.on('join:superadmin', () => {
      socket.join('superadmin')
    })

    socket.on('join:company', (companyId) => {
      if (companyId) {
        socket.join(`company:${companyId}`)
      }
    })
  })
}
