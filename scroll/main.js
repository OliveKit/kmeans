const cluster_size = 5;
const point_color = "black";
const cluster_color = "red";
const nb_clusters = 5;
const point_size = 5;
const nb_points = 1000;
const data_noise = 2;

const canvas_x = 750;
const canvas_y = 550;

let points;
let cluster_centers;

function init_centers(points) {
    let temp_points = points.slice();
    temp_points = d3.shuffle(temp_points);
    return temp_points.slice(0, nb_clusters);
}

function gaussianRand(theta=4) {
    let rand = 0;
    for (let i = 0; i < theta; i += 1) {
        rand += Math.random();
    }
    return rand / theta;
}

function isInsideCanvas(point){
    if (point.x < 0 || point.x > canvas_x){return false;}
    if (point.y < 0 || point.y > canvas_y){return false;}
    return true;
}

function createCloud(nb_c=nb_clusters, nb_p=nb_points, c_dis=data_noise){
    let new_points = [];
    let clusters = [];
    for (let c =0; c < nb_c; ++c){
        clusters.push({x: Math.random()*canvas_x, y: Math.random()*canvas_y});
    }

    for (let p = 0; p < nb_p/nb_c; ++p ){
        for (let c of clusters){
            let new_point = {x: c.x + c_dis*100*(gaussianRand()-0.5), y: c.y + c_dis*100*(gaussianRand()-0.5)};
            if(isInsideCanvas(new_point)){
                new_points.push(new_point)
            }
        }
    }
    return new_points;
}

function computerClouds(points, cluster_centers){
    let cluster_points = []; // stores all the points to its cluster_points
    for (let cluster_idx=0; cluster_idx < nb_clusters; ++cluster_idx){
        let c_points = [];
        cluster_points.push(c_points);
    }

    for (let p of points) {
        let dist = [];
        for (let c of cluster_centers) {
            let distance =Math.hypot(p.x - c.x, p.y - c.y);
            if (isNaN(distance)){distance = 0}
            dist.push(distance);
        }

        let nearest_cluster = dist.indexOf(Math.min(...dist)); //min dist
        cluster_points[nearest_cluster].push(p);
        // Il faut l'info sur les centres (quel point à quel centre au niveau des points pour la visu)
        p.center = nearest_cluster;
    }
    return cluster_points;
}

/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */

