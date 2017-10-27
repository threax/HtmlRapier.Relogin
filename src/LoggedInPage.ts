///<amd-module name="htmlrapier.relogin.logged-in-page"/>

import * as loginPopup from 'htmlrapier.relogin.LoginPopup';

var data: loginPopup.ILoginMessage = {
        type: loginPopup.MessageType,
        success: true
    };

parent.postMessage(JSON.stringify(data), "*");