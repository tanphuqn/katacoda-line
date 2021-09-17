
export interface IEndPoint {
  next_question: IQuestion
  goal: IGoal
}

export interface IQuestionPayload {
  app_id?: string
  user_id?: string
  next_question_id?: string
  group_id?: string
  question_id?: string
  answer_id?: string
  survey_id?: string
  campaign_id?: string
  answer_label?: string

}
export interface IUserPayload {
  app_id?: string
  user_id?: string
  display_name: string
}

export enum EDeployStatus {
  runnning = 'running',
  completed = 'completed',
}

// Initial
export interface IInitial {
  _id?: string
  app_id?: string
  welcomes?: Iwelcomes[]
  init_quick_reply?: IInitQuickReply
  title?: string
  delivered?: number
  activated?: boolean

}

export interface IInitQuickReply {
  start_survey: string
  is_start_survey: boolean
  restart_survey: string
  is_restart_survey: boolean
}

export interface IInitialRequest {
  app_id: string
}

export interface Iwelcomes {
  name?: string
  order?: number
  fixed?: boolean
}

export interface IApp {
  _id?: string
  name?: string
  token?: string
  secret?: string
  app_prefix?: string
  platform?: string
  deployed_status?: EDeployStatus
  triggered_at?: string
  deployed_at?: string
  logs?: string[]
  created_at?: string
  updated_at?: string
}
export interface IAnswer {
  _id?: string
  title?: string
  label?: string
  image_url: string
  next_question_id: string
}

export interface IMessage {
  _id?: string
  data?: string
}

export interface IQuestion {
  _id?: string
  app_id?: string
  group_id?: string
  title?: string
  messages?: IMessage[]
  answers?: IAnswer[]
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface INextGroup {
  title?: string
  groups: IGroup[]
}


export interface IGroup {
  _id?: string
  title?: string
  ordering?: number
  next_group_ids?: string[]
  app_id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface IGroupListRequest {
  app_id: string
}

export interface IQuestionListRequest {
  app_id: string
  group_id: string
}

// Goal
export interface IGoal {
  _id?: string
  app_id?: string
  title?: string
  details?: IGoalDetail[]
  conditions?: IGoalCondition[]
  group_id?: string
  next_group_ids?: string[]
}

export interface IGoalDetail {
  type?: string
  message?: string // If type is 'message'
  images?: IGoalDetailImageType[] // If type is image
}
export interface IGoalCondition {
  condition?: IGoalConditionDetail[]
}

export interface IGoalConditionDetail {
  question_id?: string
  answer_id?: string
}

export interface IGoalDetailImageType {
  image_url?: string
  click_url?: string
}


