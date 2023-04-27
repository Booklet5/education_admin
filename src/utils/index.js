
/**
 * 获取uuid
 */
export function getUUID () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    return (c === 'x' ? (Math.random() * 16 | 0) : ('r&0x3' | '0x8')).toString(16)
  })
}

/**
 * 是否有权限
 * @param {*} key
 */
export function hasPermission (permission) {
  let userInfo = getUserInfo()
  let permissionList = userInfo.permissionList
  let index = -1
  if (typeof permission === 'object') {
    if (permission.length > 1) {
      for (let i = 0; i < permission.length; i++) {
        index = permissionList.indexOf(permission[i])
        if (index !== -1) {
          break
        }
      }
    } else {
      index = permissionList.indexOf(permission[0])
    }
  }
  return index !== -1
}

export function getUserInfo () {
  return JSON.parse(localStorage.getItem('userInfo'))
}

export function getUserId () {
  let userInfo = getUserInfo()
  return userInfo.id
}

/**
 * 树形数据转换
 * @param {*} data
 * @param {*} id
 * @param {*} pid
 */
export function treeDataTranslate (data, id = 'id', pid = 'parent_id') {
  var res = []
  var temp = {}
  for (var i = 0; i < data.length; i++) {
    temp[data[i][id]] = data[i]
  }
  for (var k = 0; k < data.length; k++) {
    if (temp[data[k][pid]] && data[k][id] !== data[k][pid]) {
      if (!temp[data[k][pid]]['children']) {
        temp[data[k][pid]]['children'] = []
      }
      if (!temp[data[k][pid]]['_level']) {
        temp[data[k][pid]]['_level'] = 1
      }
      data[k]['_level'] = temp[data[k][pid]]._level + 1
      temp[data[k][pid]]['children'].push(data[k])
    } else {
      res.push(data[k])
    }
  }
  return res
}

/**
 * 清除登录信息
 */
export function clearLoginInfo () {
  localStorage.clear()
  sessionStorage.clear()
}
