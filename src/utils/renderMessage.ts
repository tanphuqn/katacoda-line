import { Client, Message, Profile, TextMessage, WebhookEvent } from "@line/bot-sdk";
import * as fs from "fs";
import settingApi from '../api/setting'
import { constant } from "./constant";
import { getQuestionQuickReply, getGroupQuickReply, getTextMessage, getImageCarousel, startQuickReply } from './helper';
import { IGoal, IMessage, INextGroup, IQuestion, ISetting } from "./types";

export default class RenderMessage {
    private client: Client;
    private app_id: string;

    constructor(configs: { client: Client, app_id: string }) {
        this.client = configs.client;
        this.app_id = configs.app_id;
    }

    public getNextQuestion(question: IQuestion) {
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
        const message: Message = getQuestionQuickReply(question, title)
        messages.push(message)

        return messages
    }

    public getNextGroups(app_id: string, nextGroup: INextGroup) {
        return getGroupQuickReply(app_id, nextGroup)
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

    public async getWelcome(app_id: string, group_id: string, event: WebhookEvent) {
        const setting: ISetting = await settingApi.single({ app_id: app_id })
        const welcomes = setting.welcomes
        let messages: Message[] = []
        // Create a new message.
        const profile: Profile = await this.client.getProfile(event.source.userId ?? '')
        let title: string = ''
        if (welcomes && welcomes?.length > 1) {
            for (let index = 0; index < welcomes.length - 1; index++) {
                const message: TextMessage = {
                    type: 'text',
                    text: welcomes[index]
                };

                // Reply to the user.
                messages.push(message)
            }

            title = welcomes[welcomes.length - 1];
        }
        else {
            if (welcomes && welcomes.length > 0) {
                title = welcomes[0];
            }

        }

        title = title.replace("{nickname}", profile.userId)
        title = title.replace("{accountname}", profile.displayName)
        // Create a quick replies message.
        const message: Message = startQuickReply(app_id, group_id, title)
        messages.push(message)

        return messages
    }
}