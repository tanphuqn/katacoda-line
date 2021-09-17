import { IInitialRequest, IQuestionPayload, IUserPayload } from '../utils/types'
import { NormApi } from './norm'

export class AppChatBotApi extends NormApi<{}> {
  getAppSetting = async (payload: IInitialRequest) => {
    const response = await this.axios.post('/v1/line/setting', payload)
    return this.responseHandler(response)
  }

  saveUser = async (payload: IUserPayload) => {
    const response = await this.axios.post('/v1/line/save-user', payload)
    return this.responseHandler(response)
  }

  getQuestion = async (payload: IQuestionPayload) => {
    const response = await this.axios.post('/v1/line/question', payload)
    return this.responseHandler(response)
  }

}

const chatBotApi = new AppChatBotApi()
export default chatBotApi
