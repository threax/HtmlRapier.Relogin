import * as loginPopup from 'hr.relogin.LoginPopup';

var data: loginPopup.ILoginMessage = {
    type: loginPopup.MessageType,
    success: true
};

export function alertLoggedIn() {
    parent.postMessage(JSON.stringify(data), "*");
    if (parent !== top) { //If iframe in iframe, a loop through parent here will just infinite loop for some reason.
        top.postMessage(JSON.stringify(data), "*");
    }
}