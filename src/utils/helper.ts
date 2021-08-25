// Import all dependencies, mostly using destructuring for better view.
import {
  Message,
  Profile,
  RichMenu,
  TextMessage,
} from '@line/bot-sdk';
import { constant } from './constant';
import { IAppAnswer, IAppQuestion } from './types';

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

export const quickReply = (question: IAppQuestion, title: string) => {
  const response: Message = {
    "type": "text", // ①
    "text": title,
    "quickReply": { // ②
      "items": getAnswerButtons(question),
    }
  }

  return response
}

export const getButton = (question: IAppQuestion, answer: IAppAnswer) => {

  return {
    'type': 'action',
    // "imageUrl": "https://example.com/sushi.png",
    'action': {
      'type': 'postback',
      'label': answer.title ?? '',
      'data': `app_id=${question.app_id}&question_id=${answer.next_question_id}&answer_id=${answer._id}&event_type=${constant.event_type.answer}`,
      'text': answer.title ?? '',
    },
  }
}

export const getAnswerButtons = (question: IAppQuestion) => {

  let answers: any[] = []

  question.answers?.forEach(answer => {
    answers.push(getButton(question, answer))
  });

  return answers
}



export const startQuickReply = (app_id: string, profile: Profile) => {
  const messages: Message[] = []

  // const text1: TextMessage = {
  //   "type": "text", // ①
  //   "text": `Welcome to my channel`,
  // }

  // messages.push(text1)

  const quickReply: Message = {
    "type": "text", // ①
    "text": "",
    "quickReply": { // ②
      "items": [
        {
          'type': 'action',
          // "imageUrl": "https://example.com/sushi.png",
          'action': {
            'type': 'postback',
            'label': '👉診断スタート',
            'data': `app_id=${app_id}&event_type=${constant.event_type.start}`,
            'text': '👉診断スタート',
          },
        }
      ],
    }
  }
  messages.push(quickReply)
  return messages
}



