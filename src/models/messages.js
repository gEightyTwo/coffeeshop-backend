const db = require('../../db')
const st = require('knex-postgis')(db)
console.log(st);
const bcrypt = require('bcrypt-as-promised')
const userModel = require('./users')
// const location = '47.633199 -122.317607'
// const currentLocation = '47.598886, -122.333791' // galvanize
// const currentLocation = '47.627161, -122.334172' // slu
const currentLocation = '47.595025, -122.331759' // century link field
// const currentLocation = '0, 0'



function create(message,location,id){
    location = location.split(', ').join(' ')
    return (
      db('messages')
      .insert({ users_id: id, message, location: st.geography(st.geomFromText(`Point(${location})`, 4326)) })
      .returning('*')
    )
}
//
// function distance(distance){
//   console.log(distance);
//   let friends = db('users_users').where('users_id', 1)
//   return friends
//   .then(()=> return (
//     db.raw(`SELECT *
//         FROM messages
//         where ST_DWithin(messages.location, ST_MakePoint(${currentLocation})::geography, ${distance})`)
//   ))
//   .then(messages=>messages.filter(message.))
// }
//
//
// function distance(distance){
//   console.log(distance);
//   return (
//     // db('messages')
//     // // .where({location})
//     // .returning('*')
//     db.raw(`SELECT *
//         FROM messages
//         where ST_DWithin(messages.location, ST_MakePoint(${currentLocation})::geography, ${distance})`)
//   )
// }




function distance(distance, id, onlyFriends = false,onlyMine = false){
  if (onlyFriends) {
    let localMessages
    let myFriends
    return (
      db.raw(`SELECT *
          FROM messages
          where ST_DWithin(messages.location, ST_MakePoint(${currentLocation})::geography, ${distance})`)
    )
    .then(messages => {
      localMessages = messages.rows
      // console.log(localMessages.filter(message => message.id == 1));
      return db('users_users').where('users_id', id)
    })
    .then(friends => {
      myFriends = friends
      return localMessages.filter(message => friends.some(friend => message.users_id === friend.friends_id))
    })
  } else if (onlyMine) {
    let localMessages
    let myFriends
    return (
      db.raw(`SELECT *
          FROM messages
          where ST_DWithin(messages.location, ST_MakePoint(${currentLocation})::geography, ${distance})`)
    )
    .then(messages => {
      return messages.rows.filter(message => message.users_id == id)
    })
  } else {
    let msg
    return (
      db.raw(`SELECT *
          FROM messages
          where ST_DWithin(messages.location, ST_MakePoint(${currentLocation})::geography, ${distance})`)
    )
    .then(messages => {
      // localMessages = messages.rows
      // console.log(localMessages);
      msg = messages.rows
      return db('users').select('id', 'username')
    })
    .then(users => {
      console.log(users);
      // console.log(users[0].id, msg[0]);

      const msgWithUsername = msg.map(message => {
        message.username = users.find(user => user.id == message.users_id).username
        return message
      })
      console.log(msgWithUsername);
      return msg
    })
  }
}

//
// function distance(distance,id=1){
//   console.log(distance)
//   let mymessages
//   console.log(db.raw(`SELECT * FROM messages
//       ST_DWithin(messages.location, ST_MakePoint(${currentLocation})::geography, ${distance})`));
//   return (
//     db.raw(`SELECT * FROM messages
//         ST_DWithin(messages.location, ST_MakePoint(${currentLocation})::geography, ${distance})`)
//   )
//   .then((messages)=> {
//     mymessages = messages
//     return db('users_users').where('users_id', id)
//   })
//   .then(friends => {
//     return mymessages.filter((message) => {
//       return friends.some(friend => friend.friends_id === message.user_id )
//     })
//   })
// }



module.exports = {
  create,
  distance
}
