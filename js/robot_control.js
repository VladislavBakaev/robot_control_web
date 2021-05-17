var slam_state;
var brige_state;
var mover_state;
var base_state;
var state_div_list;

var slam_param;
var internal_state;

var internal_state_ws;
var slam_param_ws;


$(document).ready(function(){
    slam_state = $('#slam_state')
    brige_state = $('#brige_state')
    mover_state = $('#mover_state')
    base_state = $('#base_state')

    state_div_list = [base_state, mover_state, brige_state, slam_state]

    slam_param = $('#slam-param')
    internal_state = $('#robot-internal-state')

    internal_state_ws = new WebSocket('ws://' + window.location.hostname + ':5000/robot/internal');
    slam_param_ws = new WebSocket('ws://' + window.location.hostname + ':5000/robot/slam/param');

    internal_state_ws.onmessage = update_internal_param
    slam_param_ws.onmessage = update_slam_param

    setInterval(get_service_list, 1000)
});

function get_service_list(){
    $.get("/v1/services", update_service_list)
}

function update_service_list(data){
    // service_list.html('<h3>name, load_state, active_state, substate</h3>')
    for(i in state_div_list){
        state_div_list[i].html(`<li>Service name: <span>${data[i]['name']}</span></li>\
        <li>Load state: <span>${data[i]['load_state']}</span></li>\
        <li>Active state: <span>${data[i]['active_state']}</span></li>\
        <li>Substate: <span>${data[i]['substate']}</span></li>`)
    }
}

function update_internal_param(event){
    data = JSON.parse(event.data)
    internal_state.html(`<li>Laser: <span>${data['laser'][1]} (scan time: ${data['laser'][0]})</span></li>\
    <li>Odometry: <span>${data['odom'][1]} (scan time: ${data['odom'][0]})</span></li>\
    <li>Serial port: <span>${data['serial'][1]} (scan time: ${data['serial'][0]})</span></li>`
    )
}

function update_slam_param(event){
    data = JSON.parse(event.data)
    slam_param.html(`<li>State: <span>${data['state']}</span></li>\
    <li>Target point: <span>x = ${data['x_target']} y = ${data['y_target']} theta = ${data['theta_target']}</span></li>\
    <li>Current point: <span>x = ${data['x_real']} y = ${data['y_real']} theta = ${data['theta_real']}</span></li>`
    )
}

function start_stop_service(service_name,cmd){
    $.ajax({
        url: '/v1/services/'+service_name+'/'+cmd,
        dataType: 'text',
        cache: false,
        contentType: 'application/json',
        processData: false,
        data: '',                         
        type: 'post',
        success: function(script_response){
            console.log(script_response);
        },
        error:function(xhr, status, errorThrown) { 
            console.log(errorThrown+'\n'+status+'\n'+xhr.statusText); 
            } 
    });
}
