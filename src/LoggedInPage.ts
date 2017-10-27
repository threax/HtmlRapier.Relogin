///<amd-module name="hr.relogin.logged-in-page"/>

import * as loginPopup from 'hr.relogin.LoginPopup';

var data: loginPopup.ILoginMessage = {
        type: loginPopup.MessageType,
        success: true
    };

parent.postMessage(JSON.stringify(data), "*");