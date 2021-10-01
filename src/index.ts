// Import all dependencies, mostly using destructuring for better view.
require('dotenv').config()
import {
    ClientConfig,
    Client,
    middleware,
    MiddlewareConfig,
    WebhookEvent,
    MessageAPIResponseBase,
    Message,
    Profile,
} from '@line/bot-sdk';
import { v4 as uuidv4 } from 'uuid';
import express, { Application, Request, Response } from 'express';
import chatBotApi from './api/chatBot'
import { IQuestion, IEndPoint, IGoal, IMessage } from './utils/types';
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

client.deleteDefaultRichMenu()


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
    let messages: Message[] = []
    if (event.type === 'postback') {
        const data = event.postback.data
        let params = new URLSearchParams(data);
        const resource_id = params.get("resource_id") || '';
        const answer_id = params.get("answer_id") || '';
        const event_type = params.get("event_type") || '';
        const survey_id = params.get("survey_id") || '';
        const campaign_id = params.get("campaign_id") || '';
        const answer_label = params.get("answer_label") || '';
        const resource_type = params.get("resource_type") || "question"
        // Check the end survey
        if (params.get("app_id") === '') {
            // TODO the sumarry survey
            return
        }

        if (event_type === constant.event_type.answer || event_type === constant.event_type.start) {
            const endPoint: IEndPoint = await chatBotApi.getQuestion({
                app_id: APP_ID,
                user_id: event.source.userId ?? '',
                campaign_id: campaign_id,
                survey_id: survey_id,
                resource_id: resource_id,
                answer_id: answer_id,
                answer_label: answer_label,
                resource_type: resource_type,
            })
            console.log("IAppEndPoint", endPoint)
            const question: IQuestion = endPoint.next_question
            const message: IMessage = endPoint.next_question
            const goal: IGoal = endPoint.next_goal
            console.log("IAppQuestion", question)
            // Finall survery, go to Goal
            if (goal) {
                // Get message of Goal
                const goalMessages = await render.getGoal(survey_id, goal)
                if (goalMessages && goalMessages.length > 0) {
                    messages = messages.concat(goalMessages);
                }
            }

            // Finall survery, go to Goal
            if (question) {
                // Next question
                messages = messages.concat(await render.getQuestion(survey_id, question));
            }

            // Finall survery, go to Goal
            if (message) {
                // Next question
                messages = messages.concat(await render.getMessage(message));
            }
        }
        else if (event_type === constant.event_type.welcome) {
            const survey_id = uuidv4();
            messages = messages.concat(await render.getWelcome(survey_id, event));
        }
        else {
            // TODO
        }


    } else {
        if (event.type !== 'message') {
            if (event.type === 'follow') {
                const profile: Profile = await client.getProfile(event.source.userId ?? "")
                if (profile) {
                    chatBotApi.saveUser({
                        app_id: APP_ID, user_id: profile.userId, display_name: profile.displayName
                    })
                }
            }
            const survey_id = uuidv4();
            messages = messages.concat(await render.getWelcome(survey_id, event));
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
