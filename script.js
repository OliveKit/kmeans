const point_size = 10;
const cluster_size = 5;
const point_color = "black";
const cluster_color = "red";


// set the dimensions and margins of the graph
let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let points = [];

let svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("click", function(){
        points.push({x: d3.mouse(this)[0], y: d3.mouse(this)[1]});
        drawCircle(d3.mouse(this)[0], d3.mouse(this)[1], point_size);
    });


function drawCircle(x, y, size, color=point_color) {
    svg.append("circle")
        .attr('class', 'click-circle')
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", size)
        .attr("fill", color);
}

function updateCenters(centers) {
    svg.selectAll(".center-circle").remove();

    for (let c of centers){
        svg.append("circle")
            .attr('class', 'center-circle')
            .attr("cx", c.x)
            .attr("cy", c.y)
            .attr("r", cluster_size)
            .attr("fill", cluster_color);
    }
}

let buttonLaunchClustering = document.getElementById("launchClustering");
buttonLaunchClustering.addEventListener('click', init_kmeans);


let nb_clusters = 2;
let clusters_coords = [];

function init_kmeans(){
    let temp_points = points.slice();
    temp_points = d3.shuffle(temp_points);

    clusters_coords = temp_points.slice(0, nb_clusters);

    updateCenters(clusters_coords);
    kmeans(points, clusters_coords);
}



function kmeans(points, cluster_centers){
    for (let p of points) {
        let dist = [];
        for (let i = 0, len = cluster_centers.length ; i < len ; i++) {
            let c = cluster_centers[i];
            dist[i] = Math.hypot(p.x - c.x, p.y - c.y);
        }
        console.log(dist);
    }
}
























