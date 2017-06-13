let makeSettings = function() {

	let ww = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    let width = function() {
        if (ww > 950) {
            return 950
        } else {
            return ww
        }
    }()

    let height = function() {

        if (width < 500) {
            return width * 1.05
        } else {
            return width * .6
        }

    }()

    let singleCell = function() {

        if (width < 500) {
            return width * .07
        } else {
            return width * .05
        }

    }()

    return {width,height,singleCell}

}

module.exports = {makeSettings}