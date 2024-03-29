﻿import * as controller from 'htmlrapier/src/controller';
import { Fetcher } from 'htmlrapier/src/fetcher';
import * as ep from 'htmlrapier/src/externalpromise';
import { TokenManager } from 'htmlrapier.accesstoken/src/manager';
import * as safepost from 'htmlrapier/src/safepostmessage';

export class LoginPopupOptions {
    private _relogPage;

    constructor(relogPage: string) {
        this._relogPage = relogPage;
    }

    public get relogPage() {
        return this._relogPage;
    }
}

export class LoginPopup {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, LoginPopupOptions, Fetcher, safepost.PostMessageValidator, TokenManager];
    }

    private dialog: controller.OnOffToggle;
    private currentPromise: ep.ExternalPromise<boolean>;
    private loginFrame: HTMLIFrameElement;
    private resizeEvent;

    constructor(bindings: controller.BindingCollection, private options: LoginPopupOptions, fetcher: Fetcher, private messageValidator: safepost.PostMessageValidator, private tokenManager: TokenManager) {
        this.dialog = bindings.getToggle("dialog");
        this.dialog.offEvent.add(t => {
            this.closed();
        });

        this.loginFrame = <HTMLIFrameElement>bindings.getHandle("loginFrame");

        tokenManager.onNeedLogin.add(f => this.showLogin());

        window.addEventListener("message", e => {
            this.handleMessage(e);
        });

        this.resizeEvent = e => {
            this.setIframeHeight();
        };
    }

    public showLogin(): Promise<boolean> {
        this.dialog.on();
        this.currentPromise = new ep.ExternalPromise<boolean>();
        this.setIframeHeight();
        this.loginFrame.src = this.options.relogPage;
        window.addEventListener("resize", this.resizeEvent);
        return this.currentPromise.Promise;
    }

    private handleMessage(e: MessageEvent): void {
        if (this.messageValidator.isValid(e)) {
            let message: ILoginMessage = e.data;
            if (message && message.type === MessageType && message.success) {
                this.dialog.off();
            }
        }
    }

    private setIframeHeight(): void {
        this.loginFrame.style.height = (window.innerHeight - 240) + "px";
    }

    private async closed(): Promise<void> {
        if (this.currentPromise) {
            var promise = this.currentPromise;

            this.currentPromise = null;

            //Reset iframe contents
            this.loginFrame.contentWindow.document.open();
            this.loginFrame.contentWindow.document.close();

            window.removeEventListener("resize", this.resizeEvent);

            promise.resolve(true); //Try to determine true or false, true to try again, false to error
        }
    }
}

export const MessageType: string = "LoginPageMessage";

export interface ILoginMessage {
    type: string;
    success: boolean;
}

export function addServices(services: controller.ServiceCollection): void {
    services.tryAddShared(LoginPopupOptions, (s) => new LoginPopupOptions("/Account/Relogin"));
    services.tryAddShared(LoginPopup, LoginPopup);
}