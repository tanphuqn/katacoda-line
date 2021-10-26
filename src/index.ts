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
import { getTextMessage } from './utils/helper';
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

// Function handler to receive the postback.
const postbackEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
    if (event.type !== 'postback') {
        return;
    }
    // Load question from api
    let messages: Message[] = []

    const data = event.postback.data
    let params = new URLSearchParams(data);
    const survey_id = params.get("survey_id") || '';
    const campaign_type = params.get("campaign_type") || constant.campaign_type.initial;
    const campaign_id = params.get("campaign_id") || '';
    const resource_id = params.get("resource_id") || '';
    const answer_id = params.get("answer_id") || '';
    const answer_label = params.get("answer_label") || '';
    const resource_type = params.get("resource_type") || "question"
    const event_type = params.get("event_type") || '';
    // Check the end survey
    if (params.get("app_id") === '') {
        // TODO the sumarry survey
        return
    }

    if (event_type === constant.event_type.answer || event_type === constant.event_type.start) {
        const next_resources = await chatBotApi.getQuestion({
            app_id: APP_ID,
            user_id: event.source.userId ?? '',
            campaign_type: campaign_type,
            campaign_id: campaign_id,
            survey_id: survey_id,
            resource_id: resource_id,
            answer_id: answer_id,
            answer_label: answer_label,
            resource_type: resource_type,
        })
        console.log("next_resources", next_resources)
        next_resources?.forEach(async function (item: any) {
            const resource_type = item["resource_type"];
            if (resource_type === constant.resource_type.question) {
                const question: IQuestion = item;
                // Render question
                if (question) {
                    // Next question
                    messages = messages.concat(await render.getQuestion(survey_id, question));
                }
            }
            else if (resource_type === constant.resource_type.goal) {
                const goal: IGoal = item;
                // Get message of Goal
                if (goal) {
                    messages = messages.concat(await render.getGoal(survey_id, goal));
                }
            }
            else {
                const message: IMessage = item;
                // Render message
                if (message) {
                    // Next question
                    messages = messages.concat(await render.getMessage(message));
                }
            }

        });

    }
    else if (event_type === constant.event_type.welcome) {
        const survey_id = uuidv4();
        messages = messages.concat(await render.getWelcome(survey_id, event));
    }
    else {
        // TODO
    }

    console.log("messages", messages)
    if (messages.length > 0) {
        // Reply to the user.
        await client.replyMessage(event.replyToken, messages);
    }
    return;
};


// Function handler to receive the follow.
const followEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
    console.log("event", event);
    if (event.type !== 'join'
        && event.type !== 'follow'
        && event.type !== 'memberJoined'
    ) {
        return;
    }

    // Load question from api
    let messages: Message[] = []
    const profile: Profile = await client.getProfile(event.source.userId ?? "")
    if (profile) {
        chatBotApi.saveUser({
            app_id: APP_ID,
            user_id: profile.userId,
            display_name: profile.displayName,
            is_active: true
        })
    }
    const survey_id = uuidv4();
    messages = messages.concat(await render.getWelcome(survey_id, event));

    console.log("messages", messages)
    if (messages.length > 0) {
        // Reply to the user.
        await client.replyMessage(event.replyToken || "", messages);
    }
    return;
};

// Function handler to receive the follow.
const unFollowEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
    if (event.type !== 'unfollow'
        && event.type !== 'leave'
    ) {
        return;
    }
    chatBotApi.saveUser({
        app_id: APP_ID,
        user_id: event.source.userId,
        is_active: false
    })

    return;
};

// Function handler to receive the text.
const textEventHandler = async (event: WebhookEvent): Promise<MessageAPIResponseBase | undefined> => {
    console.log("event", event);
    if (event.type !== 'message' || event.message.type !== 'text') {
        return;
    }

    // Process all message related variables here.
    // const { replyToken } = event;
    // Load question from api
    // let messages: Message[] = []
    // messages.push(getTextMessage(event.message.text))
    console.log("event.message.text", event.message.text)
    // console.log("messages", messages)
    // if (messages.length > 0) {
    //     // Reply to the user.
    //     await client.replyMessage(replyToken, messages);
    // }
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
                    console.log("event", event);
                    // "message" | "unsend" | "follow" | "join" | "leave" | "memberJoined" | "memberLeft" | "postback" | "videoPlayComplete" | "beacon" | "accountLink" | "things"
                    switch (event.type) {
                        case "message":
                            await textEventHandler(event);
                            break;
                        case "follow":
                        case "join":
                        case "memberJoined":
                            await followEventHandler(event);
                            break
                        case "unfollow":
                        case "leave":
                        case "memberLeft":
                            await unFollowEventHandler(event)
                            break;
                        case "postback":
                            await postbackEventHandler(event);
                            break;
                    }
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
