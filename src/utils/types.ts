export interface IInitialRequest {
  app_id: string
}

export interface IEndPoint {
  next_question: IQuestion
  next_message: IMessage
  next_goal: IGoal
}
export interface IResourcePayload {
  app_id?: string
  user_id?: string
  survey_id?: string
  campaign_type?: string
  campaign_id?: string
  resource_type?: string
  resource_id?: string
  answer_id?: string
  answer_label?: string
}

export interface IUserPayload {
  app_id?: string
  user_id?: string
  display_name?: string
  is_active: boolean
}


// Question
export interface IQuestion {
  _id?: string
  app_id?: string
  title?: string
  messages?: IMessageDetail[]
  answers?: IAnswer[]
  user_id?: string
  created_at?: string
  updated_at?: string
  applied_campain?: number
}

export interface IAnswer {
  _id?: string
  label?: string
  title?: string
  image_url: string
}


// Messages
export interface IMessage {
  _id?: string
  title?: string
  app_id?: string
  messages?: IMessageDetail[]
  applied_campain?: number

}

export interface IMessageDetail {
  type?: string
  message?: string // If type is 'message'
  images?: DetailImageType[] // If type is image
}

export interface DetailImageType {
  image_url?: string
  click_url?: string
}

// Goal
export interface IGoal {
  _id?: string
  app_id?: string
  title?: string
  details?: IGoalDetail[]
  answers?: IAnswer[]
  applied_campain?: number
}


export interface IGoalDetail {
  type?: string
  message?: string // If type is 'message'
  images?: DetailImageType[] // If type is image
}

// Initial
export interface IInitialCampaign {
  _id?: string
  app_id?: string
  welcomes?: Iwelcomes[]
  init_quick_reply?: IInitQuickReply
  title?: string
  delivered?: number
  is_active?: boolean
  // scenarios?: IScenario[]
}


export interface Iwelcomes {
  name?: string
  order?: number
  fixed?: boolean
}

export interface IInitQuickReply {
  start_survey: string
  is_start_survey: boolean
  restart_survey: string
  is_restart_survey: boolean
}