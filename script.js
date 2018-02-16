const point_size = 10;
const cluster_size = 5;
const point_color = "black";
const cluster_color = "red";
let nb_clusters = 2;


// set the dimensions and margins of the graph
let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
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

function displayCenters(centers) {
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


let cluster_centers = [];

function init_kmeans(){
    let temp_points = points.slice();
    temp_points = d3.shuffle(temp_points);

    cluster_centers = temp_points.slice(0, nb_clusters);

    console.log('cluster_centers', cluster_centers);


    displayCenters(cluster_centers);
    cluster_points = computerClouds(points, cluster_centers);
    cluster_centers = updateCenters(cluster_points);

    console.log('cluster_centers', cluster_centers);

    for (let i = 0; i<5; ++i){
      cluster_points = computerClouds(points, cluster_centers);
      cluster_centers = updateCenters(cluster_points);
      displayCenters(cluster_centers);
      console.log('cluster_centers', cluster_centers);
    }

}


// Coucou ma belle
// ----c=8 # Quentin
// ----c=======================================8 # Clément (sacré engin)
function computerClouds(points, cluster_centers){

    let cluster_points = []; // stores all the points to its cluster_points
    for (let cluster_idx=0; cluster_idx < nb_clusters; ++cluster_idx){
      let c_points = [];
      cluster_points.push(c_points);
    }

    for (let p of points) {
        let dist = [];
        for (let i = 0, len = cluster_centers.length ; i < len ; i++) {
            let c = cluster_centers[i];
            dist[i] = Math.hypot(p.x - c.x, p.y - c.y);
        }
        if (isNaN(dist[0])){dist[0] = 0};
        if (isNaN(dist[1])){dist[1] = 0};

        let nearest_cluster = dist.indexOf(Math.min(...dist)); //min dist

        console.log('nearest_cluster', nearest_cluster);
        if(nearest_cluster<0){console.log('dist', dist)};
        //console.log('cluster_points', cluster_points);
        cluster_points[nearest_cluster].push(p);
    }

    return cluster_points;
}


function updateCenters(cluster_points){
  let new_cluster_centers = [];

  for(let c_points of cluster_points){
    console.log('length point', c_points.length);
    let sumX = 0;
    let sumY = 0;
    for(let p of c_points){
      sumX += p.x;
      sumY += p.y;
    }
    new_cluster_centers.push([sumX/c_points.length, sumY/c_points.length]);
  }

  return new_cluster_centers;

}
