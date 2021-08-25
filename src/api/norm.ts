import axios from 'axios'
export const baseUrl = `${process.env.APP_API_ENDPOINT}`

interface IRequestHeader {
  [key: string]: string
}

const headers: IRequestHeader = {
  'Access-Control-Allow-Origin': '*',
}
const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
  withCredentials: false,
  headers,
})

axiosInstance.interceptors.response.use((response) => {
  return response
}, (error) => {
  switch (error.response?.status) {
    case 400:
    case 404:
      throw new Error('400')
    case 401:
      throw new Error('401')

    case 403:
      throw new Error('403')

    case 500:
      throw new Error('500')

    default:
      return Promise.reject(error)
  }
})

export class NormApi<T> {
  axios = axiosInstance

  // eslint-disable-next-line
  responseHandler(response: any) {
    return response?.data?.data || response?.data || response
  }
}
