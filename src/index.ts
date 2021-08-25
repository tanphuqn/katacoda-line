// Import all dependencies, mostly using destructuring for better view.
require('dotenv').config()
import {
    ClientConfig,
    Client,
    middleware,
    MiddlewareConfig,
    WebhookEvent,
    TextMessage,
    FlexMessage,
    MessageAPIResponseBase,
    FlexContainer,
    Message,
    Profile,
} from '@line/bot-sdk';
import * as fs from "fs";
import express, { Application, Request, Response } from 'express';
import appQuestionApi from './api/app-question'
import { createMenu, quickReply, startQuickReply } from './utils/helper';
import { IAppAnswer, IAppQuestion, IAppMessage } from './utils/types';
import { constant } from './utils/constant';
// Setup all LINE client and Express configurations.
const clientConfig: ClientConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET,
};

const middlewareConfig: MiddlewareConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET || '',
};

const PORT = process.env.PORT || 3000;
const APP_ID: string = process.env.APP_ID || '';
// Create a new LINE SDK client.
const client = new Client(clientConfig);
// Create a new Express application.
const app: Application = express();

const init = async (): Promise<string | undefined> => {
    const richMenuId = await client.createRichMenu(createMenu(APP_ID))
    console.log("richMenuId", richMenuId)
    await client.setRichMenuImage(richMenuId, fs.createReadStream('./richmenu.jpeg'))
    await client.setDefaultRichMenu(richMenuId)

    console.log("Init end")

    return ''
};

init();

// Function handler to receive the text.
const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
    console.log("event", event);
    // Process all variables here.
    if (event.type !== 'join'
        && event.type !== 'follow'
        && event.type !== 'memberJoined'
        && event.type !== 'message'
        && event.type !== 'postback') {
        return;
    }

    // Process all message related variables here.
    const { replyToken } = event;
    // Load question from api
    const app_id = process.env.APP_ID || ''
    let question_id = ''
    let answer_id = ''
    let event_type = ''
    let messages: Message[] = []
    let title = ''
    if (event.type === 'postback') {
        const data = event.postback.data
        let params = new URLSearchParams(data);
        question_id = params.get("question_id") || '';
        answer_id = params.get("answer_id") || '';
        event_type = params.get("event_type") || '';
        // Check the end survey
        if (params.get("app_id") === '') {
            // TODO the sumarry survey
            return
        }

        if (event_type === constant.event_type.answer || event_type === constant.event_type.start) {
            if ((question_id !== '' || answer_id !== '') || event_type === constant.event_type.start) {
                const question: IAppQuestion = await appQuestionApi.single({ app_id: app_id, question_id: question_id })
                console.log("question", question)
                if (question.messages && question.messages?.length > 1) {
                    for (let index = 0; index < question.messages.length - 1; index++) {
                        const element: IAppMessage = question.messages[index];
                        const message: TextMessage = {
                            type: 'text',
                            text: element.data ?? ''
                        };

                        // Reply to the user.
                        messages.push(message)
                    }

                    const element: IAppMessage = question.messages[question.messages.length - 1];
                    title = element.data ?? ''
                }
                else {
                    if (question.messages && question.messages.length > 0) {
                        const element: IAppMessage = question.messages[0];
                        title = element.data ?? ''
                    }

                }
                // Create a new message.
                const message: Message = quickReply(question, title)
                messages.push(message)
            }
            else {
                // Final question
                const message: TextMessage = {
                    type: 'text',
                    text: "Thank you so much"
                };
                // Reply to the user.
                messages.push(message)
            }

            console.log("messages", messages)
            // Reply to the user.
            await client.replyMessage(replyToken, messages);
        }
        else if (event_type === constant.event_type.welcome) {
            // Create a new message.
            const profile: Profile = await client.getProfile(event.source.userId ?? '')
            const message: Message[] = startQuickReply(app_id, profile)
            // Reply to the user.
            await client.replyMessage(replyToken, message);
        }
        else {
            // TODO
        }


    } else {
        if (event.type !== 'message') {
            // Create a new message.
            const profile: Profile = await client.getProfile(event.source.userId ?? '')
            const message: Message[] = startQuickReply(app_id, profile)
            // Reply to the user.
            await client.replyMessage(replyToken, message);
        }
    }

    return;
};

app.get(
    '/',
    async (_: Request, res: Response): Promise<Response> => {
        return res.status(200).json({
            status: 'success',
            message: 'Connected successfully!',
        });
    }
);

// This route is used for the Webhook.
app.post(
    '/webhook',
    middleware(middlewareConfig),
    async (req: Request, res: Response): Promise<Response> => {
        const events: WebhookEvent[] = req.body.events;

        // Process all of the received events asynchronously.
        const results = await Promise.all(
            events.map(async (event: WebhookEvent) => {
                try {
                    await textEventHandler(event);
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        console.error(err);
                    }

                    // Return an error message.
                    return res.status(500).json({
                        status: 'error',
                    });
                }
            })
        );

        // Return a successfull message.
        return res.status(200).json({
            status: 'success',
            results,
        });
    }
);

// Create a server and listen to it.
app.listen(PORT, () => {
    console.log("process.env.APP_API_ENDPOINT", process.env.APP_API_ENDPOINT)
    console.log(`Application is live and listening on port ${PORT}`);
});
