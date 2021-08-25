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
} from '@line/bot-sdk';
import * as fs from "fs";
import express, { Application, Request, Response } from 'express';
import appQuestionApi from './api/app-question'
import { createMenu, quickReply } from './utils/helper';
import { IAppAnswer, IAppQuestion, IAppMessage } from './utils/types';
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
    if (event.type !== 'join' && event.type !== 'message' && event.type !== 'postback') {
        return;
    }

    // Process all message related variables here.
    const { replyToken } = event;
    // Load question from api
    const app_id = process.env.APP_ID || ''
    let question_id = ''
    let messages: Message[] = []

    if (event.type === 'postback') {
        const data = event.postback.data
        let params = new URLSearchParams(data);
        question_id = params.get("question_id") || '';

        // Check the end survey
        if (params.get("app_id") === '') {
            // TODO the sumarry survey
            return
        }
        const question: IAppQuestion = await appQuestionApi.single({ app_id: app_id, question_id: question_id })
        console.log("question", question)
        let title = ''
        if (question.messages && question.messages?.length > 1) {
            for (let index = 0; index < question.messages.length - 2; index++) {
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
        console.log("messages", messages)
        // Create a new message.
        const response: Message = quickReply(question, title)
        messages.push(response)

    }

    // Reply to the user.
    await client.replyMessage(replyToken, messages);

    return;
};

// Register the LINE middleware.
// As an alternative, you could also pass the middleware in the route handler, which is what is used here.
// app.use(middleware(middlewareConfig));

// Route handler to receive webhook events.
// This route is used to receive connection tests.
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
