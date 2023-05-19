module.exports = function friendlistFix(d) {

	const path = require('path');
	
	d.dispatch.addDefinition('S_FRIEND_LIST', 99, path.join(__dirname, './S_FRIEND_LIST.99.def'), true);
	d.dispatch.addDefinition('S_UPDATE_FRIEND_INFO', 99, path.join(__dirname, './S_UPDATE_FRIEND_INFO.99.def'), true);

	let requestRefresh = undefined;
	let friendlist = undefined;
	let incomingRequest = false;
	let updateFriends = false;

	d.hook('S_SELECT_USER', '*', () => {
		incomingRequest = false;
	});

	d.hook('S_LOAD_TOPO', '*', () => {
		d.send('S_FRIEND_LIST', '*', {
			personalNote: '',
			friends: []
		});
	});

	d.hook('S_FRIEND_LIST', 99, event => {
		friendlist = event;
		incomingRequest = false;

		for (let i = 0; i < friendlist.friends.length; i++){
			if (friendlist.friends[i].type == 2) incomingRequest = true;
		};

		d.send('S_FRIEND_LIST', 99, {
			personalNote: '',
			friends: []
		});
	});

	d.hook('S_FRIEND_LIST', 99, {filter:{fake: true}}, () => {
		if (incomingRequest && !requestRefresh) return false;
	});

	d.hook('C_UPDATE_FRIEND_INFO', '*', () => {
		updateFriends = true;

		d.send('S_FRIEND_LIST', 99, {
			personalNote: '',
			friends: []
		});
	});

	d.hook('S_UPDATE_FRIEND_INFO', 99, event => {
		if (!updateFriends) {
			if (event.friends != 0 && event.friends[0].status == 0) {
				d.send('S_DUNGEON_EVENT_MESSAGE', '*', {
					type: 1,
					chat: 0,
					channel: 27,
					message: `${event.friends[0].name} has come online.`
				});
			};
			return false;
		};

		if (friendlist == undefined) return;

		if (incomingRequest) requestRefresh = true;

		d.send('S_FRIEND_LIST', 99, {
			personalNote: friendlist.personalNote,
			friends: friendlist.friends
		});

		updateFriends = false;
		requestRefresh = false;
	});

	d.hook('S_RESULT_CHANGE_MY_PROFILE', '*', event => {
		friendlist.personalNote = event.text;
	});

	d.hook('S_DELETE_FRIEND', '*', event => {
		for (let i = 0; i < friendlist.friends.length; i++){
			if (friendlist.friends[i].playerId === event.id) friendlist.friends.splice(i, 1);
		};
	});

	d.hook('C_EDIT_FRIEND_GROUP', '*', event => {
		for (let i = 0; i < friendlist.friends.length; i++){
			if (friendlist.friends[i].playerId === event.friends[0].playerId) {
				friendlist.friends[i].group = event.id;
			};
		};
	});

	d.hook('C_ADD_FRIEND_GROUP', '*', event => {
		let counter = 0;
		for (let i = 0; i < friendlist.friends.length; i++){
			if (friendlist.friends[i].playerId === event.friends[counter]) {
				friendlist.friends[i].group = event.id;
				counter++;
			};
		};
	});

	//Save and reload in game
	this.saveState = () => {
        console.log("Reloading reset")
    };
    this.loadState = state => {
        console.log("Finished reloading.")
    };
    this.destructor = () => {};
	
}