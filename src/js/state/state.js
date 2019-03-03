
function State(data) {
	// Internal true source of state, copy to prevent mutation of the 
	// initial data
	let state = Object.assign({ }, data);
	
	const stateProxy = new Proxy(state, {
		set: onModify
	});
	const subscribers = [];

	// Freeze to prevent mutation of the state property directly
	return Object.freeze({
		state: stateProxy,
		subscribe
	});

	function onModify(object, property, value) {
		if (state[property] === value) {
			// No change
			return true;
		}

		if (!state.hasOwnProperty(property)) {
			console.warn(`Update of undefined property "${property}". Consider defining an initial state.`);
		}

		state[property] = value;

		publish({ [property]: value });

		return true;
	}

	function subscribe(handler) {
		subscribers.push(handler);
	}

	function publish(change) {
		const frozenState = Object.freeze(Object.assign({ }, state));
		const frozenChange = Object.freeze(Object.assign({ }, change));
		let subscriber;

		for (subscriber of subscribers) {
			subscriber(frozenState, frozenChange);
		}		
	}
}

// Export wrapped to be able to spy on that function in specs
export const StateModule = { State };
