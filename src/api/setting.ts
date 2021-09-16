import { IInitial, IInitialRequest } from '../utils/types'
import { NormApi } from './norm'

export class AppSettingApi extends NormApi<IInitial> {
  single = async (payload: IInitialRequest) => {
    const response = await this.axios.post('/v1/line/setting', payload)
    return this.responseHandler(response)
  }

}

const settingApi = new AppSettingApi()
export default settingApi
