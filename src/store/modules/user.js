export default {
  namespaced: true,
  state: {
    id: 0,
    name: '',
    webSocketConnectState: 0
  },
  mutations: {
    updateId (state, id) {
      state.id = id
    },
    updateName (state, name) {
      state.name = name
    },

    updateWebSocketConnectState (state, webSocketConnectState) {
      state.webSocketConnectState = webSocketConnectState
      sessionStorage.setItem('webSocketConnectState', JSON.stringify(webSocketConnectState))
    }
  },

  getters: {
    getWebSocketConnectState (state) {
      if (state.webSocketConnectState) {
        return state.course
      }
      return JSON.parse(sessionStorage.getItem('webSocketConnectState'))
    }
  }
}
