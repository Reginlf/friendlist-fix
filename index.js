module.exports = function friendlistFix(d) {

	let friendlist = undefined;
	let updateFriends = false;
	let saveFriendlist = false;

	d.hook('S_LOAD_TOPO', '*', () => {
		d.send('S_FRIEND_LIST', '*', {
			personalNote: '',
			friends: []
		});
	});

	d.hook('S_SELECT_USER', '*', () => {
		saveFriendlist = true;
	});

	d.hook('S_FRIEND_LIST', '*', event => {
		if (!saveFriendlist) return;
		friendlist = event;
		saveFriendlist = false;

		d.send('S_FRIEND_LIST', '*', {
			personalNote: '',
			friends: []
		});
	});

	d.hook('C_UPDATE_FRIEND_INFO', '*', () => {
		updateFriends = true;

		d.send('S_FRIEND_LIST', '*', {
			personalNote: '',
			friends: []
		});
	});

	d.hook('S_UPDATE_FRIEND_INFO', '*', event => {
		if (!updateFriends) {
			if (event.friends[0].status == 0) {
				d.send('S_DUNGEON_EVENT_MESSAGE', '*', {
					type: 1,
					chat: 0,
					channel: 27,
					message: `${event.friends[0].name} has come online.`
				});
			};
			return false;
		};

		d.send('S_FRIEND_LIST', '*', {
			personalNote: friendlist.personalNote,
			friends: friendlist.friends
		});

		updateFriends = false;
	});
	
}