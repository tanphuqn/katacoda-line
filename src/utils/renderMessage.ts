import { Client, Message, TextMessage } from "@line/bot-sdk";
import * as fs from "fs";
import { createMenu, quickReply, startQuickReply } from './helper';
import { IAppGoal, IAppGroup, IAppMessage, IAppQuestion } from "./types";

export default class RenderMessage {
    private client: Client;
    private app_id: string;

    constructor(configs: { client: Client, app_id: string }) {
        this.client = configs.client;
        this.app_id = configs.app_id;
    }

    public async createRichMenu() {
        const richMenuId = await this.client.createRichMenu(createMenu(this.app_id))
        console.log("richMenuId", richMenuId)
        await this.client.setRichMenuImage(richMenuId, fs.createReadStream('./richmenu.jpeg'))
        await this.client.setDefaultRichMenu(richMenuId)

        console.log("createRichMenu end")
    }

    public getNextQuestion(question: IAppQuestion) {
        let messages: Message[] = []
        let title: string = ''
        // Next question
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

        // Create a quick replies message.
        const message: Message = quickReply(question, title)
        messages.push(message)

        return messages
    }

    public getNextGroups(nextGroups: IAppGroup) {
        let messages: Message[] = []
        return messages
    }

    public getGoals(goals: IAppGoal) {
        let messages: Message[] = []
        return messages
    }
}