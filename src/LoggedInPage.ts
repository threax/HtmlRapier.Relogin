import * as loginPopup from 'hr.relogin.LoginPopup';
import * as safepost from 'hr.safepostmessage';
import * as controller from 'hr.controller';

var data: loginPopup.ILoginMessage = {
    type: loginPopup.MessageType,
    success: true
};

export class LoggedInPage {
    public static get InjectorArgs(): controller.DiFunction<any>[] {
        return [safepost.MessagePoster];
    }

    constructor(private poster: safepost.MessagePoster) {

    }

    public alertLoggedIn(): void {
        this.poster.postWindowMessage(parent, data);
        if (parent !== top) { //If iframe in iframe, a loop through parent here will just infinite loop for some reason.
            this.poster.postWindowMessage(top, data);
        }
    }
}

export function addServices(services: controller.ServiceCollection): void {
    services.tryAddShared(LoggedInPage, LoggedInPage);
}