import { Client, Message, Profile, TextMessage, WebhookEvent } from "@line/bot-sdk";
import chatBotApi from '../api/chatBot'
import { constant } from "./constant";
import { getResourceQuickReply, getTextMessage, getImageCarousel, startQuickReply } from './helper';
import { IGoal, IMessage, IQuestion, IInitialCampaign, IMessageDetail } from "./types";

export default class RenderMessage {
    private client: Client;
    private app_id: string;

    constructor(configs: { client: Client, app_id: string }) {
        this.client = configs.client;
        this.app_id = configs.app_id;
    }

    public async getQuestion(survey_id: string, question: IQuestion) {
        const setting: IInitialCampaign = await chatBotApi.getAppSetting({ app_id: this.app_id })
        let messages: Message[] = []
        // Next question
        if (question.messages && question.messages?.length > 0) {
            for (let index = 0; index < question.messages.length; index++) {
                const element: IMessageDetail = question.messages[index];
                if (element.type === constant.detail_image_type.message) {
                    if (element.message) {
                        messages.push(getTextMessage(element.message))
                    }

                }
                else {
                    if (element.images) {
                        messages.push(getImageCarousel(question.title ?? "", element.images))
                    }
                }
            }
        }
        // Create a quick replies message.
        const message: Message = getResourceQuickReply(question, survey_id, question.title ?? "", constant.resource_type.question, setting)
        messages.push(message)

        return messages
    }

    public async getMessage(msg: IMessage) {
        let messages: Message[] = []
        // Next question
        if (msg.messages && msg.messages?.length > 0) {
            for (let index = 0; index < msg.messages.length; index++) {
                const element: IMessageDetail = msg.messages[index];
                if (element.type === constant.detail_image_type.message) {
                    if (element.message) {
                        messages.push(getTextMessage(element.message))
                    }
                }
                else {
                    if (element.images) {
                        messages.push(getImageCarousel(msg.title ?? "", element.images))
                    }
                }
            }
        }

        return messages
    }


    public async getGoal(survey_id: string, goal: IGoal) {
        const setting: IInitialCampaign = await chatBotApi.getAppSetting({ app_id: this.app_id })
        let messages: Message[] = []
        const details = goal.details
        console.log("details", details)
        details?.forEach(element => {
            console.log("element", element)
            if (element.type == constant.detail_image_type.message) {
                if (element.message) {
                    messages.push(getTextMessage(element.message))
                }
            }
            else {
                if (element.images) {
                    messages.push(getImageCarousel(goal.title ?? "", element.images))
                }
            }
        });

        // Create a quick replies message.
        const message: Message = getResourceQuickReply(goal, survey_id, goal.title ?? "", constant.resource_type.goal, setting)
        messages.push(message)

        console.log("messages", messages)
        return messages
    }

    public async getWelcome(survey_id: string, event: WebhookEvent) {
        const setting: IInitialCampaign = await chatBotApi.getAppSetting({ app_id: this.app_id })
        const welcomes = setting.welcomes
        let messages: Message[] = []
        // Create a new message.
        const profile: Profile = await this.client.getProfile(event.source.userId ?? '')
        let title: string = ""
        if (welcomes && welcomes?.length > 1) {
            for (let index = 0; index < welcomes.length - 1; index++) {
                let text = welcomes[index].name
                if (text) {
                    text = text.replace("{displayName}", profile.displayName)
                    text = text.replace("{userId}", profile.userId)
                    messages.push(getTextMessage(text))
                }
            }

            title = welcomes[welcomes.length - 1].name ?? ""
        }
        else {
            if (welcomes && welcomes.length > 0) {
                title = welcomes[0].name ?? "";
            }

        }

        if (title) {
            title = title.replace("{displayName}", profile.displayName)
            title = title.replace("{userId}", profile.userId)
            // Create a quick replies message.
            const message: Message = startQuickReply(this.app_id, survey_id, title, setting)
            messages.push(message)
        }


        return messages
    }
}