import { Client, Message, TextMessage } from "@line/bot-sdk";
import * as fs from "fs";
import { createMenu, quickReply, startQuickReply } from './helper';
import { IGoal, IGroup, IMessage, IQuestion } from "./types";

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
        const message: Message = quickReply(question, title)
        messages.push(message)

        return messages
    }

    public getNextGroups(nextGroups: IGroup) {
        let messages: Message[] = []
        return messages
    }

    public getGoals(goals: IGoal) {
        let messages: Message[] = []
        const message: Message = {
            "type": "template",
            "altText": "this is a image carousel template",
            "template": {
                "type": "image_carousel",
                "columns": [
                    {
                        "imageUrl": "https://example.com/bot/images/item1.jpg",
                        "action": {
                            "type": "postback",
                            "label": "Buy",
                            "data": "action=buy&itemid=111"
                        }
                    },
                    {
                        "imageUrl": "https://example.com/bot/images/item2.jpg",
                        "action": {
                            "type": "message",
                            "label": "Yes",
                            "text": "yes"
                        }
                    },
                    {
                        "imageUrl": "https://example.com/bot/images/item3.jpg",
                        "action": {
                            "type": "uri",
                            "label": "View detail",
                            "uri": "http://example.com/page/222"
                        }
                    }
                ]
            }
        }

        messages.push(message)
        return messages
    }
}