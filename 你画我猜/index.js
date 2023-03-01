const express = require("express");
const app = express();
app.use(express.static("www"));

const server = app.listen(3000, function () {
    console.log("服务器启动成功");
});

// 请求 WebSocket 模块
const WebSocket = require("ws")
// 创建 WebSocket 服务对象
const websocket = new WebSocket.Server({
    server: server
})
let userList = [];
let shangcList = []
websocket.on("connection", (ws, req) => {
    console.log(req.connection.remoteAddress + '偷偷溜了进来');
    if (req.connection.remoteAddress === '::ffff:192.168.124.13') {
        let data = {
            type: 'caog',
            caog: true,
        }
        ws.send(JSON.stringify(data))
    }
    let ip = req.connection.remoteAddress
    ws.ip = ip
    let nickname = decodeURI(req.url.substring(1))
    ws.nickname = nickname

    userList.forEach(item => {
        let data = {
            type: 'in-out',
            nickname: nickname,
            content: '进入聊天室'
        }
        item.send(JSON.stringify(data))
    })
    // 把自己也假如到列表
    userList.push(ws)
    
    // 通知所有人目前聊天室在线人数
    userList.forEach(item => {
        let data = {
            type: 'welcome',
            content: '欢迎来到你画我猜,目前场中人数:' + userList.length + '人'
        }
        item.send(JSON.stringify(data))
    })

    ws.on('message', data => {

        let dataObj = JSON.parse(data)
        // 上场
        if (dataObj.shangc) {
            ws.vip = true
        } else {
            ws.vip = false
        }
        switch (dataObj.type) {
            case "group":
                userList.forEach(item => {
                    let data = {
                        type: 'group',
                        content: dataObj.data,
                        nickname: ws.nickname,
                        ip: ws.ip,
                    }
                    item.send(JSON.stringify(data))
                })
                break;
            case "down":
                userList.forEach(item => {
                    let data = {
                        type: 'down',
                        x1: dataObj.data.x1,
                        y1: dataObj.data.y1,
                    }
                    item.send(JSON.stringify(data))
                })
                break;
            case "shangc":
                shangcList.push(ws)
                if (shangcList.length === 1) {
                    shangcList[0].vip = true
                } else {
                    shangcList.forEach(item => {
                        item.vip = false
                    })
                    shangcList[0].vip = true
                }

                shangcList.forEach(item => {
                    let data = {
                        type: 'shangc',
                        vip: item.vip,
                        nickname: ws.nickname,
                    }
                    item.send(JSON.stringify(data))
                })
                break;
            case "move":
                userList.forEach(item => {
                    let data = {
                        type: 'move',
                        x: dataObj.data.x,
                        y: dataObj.data.y,
                        w: dataObj.data.w,
                        c: dataObj.data.c
                    }
                    item.send(JSON.stringify(data))
                })
                break;
            case "clear":
                userList.forEach(item => {
                    let data = {
                        type: 'clear',
                    }
                    item.send(JSON.stringify(data))
                })
                break;
            default:
                break;
        }
    })

})