let scrollVis = function () {

    const margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = canvas_x - margin.left - margin.right,
        height = canvas_y - margin.top - margin.bottom;

    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    let lastIndex = -1;
    let activeIndex = 0;

    // main svg used for visualization
    let svg = null;

    // d3 selection that will be used
    // for displaying visualizations
    let g = null;

    // Generate color map and colors
    let cm = d3.scaleLinear().domain([0, nb_clusters])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb('#00bfff'), d3.rgb('#DC143C')]);
    let colors = [];
    for (let c = 0; c < nb_clusters; ++c ){
        colors.push(cm(c));
    }

    // When scrolling to a new section
    // the activation function for that
    // section is called.
    let activateFunctions = [];
    // If a section has an update function
    // then it is called while scrolling
    // through the section with the current
    // progress through the section.
    let updateFunctions = [];

    /**
     * chart
     *
     * @param selection - the current d3 selection(s)
     *  to draw the visualization in. For this
     *  example, we will be drawing it in #vis
     */
    let chart = function (selection) {
        console.log(selection);
        selection.each(function (rawData) {
            // create svg and give it a width and height
            svg = d3.select(this).selectAll('svg').data([points]);
            let svgE = svg.enter().append('svg');
            // @v4 use merge to combine enter and existing selection
            svg = svg.merge(svgE);

            svg.attr('width', width + margin.left + margin.right);
            svg.attr('height', height + margin.top + margin.bottom);

            svg.append('g');


            // this group element will be used to contain all
            // other elements.
            g = svg.select('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            points = createCloud();
            cluster_centers = init_centers(points);
            computerClouds(points, cluster_centers);


            setupVis(points, cluster_centers);

            setupSections();
        });
    };


    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param points - the points to cluster.
     * @param cluster_centers - the centers of the clusters.
     */
    let setupVis = function (points, cluster_centers) {
        console.log(points);

        g.append('text')
            .attr('class', 'sub-title openvis-title')
            .attr('x', width / 2)
            .attr('y', (height / 3) + (height / 5))
            .text('Kmeans Clustering');

        g.selectAll('.openvis-title')
            .attr('opacity', 0);

        // count filler word count title
        g.append('text')
            .attr('class', 'title count-title highlight')
            .attr('x', width / 2)
            .attr('y', height / 3)
            .text(`Find ${nb_clusters} Groups`);

        g.append('text')
            .attr('class', 'sub-title count-title')
            .attr('x', width / 2)
            .attr('y', (height / 3) + (height / 5))
            .text('In The Data');

        g.selectAll('.count-title')
            .attr('opacity', 0);

        // @v4 Using .merge here to ensure
        // new and old data have same attrs applied
        let circles = g.selectAll('.click-circle').data(points, function (d) { return {x: d.x, y: d.y}; });

        let circlesE = circles.enter()
            .append('circle')
            .classed('click-circle', true);
        circles = circles.merge(circlesE)
            .attr('r', point_size)
            .attr('fill', point_color)
            .attr('cx', function (d) { return d.x;})
            .attr('cy', function (d) { return d.y;})
            .attr("fill-opacity", 0.6)
            .attr('opacity', 0);

        let lines = g.selectAll('.line').data(points, function (d) { return {x: d.x, y: d.y}; });

        let linesE = lines.enter()
            .append('line')
            .classed('line', true);
        lines = lines.merge(linesE)
            .attr("x1", function(d) {
                return d.x;
            })
            .attr("y1", function(d) {
                return d.y;
            })
            .attr("x2", function(d) {
                return cluster_centers[d.center].x;
            })
            .attr("y2", function(d) {
                return cluster_centers[d.center].y;
            })
            .attr("stroke", function(d) {
                return colors[d.center];
            })
            .attr('opacity', 0);

        let centers = g.selectAll('.center-circle').data(cluster_centers, function (d) { return {x: d.x, y: d.y}; });

        let centersE = centers.enter()
            .append('circle')
            .classed('center-circle', true);
        centers = centers.merge(centersE)
            .attr('r', cluster_size)
            .attr('fill', cluster_color)
            .attr('cx', function (d) { return d.x;})
            .attr('cy', function (d) { return d.y;})
            .attr('opacity', 0);

    };

    /**
     * setupSections - each section is activated
     * by a separate function. Here we associate
     * these functions to the sections based on
     * the section's index.
     *
     */
    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions[0] = showTitle;
        activateFunctions[1] = showFillerTitle;
        activateFunctions[2] = showData;
        activateFunctions[3] = showInitialCenters;
        activateFunctions[4] = showInitialLines;
        activateFunctions[5] = showHistPart;
        activateFunctions[6] = showHistAll;
        activateFunctions[7] = showCough;
        activateFunctions[8] = showHistAll;

        // updateFunctions are called while
        // in a particular section to update
        // the scroll progress in that section.
        // Most sections do not need to be updated
        // for all scrolling and so are set to
        // no-op functions.
        for (var i = 0; i < 9; i++) {
            updateFunctions[i] = function () {};
        }
        updateFunctions[7] = updateCough;
    };

    /**
     * ACTIVATE FUNCTIONS
     *
     * These will be called their
     * section is scrolled to.
     *
     * General pattern is to ensure
     * all content for the current section
     * is transitioned in, while hiding
     * the content for the previous section
     * as well as the next section (as the
     * user may be scrolling up or down).
     *
     */

    /**
     * showTitle - initial title
     *
     * hides: count title
     * (no previous step to hide)
     * shows: intro title
     *
     */
    function showTitle() {
        g.selectAll('.count-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.openvis-title')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
    }

    /**
     * showFillerTitle - filler counts
     *
     * hides: intro title
     * hides:  data circles
     * shows: filler count title
     *
     */
    function showFillerTitle() {
        g.selectAll('.openvis-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.click-circle')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.count-title')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
    }

    /**
     * showData - data circles
     *
     * hides: filler count title
     * hides: center circles
     * shows: data circles
     *
     */
    function showData() {
        g.selectAll('.count-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.center-circle')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.click-circle')
            .transition()
            .duration(600)
            .delay(function (d, i) {
                return i;
            })
            .attr('opacity', 1.0);
    }

    /**
     * showInitialCenters - center circles
     *
     */
    function showInitialCenters() {
        g.selectAll('.line')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.click-circle')
            .transition()
            .duration(0)
            .attr('fill', point_color);

        g.selectAll('.center-circle')
            .transition()
            .duration(600)
            .delay(function (d, i) {
                return 50 * i;
            })
            .attr('opacity', 1.0);
    }

    /**
     * showInitialLines - lines and colors
     *
     */
    function showInitialLines() {
        g.selectAll('.line')
            .transition()
            .duration(600)
            .attr('opacity', 0.3);

        // TODO - Fix refresh when already on this section
        // let test = g.selectAll('.click-circle')
        //     .transition()
        //     .duration(600)
        //     .delay(function (d, i) {
        //         return i;
        //     })
        //     .attr('opacity', 0.8);


        g.selectAll('.click-circle')
            .transition()
            .duration(600)
            .attr('fill', function(d) {
                return colors[d.center];
            });
    }

    /**
     * showHistPart - shows the first part
     *  of the histogram of filler words
     *
     * hides: barchart
     * hides: last half of histogram
     * shows: first half of histogram
     *
     */
    function showHistPart() {
        // switch the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.bar-text')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.bar')
            .transition()
            .duration(600)
            .attr('width', 0);

        // here we only show a bar if
        // it is before the 15 minute mark
        g.selectAll('.hist')
            .transition()
            .duration(600)
            .attr('y', function (d) { return (d.x0 < 15) ? yHistScale(d.length) : height; })
            .attr('height', function (d) { return (d.x0 < 15) ? height - yHistScale(d.length) : 0; })
            .style('opacity', function (d) { return (d.x0 < 15) ? 1.0 : 1e-6; });
    }

    /**
     * showHistAll - show all histogram
     *
     * hides: cough title and color
     * (previous step is also part of the
     *  histogram, so we don't have to hide
     *  that)
     * shows: all histogram bars
     *
     */
    function showHistAll() {
        // ensure the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.cough')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        // named transition to ensure
        // color change is not clobbered
        g.selectAll('.hist')
            .transition('color')
            .duration(500)
            .style('fill', '#008080');

        g.selectAll('.hist')
            .transition()
            .duration(1200)
            .attr('y', function (d) { return yHistScale(d.length); })
            .attr('height', function (d) { return height - yHistScale(d.length); })
            .style('opacity', 1.0);
    }

    /**
     * showCough
     *
     * hides: nothing
     * (previous and next sections are histograms
     *  so we don't have to hide much here)
     * shows: histogram
     *
     */
    function showCough() {
        // ensure the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.hist')
            .transition()
            .duration(600)
            .attr('y', function (d) { return yHistScale(d.length); })
            .attr('height', function (d) { return height - yHistScale(d.length); })
            .style('opacity', 1.0);
    }

    /**
     * showAxis - helper function to
     * display particular xAxis
     *
     * @param axis - the axis to show
     *  (xAxisHist or xAxisBar)
     */
    function showAxis(axis) {
        g.select('.x.axis')
            .call(axis)
            .transition().duration(500)
            .style('opacity', 1);
    }

    /**
     * hideAxis - helper function
     * to hide the axis
     *
     */
    function hideAxis() {
        g.select('.x.axis')
            .transition().duration(500)
            .style('opacity', 0);
    }

    /**
     * UPDATE FUNCTIONS
     *
     * These will be called within a section
     * as the user scrolls through it.
     *
     * We use an immediate transition to
     * update visual elements based on
     * how far the user has scrolled
     *
     */

    /**
     * updateCough - increase/decrease
     * cough text and color
     *
     * @param progress - 0.0 - 1.0 -
     *  how far user has scrolled in section
     */
    function updateCough(progress) {
        g.selectAll('.cough')
            .transition()
            .duration(0)
            .attr('opacity', progress);

        g.selectAll('.hist')
            .transition('cough')
            .duration(0)
            .style('fill', function (d) {
                return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
            });
    }

    /**
     * DATA FUNCTIONS
     *
     * Used to coerce the data into the
     * formats we need to visualize
     *
     */

    /**
     * getWords - maps raw data to
     * array of data objects. There is
     * one data object for each word in the speach
     * data.
     *
     * This function converts some attributes into
     * numbers and adds attributes used in the visualization
     *
     * @param rawData - data read in from file
     */
    function getWords(rawData) {
        return rawData.map(function (d, i) {
            // is this word a filler word?
            d.filler = (d.filler === '1') ? true : false;
            // time in seconds word was spoken
            d.time = +d.time;
            // time in minutes word was spoken
            d.min = Math.floor(d.time / 60);

            // positioning for square visual
            // stored here to make it easier
            // to keep track of.
            d.col = i % numPerRow;
            d.x = d.col * (squareSize + squarePad);
            d.row = Math.floor(i / numPerRow);
            d.y = d.row * (squareSize + squarePad);
            return d;
        });
    }

    /**
     * getFillerWords - returns array of
     * only filler words
     *
     * @param data - word data from getWords
     */
    function getFillerWords(data) {
        return data.filter(function (d) {return d.filler; });
    }

    /**
     * getHistogram - use d3's histogram layout
     * to generate histogram bins for our word data
     *
     * @param data - word data. we use filler words
     *  from getFillerWords
     */
    function getHistogram(data) {
        // only get words from the first 30 minutes
        var thirtyMins = data.filter(function (d) { return d.min < 30; });
        // bin data into 2 minutes chuncks
        // from 0 - 31 minutes
        // @v4 The d3.histogram() produces a significantly different
        // data structure then the old d3.layout.histogram().
        // Take a look at this block:
        // https://bl.ocks.org/mbostock/3048450
        // to inform how you use it. Its different!
        return d3.histogram()
            .thresholds(xHistScale.ticks(10))
            .value(function (d) { return d.min; })(thirtyMins);
    }

    /**
     * groupByWord - group words together
     * using nest. Used to get counts for
     * barcharts.
     *
     * @param words
     */
    function groupByWord(words) {
        return d3.nest()
            .key(function (d) { return d.word; })
            .rollup(function (v) { return v.length; })
            .entries(words)
            .sort(function (a, b) {return b.value - a.value;});
    }

    /**
     * activate -
     *
     * @param index - index of the activated section
     */
    chart.activate = function (index) {
        activeIndex = index;
        var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(function (i) {
            activateFunctions[i]();
        });
        lastIndex = activeIndex;
    };

    /**
     * update
     *
     * @param index
     * @param progress
     */
    chart.update = function (index, progress) {
        updateFunctions[index](progress);
    };

    // return chart function
    return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
    // create a new plot and
    // display it
    var plot = scrollVis();
    d3.select('#vis')
        .datum(data)
        .call(plot);

    // setup scroll functionality
    var scroll = scroller()
        .container(d3.select('#graphic'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));

    // setup event handling
    scroll.on('active', function (index) {
        // highlight current step text
        d3.selectAll('.step')
            .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

        // activate current section
        plot.activate(index);
    });

    scroll.on('progress', function (index, progress) {
        plot.update(index, progress);
    });
}

// load data and display
d3.tsv('words.tsv', display);