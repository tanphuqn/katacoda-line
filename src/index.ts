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
import appQuestionApi from './api/question'
import { startQuickReply } from './utils/helper';
import { IQuestion, IEndPoint } from './utils/types';
import { constant } from './utils/constant';
import RenderMessage from './utils/renderMessage';
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
const client = new Client(clientConfig);
const app: Application = express();
const render = new RenderMessage({ client: client, app_id: APP_ID });

render.createRichMenu();

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
    let group_id = ''
    let question_id = ''
    let answer_id = ''
    let event_type = ''
    let messages: Message[] = []
    let title = ''
    if (event.type === 'postback') {
        const data = event.postback.data
        let params = new URLSearchParams(data);
        group_id = params.get("group_id") || '';
        question_id = params.get("question_id") || '';
        answer_id = params.get("answer_id") || '';
        event_type = params.get("event_type") || '';
        // Check the end survey
        if (params.get("app_id") === '') {
            // TODO the sumarry survey
            return
        }

        if (event_type === constant.event_type.answer || event_type === constant.event_type.start) {
            const endPoint: IEndPoint = await appQuestionApi.single({
                app_id: APP_ID, question_id: question_id,
                group_id: group_id, answer_id: answer_id
            })
            console.log("IAppEndPoint", endPoint)
            const question: IQuestion = endPoint.next_question
            console.log("IAppQuestion", question)
            // Finall survery, go to Goal and Next group
            if (question == null) {

                // Reply to the user.
                const goalMessages = render.getGoal(endPoint.goal)
                if (goalMessages && goalMessages.length > 0) {
                    messages = messages.concat(goalMessages);
                }
                // Get message of next groups
                if (endPoint.next_group && endPoint.next_group.groups && endPoint.next_group.groups.length > 0) {
                    messages.push(render.getNextGroups(APP_ID, endPoint.next_group))
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
            }
            else {
                // Next question
                messages = messages.concat(render.getNextQuestion(question));
            }

        }
        else if (event_type === constant.event_type.welcome) {
            // Create a new message.
            const profile: Profile = await client.getProfile(event.source.userId ?? '')
            messages = messages.concat(startQuickReply(APP_ID, group_id, profile))
        }
        else {
            // TODO
        }


    } else {
        if (event.type !== 'message') {
            // Create a new message.
            const profile: Profile = await client.getProfile(event.source.userId ?? '')
            messages = messages.concat(startQuickReply(APP_ID, "", profile))
        }
    }

    console.log("messages", messages)
    if (messages.length > 0) {
        // Reply to the user.
        await client.replyMessage(replyToken, messages);
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
