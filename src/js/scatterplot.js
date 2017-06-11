let d3 = require("d3");

class scatterplot {

    constructor(opts) {
        this.element = opts.element;
        this.dataUrl = opts.dataUrl;
        this.aspectHeight = opts.aspectHeight ? opts.aspectHeight : .6;
        this.onReady = opts.onReady;
        this.party = opts.party ? opts.party : null;


        this.xCat = opts.xCat;
        this.yCat =  opts.yCat;
        this.xDomain = [-.02, .2];
        this.yDomain = [-.02, .2];
        this.xMax = this.xDomain[1];
        this.yMax = this.yDomain[1];

        this._setData();


    }


    _setData() {

        d3.csv(this.dataUrl, (error, data) => {

            this.data = data;

            this.popDomain = d3.extent(data, d=> {
                return +d["pop2016"];
            });

            this.popDomain = [500000, 39250017];

            this.update();

        });

    }

    _setDimensions() {
        // define width, height and margin

        this.mobile = window.innerWidth <= 375 ? true : false;

        this.margin = {
            top: 30,
            right: 30,
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

        let pctFormat = d3.format(".0%");

        // set the ranges
        this.xScale = d3.scaleLinear()
            .range([0, this.width])
            .domain(this.xDomain);

        this.yScale = d3.scaleLinear()
            .range([this.height, 0])
            .domain(this.yDomain);

        this.circleScale = d3.scaleSqrt()
            .range([6,100])
            .domain(this.popDomain);

        this.xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d=> {
                return d > 0 ? `+${pctFormat(d)}` : pctFormat(d);
            })
            .ticks(5)
            .tickSize(-this.height);

        this.yAxis = d3.axisLeft(this.yScale)
            .tickFormat(d=> {
                return d > 0 ? `+${pctFormat(d)}` : pctFormat(d);
            })
            .ticks(5)
            .tickSize(-this.width);


    }

    draw() {



        this.element.innerHTML = "";

        d3.select(this.element).classed("scatterplot", true)
            .classed("is-mobile", this.mobile);

        this.svg = d3.select(this.element).append('svg');

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
            .attr("x", this.width/2)
            .attr("y",30)
            .style("text-anchor", "middle")
            .text("Health care jobs");

        // Add the Y Axis
        this.plot.append("g")
            .attr("class", "axis y-axis")
            .call(this.yAxis)
            .append("text")
            .classed("label", true)
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height/2)
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

        let count = 0;
        let nonSupressed = this.data.filter(d => {

            if (d.hcChg === "na") {
                count++;
            }

            return d.hcChg !== "na";
        });

        console.log(count);

        this.colors = {
                dem: "#01356e",
                gop: "#b1290a"
            }
            // Add the scatterplot
        this.plot.selectAll(".dot")
            .data(this.data)
            .enter().append("circle")
            .attr("class", d=> {
                return `dot ${d.winner2016}`;
            })
            .attr("r", d=> {

                console.log(this.circleScale( +d["pop2016"] / Math.PI ));

                return this.circleScale( +d["pop2016"] / Math.PI ); 
            })
            .attr("cx", d => {
                let val = +d[this.xCat] > this.xMax ? (this.xMax + .05) : +d[this.xCat]; 
                return this.xScale(val);
            })
            .attr("cy", d => {
                let val = +d[this.yCat] > this.yMax ? (this.yMax + .05) : +d[this.yCat]; 
                return this.yScale(val);
            })
            .style("opacity", .7)
            .on("click", d=> {
                console.log(d);
            });

        this.plot.selectAll(".st-label")
            .data(this.data)
            .enter().append("text")
            .attr("class", d=> {
                return `st-label ${d.winner2016}`;
            })
            .attr("x", d => {
                let val = +d[this.xCat] > this.xMax ? (this.xMax + .05) : +d[this.xCat]; 
                return this.xScale(val);
            })
            .attr("y", d => {
                let val = +d[this.yCat] > this.yMax ? (this.yMax + .05) : +d[this.yCat]; 
                return this.yScale(val);
            })
            .attr("text-anchor", "middle")
            .text(d=> {
                return d.area_title;
            });

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