import { Client, Message, Profile, TextMessage, WebhookEvent } from "@line/bot-sdk";
import chatBotApi from '../api/chatBot'
import { constant } from "./constant";
import { getQuestionQuickReply, getTextMessage, getImageCarousel, startQuickReply } from './helper';
import { IGoal, IMessage, IQuestion, IInitial } from "./types";

export default class RenderMessage {
    private client: Client;
    private app_id: string;

    constructor(configs: { client: Client, app_id: string }) {
        this.client = configs.client;
        this.app_id = configs.app_id;
    }

    public async getNextQuestion(survey_id: string, question: IQuestion) {
        const setting: IInitial = await chatBotApi.getAppSetting({ app_id: this.app_id })
        let messages: Message[] = []
        let title: string = ''
        // Next question
        if (question.messages && question.messages?.length > 1) {
            for (let index = 0; index < question.messages.length - 1; index++) {
                const element: IMessage = question.messages[index];
                const message: TextMessage = {
                    type: 'text',
                    text: element.data ?? ''
                };

                // Reply to the user.
                messages.push(message)
            }

            const element: IMessage = question.messages[question.messages.length - 1];
            title = element.data ?? ''
        }
        else {
            if (question.messages && question.messages.length > 0) {
                const element: IMessage = question.messages[0];
                title = element.data ?? ''
            }

        }

        // Create a quick replies message.
        const message: Message = getQuestionQuickReply(question, survey_id, title, setting)
        messages.push(message)

        return messages
    }

    public getGoal(goal: IGoal) {
        let messages: Message[] = []
        const details = goal.details
        console.log("details", details)
        details?.forEach(element => {
            console.log("element", element)
            if (element.type == constant.goal_detail_type.message) {
                messages.push(getTextMessage(element.message ?? ''))
            }
            else {
                messages.push(getImageCarousel(goal, element.images ?? []))
            }
        });

        console.log("messages", messages)
        return messages
    }

    public async getWelcome(group_id: string, survey_id: string, event: WebhookEvent) {
        const setting: IInitial = await chatBotApi.getAppSetting({ app_id: this.app_id })
        const welcomes = setting.welcomes
        let messages: Message[] = []
        // Create a new message.
        const profile: Profile = await this.client.getProfile(event.source.userId ?? '')
        let title: string = ''
        if (welcomes && welcomes?.length > 1) {
            for (let index = 0; index < welcomes.length - 1; index++) {
                let text = welcomes[index].name ?? ""
                text = text.replace("{displayName}", profile.displayName)
                text = text.replace("{userId}", profile.userId)
                const message: TextMessage = {
                    type: 'text',
                    text: text
                };

                // Reply to the user.
                messages.push(message)
            }

            title = welcomes[welcomes.length - 1].name ?? "";
        }
        else {
            if (welcomes && welcomes.length > 0) {
                title = welcomes[0].name ?? "";
            }

        }

        title = title.replace("{displayName}", profile.displayName)
        title = title.replace("{userId}", profile.userId)
        // Create a quick replies message.
        const message: Message = startQuickReply(this.app_id, group_id, survey_id, title, setting)
        messages.push(message)

        return messages
    }
}