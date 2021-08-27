// Import all dependencies, mostly using destructuring for better view.
import {
  Message,
  PostbackAction,
  Profile,
  QuickReplyItem,
  RichMenu,
  TemplateImageColumn,
  TextMessage,
} from '@line/bot-sdk';
import { constant } from './constant';
import { IAnswer, IGoal, IGoalDetail, IGoalDetailImageType, IGroup, INextGroup, IQuestion } from './types';

export const createMenu = (app_id: string) => {
  const richmenu: RichMenu = {
    "size": {
      "width": 2500,
      "height": 1686
    },
    "selected": false,
    "name": "Nice richmenu",
    "chatBarText": "Tap to open",
    "areas": [
      {
        "bounds": {
          "x": 0,
          "y": 0,
          "width": 2500,
          "height": 1686
        },
        "action": {
          "type": "postback",
          'data': `app_id=${app_id}&event_type=${constant.event_type.welcome}`,
        }
      }
    ]
  };

  return richmenu;
}

export const getQuestionQuickReply = (question: IQuestion, title: string) => {
  let buttons: QuickReplyItem[] = []

  question.answers?.forEach(answer => {
    buttons.push(getAnswerPostbackButton(question, answer))
  });

  buttons.push(getDefaultStartButton(question.app_id ?? "", question.group_id ? ""))
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
      'data': `app_id=${question.app_id}&group_id=${question.group_id}&question_id=${answer.next_question_id}&answer_id=${answer._id}&event_type=${constant.event_type.answer}`,
      'text': answer.title ?? '',
    },
  }
  return item
}

export const getGroupQuickReply = (app_id: string, nextGroup: INextGroup) => {
  let buttons: QuickReplyItem[] = []
  nextGroup.groups?.forEach(group => {
    buttons.push(getGroupPostbackButton(group))
  });

  buttons.push(getDefaultStartButton(app_id, ""))
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
    // "imageUrl": group.image_url,
    'action': {
      'type': 'postback',
      'label': group.title ?? '',
      'data': `app_id=${group.app_id}&group_id=${group._id}&event_type=${constant.event_type.start}`,
      'text': group.title ?? '',
    },
  }
  return item
}

export const getDefaultStartButton = (app_id: string, group_id: string) => {
  const item: QuickReplyItem = {
    'type': 'action',
    // "imageUrl": "https://example.com/sushi.png",
    'action': {
      'type': 'postback',
      'label': '👉診断スタート',
      'data': `app_id=${app_id}&group_id=${group_id}&event_type=${constant.event_type.start}`,
      'text': '👉診断スタート',
    },
  }

  return item
}

export const startQuickReply = (app_id: string, group_id: string, profile: Profile) => {
  const messages: Message[] = []

  messages.push(getTextMessage(`Welcome to my channel`))

  const quickReply: Message = {
    "type": "text", // ①
    "text": "Let's go",
    "quickReply": { // ②
      "items": [
        {
          'type': 'action',
          // "imageUrl": "https://example.com/sushi.png",
          'action': {
            'type': 'postback',
            'label': '👉診断スタート',
            'data': `app_id=${app_id}&group_id=${group_id}&event_type=${constant.event_type.start}`,
            'text': '👉診断スタート',
          },
        }
      ],
    }
  }
  messages.push(quickReply)
  return messages
}

export const getTemplateImageColumn = (image: IGoalDetailImageType) => {
  let column: TemplateImageColumn

  if (image.click_url) {
    column = {
      "imageUrl": image.image_url ?? "",
      "action": {
        "type": "uri",
        "label": "View detail",
        "uri": image.click_url ?? ""
      }
    }
  }
  else {
    column = {
      "imageUrl": image.image_url ?? "",
      "action": {
        "type": "message",
        "label": "Yes",
        "text": "yes"
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



