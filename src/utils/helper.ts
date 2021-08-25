// Import all dependencies, mostly using destructuring for better view.
import {
  Message,
  RichMenu,
} from '@line/bot-sdk';
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
          "label": "Start",
          'data': `app_id=${app_id}`,
          'text': "Start",
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
      'data': `app_id=${question.app_id}&question_id=${answer.next_question_id}`,
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


