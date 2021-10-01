// Import all dependencies, mostly using destructuring for better view.
import {
  Message,
  QuickReplyItem,
  TemplateImageColumn,
  TextMessage,
} from '@line/bot-sdk';
import { constant } from './constant';
import { IAnswer, IInitQuickReply, IQuestion, IInitialCampaign, DetailImageType, IGoal } from './types';

export const getResourceQuickReply = (resource: IQuestion | IGoal, survey_id: string, title: string, resource_type: string, setting: IInitialCampaign) => {
  let buttons: QuickReplyItem[] = []
  let init_quick_reply: IInitQuickReply = setting.init_quick_reply ?? {
    start_survey: "Start survey",
    is_start_survey: true,
    restart_survey: "Restart survey",
    is_restart_survey: true
  }

  if (init_quick_reply.is_restart_survey) {
    buttons.push(getDefaultStartButton(resource.app_id ?? "", survey_id, init_quick_reply.restart_survey, setting._id ?? ""))
  }

  resource.answers?.forEach(answer => {
    buttons.push(getAnswerPostbackButton(survey_id, resource, answer, setting._id ?? "", resource_type))
  });
  const response: Message = {
    "type": "text", // ①
    "text": title,
    "quickReply": { // ②
      "items": buttons,
    }
  }

  return response
}

export const getAnswerPostbackButton = (survey_id: string, resource: IQuestion | IGoal, answer: IAnswer, campaign_id: string, resource_type: string) => {
  const item: QuickReplyItem = {
    'type': 'action',
    "imageUrl": answer.image_url,
    'action': {
      'type': 'postback',
      'label': answer.title ?? '',
      'data': `app_id=${resource.app_id}&campaign_id=${campaign_id}&resource_id=${resource._id}&answer_id=${answer._id}&answer_label=${answer.label}&survey_id=${survey_id}&event_type=${constant.event_type.answer}&resource_type=${resource_type}`,
      'text': answer.title ?? '',
    },
  }
  return item
}

export const getDefaultStartButton = (app_id: string, survey_id: string, title: string, campaign_id: string) => {
  const item: QuickReplyItem = {
    'type': 'action',
    // "imageUrl": "https://example.com/sushi.png",
    'action': {
      'type': 'postback',
      'label': title,
      'data': `app_id=${app_id}&survey_id=${survey_id}&campaign_id=${campaign_id}&event_type=${constant.event_type.start}`,
      'text': title,
    },
  }

  return item
}

export const startQuickReply = (app_id: string, survey_id: string, title: string, setting: IInitialCampaign) => {
  let message: Message
  const init_quick_reply: IInitQuickReply = setting.init_quick_reply ?? {
    start_survey: "Start survey",
    is_start_survey: true,
    restart_survey: "Restart survey",
    is_restart_survey: true
  }

  if (!init_quick_reply.is_start_survey) {
    message = getTextMessage(title)
  } else {

    message = {
      "type": "text", // ①
      "text": title,
      "quickReply": { // ②
        "items": [
          {
            'type': 'action',
            'action': {
              'type': 'postback',
              'label': init_quick_reply.start_survey,
              'data': `app_id=${app_id}&survey_id=${survey_id}&campaign_id=${setting._id}&event_type=${constant.event_type.start}`,
              'text': init_quick_reply.start_survey,
            },
          }
        ],
      }
    }
  }

  return message
}

export const getTemplateImageColumn = (image: DetailImageType) => {
  let column: TemplateImageColumn

  if (image.click_url) {
    column = {
      "imageUrl": image.image_url ?? "",
      "action": {
        "type": "uri",
        "uri": image.click_url ?? ""
      }
    }
  }
  else {
    column = {
      "imageUrl": image.image_url ?? "",
      "action": {
        "type": "message",
        "text": " "
      }
    }
  }

  return column
}

export const getImageCarousel = (title: string, images: DetailImageType[]) => {
  const columns: TemplateImageColumn[] = []
  images?.forEach(element => {
    const column = getTemplateImageColumn(element)
    columns.push(column)
  });

  const message: Message = {
    "type": "template",
    "altText": title ?? '',
    "template": {
      "type": "image_carousel",
      "columns": columns
    }
  }

  return message
}

export const getTextMessage = (title: string) => {
  // Final question
  const message: TextMessage = {
    type: 'text',
    text: title
  };

  return message
}



