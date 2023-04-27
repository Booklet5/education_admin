import axios from 'axios'
import $http from '@/utils/httpRequest'

/**
 * 年级列表
 * @param dictType
 * @param callBack
 */
export function getPaperInfoList (params) {
  return axios.get($http.httpUrl('/system/testPaperInfo'), {
    params: params
  })
}
