﻿import * as controller from 'hr.controller';
import { Fetcher, RequestInfo, Response } from 'hr.fetcher';
import * as ep from 'hr.externalpromise';
import { AccessTokenManager } from 'hr.accesstokens';

export class LoginPopupOptions{
    private _relogPage;

    constructor(relogPage: string){
        this._relogPage = relogPage;
    }

    public get relogPage(){
        return this._relogPage;
    }
}

export class LoginPopup {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [controller.BindingCollection, LoginPopupOptions, Fetcher];
    }

    private dialog: controller.OnOffToggle;
    private currentPromise: ep.ExternalPromise<boolean>;
    private loginFrame: HTMLIFrameElement;
    private resizeEvent;

    constructor(bindings: controller.BindingCollection, private options: LoginPopupOptions, fetcher: Fetcher) {
        this.dialog = bindings.getToggle("dialog");
        this.dialog.offEvent.add(t => {
            this.closed();
        });

        this.loginFrame = <HTMLIFrameElement>bindings.getHandle("loginFrame");

        if (AccessTokenManager.isInstance(fetcher)) {
            fetcher.onNeedLogin.add(f => this.open(f));

            window.addEventListener("message", e => {
                this.handleMessage(e);
            });
        }

        this.resizeEvent = e => {
            this.setIframeHeight();
        };
    }

    public open(accessTokenManager: AccessTokenManager): Promise<boolean> {
        this.dialog.on();
        this.currentPromise = new ep.ExternalPromise<boolean>();
        this.setIframeHeight();
        this.loginFrame.src = this.options.relogPage;
        window.addEventListener("resize", this.resizeEvent);
        return this.currentPromise.Promise;
    }

    private handleMessage(e: MessageEvent): void{
        var message: ILoginMessage = JSON.parse(e.data);
        if(message.type === MessageType && message.success){
            this.dialog.off();
        }
    }

    private setIframeHeight(): void{
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

export interface ILoginMessage{
    type: string;
    success: boolean;
}

export function addServices(services: controller.ServiceCollection): void {
    services.tryAddShared(LoginPopupOptions, (s) => new LoginPopupOptions("/Account/Relogin"));
    services.tryAddShared(LoginPopup, LoginPopup);
}