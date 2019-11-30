'use strict'

class GoogleSignIn {

    constructor() {
        let tthis = this
        this.profile_data = null
    }

    async init_api(CLIENT_ID) {

        this.is_init = false
        let signin_meta = $('<meta>')
        .attr('name','google-signin-client_id')
        .attr('content',CLIENT_ID)
        let script = document.createElement('script');
        $('head').append(signin_meta)
        $('head').append(script)
        script.src = 'https://apis.google.com/js/platform.js'
        script.onload = function(){
            tthis.is_init = true
        }

        let tthis = this
        return new Promise((ok)=>{
            let int = setInterval(function() {
                if(tthis.is_init == false)
                    return
                clearInterval(int)
                ok()
            })
        })
    }

    async disconnect() {
        this.profile_data.profile.disconnect()
        this.profile_data = null
        var auth2 = gapi.auth2.getAuthInstance();
        await auth2.disconnect()
        await auth2.signOut()
    }

    get_JQ_button() {
        let btn = $('<div>').attr('id','g-signin2').addClass('g-signin2')
        let tthis = this
        btn.ready(function() {
            gapi.signin2.render('g-signin2', {
            'width': 240,
            'height': 50,
            'longtitle': false,
            'onsuccess': function(profile) {
                tthis.on_sign_in.call(tthis,profile)
            },
            'onfailure': function(fail) {
                console.log(fail)
            }
            });
        })
        return btn
    }

    on_sign_in(profile) {
        let base_profile = profile.getBasicProfile()
        this.profile_data = {
            id:base_profile.getId(),
            email:base_profile.getEmail(),
            name:base_profile.getName(),
            family_name:base_profile.getFamilyName(),
            given_name:base_profile.getGivenName(),
            image_url:base_profile.getImageUrl(),
            base_profile:base_profile,
            profile:profile
        }
    }

    async get_profile_data() {
        let tthis = this
        return new Promise((ok)=>{
            let int = setInterval(function() {
                if(tthis.profile_data == null)
                    return
                clearInterval(int)
                ok(tthis.profile_data)
            })
        })
    }

}