
export interface IApp {
  _id: string;

}

export interface IAppAnswer {
  _id?: string
  title?: string
  next_question_id: string
}

export interface IAppMessage {
  _id?: string
  data?: string
}


export interface IAppGoalItem {
  type?: string
  data?: string
}


export interface IAppQuestion {
  _id?: string
  title?: string
  answers?: IAppAnswer[]
  messages?: IAppMessage[]
  app_id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface IAppGoal {
  _id?: string
  app_id?: string
  user_id?: string
  data: IAppGoalItem[]
  created_at?: string
  updated_at?: string
}

export interface IAppGroup {
  _id?: string
  title?: string
  app_id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}
export interface IAppEndPoint {
  next_question: IAppQuestion
  next_groups: IAppGroup
  goals: IAppGoal
}

export interface IQuestionPayload {
  app_id: string
  question_id: string
  group_id: string
  answer_id: string
}