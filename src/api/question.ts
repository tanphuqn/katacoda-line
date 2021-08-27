import console from 'console'
import { IQuestion, IQuestionPayload } from '../utils/types'
import { NormApi } from './norm'

export class AppQuestionApi extends NormApi<IQuestion> {
  single = async (payload: IQuestionPayload) => {
    const response = await this.axios.post('/v1/line/question', payload)
    return this.responseHandler(response)
  }

}

const AppQuestion = new AppQuestionApi()
export default AppQuestion
