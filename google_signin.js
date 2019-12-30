'use strict'

class GoogleSignIn {

    constructor(CLIENT_ID=null) {
        this.profile_data = null
        this.CLIENT_ID = CLIENT_ID
        this.is_init = false
    }

    async init_api(CLIENT_ID=null) {
        if(this.is_init)
            return
        CLIENT_ID = CLIENT_ID==null?this.CLIENT_ID:CLIENT_ID
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

        await this.init_api()

        let tthis = this

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
        })
    }

    get_spinner() {
        return '<div class="mdl-spinner mdl-js-spinner is-active is-upgraded" data-upgraded=",MaterialSpinner"><div class="mdl-spinner__layer mdl-spinner__layer-1"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-2"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-3"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-4"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__gap-patch"><div class="mdl-spinner__circle"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle"></div></div></div></div>'
    }

}