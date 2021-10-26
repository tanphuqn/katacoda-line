import { Client, Message, Profile, WebhookEvent } from "@line/bot-sdk";
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

    public getQuestion(survey_id: string, question: IQuestion, setting: IInitialCampaign) {
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
                        const message = getImageCarousel(question.title ?? "", element.images)
                        if (message) {
                            messages.push(message)
                        }
                    }
                }
            }
        }
        // Create a quick replies message.
        if (question.answers) {
            const message: Message = getResourceQuickReply(question, survey_id, question.title ?? "", constant.resource_type.question, setting)
            messages.push(message)
        }
        return messages
    }

    public getMessage(msg: IMessage) {
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
                        const message = getImageCarousel(msg.title ?? "", element.images)
                        if (message) {
                            messages.push(message)
                        }
                    }
                }
            }
        }

        return messages
    }


    public getGoal(survey_id: string, goal: IGoal, setting: IInitialCampaign) {
        let messages: Message[] = []
        const details = goal.details
        details?.forEach(element => {
            if (element.type == constant.detail_image_type.message) {
                if (element.message) {
                    messages.push(getTextMessage(element.message))
                }
            }
            else {
                if (element.images) {
                    const message = getImageCarousel(goal.title ?? "", element.images)
                    if (message) {
                        messages.push(message)
                    }
                }
            }
        });

        if (goal.answers) {
            // Create a quick replies message.
            const message: Message = getResourceQuickReply(goal, survey_id, goal.title ?? "", constant.resource_type.goal, setting)
            messages.push(message)
        }

        return messages
    }

    public getWelcome(survey_id: string, event: WebhookEvent, setting: IInitialCampaign, profile: Profile) {
        const welcomes = setting.welcomes
        let messages: Message[] = []
        // Create a new message.
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