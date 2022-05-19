//Update tracking cookie with website metrics

//Metrics include:
//- Page visited
//- Time of visit
//- How long the user stays on the page for
//- Name of user visited (if logged in)
//- CRUD action, if any
//- User agent information (browser, operating system, etc)
function updateTracker(request, response, metrics) {
    let original = []; // On first-use will be an empty array to which we add one thing later on
	
    //If there is a stored tracking cookie, then get its value
    if (request.cookies) {
        const trackedValue = request.cookies['tracking'];
        if (trackedValue) {
            //Get the object by converting the JSON
            original = JSON.parse(trackedValue);
        }
    }
	
    //Add tracking information to the end of the array of values
    original.push(metrics);

    //Convert object to JSON to store in the cookie
    const newTracked = JSON.stringify(original);

    //Set an expiry date as late as possible (special value for year 2038, beyond which there can be browser issues)
    const expiresAt = new Date(2147483647000);
	
    //Update tracking cookie (Will also create it on first use)
    response.cookie("tracking", newTracked, { expires: expiresAt })
}

module.exports = {
    updateTracker
}