import { Client } from "@line/bot-sdk";
import * as fs from "fs";
import { createMenu, quickReply, startQuickReply } from './helper';

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

        console.log("Init end")
    }
}