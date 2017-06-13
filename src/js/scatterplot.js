let d3 = require("d3");
let setTooltip = require('./tooltip.js');
let util = require('./util.js');

class scatterplot {

    constructor(opts) {
        this.element = opts.element;
        this.data = opts.data;
        this.aspectHeight = opts.aspectHeight ? opts.aspectHeight : .6;
        this.onReady = opts.onReady;
        this.party = opts.party ? opts.party : null;
        this.popDomain = opts.popDomain ? opts.popDomain : [500000, 39250017];

        this.xCat = opts.xCat;
        this.yCat = opts.yCat;
        this.xDomain = [-.015, .15];
        this.yDomain = [-.015, .15];
        this.xMax = this.xDomain[1];
        this.yMax = this.yDomain[1];

        this.fipsLookup = opts.fipsLookup;

        this._setData();

    }


    _setData() {

        this.data.forEach(d => {
            d.xVal = +d[this.xCat] > this.xMax ? (this.xMax + .05) : +d[this.xCat];
            d.yVal = +d[this.yCat] > this.yMax ? (this.yMax + .05) : +d[this.yCat];
        });

        this.update();

    }

    _setDimensions() {
        // define width, height and margin
        this.breakpoint = window.innerWidth <= 375 ? "mobile" : window.innerWidth > 375 && window.innerWidth <= 621 ? "medium" : "large";

        this.mobile = window.innerWidth <= 375 ? true : false;

        this.xDomain = this.mobile ? [-.015, .15] : this.xDomain;
        this.aspectHeight = this.aspectHeight;

        this.margin = {
            top: 30,
            right: this.mobile ? 30 : 110,
            bottom: 45,
            left: 60
        };

        this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
        this.height = (this.element.offsetWidth * this.aspectHeight) - this.margin.top - this.margin.bottom; //Determine desired height here


    }


    update() {
        this._setDimensions();
        this._setScales();
        this.draw();
        this.onReady();
    }

    _setScales() {


        let circleRange = this.breakpoint === "mobile" ? [6, 40] :
            this.breakpoint === "medium" ? [5, 50] :
            [7, 70];

        let pctFormat = d3.format(".0%");

        // set the ranges
        this.xScale = d3.scaleLinear()
            .range([0, this.width])
            .domain(this.xDomain);

        this.yScale = d3.scaleLinear()
            .range([this.height, 0])
            .domain(this.yDomain);

        this.circleScale = d3.scaleSqrt()
            .range(circleRange)
            .domain(this.popDomain);

        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d => {
                return d > 0 ? `+${pctFormat(d)}` : pctFormat(d);
            })
            .ticks(5)
            .tickSize(-this.height);

        this.yAxis = d3.axisLeft(this.yScale)
            .tickFormat(d => {
                return d > 0 ? `+${pctFormat(d)}` : pctFormat(d);
            })
            .ticks(5)
            .tickSize(-this.width);

