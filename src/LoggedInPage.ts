///<amd-module name="hr.relogin.logged-in-page"/>
//This amd name can stay since this file is itself an entry point. This can keep b/c with older sites.

import * as loginPopup from './LoginPopup';

var data: loginPopup.ILoginMessage = {
        type: loginPopup.MessageType,
        success: true
    };

parent.postMessage(JSON.stringify(data), "*");