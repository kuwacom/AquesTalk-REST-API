const fs = require("fs")
const axios = require('axios');
const { exec } = require('child_process')
const express = require("express");
const iconv = require('iconv-lite');
const app = express();
const kLoger = require("./kloger");
const loger = new kLoger({
    info: true,
    debug: true,
    error: true 
});

// エラーハンドリング
process.on("uncaughtException", function(err) {
    loger.error(err)
})

const server = app.listen(30596,'0.0.0.0', () => {
    loger.info("AquesTalk HTTP API bind on "+server.address().address+":"+ + server.address().port);
});

app.get("/synthesize", async (req, res, next) => {
    let text = req.query.text
    let type = req.query.type
    let speed = req.query.speed
    if(!text){
        res.json({
            status:"error"
        })
        return
    }
    if(!speed){speed = 1}

    let url = encodeURI(`https://api.kuwa.app/voicevox/audio_query?text=${text}&speaker=0`)
    let response = await axios.post(url);
    text = response.data["kana"]

    const inTEMP = "./temp/"+Math.floor(Math.random() * ( 999999 - 100000 ) + 100000)
    const outTEMP = "./temp/"+Math.floor(Math.random() * ( 999999 - 100000 ) + 100000)
    // fs.writeFileSync(inTEMP,text,'sft-js')
    const writer = fs.createWriteStream(inTEMP);
    writer.write(iconv.encode(text, "Shift_JIS"));
    writer.end();
    const AquesTalkCMD = `AquesTalkCMD.exe ${type} ${speed*100} ${inTEMP} ${outTEMP}`
    exec(AquesTalkCMD, (err, stdout, stderr) => {
        if (err) {
            loger.error(err);
            return;
        }
        loger.debug(`audio query => ${text} : ${type} : ${speed}`);
        res.send(fs.readFileSync(outTEMP));
        fs.unlinkSync(inTEMP);
        fs.unlinkSync(outTEMP);
    })
});