        this.voronoiDiagram = d3.voronoi()
            .x(d => {
                return this.xScale(d.xVal);
            })
            .y(d => {
                return this.yScale(d.yVal);

            })
            .size([this.width, this.height])(this.data);

    }

    draw() {

        this.element.innerHTML = "";

        d3.select(this.element).classed("scatterplot", true)
            .classed("is-mobile", this.mobile)
            .classed("has-tooltip", true);

        this.svg = d3.select(this.element).append('svg');

        this.tooltip = d3.select(this.element).append("div")
            .attr("class", "tooltip")
            .on("click", d => {
                this.setInactive();
            });

        this.setTooltip = setTooltip.init('.has-tooltip')

        //Set svg dimensions
        this.svg.attr('width', this.width + this.margin.left + this.margin.right);
        this.svg.attr('height', this.height + this.margin.top + this.margin.bottom);

        // create the chart group.
        this.plot = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
            .attr("class", "chart-g");

        // Add the X Axis
        this.plot.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", `translate(0,${this.height})`)
            .call(this.xAxis)
            .append("text")
            .classed("label", true)
            .attr("x", this.width / 2)
            .attr("y", 30)
            .style("text-anchor", "middle")
            .text("Health care jobs");

        // Add the Y Axis
        this.plot.append("g")
            .attr("class", "axis y-axis")
            .call(this.yAxis)
            .append("text")
            .classed("label", true)
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -50)
            .attr("dy", "0.71em")
            .attr("text-anchor", "middle")
            .text("People insured");

        this.plot.append("line")
            .attr("class", "zero-line")
            .attr("x1", 0)
            .attr("y1", this.yScale(0))
            .attr("x2", this.width)
            .attr("y2", this.yScale(0));

        this.plot.append("line")
            .attr("class", "zero-line")
            .attr("x1", this.xScale(0))
            .attr("y1", 0)
            .attr("x2", this.xScale(0))
            .attr("y2", this.height);

        this.drawDots();

    }

    drawDots() {

        let _this = this;

        console.log(this.data);

        let count = 0;

        this.dotsHere = this.plot.append("g")
            .classed("dots-g", true);

        this.colors = {
                dem: "#01356e",
                gop: "#b1290a"
            }
            // Add the scatterplot
        this.dots = this.dotsHere.selectAll(".dot")
            .data(this.data)
            .enter().append("circle")
            .attr("class", d => {
                return `dot ${d.winner2016}`;
            })
            .attr("fips", d => {
                return d.area_fips;
            })
            .attr("r", d => {
                return this.circleScale(+d["pop2016"] / Math.PI);
            })
            .attr("cx", d => {
                return this.xScale(d.xVal);
            })
            .attr("cy", d => {
                return this.yScale(d.yVal);
            });
        //.style("opacity", .9);

        // this.plot.selectAll(".st-label")
        //     .data(this.data)
        //     .enter().append("text")
        //     .attr("class", d=> {
        //         return `st-label ${d.winner2016}`;
        //     })
        //     .attr("x", d => {
        //         let val = +d[this.xCat] > this.xMax ? (this.xMax + .05) : +d[this.xCat]; 
        //         return this.xScale(val);
        //     })
        //     .attr("yc", d => {
        //         let val = +d[this.yCat] > this.yMax ? (this.yMax + .05) : +d[this.yCat]; 
        //         return this.yScale(val);
        //     })
        //     .attr("text-anchor", "middle")
        //     .text(d=> {
        //         return d.area_title;
        //     });

        this.drawVoronoi();

    }


    drawVoronoi() {

        // let labelList = ["Colorado", "California", "Texas", "Nevada", "Washington", "District of Columbia", "Arkansas", "Maine", "Wisconsin", "Vermont", "Alaska", "Delaware", "Florida", "Utah", "Massachusetts"];

        let labelList = ["Nevada", "California", "Colorado", "Texas", "Florida", "Arizona", "Kentucky", "Massachusetts", "Delaware", "Mississippi", "South Dakota", "Virginia", "Oregon", "West Virginia", "Washington"];

        // draw the polygons
        this.voronoiPolygons = this.plot.append('g')
            .attr('class', 'voronoi-polygons');

        let voronoiSeries = this.voronoiDiagram.polygons();

        const binding = this.voronoiPolygons.selectAll('path').data(voronoiSeries);

        binding.enter().append('path')
            .style('fill', "#fff")
            .style('stroke', 'tomato')
            .attr("fips", d => {
                return d.data.area_fips;
            })
            .style('opacity', 0)
            .attr('d', d => {
                return d ? `M${d.join('L')}Z` : ``;
            })
            .on("mouseover", d => {
                this.setActive(d.data.area_fips, this.mobile);
            })
            .on("mouseout", d => {
                this.setInactive(d.data.area_fips);
            });


        let labelSeries = voronoiSeries.filter(d => {
            //return d;
            return labelList.indexOf(d.data.area_title) > -1;
        });

        let theLabels = this.plot.append("g")
            .attr("class", "labels");

        let labels = theLabels.selectAll("g.label-g")
            .data(labelSeries)
            .enter().append("g")
            .attr("class", d => {

                let x = this.xScale(d.data[this.xCat]);
                let y = this.yScale(d.data[this.yCat]);

                var centroid = d3.polygonCentroid(d),
                    point = [x, y],
                    angle = Math.round(Math.atan2(centroid[1] - point[1], centroid[0] - point[0]) / Math.PI * 2);

                d.orient = angle === 0 ? "right" :
                    angle === -1 ? "top" :
                    angle === 1 ? "bottom" :
                    "left";

                d.orient = d.data.area_title === "Oregon" ? "right" : d.orient;
                d.orient = d.data.area_title === "Washington" ? "bottom" : d.orient;

                return "label-g label--" + d.orient;
            })
            .classed("default", d => {
                return d.default;
            })
            .attr("transform", d => {
                let r = this.circleScale(+d.data["pop2016"] / Math.PI);
                let xPos = this.xScale(d.data[this.xCat]);
                let yPos = this.yScale(d.data[this.yCat]);
                let x = d.orient === "left" ? xPos - r : d.orient === "right" ? xPos + r : xPos;
                let y = d.orient === "top" ? yPos - r : d.orient === "bottom" ? yPos + r : yPos;
                return `translate(${x},${y})`;
            });

        let pointerLength = 10;

        labels.append("line")
            .attr("x1", d => {
                return d.orient === "right" ? 0 : d.orient === "left" ? 0 : 0;
            })
            .attr("y1", d => {
                return d.orient === "bottom" ? 0 : d.orient === "top" ? 0 : 0;
            })
            .style("stroke", "#c2c2c2")
            .style("stroke-width", 1)
            .attr("x2", d => {
                return d.orient === "right" ? pointerLength : d.orient === "left" ? -pointerLength : 0;
            })
            .attr("y2", d => {
                return d.orient === "bottom" ? pointerLength : d.orient === "top" ? -pointerLength : 0;
            });

        labels.append("text")
            .attr("dy", d => {
                return d.orient === "left" || d.orient === "right" ? ".35em" : d.orient === "bottom" ? ".71em" : null;
            })
            .attr("x", d => {
                return d.orient === "right" ? pointerLength : d.orient === "left" ? -pointerLength : null;
            })
            .attr("text-anchor", d => {
                return d.orient === "right" ? "start" : d.orient === "left" ? "end" : "middle";
            })
            .attr("y", d => {
                return d.orient === "bottom" ? pointerLength : d.orient === "top" ? -pointerLength : null;
            })
            .style("font-size", 10)
            .text(d => {
                let fips = d.data.area_fips;
                let name = this.fipsLookup[fips].ap;
                return `${name}`;
            });


    }


    setActive(fips, dd) { //(tooltip, boolean) Check if triggered from dropdown

        this.voronoiPolygons.classed("disabled", dd);
        this.tooltip.classed("persistent", dd);

        let datum = this.plot.selectAll(`.dot[fips='${fips}']`).datum();

        let xPos = this.xScale(datum.xVal) + this.margin.left;
        let yPos = this.yScale(datum.yVal) + this.margin.top;

        this.setTooltip.position(datum, [xPos, yPos], {
            width: this.width,
            height: this.height
        });

        d3.select(`.dot[fips='${fips}']`).moveToFront();
        this.plot.selectAll(".dot").classed("inactive", true);
        d3.select(`.dot[fips='${fips}']`).classed("active", true).classed("inactive", false);
    }

    setInactive(fips) {
        this.setTooltip.deposition();
        d3.select(`.dot[fips='${fips}']`).moveToBack();
        this.plot.selectAll(".dot").classed("active", false).classed("inactive", false);
        d3.select(`.dot`).classed("inactive", false);
        this.voronoiPolygons.classed("disabled", false);
        this.tooltip.classed("persistent", false);
    }


}



function numberWithCommas(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* HELPER FUNCTIONS */
//Move to front and back controls z-index of features on mouseover and mouseout.
d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

d3.selection.prototype.moveToBack = function() {
    return this.each(function() {
        const firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};



export default scatterplot;