const d3 = require("d3");

import scatterplot from "./scatterplot";
import searchBar from "./searchBar";
import fipsLookup from "../data/fips.json";

//var setupVisualsGoogleAnalytics = require('./analytics.js').setupVisualsGoogleAnalytics;
//var trackEvent = require('./analytics.js').trackEvent;

var pym = require('pym.js');

var pymChild = null;

document.addEventListener("DOMContentLoaded", main());

function main() {
    var pymChild = new pym.Child();
    let statesScatterplot;

    d3.csv(`data/states_data.csv`, (error, data) => {

        data.forEach(d=> {
            d.area_fips = pad(d.area_fips, 2);
        });

        statesScatterplot = new scatterplot({
            element: document.querySelector(`.well.states .chart`),
            data: data,
            party: "dem",
            aspectHeight: .75,
            xCat: "hcChg",
            yCat: "insChg",
            fipsLookup : fipsLookup,
            popDomain: d3.extent(data, d => {
                return +d["pop2016"];
            }),
            onReady: function() {
                console.log(this.data);
            }
        });

        let statesArray = [];
        data.forEach(d => {
            statesArray.push(d.area_title);
        });

        let dropdown = new searchBar({
            vizData: data,
            selector: ".header-search",
            placeholder: "Search for a state...",
            noResultsText: "No match found",
            context: statesScatterplot
        });




        // var sp = statesScatterplot;

        // let keyVals = [1000000, 5000000, 10000000];

        // let key = d3.select(".key-test")
        //     .append("svg")
        //     .attr("width", 100)
        //     .attr("height", 100);

        // key.selectAll(".key-item")
        //     .data(keyVals).enter()
        //     .append("circle")
        //     .attr("cx", d=> {
        //         return sp.circleScale(10000000) + 5;
        //     })
        //     .attr("cy", d=> {
        //         return 90 - sp.circleScale(d);
        //     })
        //     .attr("r", d=> {
        //         return sp.circleScale(d);
        //     });

    });






    // var statesScatterplot = new scatterplot({
    //     element: document.querySelector(`.well.states .chart`),
    //     dataUrl: `data/states_data.csv`,
    //     party: "dem",
    //     aspectHeight: 1,
    //     xCat: "hcChg",
    //     yCat: "insChg",
    //     onReady: function() {
    //         console.log(this.data);
    //     }
    // });



    d3.select(window).on("resize", d => {
        // gopScatterplot.update();
        // demScatterplot.update();
        statesScatterplot.update();

        console.log(statesScatterplot.breakpoint);


    });

}


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}










