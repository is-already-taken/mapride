
// Export wrapped to be able to spy on that function in specs.
// Provide facade of browser methods for testing because we can't spy on 
// properties because they're not configurable.
export const BrowserFacade = {
	getLocationHash() {
		return window.location.hash;
	}
};
