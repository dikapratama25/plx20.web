import { Injectable } from "@angular/core";
import { AppConsts } from '@shared/AppConsts';

@Injectable()

export class DeeplinkService {
    constructor() {

    }
    deeplink(appUrl: string, webUrl: string, useServerRedirect?: boolean | null | undefined) {
        let serverUrl = AppConsts.remoteServiceBaseUrl + '/api/General/RedirectToApp';
        let appName = AppConsts.deepAppLink;
        let ua = navigator.userAgent.toLowerCase();
        let isAndroid = ua.indexOf("android") > -1; // android check
        let isIphone = ua.indexOf("iphone") > -1; // ios check
        if (isIphone == true) {
            if (appUrl) {
                if (useServerRedirect) {
                    // serverUrl += appUrl;
                    // location.href = serverUrl;
                    this.postSubmit(serverUrl, {
                        url: appUrl
                    }, 'post', appName);
                }
                else {
                    location.href = appUrl;
                    // window.location.replace(appUrl);
                    // setTimeout(function () {window.location.replace(webUrl); }, 10000);
                    // let app = { 
                    //     launchApp: function() {
                    //         window.location.replace(appUrl); //"bundlename://linkname" //which page to open(now from mobile, check its authorization)
                    //         setTimeout(500);
                    //     },
                    //     openWebApp: function() {
                    //         window.location.href = webUrl; //https://itunes.apple.com/us/app/appname/appid
                    //     }
                    // };
                    // app.launchApp();
                }
            }
        } 
        else if (isAndroid== true) {
            if (appUrl) {
                if (useServerRedirect) {
                    // serverUrl += appUrl;
                    // location.href = serverUrl;
                    this.postSubmit(serverUrl, {
                        url: appUrl
                    }, 'post', appName);
                }
                else {
                    location.href = appUrl;
                    // window.location.replace(appUrl);
                    // setTimeout(function () {window.location.replace(webUrl); }, 10000);
                    // let app = { 
                    //     launchApp: function() {
                    //         window.location.replace(appUrl); //which page to open(now from mobile, check its authorization)
                    //         setTimeout(this.openWebApp, 500);
                    //     },
                    //     openWebApp: function() {
                    //         window.location.href = webUrl;
                    //     }
                    // };
                    // app.launchApp();
                }
            }
        }
        else{
            if (webUrl) {
                //navigate to website url
                window.location.href = webUrl;
            }
        }
    }

    // postSubmit(path, params, method) {
    //     method = method || "post";
    
    //     var form = document.createElement("form");
    //     form.setAttribute("method", method);
    //     form.setAttribute("action", path);
    
    //     for(var key in params) {
    //         if(params.hasOwnProperty(key)) {
    //             var hiddenField = document.createElement("input");
    //             hiddenField.setAttribute("type", "hidden");
    //             hiddenField.setAttribute("name", key);
    //             hiddenField.setAttribute("value", params[key]);
    
    //             form.appendChild(hiddenField);
    //          }
    //     }
    
    //     document.body.appendChild(form);
    //     form.submit();
    // }

    postSubmit(path, params, method, appName) {
        method = method || "post";
    
        var form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", path);
        
        for(var key in params) {
            if(params.hasOwnProperty(key)) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", params[key]);
        
                form.appendChild(hiddenField);
             }
        }

        var submitField = document.createElement("input");
        submitField.setAttribute("type", "submit");
        submitField.setAttribute("style", "visibility:hidden;");
        submitField.setAttribute("id", "execute-deeplink");
        submitField.setAttribute("value", "send");
        
        form.appendChild(submitField);
        document.body.appendChild(form);

        if (confirm("Opening " + appName + " Application..")) {
            document.getElementById("execute-deeplink").click();
        }
    }
}