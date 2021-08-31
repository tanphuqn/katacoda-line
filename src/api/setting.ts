import { IQuestion, IQuestionPayload, ISetting, ISettingRequest } from '../utils/types'
import { NormApi } from './norm'

export class AppSettingApi extends NormApi<ISetting> {
  single = async (payload: ISettingRequest) => {
    const response = await this.axios.post('/v1/line/setting', payload)
    return this.responseHandler(response)
  }

}

const settingApi = new AppSettingApi()
export default settingApi
