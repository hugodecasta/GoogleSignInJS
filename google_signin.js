'use strict'

export default class GoogleSignIn {

    constructor(init_option) {

        this.profile_data = null
        this.is_init = false

        this.init_option = init_option
    }

    is_connected() {
        return this.profile_data != null
    }

    async create_script(src) {
        return new Promise(ok=>{
            let script = document.createElement('script');
            $('head').append(script)
            script.src = src
            script.onload = ok
        })
    }

    async get_api(api_name) {
        await this.get_profile_data()
        return gapi.client[api_name]
    }

    async init_api() {
        if(this.is_init)
            return

        await this.create_script('https://apis.google.com/js/platform.js')
        await this.create_script('https://apis.google.com/js/api.js')
        await (new Promise(ok=>{gapi.load('client:auth2', ok)}))
        await gapi.client.init(this.init_option)
        let GoogleAuth = gapi.auth2.getAuthInstance();
        if(await GoogleAuth.isSignedIn.get()) {
            let user = GoogleAuth.currentUser.get();
            this.on_sign_in(user)
        }
        this.is_init = true
    }

    async disconnect() {
        this.profile_data = null
        await gapi.auth2.getAuthInstance().signOut();
    }

    get_JQ_button(callback) {
        let btn = $('<div>').attr('id','g-signin2').addClass('g-signin2')
        let tthis = this

        btn.ready(function() {

            gapi.signin2.render('g-signin2', {
                'width': 240,
                'height': 50,
                'longtitle': false,
                'onsuccess': async function(profile) {
                    tthis.on_sign_in.call(tthis,profile)
                    callback.call(tthis,tthis.profile_data)
                },
                'onfailure': function(fail) {
                    console.log(fail)
                }
            });
        })
        return btn
    }

    get_user_button(profile_data) {
        let btn = $('<div>').addClass('user_btn')
        btn.css('background-image','url("'+profile_data.image_url+'")')
        let tthis = this
        btn.click(async function(){
            await tthis.disconnect()
            location.reload()
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

    async get_profile_data(draw_btn=true) {

        if($('.user_btn').length == 1) {
            draw_btn = false
        }


        if(draw_btn) {
            var loader = $(this.get_spinner()).addClass('google_loading')
            $('body').append(loader)
        }
        await this.init_api()
        if(draw_btn) {
            loader.remove()
        }

        if(this.is_connected()) {
            if(draw_btn) {
                let user_btn = this.get_user_button(this.profile_data)
                $('body').append(user_btn)
            }
            return this.profile_data
        }


        if(draw_btn) {
            let tthis = this
            return new Promise(ok=>{
                let signin_btn = this.get_JQ_button(async function() {
                    signin_btn.remove()
                    let profile_data = await tthis.get_profile_data(draw_btn)
                    ok(profile_data)
                })
                $('body').append(signin_btn)
            })
        }
    }

    get_spinner() {
        return '<div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active is-upgraded" data-upgraded=",MaterialSpinner"><div class="mdl-spinner__layer mdl-spinner__layer-1"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-2"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-3"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-4"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div></div>'
    }

    get_button() {
        return '<div id="g-signin2" class="g-signin2"><div style="height:50px;width:240px;" class="abcRioButton abcRioButtonLightBlue"><div class="abcRioButtonContentWrapper"><div class="abcRioButtonIcon" style="padding:15px"><div style="width:18px;height:18px;" class="abcRioButtonSvgImageWithFallback abcRioButtonIconImage abcRioButtonIconImage18"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48" class="abcRioButtonSvg"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg></div></div><span style="font-size:16px;line-height:48px;" class="abcRioButtonContents"><span id="not_signed_in1hva6t2cu25h">Connexion</span><span id="connected1hva6t2cu25h" style="display:none">Signed in</span></span></div></div></div>'
    }

}