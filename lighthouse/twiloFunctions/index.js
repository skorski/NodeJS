
module.exports = {
checkVerified: function (socket, verified, number) {
	if (verified == true) {
		socket.emit('reset');
		socket.emit('update', {message: "You have already verified " + number + "!"});
		return true;
	}
	return false;
}

};
