var Twit = require('twit');
var T = new Twit({
  consumer_key:         /*twitter consumer key(from twitter developer portal)*/'',
  consumer_secret:      /*twitter consumer_secret key*/'',
  access_token:         /*twitter access_token*/'',
  access_token_secret:  /*twitter access_token_secret*/'',
  timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

const { Client } = require('tmi.js');
const tmi = require('tmi.js')
const twitchChannel = /*broadcaster NAME*/''
const client = new tmi.Client({
    options: { debug: true},
     identity: {
         username: /*twitch BOT account name*/'',
         password: /*twitch BOT oauth code*/''
    },
        channels: [twitchChannel]
    });

client.connect();

let input, id_str = '';
var post = '';
client.on('message', (channel, tags, message, self) => {
    if(blackList(channel, tags, message.toLowerCase()) || self){
        return;
    }
    //finds the command
    input = message.split(' ');
    //sets the frist word as input e.g !tweet
    let command = input[0];
    
    for(var i = 1; i < input.length; i++){
        //sets everything after the first word as what to post (the variable post is used in multiple methods so be careful if you change the name)
        post += input[i] + ' ';
    }
    //console.log(post);
    switch (command.toLowerCase()){
        case ('!tweet'):
            tweet(channel, tags, post);
            break;
        case('!deltweet'): //e.g. !deltweet (id) //the id gets pasted into the twitch chat so you can quickly delete any tweets that you dont like 
            if(`${tags.mod}`){
                delTweet(channel, tags, post);
            }else{
                client.say(channel, 'You do not have permission to delete tweets!');
            }
            break;
        case ('!dellasttweet'): //e.g. !dellasttweet //this will delete the most recent one. 
            if(`${tags.mod}`){
                delLastTweet(channel, tags);
            }else{
                client.say(channel, 'You do not have permission to delete tweets!');
            }
            break;
        case ('!clear'): //basically is just the /clear command but with !clear, this is just to show how easy it is to create commands. (this isnt needed if you have nightbot installed)
            if(`${tags.mod}`){
                client.clear(channel);
            }else{
                client.say(channel, 'You do not have permission to clear chat!');
            }
            break;
        default: 
            if(command.charAt(0) === '!'){
                client.say(channel, `${tags.username} the command you input not exist!`);
            }else{
                break;
            }
    }
});



function tweet(channel, tags, message){
    post += "\n\n" + 'This message was tweeted by ' + `${tags.username}` + ' at https://www.twitch.tv' + twitchChannel;
    T.post('statuses/update', { status: post }, function(err, data, response) {
        id_str = data.id_str;
        client.say(channel, 'The id for post of ' + `@${tags.username}` + ' is ' + id_str);
    })
}

function delTweet(channel, tags, message){
    T.post('statuses/destroy/:id', { id: message }, function(err, data, response){
        client.say(channel, 'Post ' + /*id of twitter post ->*/id_str + ' was deleted by ' + `@${tags.username}`);
    })
}

function delLastTweet(channel, tags){
    T.post('statuses/destroy/:id', { id: id_str }, function(err, data, response){
        client.say(channel, 'Post ' + /*id of twitter post ->*/id_str + ' was deleted by ' + `@${tags.username}`);
    })
}

function blackList(channel, tags, message){
    const regexp = /*put blacklisted terms in lower case separated by |*// /;
    if(regexp.test(message)){
        client.say(channel, `@${tags.username}, A term you tweeted was blacklisted!`);
        client.timeout(channel, `@${tags.username}`, 300, 'Tried tweeting a blacklisted term!');
        return true;
    }else{
       return false;
    }
}
