// Import all dependencies, mostly using destructuring for better view.
import {
  Message,
  QuickReplyItem,
  TemplateImageColumn,
  TextMessage,
} from '@line/bot-sdk';
import { constant } from './constant';
import { IAnswer, IGoal, IGoalDetailImageType, IGroup, IInitQuickReply, INextGroup, IQuestion, ISetting } from './types';

export const getQuestionQuickReply = (question: IQuestion, survey_id: string, title: string, setting: ISetting) => {
  let buttons: QuickReplyItem[] = []
  let init_quick_reply: IInitQuickReply = setting.init_quick_reply ?? {
    start_survey: "Start survey",
    is_start_survey: true,
    restart_survey: "Restart survey",
    is_restart_survey: true
  }

  if (init_quick_reply.is_restart_survey) {
    buttons.push(getDefaultStartButton(question.app_id ?? "", question.group_id ?? "", survey_id, init_quick_reply.restart_survey))
  }

  question.answers?.forEach(answer => {
    buttons.push(getAnswerPostbackButton(question, answer))
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

export const getAnswerPostbackButton = (question: IQuestion, answer: IAnswer) => {
  const item: QuickReplyItem = {
    'type': 'action',
    "imageUrl": answer.image_url,
    'action': {
      'type': 'postback',
      'label': answer.title ?? '',
      'data': `app_id=${question.app_id}
              &group_id=${question.group_id}
              &question_id=${question._id}
              &next_question_id=${answer.next_question_id}
              &answer_id=${answer._id}
              &answer_label=${answer.label}
              &event_type=${constant.event_type.answer}`,
      'text': answer.title ?? '',
    },
  }
  return item
}

export const getGroupQuickReply = (app_id: string, nextGroup: INextGroup, setting: ISetting) => {
  let buttons: QuickReplyItem[] = []
  let init_quick_reply: IInitQuickReply = setting.init_quick_reply ?? {
    start_survey: "Start survey",
    is_start_survey: true,
    restart_survey: "Restart survey",
    is_restart_survey: true
  }
  // if (init_quick_reply.is_start_survey) {
  //   buttons.push(getDefaultStartButton(app_id, "", init_quick_reply.start_survey))
  // }

  // if (init_quick_reply.is_restart_survey) {
  //   buttons.push(getDefaultStartButton(app_id, "", init_quick_reply.restart_survey))
  // }

  nextGroup.groups?.forEach(group => {
    buttons.push(getGroupPostbackButton(group))
  });
  const response: Message = {
    "type": "text", // ①
    "text": nextGroup.title ?? '',
    "quickReply": { // ②
      "items": buttons,
    }
  }

  return response
}

export const getGroupPostbackButton = (group: IGroup) => {
  const item: QuickReplyItem = {
    'type': 'action',
    'action': {
      'type': 'postback',
      'label': group.title ?? '',
      'data': `app_id=${group.app_id}&group_id=${group._id}&event_type=${constant.event_type.start}`,
      'text': group.title ?? '',
    },
  }
  return item
}

export const getDefaultStartButton = (app_id: string, group_id: string, survey_id: string, title: string) => {
  const item: QuickReplyItem = {
    'type': 'action',
    // "imageUrl": "https://example.com/sushi.png",
    'action': {
      'type': 'postback',
      'label': title,
      'data': `app_id=${app_id}
              &group_id=${group_id}
              &survey_id=${survey_id}
              &event_type=${constant.event_type.start}`,
      'text': title,
    },
  }

  return item
}

export const startQuickReply = (app_id: string, group_id: string, survey_id: string, title: string, setting: ISetting) => {
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
              'data': `app_id=${app_id}
                      &group_id=${group_id}
                      &survey_id=${survey_id}
                      &event_type=${constant.event_type.start}`,
              'text': init_quick_reply.start_survey,
            },
          }
        ],
      }
    }
  }

  return message
}

export const getTemplateImageColumn = (image: IGoalDetailImageType) => {
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

export const getImageCarousel = (goal: IGoal, images: IGoalDetailImageType[]) => {
  const columns: TemplateImageColumn[] = []
  images?.forEach(element => {
    const column = getTemplateImageColumn(element)
    columns.push(column)
  });

  const message: Message = {
    "type": "template",
    "altText": goal.title ?? '',
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



