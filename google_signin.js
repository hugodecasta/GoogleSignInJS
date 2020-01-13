'use strict'

export default class GoogleSignIn {

    constructor(CLIENT_ID=null, scope='') {
        this.profile_data = null
        this.CLIENT_ID = CLIENT_ID
        this.is_init = false
        this.scope = scope
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

    async get_api(api, api_key, api_name) {
        await this.get_profile_data()
        gapi.client.setApiKey(api_key)
        await gapi.client.load(api)
        return gapi.client[api_name]
    }

    async init_api(CLIENT_ID=null) {
        if(this.is_init)
            return
        CLIENT_ID = CLIENT_ID==null?this.CLIENT_ID:CLIENT_ID
        await this.create_script('https://apis.google.com/js/platform.js')
        await this.create_script('https://apis.google.com/js/api.js')
        let tthis = this
        return new Promise(ok=>{
            gapi.load("client:auth2", async function() {
                await gapi.auth2.init({client_id: CLIENT_ID})
                if(await gapi.auth2.getAuthInstance().isSignedIn.get()) {
                    tthis.on_sign_in(await gapi.auth2.getAuthInstance().currentUser.get())
                }
                tthis.is_init = true
                ok()
            });
        })
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
                'scope': this.scope,
                'width': 240,
                'height': 50,
                'longtitle': false,
                'onsuccess': function(profile) {
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

        let loader = $(this.get_spinner()).addClass('google_loading')
        $('body').append(loader)
        await this.init_api()
        loader.remove()

        if(this.is_connected()) {
            let user_btn = this.get_user_button(this.profile_data)
            $('body').append(user_btn)
            return this.profile_data
        }

        let tthis = this
        return new Promise(ok=>{
            let signin_btn = this.get_JQ_button(async function() {
                signin_btn.remove()
                let profile_data = await tthis.get_profile_data(draw_btn)
                ok(profile_data)
            })
            $('body').append(signin_btn)
        })
/*
        let signin_btn = null
        let load_icon = null
        if(draw_btn && this.profile_data == null) {
            load_icon = $(this.get_spinner()).addClass('google_loading')
            signin_btn = tthis.get_JQ_button().css('display','none')
            $('body').append(signin_btn)
            $('body').append(load_icon)
            setTimeout(function(){
                if(signin_btn != null) {
                    load_icon.remove()
                    signin_btn.css('display','block')
                }
            },2000)
        }

        return new Promise((ok)=>{
            let int = setInterval(function() {
                if(tthis.profile_data == null)
                    return
                if(draw_btn && signin_btn != null) {
                    load_icon.remove()
                    signin_btn.remove()
                    load_icon = null
                    signin_btn = null
                    $('body').append(tthis.get_user_button(tthis.profile_data))
                }
                clearInterval(int)
                ok(tthis.profile_data)
            })
        })*/
    }

    get_spinner() {
        return '<div class="mdl-spinner mdl-js-spinner is-active is-upgraded" data-upgraded=",MaterialSpinner"><div class="mdl-spinner__layer mdl-spinner__layer-1"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-2"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-3"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-4"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div></div>'
    }

}