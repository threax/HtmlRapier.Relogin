import * as loginPopup from 'hr.relogin.LoginPopup';

var data: loginPopup.ILoginMessage = {
        type: loginPopup.MessageType,
        success: true
    };

export function alertLoggedIn() {
    parent.postMessage(JSON.stringify(data), "*");
}