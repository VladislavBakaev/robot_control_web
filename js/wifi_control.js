var target_foget_wifi;
let image_lock_html = "<img src='images/lock.png'>"
let image_unlock_html = "<img src='images/unlock.png'>"
let load = '<div id="fountainG">\
    <div id="fountainG_1" class="fountainG"></div>\
    <div id="fountainG_2" class="fountainG"></div>\
    <div id="fountainG_3" class="fountainG"></div>\
    <div id="fountainG_4" class="fountainG"></div>\
    <div id="fountainG_5" class="fountainG"></div>\
    <div id="fountainG_6" class="fountainG"></div>\
    <div id="fountainG_7" class="fountainG"></div>\
    <div id="fountainG_8" class="fountainG"></div></div>'
var wifi_dict;
var target_wifi;
var load_wifi;
var chatSocket;
var list;

$.fn.popup = function() {
    this.css('position', 'absolute').fadeIn();
    this.css('top', ($(window).height() - this.height()) / 2 + $(window).scrollTop() + 'px');
    this.css('left', ($(window).width() - this.width()) / 2  + 'px');
    $('.backpopup').fadeIn();
}

$(document).ready(function(){

    list = $('#wifi-list')
    list.click(click_wifi)

    chatSocket = new WebSocket('ws://' + window.location.hostname + ':5000/wifi/list');
    chatSocket.onmessage = wifi_message_load

    $('#password-but').attr('disabled', 'disabled');
    $('#in-password').on('keyup', check_pass_symbol)


    $('.backpopup,.close').click(function(){
        $('.popup-window').fadeOut();
        $('.backpopup').fadeOut();
    });
    $("#wifi-list").bind("contextmenu", function (event) {
        event.preventDefault();
        target_foget_wifi = event.target.innerText.split('\n')[0]
        $(".custom-menu").finish().toggle(100).
        
        css({
            top: event.pageY + "px",
            left: event.pageX + "px"
        });
    });
    $(document).bind("mousedown", function (e) {
        if (!$(e.target).parents(".custom-menu").length > 0) {
            $(".custom-menu").hide(100);
        }
    });

    $(".custom-menu li").click(function(e){
        forget_wifi_net(target_foget_wifi)
        $(".custom-menu").hide(100);
      });        
});

function wifi_message_load(event){
    var wifi_list = JSON.parse(event.data)['wifi'];
    list.html('');
    let class_;
    let lock;
    wifi_dict = {}

    for(i in wifi_list){
        wifi_dict[wifi_list[i][2]] = [wifi_list[i][0], wifi_list[i][3], wifi_list[i][4]]

        if (wifi_list[i][0] === "active"){
            class_ = "active"
        }
        else{
            class_ = ""
        }
        if (load_wifi !=undefined && load_wifi == wifi_list[i][2]){
            lock = load
        }
        else if (wifi_list[i][3] === "non-password"){
            lock = '';
        }
        else{
            if (wifi_list[i][4] === "saved"){
                lock = image_unlock_html
            }
            else{
                lock = image_lock_html
            }
        }
        list.append(`<li class = "${class_}">${lock}<span>${wifi_list[i][2]}<span class='ip-style'>${wifi_list[i][5]}</span><br><span>${wifi_list[i][1]}</span></span></li>`)
    }
};

function click_wifi(e){
    target_wifi = e.target.innerText.split('\n')
    if (target_wifi.length < 3){
        var target_wifi_param = wifi_dict[target_wifi[0]]
        if (target_wifi_param[0]=='non-active'){
            if (target_wifi_param[1] =="password" && target_wifi_param[2] == 'non-saved'){
                $('.popup-window').popup();
            }
            else{
                send_change_wifi_req(target_wifi[0], '')
            }
        }
    }
}

function change_wifi(){
    $('#password-but').attr('disabled', 'disabled');
    $('.popup-window').fadeOut();
    $('.backpopup').fadeOut();
    var password = $('#in-password').val()
    $('#in-password').val('')
    send_change_wifi_req(target_wifi[0], password)
}

function send_change_wifi_req(name, password){
    load_wifi = target_wifi[0]
    $.ajax({
        url: '/api/wifi/connect',
        dataType: 'text',
        cache: false,
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify({"name":name, "password":password}),                         
        type: 'post',
        success: function(script_response){
            console.log(script_response);
            load_wifi = undefined
        },
        error:function(xhr, status, errorThrown) { 
            console.log(errorThrown+'\n'+status+'\n'+xhr.statusText); 
            } 
    });
}
function forget_wifi_net(name){
    $.ajax({
        url: '/api/wifi/forget',
        dataType: 'text',
        cache: false,
        contentType: 'application/json',
        processData: false,
        data: JSON.stringify({"name":name}),                         
        type: 'post',
        success: function(script_response){
            console.log(script_response);
        },
        error:function(xhr, status, errorThrown) { 
            console.log(errorThrown+'\n'+status+'\n'+xhr.statusText); 
            } 
    });
}
function check_pass_symbol(event){
    if ($(this).val().length >= 8){
        $('#password-but').removeAttr('disabled'); 
    }
}