// let util = require('./util.js')
const d3 = require("d3");

let getQuad = (coords,size) => {

	console.log(coords, size);
	//console.log(coords, size);

	let l = []

	if (coords[1] > size[1]/2) {
		l.push('s')
	} else {
		l.push('n')
	}

	if (coords[0] > size[0]/2) {
		l.push('e');
	}

	// if (coords[0] < -size[0]/2) {
	// 	l.push('w');
	// }

	if (coords[0] < size[0]/2) {
		l.push('w');
	}

	return l.join('');

}


function numberWithCommas(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

let pctFormat = d3.format(".0%");

let init = function(ttDiv) {

	let theTooltip = d3.select(ttDiv).select('.tooltip')
	let fields = theTooltip.selectAll('.tt-update')

	let updateFields = function(data) {
		fields.each(function() {
			let f = d3.select(this)
			let o = this.dataset
			if (o.format) {
				f.text(formats[o.format](data[o.field]))
			} else {
				f.text(data[o.field])
			}
		});
	}

	let position = function(data,coords,settings) {

		//console.log(coords, settings);

		let region = getQuad(coords,[(settings.width),(settings.height)])

		//updateFields(data);

		//console.log(region);

		//area_title,pop2016,area_fips,hc2010,hc2015,ins2010,ins2015,hcChg,insChg,winner2016

		theTooltip
			.classed('tooltip-active',true)
			.classed('tooltip-' + region, true)
			.style('left', coords[0] + 'px')
			.style('top', coords[1] + 'px')
			.html(d=> {
				return `<div class="tooltip-inner">
							<div class="close-button">×</div>
							<h4 class="tt-header">${data.area_title}</h4>
							<div class="tt-row with-rule subhead">
								<strong>Total insured</strong>
							</div>
							<div class="tt-row with-rule">
								<strong>2015:</strong>
								<span>${numberWithCommas(data.ins2015)}</span>
							</div>
							<div class="tt-row">
								<strong>Change from 2010:</strong>
								<span>${pctFormat(data.insChg)}</span>
							</div>
							<div class="tt-row with-rule subhead">
								<strong>Health care jobs</strong>
							</div>
							<div class="tt-row with-rule">
								<strong>2015:</strong>
								<span>${numberWithCommas(data.hc2015)}</span>
							</div>
							<div class="tt-row">
								<strong>Change from 2010:</strong>
								<span>${pctFormat(data.hcChg)}</span>
							</div>
						</div>`
				});


	}

	let deposition = function() {
		
		theTooltip.attr('class','tooltip')

	}
	
	return {position, deposition, updateFields}
}

module.exports = {init}