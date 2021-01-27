var express = require('express');
const axios = require('axios');
var router = express.Router();
var FormData = require('form-data');

const branches_api = process.env.BRANCHES_API;
const authToken = process.env.AUTH_TOKEN;
const triggerToken = process.env.TRIGGER_TOKEN;
const trigger_api = process.env.TRIGGER_API;

function generateSuccessReply(user_id, ticket, ref){
    return {
        "replace_original": true,
        "text": `${user_id} Your request is submitted. Relax :coffee:  while I build the Apk for you!\n >This usually takes 4-5 minutes. I *will ping you* once its done.\n >Your ticket - ${ticket} \n >Branch Selected - *${ref}*`
      }
}

router.get('/', function(req, res, next) {
    
});

router.post('/get_apk',function(req,res) {
    try {
        axios.get(branches_api, { 'headers': { 'PRIVATE-TOKEN': authToken } })
        .then(response => {
            const user_id = `<@${req.body.user_id}>`;
            const channel_id = req.body.channel_id;

            const branch_list = [];
            for (let index = 0; index < response.data.length; index++) {
                const temp = response.data[index];
                const branch = {
                    text: temp.name,
                    value: temp.name
                };
                branch_list.push(branch);
            }

            const final_response = {
                response_type: 'in_channel',
                channel: channel_id,
                text: `Hey ${user_id} ..,`,
                attachments: [{
                  text: 'Where can I get the Apk for you?',
                  fallback: 'Where can I get the Apk for you?',
                  color: '#2c963f',
                  attachment_type: 'default',
                  callback_id: 'query_selection',
                  actions: [{
                    name: 'query_select_menu',
                    text: 'Choose an branch...',
                    type: 'select',
                    options: branch_list,
                  }],
                }],
              };
              return res.json(final_response);
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).send('Something went wrong :(');
        });
      } catch (err) {
        console.log(err);
        return res.status(500).send('Something went wrong :(');
      }
});

router.post('/actions', async (req,res) => {
    try {
        const payload = JSON.parse(req.body.payload);

        if (payload.callback_id === 'query_selection') {
            const branch_selected = payload.actions[0].selected_options[0].value;
            const user_id = `<@${payload.user.id}>`;
            const channel_id = payload.channel.id;

            var bodyForm = new FormData();
            bodyForm.append('token', triggerToken);
            bodyForm.append('ref', branch_selected);
            bodyForm.append('variables[SLACK_REFERRER_ID]', user_id);
            bodyForm.append('variables[SLACK_CHANNEL_ID]', channel_id);

            axios({
                method: 'post',
                url: trigger_api,
                data: bodyForm,
                headers: bodyForm.getHeaders()
                })
                .then(function (response) {
                    const ticket = response.data.id;
                    const ref = response.data.ref;
                    return res.send(generateSuccessReply(user_id, ticket, ref));
                })
                .catch(function (response) {
                    console.log(response);
                    return res.send('Something went wrong! Try Again!');
                });
        }else{
            return res.send('Something went wrong! Try Again!');
        }
      } catch (err) {
        console.log(err);
        return res.status(500).send('Something went wrong :(');
      }
});

router.post('/help',function(req,res) {
    try {
        //add logic here
      } catch (err) {
        console.log(err);
        return res.status(500).send('Something went wrong :(');
      }
});

router.post('/get_status',function(req,res) {
    try {
        //add logic here
      } catch (err) {
        console.log(err);
        return res.status(500).send('Something went wrong :(');
      }
});

module.exports = router;
