const d3 = require("d3");

import scatterplot from "./scatterplot";

//var setupVisualsGoogleAnalytics = require('./analytics.js').setupVisualsGoogleAnalytics;
//var trackEvent = require('./analytics.js').trackEvent;

var pym = require('pym.js');

var pymChild = null;

document.addEventListener("DOMContentLoaded", main());

function main() {
    var pymChild = new pym.Child();

    // var gopScatterplot = new scatterplot({
    //     element: document.querySelector(`.well.gop .chart`),
    //     dataUrl: `data/output_data.csv`,
    //     party: "gop",
    //     aspectHeight: 1,
    //     xCat: "hcChg",
    //     yCat: "insChg",
    //     onReady: function() {
    //         console.log("ready");
    //     }
    // });

    // var demScatterplot = new scatterplot({
    //     element: document.querySelector(`.well.dem .chart`),
    //     dataUrl: `data/output_data.csv`,
    //     party: "dem",
    //     aspectHeight: 1,
    //     xCat: "hcChg",
    //     yCat: "insChg",
    //     onReady: function() {
    //         console.log("ready");
    //     }
    // });

    var statesScatterplot = new scatterplot({
        element: document.querySelector(`.well.states .chart`),
        dataUrl: `data/states_data.csv`,
        party: "dem",
        aspectHeight: 1,
        xCat: "hcChg",
        yCat: "insChg",
        onReady: function() {
            console.log(this.data);
        }
    });



    d3.select(window).on("resize", d => {
        // gopScatterplot.update();
        // demScatterplot.update();
        statesScatterplot.update();
    });

}